import { ServiceBuilderResult } from '../types';

export function buildEventBridge(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const eventBusName = cfg.event_bus_name || 'default';
  const createCustomBus = cfg.create_custom_bus === true;
  const enableArchive = cfg.enable_archive === true;
  const archiveRetentionDays = cfg.archive_retention_days || 30;

  if (createCustomBus) {
    resources.EventBus = {
      Type: "AWS::Events::EventBus",
      Properties: {
        Name: {
          "Fn::Sub": `${"${projectName}-${environment}-${eventBusName}"}`,
        },
        Tags: [
          {
            Key: "Environment",
            Value: environment,
          },
        ],
      },
    };

    outputs.EventBusArn = {
      Description: "Event Bus ARN",
      Value: { Ref: "EventBus" },
    };

    outputs.EventBusName = {
      Description: "Event Bus Name",
      Value: { Ref: "EventBus" },
    };
  }

  if (enableArchive) {
    resources.Archive = {
      Type: "AWS::Events::Archive",
      Properties: {
        ArchiveName: {
          "Fn::Sub": `${"${projectName}-${environment}-archive"}`,
        },
        SourceArn: createCustomBus
          ? { Ref: "EventBus" }
          : { "Fn::Sub": "arn:aws:events:${AWS::Region}:${AWS::AccountId}:event-bus/default" },
        RetentionDays: archiveRetentionDays,
        EventPattern: {
          source: [{ prefix: "" }],
        },
      },
    };

    outputs.ArchiveArn = {
      Description: "EventBridge Archive ARN",
      Value: { Ref: "Archive" },
    };
  }

  resources.EventRule = {
    Type: "AWS::Events::Rule",
    Properties: {
      Name: {
        "Fn::Sub": `${"${projectName}-${environment}-rule"}`,
      },
      EventBusName: createCustomBus ? { Ref: "EventBus" } : undefined,
      EventPattern: {
        source: ["aws.ec2"],
        "detail-type": ["EC2 Instance State-change Notification"],
      },
      State: "ENABLED",
      Targets: [
        {
          Arn: {
            "Fn::Sub": `arn:aws:logs:${"${AWS::Region}"}:${"${AWS::AccountId}"}:log-group:/aws/events/${"${projectName}-${environment}"}`,
          },
          Id: "LogTarget",
        },
      ],
    },
  };

  resources.EventLogGroup = {
    Type: "AWS::Logs::LogGroup",
    Properties: {
      LogGroupName: {
        "Fn::Sub": `/aws/events/${"${projectName}-${environment}"}`,
      },
      RetentionInDays: 7,
    },
  };

  return [resources, outputs];
}
