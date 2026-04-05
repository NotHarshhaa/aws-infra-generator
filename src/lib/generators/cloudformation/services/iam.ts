import { ServiceBuilderResult } from '../types';

export function buildIam(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const createEc2Role = cfg.create_ec2_role !== false;
  const createAdmin = cfg.create_admin_role === true;
  const createS3Policy = cfg.create_s3_policy === true;
  const createRdsPolicy = cfg.create_rds_policy === true;

  if (createEc2Role) {
    resources.EC2Role = {
      Type: "AWS::IAM::Role",
      Properties: {
        RoleName: {
          "Fn::Sub": "${ProjectName}-${Environment}-ec2-role",
        },
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { Service: "ec2.amazonaws.com" },
              Action: "sts:AssumeRole",
            },
          ],
        },
        Tags: [
          {
            Key: "Name",
            Value: {
              "Fn::Sub": "${ProjectName}-${Environment}-ec2-role",
            },
          },
        ],
      },
    };
    resources.EC2InstanceProfile = {
      Type: "AWS::IAM::InstanceProfile",
      Properties: {
        InstanceProfileName: {
          "Fn::Sub": "${ProjectName}-${Environment}-ec2-profile",
        },
        Roles: [{ Ref: "EC2Role" }],
      },
    };
    outputs.EC2RoleArn = {
      Description: "EC2 Role ARN",
      Value: { "Fn::GetAtt": ["EC2Role", "Arn"] },
    };
  }

  if (createS3Policy) {
    resources.S3AccessPolicy = {
      Type: "AWS::IAM::ManagedPolicy",
      Properties: {
        ManagedPolicyName: {
          "Fn::Sub": "${ProjectName}-${Environment}-s3-access",
        },
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket",
                "s3:DeleteObject",
              ],
              Resource: "*",
            },
          ],
        },
      },
    };
  }

  if (createRdsPolicy) {
    resources.RDSAccessPolicy = {
      Type: "AWS::IAM::ManagedPolicy",
      Properties: {
        ManagedPolicyName: {
          "Fn::Sub": "${ProjectName}-${Environment}-rds-access",
        },
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: ["rds:DescribeDBInstances", "rds:Connect"],
              Resource: "*",
            },
          ],
        },
      },
    };
  }

  return [resources, outputs];
}
