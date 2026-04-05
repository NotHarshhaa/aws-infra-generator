import { GeneratedFile } from '../types';

export function generateSns(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const topicName = cfg.topic_name || `${projectName}-${environment}-notifications`;
  const displayName = cfg.display_name || `${projectName} Notifications`;
  const topicType = cfg.topic_type || "standard";
  const enableDeliveryPolicy = cfg.enable_delivery_policy === true;
  const enableEncryption = cfg.enable_encryption !== false;
  const enableMonitoring = cfg.enable_monitoring === true;
  const emailSubscriptions = cfg.email_subscriptions ? cfg.email_subscriptions.split(',').map((email: string) => email.trim()).filter(Boolean) : [];
  const sqsSubscription = cfg.sqs_subscription === true;
  const lambdaSubscription = cfg.lambda_subscription === true;
  const httpSubscription = cfg.http_subscription && cfg.http_endpoint;

  const resources: any = {
    Parameters: {
      TopicName: {
        Type: "String",
        Default: topicName,
        Description: "Name for the SNS topic",
      },
      DisplayName: {
        Type: "String",
        Default: displayName,
        Description: "Display name for email notifications",
      },
      TopicType: {
        Type: "String",
        Default: topicType,
        AllowedValues: ["standard", "fifo"],
        Description: "Type of topic (Standard or FIFO)",
      },
      EnableEncryption: {
        Type: "String",
        Default: enableEncryption.toString(),
        AllowedValues: ["true", "false"],
        Description: "Enable server-side encryption",
      },
    },
    Resources: {},
    Outputs: {},
  };

  // SNS Topic
  const topicProperties: any = {
    TopicName: { Ref: "TopicName" },
    ...(topicType === "fifo" && {
      FifoTopic: true,
      ContentBasedDeduplication: false,
    }),
    ...(enableEncryption && {
      KmsMasterKeyId: "alias/aws/sns",
    }),
    Tags: [
      {
        Key: "Name",
        Value: `${projectName}-${environment}-sns`,
      },
      {
        Key: "Environment",
        Value: environment,
      },
    ],
  };

  if (displayName) {
    topicProperties.DisplayName = { Ref: "DisplayName" };
  }

  resources.Resources.Topic = {
    Type: "AWS::SNS::Topic",
    Properties: topicProperties,
  };

  resources.Outputs.TopicArn = {
    Description: "SNS topic ARN",
    Value: { Ref: "Topic" },
    Export: {
      Name: `${projectName}-${environment}-TopicArn`,
    },
  };

  resources.Outputs.TopicName = {
    Description: "SNS topic name",
    Value: { Ref: "Topic" },
  };

  // Email Subscriptions
  emailSubscriptions.forEach((email: string, index: number) => {
    resources.Resources[`EmailSubscription${index}`] = {
      Type: "AWS::SNS::Subscription",
      Properties: {
        Protocol: "email",
        Endpoint: email,
        TopicArn: { Ref: "Topic" },
        AutoConfirm: true,
      },
    };
  });

  // SQS Subscription
  if (sqsSubscription) {
    resources.Resources.SQSSubscription = {
      Type: "AWS::SNS::Subscription",
      Properties: {
        Protocol: "sqs",
        Endpoint: { Ref: "Queue" },
        TopicArn: { Ref: "Topic" },
      },
    };

    // SQS Policy to allow SNS to write to queue
    resources.Resources.SQSPolicy = {
      Type: "AWS::SQS::QueuePolicy",
      Properties: {
        Queues: [{ Ref: "Queue" }],
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "sns.amazonaws.com",
              },
              Action: "sqs:SendMessage",
              Resource: { "Fn::GetAtt": ["Queue", "Arn"] },
              Condition: {
                ArnEquals: {
                  "aws:SourceArn": { Ref: "Topic" },
                },
              },
            },
          ],
        },
      },
    };
  }

  // Lambda Subscription
  if (lambdaSubscription) {
    resources.Resources.LambdaSubscription = {
      Type: "AWS::SNS::Subscription",
      Properties: {
        Protocol: "lambda",
        Endpoint: { "Fn::GetAtt": ["LambdaFunction", "Arn"] },
        TopicArn: { Ref: "Topic" },
      },
    };

    // Lambda Permission for SNS
    resources.Resources.LambdaPermission = {
      Type: "AWS::Lambda::Permission",
      Properties: {
        FunctionName: { Ref: "LambdaFunction" },
        Action: "lambda:InvokeFunction",
        Principal: "sns.amazonaws.com",
        SourceArn: { Ref: "Topic" },
      },
    };
  }

  // HTTP/HTTPS Subscription
  if (httpSubscription && cfg.http_endpoint) {
    resources.Resources.HTTPSubscription = {
      Type: "AWS::SNS::Subscription",
      Properties: {
        Protocol: cfg.http_subscription,
        Endpoint: cfg.http_endpoint,
        TopicArn: { Ref: "Topic" },
      },
    };
  }

  // Delivery Policy
  if (enableDeliveryPolicy) {
    resources.Resources.TopicPolicy = {
      Type: "AWS::SNS::TopicPolicy",
      Properties: {
        Topics: [{ Ref: "Topic" }],
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: "SNS:Publish",
              Resource: { Ref: "Topic" },
            },
            {
              Effect: "Allow",
              Principal: {
                Service: "cloudwatch.amazonaws.com",
              },
              Action: "SNS:Publish",
              Resource: { Ref: "Topic" },
            },
          ],
        },
      },
    };
  }

  // CloudWatch Monitoring
  if (enableMonitoring) {
    resources.Resources.NotificationsFailedAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-sns-failed`,
        AlarmDescription: "SNS topic has failed notifications",
        MetricName: "NumberOfNotificationsFailed",
        Namespace: "AWS/SNS",
        Period: "300",
        EvaluationPeriods: "2",
        Statistic: "Sum",
        Threshold: "5",
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "Topic" }],
        Dimensions: [
          {
            Name: "TopicName",
            Value: { Ref: "Topic" },
          },
        ],
      },
    };

    resources.Resources.NotificationsDeliveredAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-sns-delivered`,
        AlarmDescription: "SNS topic delivery rate is too low",
        MetricName: "NumberOfNotificationsDelivered",
        Namespace: "AWS/SNS",
        Period: "300",
        EvaluationPeriods: "2",
        Statistic: "Sum",
        Threshold: "10",
        ComparisonOperator: "LessThanThreshold",
        AlarmActions: [{ Ref: "Topic" }],
        Dimensions: [
          {
            Name: "TopicName",
            Value: { Ref: "Topic" },
          },
        ],
      },
    };

    resources.Resources.PublishSizeAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-sns-publish-size`,
        AlarmDescription: "SNS message size is too large",
        MetricName: "SMSMonthToDateSpentUSD",
        Namespace: "AWS/SNS",
        Period: "300",
        EvaluationPeriods: "1",
        Statistic: "Maximum",
        Threshold: "254800", // 254KB in bytes
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "Topic" }],
        Dimensions: [
          {
            Name: "TopicName",
            Value: { Ref: "Topic" },
          },
        ],
      },
    };
  }

  return {
    name: "sns.yaml",
    path: `${projectName}/sns.yaml`,
    content: JSON.stringify(resources, null, 2),
    language: "yaml",
  };
}
