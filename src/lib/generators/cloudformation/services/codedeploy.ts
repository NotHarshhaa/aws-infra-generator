import { ServiceBuilderResult } from '../types';

export function buildCodeDeploy(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const applicationName = cfg.application_name || 'my-app';
  const deploymentPlatform = cfg.deployment_platform || 'ec2';

  resources.CodeDeployRole = {
    Type: "AWS::IAM::Role",
    Properties: {
      RoleName: {
        "Fn::Sub": `${"${projectName}-${environment}-codedeploy-role"}`,
      },
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "codedeploy.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
      ManagedPolicyArns: [
        "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole",
      ],
    },
  };

  resources.CodeDeployApplication = {
    Type: "AWS::CodeDeploy::Application",
    Properties: {
      ApplicationName: {
        "Fn::Sub": `${"${projectName}-${environment}-${applicationName}"}`,
      },
      ComputePlatform: deploymentPlatform === 'lambda' ? 'Lambda' : deploymentPlatform === 'ecs' ? 'ECS' : 'Server',
    },
  };

  resources.DeploymentGroup = {
    Type: "AWS::CodeDeploy::DeploymentGroup",
    Properties: {
      ApplicationName: { Ref: "CodeDeployApplication" },
      DeploymentGroupName: {
        "Fn::Sub": `${"${projectName}-${environment}-deployment-group"}`,
      },
      ServiceRoleArn: { "Fn::GetAtt": ["CodeDeployRole", "Arn"] },
      DeploymentConfigName: "CodeDeployDefault.OneAtATime",
      DeploymentStyle: {
        DeploymentType: "IN_PLACE",
        DeploymentOption: "WITHOUT_TRAFFIC_CONTROL",
      },
    },
  };

  outputs.ApplicationArn = {
    Description: "CodeDeploy Application ARN",
    Value: { "Fn::GetAtt": ["CodeDeployApplication", "ApplicationArn"] },
  };

  return [resources, outputs];
}
