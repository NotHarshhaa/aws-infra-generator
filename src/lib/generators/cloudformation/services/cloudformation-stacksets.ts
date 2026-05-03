import { ServiceBuilderResult } from '../types';

export function buildCloudFormationStackSets(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const stackSetName = cfg.stackset_name || 'my-stackset';

  resources.StackSet = {
    Type: "AWS::CloudFormation::StackSet",
    Properties: {
      StackSetName: {
        "Fn::Sub": `${"${projectName}-${environment}-${stackSetName}"}`,
      },
      Description: `StackSet for ${projectName} multi-account deployment`,
      PermissionModel: "SELF_MANAGED",
      Capabilities: ["CAPABILITY_IAM"],
      TemplateBody: JSON.stringify({
        AWSTemplateFormatVersion: "2010-09-09",
        Description: `Template for ${projectName} stack instances`,
        Resources: {
          ExampleResource: {
            Type: "AWS::S3::Bucket",
            Properties: {
              BucketName: {
                "Fn::Sub": `${"${projectName}-${environment}-example"}`,
              },
            },
          },
        },
      }),
    },
  };

  outputs.StackSetArn = {
    Description: "CloudFormation StackSet ARN",
    Value: { "Fn::GetAtt": ["StackSet", "StackSetARN"] },
  };

  return [resources, outputs];
}
