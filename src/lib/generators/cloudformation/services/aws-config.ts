import { ServiceBuilderResult } from '../types';

export function buildAWSConfig(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const enableRecorder = cfg.enable_recorder !== false;
  const includeGlobalResources = cfg.include_global_resources !== false;

  if (enableRecorder) {
    resources.ConfigRecorder = {
      Type: "AWS::Config::ConfigurationRecorder",
      Properties: {
        Name: {
          "Fn::Sub": `${"${projectName}-${environment}-recorder"}`,
        },
        RoleARN: {
          "Fn::Sub": "arn:aws:iam::${AWS::AccountId}:role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig",
        },
        RecordingGroup: {
          AllSupported: true,
          IncludeGlobalResourceTypes: includeGlobalResources,
        },
      },
    };

    resources.ConfigDeliveryChannel = {
      Type: "AWS::Config::DeliveryChannel",
      Properties: {
        Name: {
          "Fn::Sub": `${"${projectName}-${environment}-delivery-channel"}`,
        },
        S3BucketName: {
          "Fn::Sub": `${"${projectName}-${environment}-config-logs"}`,
        },
      },
      DependsOn: "ConfigRecorder",
    };
  }

  outputs.RecorderName = {
    Description: "AWS Config Recorder Name",
    Value: { Ref: "ConfigRecorder" },
  };

  return [resources, outputs];
}
