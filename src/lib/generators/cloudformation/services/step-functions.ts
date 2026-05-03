import { ServiceBuilderResult } from '../types';

export function buildStepFunctions(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const stateMachineName = cfg.state_machine_name || 'my-workflow';
  const type = cfg.type || 'STANDARD';
  const executionTimeout = cfg.execution_timeout || 3600;
  const enableLogging = cfg.enable_logging !== false;
  const enableTracing = cfg.enable_tracing === true;

  resources.StepFunctionsRole = {
    Type: "AWS::IAM::Role",
    Properties: {
      RoleName: {
        "Fn::Sub": `${"${projectName}-${environment}-stepfunctions-role"}`,
      },
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "states.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
      Policies: [
        {
          PolicyName: "StepFunctionsBasicExecution",
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                ],
                Resource: "*",
              },
            ],
          },
        },
      ],
    },
  };

  if (enableLogging) {
    resources.StepFunctionsLogGroup = {
      Type: "AWS::Logs::LogGroup",
      Properties: {
        LogGroupName: {
          "Fn::Sub": `/aws/vendedlogs/states/${"${projectName}-${environment}-state-machine"}`,
        },
        RetentionInDays: 7,
      },
    };
  }

  const stateMachineProps: any = {
    StateMachineName: {
      "Fn::Sub": `${"${stateMachineName}-${environment}"}`,
    },
    StateMachineType: type,
    DefinitionString: JSON.stringify({
      Comment: "A simple minimal example",
      StartAt: "HelloWorld",
      States: {
        HelloWorld: {
          Type: "Pass",
          Result: "Hello World!",
          End: true,
        },
      },
    }),
    RoleArn: {
      "Fn::GetAtt": ["StepFunctionsRole", "Arn"],
    },
  };

  if (executionTimeout) {
    stateMachineProps.TimeoutSeconds = executionTimeout;
  }

  if (enableLogging) {
    stateMachineProps.LoggingConfiguration = {
      Destinations: [
        {
          CloudWatchLogsLogGroup: {
            LogGroupArn: {
              "Fn::GetAtt": ["StepFunctionsLogGroup", "Arn"],
            },
          },
        },
      ],
      Level: "ALL",
    };
  }

  if (enableTracing) {
    stateMachineProps.TracingConfiguration = {
      Enabled: true,
    };
  }

  resources.StateMachine = {
    Type: "AWS::StepFunctions::StateMachine",
    Properties: stateMachineProps,
  };

  outputs.StateMachineArn = {
    Description: "Step Functions State Machine ARN",
    Value: { Ref: "StateMachine" },
  };

  outputs.StateMachineName = {
    Description: "Step Functions State Machine Name",
    Value: { Ref: "StateMachine" },
  };

  return [resources, outputs];
}
