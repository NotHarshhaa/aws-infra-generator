import { GeneratedFile } from '../types';

export function generateLambda(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const functionName = cfg.function_name || `${projectName}-${environment}-lambda`;
  const runtime = cfg.runtime || "python3.11";
  const handler = cfg.handler || "index.lambda_handler";
  const memorySize = cfg.memory_size || 128;
  const timeout = cfg.timeout || 30;
  const environmentVariables = cfg.environment_variables || {};
  const enableVpc = cfg.enable_vpc === true;
  const enableMonitoring = cfg.enable_monitoring === true;
  const enableTracing = cfg.enable_tracing === true;
  const reservedConcurrency = cfg.reserved_concurrency || null;

  const resources: any = {
    Parameters: {
      FunctionName: {
        Type: "String",
        Default: functionName,
        Description: "Name for the Lambda function",
      },
      Runtime: {
        Type: "String",
        Default: runtime,
        AllowedValues: [
          "python3.11",
          "python3.10",
          "nodejs20.x",
          "nodejs18.x",
          "java21",
          "go1.x",
          "dotnet8",
        ],
        Description: "Lambda runtime",
      },
      Handler: {
        Type: "String",
        Default: handler,
        Description: "Function handler",
      },
      MemorySize: {
        Type: "Number",
        Default: memorySize.toString(),
        MinValue: "128",
        MaxValue: "10240",
        Description: "Function memory size in MB",
      },
      Timeout: {
        Type: "Number",
        Default: timeout.toString(),
        MinValue: "1",
        MaxValue: "900",
        Description: "Function timeout in seconds",
      },
      EnableVpc: {
        Type: "String",
        Default: enableVpc.toString(),
        AllowedValues: ["true", "false"],
        Description: "Deploy Lambda in VPC",
      },
      EnableMonitoring: {
        Type: "String",
        Default: enableMonitoring.toString(),
        AllowedValues: ["true", "false"],
        Description: "Enable detailed monitoring",
      },
      EnableTracing: {
        Type: "String",
        Default: enableTracing.toString(),
        AllowedValues: ["true", "false"],
        Description: "Enable X-Ray tracing",
      },
    },
    Resources: {},
    Outputs: {},
  };

  // Lambda Function
  const functionProperties: any = {
    FunctionName: { Ref: "FunctionName" },
    Runtime: { Ref: "Runtime" },
    Role: { "Fn::GetAtt": ["LambdaExecutionRole", "Arn"] },
    Handler: { Ref: "Handler" },
    Code: {
      ZipFile: "placeholder", // In real implementation, this would be actual code
    },
    MemorySize: { Ref: "MemorySize" },
    Timeout: { Ref: "Timeout" },
    Tags: [
      {
        Key: "Name",
        Value: `${projectName}-${environment}-lambda`,
      },
      {
        Key: "Environment",
        Value: environment,
      },
    ],
    ...(enableTracing && {
      TracingConfig: {
        Mode: "Active",
      },
    }),
    ...(reservedConcurrency && {
      ReservedConcurrentExecutions: reservedConcurrency,
    }),
  };

  // Environment Variables
  if (Object.keys(environmentVariables).length > 0) {
    const envVars = Object.entries(environmentVariables).map(([key, value]) => ({
      Variable: key,
      Value: value,
    }));
    functionProperties.Environment = { Variables: envVars };
  }

  // VPC Configuration
  if (enableVpc) {
    functionProperties.VpcConfig = {
      SubnetIds: [
        { Ref: "PrivateSubnet0" },
        { Ref: "PrivateSubnet1" },
      ],
      SecurityGroupIds: [{ Ref: "LambdaSecurityGroup" }],
    };
  }

  resources.Resources.LambdaFunction = {
    Type: "AWS::Lambda::Function",
    Properties: functionProperties,
  };

  resources.Outputs.LambdaFunctionArn = {
    Description: "Lambda function ARN",
    Value: { "Fn::GetAtt": ["LambdaFunction", "Arn"] },
    Export: {
      Name: `${projectName}-${environment}-LambdaFunctionArn`,
    },
  };

  resources.Outputs.LambdaFunctionName = {
    Description: "Lambda function name",
    Value: { Ref: "LambdaFunction" },
  };

  // IAM Role
  resources.Resources.LambdaExecutionRole = {
    Type: "AWS::IAM::Role",
    Properties: {
      RoleName: `${projectName}-${environment}-lambda-role`,
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
      Tags: [
        {
          Key: "Name",
          Value: `${projectName}-${environment}-lambda-role`,
        },
      ],
    },
  };

  // Basic Lambda execution policy
  resources.Resources.LambdaBasicExecutionRolePolicy = {
    Type: "AWS::IAM::RolePolicyAttachment",
    Properties: {
      PolicyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
      RoleName: { Ref: "LambdaExecutionRole" },
    },
  };

  // VPC access policy
  if (enableVpc) {
    resources.Resources.LambdaVPCExecutionRolePolicy = {
      Type: "AWS::IAM::RolePolicyAttachment",
      Properties: {
        PolicyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
        RoleName: { Ref: "LambdaExecutionRole" },
      },
    };

    // Security Group for Lambda
    resources.Resources.LambdaSecurityGroup = {
      Type: "AWS::EC2::SecurityGroup",
      Properties: {
        GroupDescription: "Security group for Lambda function",
        VpcId: { Ref: "VPC" },
        SecurityGroupEgress: [
          {
            IpProtocol: "-1",
            CidrIp: "0.0.0.0/0",
            Description: "Allow all outbound traffic",
          },
        ],
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-lambda-sg`,
          },
        ],
      },
    };
  }

  // Additional policies based on configuration
  if (cfg.s3_access === true) {
    resources.Resources.LambdaS3AccessPolicy = {
      Type: "AWS::IAM::RolePolicy",
      Properties: {
        RoleName: { Ref: "LambdaExecutionRole" },
        PolicyName: `${projectName}-${environment}-lambda-s3-access`,
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
              ],
              Resource: [
                { "Fn::GetAtt": ["S3Bucket", "Arn"] },
                { "Fn::Sub": "${S3Bucket.Arn}/*" },
              ],
            },
          ],
        },
      },
    };
  }

  if (cfg.dynamodb_access === true) {
    resources.Resources.LambdaDynamoDBAccessPolicy = {
      Type: "AWS::IAM::RolePolicy",
      Properties: {
        RoleName: { Ref: "LambdaExecutionRole" },
        PolicyName: `${projectName}-${environment}-lambda-dynamodb-access`,
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan",
              ],
              Resource: { "Fn::GetAtt": ["DynamoDBTable", "Arn"] },
            },
          ],
        },
      },
    };
  }

  if (cfg.sqs_access === true) {
    resources.Resources.LambdaSQSAccessPolicy = {
      Type: "AWS::IAM::RolePolicy",
      Properties: {
        RoleName: { Ref: "LambdaExecutionRole" },
        PolicyName: `${projectName}-${environment}-lambda-sqs-access`,
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "sqs:ReceiveMessage",
                "sqs:DeleteMessage",
                "sqs:GetQueueAttributes",
              ],
              Resource: { "Fn::GetAtt": ["Queue", "Arn"] },
            },
          ],
        },
      },
    };
  }

  // EventBridge trigger
  if (cfg.eventbridge_trigger === true) {
    resources.Resources.EventBridgeRule = {
      Type: "AWS::Events::Rule",
      Properties: {
        Name: `${projectName}-${environment}-lambda-trigger`,
        Description: "Trigger Lambda function on schedule",
        ScheduleExpression: cfg.schedule_expression || "rate(5 minutes)",
        State: "ENABLED",
        Targets: [
          {
            Arn: { "Fn::GetAtt": ["LambdaFunction", "Arn"] },
            Id: "LambdaTarget",
          },
        ],
      },
    };

    resources.Resources.LambdaEventBridgePermission = {
      Type: "AWS::Lambda::Permission",
      Properties: {
        FunctionName: { Ref: "LambdaFunction" },
        Action: "lambda:InvokeFunction",
        Principal: "events.amazonaws.com",
        SourceArn: { "Fn::GetAtt": ["EventBridgeRule", "Arn"] },
      },
    };
  }

  // API Gateway trigger
  if (cfg.api_gateway_trigger === true) {
    resources.Resources.APIGateway = {
      Type: "AWS::ApiGateway::RestApi",
      Properties: {
        Name: `${projectName}-${environment}-api`,
        Description: "API Gateway for Lambda function",
        EndpointConfiguration: {
          Types: ["REGIONAL"],
        },
      },
    };

    resources.Resources.APIGatewayResource = {
      Type: "AWS::ApiGateway::Resource",
      Properties: {
        RestApiId: { Ref: "APIGateway" },
        ParentId: { "Fn::GetAtt": ["APIGateway", "RootResourceId"] },
        PathPart: "{proxy+}",
      },
    };

    resources.Resources.APIGatewayMethod = {
      Type: "AWS::ApiGateway::Method",
      Properties: {
        RestApiId: { Ref: "APIGateway" },
        ResourceId: { Ref: "APIGatewayResource" },
        HttpMethod: "ANY",
        AuthorizationType: "NONE",
      },
    };

    resources.Resources.APIGatewayIntegration = {
      Type: "AWS::ApiGateway::Integration",
      Properties: {
        RestApiId: { Ref: "APIGateway" },
        ResourceId: { Ref: "APIGatewayResource" },
        HttpMethod: "ANY",
        Type: "AWS_PROXY",
        IntegrationHttpMethod: "POST",
        Uri: { "Fn::Sub": "arn:aws:apigateway:${AWS::Region}:${AWS::AccountId}:lambda:path/2015-03-31/functions/${LambdaFunction.Arn}/invocations" },
      },
    };

    resources.Resources.APIGatewayDeployment = {
      Type: "AWS::ApiGateway::Deployment",
      Properties: {
        RestApiId: { Ref: "APIGateway" },
      },
      DependsOn: ["APIGatewayMethod"],
    };

    resources.Resources.APIGatewayStage = {
      Type: "AWS::ApiGateway::Stage",
      Properties: {
        RestApiId: { Ref: "APIGateway" },
        DeploymentId: { Ref: "APIGatewayDeployment" },
        StageName: environment,
      },
    };

    resources.Resources.LambdaAPIGatewayPermission = {
      Type: "AWS::Lambda::Permission",
      Properties: {
        FunctionName: { Ref: "LambdaFunction" },
        Action: "lambda:InvokeFunction",
        Principal: "apigateway.amazonaws.com",
        SourceArn: { "Fn::Sub": "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${APIGateway.RootResourceId}/*/*/*" },
      },
    };

    resources.Outputs.APIGatewayUrl = {
      Description: "API Gateway URL",
      Value: { "Fn::Sub": "https://${APIGateway.RestApiId}.execute-api.${AWS::Region}.amazonaws.com/${environment}" },
    };
  }

  // CloudWatch Monitoring
  if (enableMonitoring) {
    resources.Resources.ErrorsAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-lambda-errors`,
        AlarmDescription: "Lambda function has too many errors",
        MetricName: "Errors",
        Namespace: "AWS/Lambda",
        Statistic: "Sum",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "5",
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "FunctionName",
            Value: { Ref: "LambdaFunction" },
          },
        ],
      },
    };

    resources.Resources.DurationAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-lambda-duration`,
        AlarmDescription: "Lambda function duration is too high",
        MetricName: "Duration",
        Namespace: "AWS/Lambda",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: timeout * 1000 * 0.8, // 80% of timeout in milliseconds
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "FunctionName",
            Value: { Ref: "LambdaFunction" },
          },
        ],
      },
    };

    resources.Resources.ThrottlesAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-lambda-throttles`,
        AlarmDescription: "Lambda function is being throttled",
        MetricName: "Throttles",
        Namespace: "AWS/Lambda",
        Statistic: "Sum",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "10",
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "FunctionName",
            Value: { Ref: "LambdaFunction" },
          },
        ],
      },
    };
  }

  return {
    name: "lambda.yaml",
    path: `${projectName}/lambda.yaml`,
    content: JSON.stringify(resources, null, 2),
    language: "yaml",
  };
}
