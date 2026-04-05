import { GeneratedFile } from '../types';

export function generateSqs(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const queueName = cfg.queue_name || `${projectName}-${environment}-queue`;
  const queueType = cfg.queue_type || "standard";
  const visibilityTimeout = cfg.visibility_timeout || 30;
  const messageRetentionPeriod = cfg.message_retention_period || 345600; // 4 days in seconds
  const deadLetterQueue = cfg.dead_letter_queue === true;
  const enableEncryption = cfg.enable_encryption !== false;
  const enableMonitoring = cfg.enable_monitoring === true;
  const maxReceiveCount = cfg.max_receive_count || 3;

  const resources: any = {
    Parameters: {
      QueueName: {
        Type: "String",
        Default: queueName,
        Description: "Name for the SQS queue",
      },
      QueueType: {
        Type: "String",
        Default: queueType,
        AllowedValues: ["standard", "fifo"],
        Description: "Type of queue (Standard or FIFO)",
      },
      VisibilityTimeout: {
        Type: "Number",
        Default: visibilityTimeout.toString(),
        MinValue: "0",
        MaxValue: "43200",
        Description: "Time a message is invisible after being read",
      },
      MessageRetentionPeriod: {
        Type: "Number",
        Default: messageRetentionPeriod.toString(),
        MinValue: "60",
        MaxValue: "1209600",
        Description: "How long to retain messages (1-14 days)",
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

  // Main Queue
  const queueProperties: any = {
    QueueName: { Ref: "QueueName" },
    VisibilityTimeout: { Ref: "VisibilityTimeout" },
    MessageRetentionPeriod: { Ref: "MessageRetentionPeriod" },
    ...(queueType === "fifo" && {
      FifoQueue: true,
      ContentBasedDeduplication: false,
    }),
    ...(enableEncryption && {
      SqsManagedSseEnabled: true,
    }),
    Tags: [
      {
        Key: "Name",
        Value: `${projectName}-${environment}-sqs`,
      },
      {
        Key: "Environment",
        Value: environment,
      },
    ],
  };

  resources.Resources.Queue = {
    Type: "AWS::SQS::Queue",
    Properties: queueProperties,
  };

  resources.Outputs.QueueUrl = {
    Description: "SQS queue URL",
    Value: { Ref: "Queue" },
    Export: {
      Name: `${projectName}-${environment}-QueueUrl`,
    },
  };

  resources.Outputs.QueueArn = {
    Description: "SQS queue ARN",
    Value: { "Fn::GetAtt": ["Queue", "Arn"] },
    Export: {
      Name: `${projectName}-${environment}-QueueArn`,
    },
  };

  // Dead Letter Queue
  if (deadLetterQueue) {
    resources.Resources.DLQ = {
      Type: "AWS::SQS::Queue",
      Properties: {
        QueueName: { "Fn::Sub": "${QueueName}-dlq" },
        MessageRetentionPeriod: "1209600", // 14 days
        ...(queueType === "fifo" && {
          FifoQueue: true,
          ContentBasedDeduplication: false,
        }),
        ...(enableEncryption && {
          SqsManagedSseEnabled: true,
        }),
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-sqs-dlq`,
          },
        ],
      },
    };

    resources.Outputs.DLQUrl = {
      Description: "Dead Letter Queue URL",
      Value: { Ref: "DLQ" },
    };

    resources.Outputs.DLQArn = {
      Description: "Dead Letter Queue ARN",
      Value: { "Fn::GetAtt": ["DLQ", "Arn"] },
    };

    // Redrive Policy
    resources.Resources.RedrivePolicy = {
      Type: "AWS::SQS::QueuePolicy",
      Properties: {
        Queues: [{ Ref: "Queue" }],
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: "sqs:*",
              Resource: { "Fn::GetAtt": ["Queue", "Arn"] },
            },
          ],
        },
      },
    };

    // Add redrive policy to main queue
    queueProperties.RedrivePolicy = {
      deadLetterTargetArn: { "Fn::GetAtt": ["DLQ", "Arn"] },
      maxReceiveCount: maxReceiveCount,
    };
  }

  // IAM Policy for Queue Access
  if (cfg.create_iam_policy === true) {
    resources.Resources.SQSPolicy = {
      Type: "AWS::IAM::ManagedPolicy",
      Properties: {
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "sqs:SendMessage",
                "sqs:ReceiveMessage",
                "sqs:DeleteMessage",
                "sqs:GetQueueAttributes",
                "sqs:ChangeMessageVisibility",
              ],
              Resource: [
                { "Fn::GetAtt": ["Queue", "Arn"] },
                ...(deadLetterQueue ? [{ "Fn::GetAtt": ["DLQ", "Arn"] }] : []),
              ],
            },
          ],
        },
        Description: "Policy for SQS queue access",
        ManagedPolicyName: `${projectName}-${environment}-sqs-policy`,
      },
    };

    resources.Outputs.SQSPolicyArn = {
      Description: "SQS IAM policy ARN",
      Value: { Ref: "SQSPolicy" },
    };
  }

  // CloudWatch Monitoring
  if (enableMonitoring) {
    resources.Resources.MessagesVisibleAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-sqs-visible-messages`,
        AlarmDescription: "SQS queue has too many visible messages",
        MetricName: "ApproximateNumberOfMessagesVisible",
        Namespace: "AWS/SQS",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "100",
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "QueueName",
            Value: { "Fn::GetAtt": ["Queue", "QueueName"] },
          },
        ],
      },
    };

    resources.Resources.DeletedMessagesAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-sqs-deleted-messages`,
        AlarmDescription: "SQS queue processing rate is too low",
        MetricName: "NumberOfMessagesDeleted",
        Namespace: "AWS/SQS",
        Statistic: "Sum",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "10",
        ComparisonOperator: "LessThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "QueueName",
            Value: { "Fn::GetAtt": ["Queue", "QueueName"] },
          },
        ],
      },
    };

    resources.Resources.OldestMessageAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-sqs-oldest-message`,
        AlarmDescription: "SQS queue has old messages",
        MetricName: "ApproximateAgeOfOldestMessage",
        Namespace: "AWS/SQS",
        Statistic: "Maximum",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "3600", // 1 hour
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "QueueName",
            Value: { "Fn::GetAtt": ["Queue", "QueueName"] },
          },
        ],
      },
    };
  }

  return {
    name: "sqs.yaml",
    path: `${projectName}/sqs.yaml`,
    content: JSON.stringify(resources, null, 2),
    language: "yaml",
  };
}
