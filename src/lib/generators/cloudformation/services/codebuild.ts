import { ServiceBuilderResult } from '../types';

export function buildCodeBuild(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const buildProjectName = cfg.project_name || 'my-build-project';
  const buildRuntime = cfg.build_runtime || 'ubuntu-standard';
  const computeType = cfg.compute_type || 'BUILD_GENERAL1_SMALL';
  const buildTimeout = cfg.build_timeout || 60;

  resources.CodeBuildRole = {
    Type: "AWS::IAM::Role",
    Properties: {
      RoleName: {
        "Fn::Sub": `${"${projectName}-${environment}-codebuild-role"}`,
      },
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "codebuild.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
      Policies: [
        {
          PolicyName: "CodeBuildBasicExecution",
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
                Resource: "*",
              },
            ],
          },
        },
      ],
    },
  };

  const image = buildRuntime === 'ubuntu-standard' ? "aws/codebuild/standard:6.0" : buildRuntime === 'amazonlinux2' ? "aws/codebuild/amazonlinux2-aarch64-standard:3.0" : "aws/codebuild/standard:6.0";

  resources.CodeBuildProject = {
    Type: "AWS::CodeBuild::Project",
    Properties: {
      Name: {
        "Fn::Sub": `${"${projectName}-${environment}"}`,
      },
      Description: `CodeBuild project for ${projectName}`,
      ServiceRole: { "Fn::GetAtt": ["CodeBuildRole", "Arn"] },
      Artifacts: {
        Type: "NO_ARTIFACTS",
      },
      Environment: {
        Type: "LINUX_CONTAINER",
        ComputeType: computeType,
        Image: image,
      },
      TimeoutInMinutes: buildTimeout,
      Source: {
        Type: "GITHUB",
        Location: "https://github.com/example/repo.git",
        BuildSpec: "buildspec.yml",
      },
    },
  };

  outputs.ProjectArn = {
    Description: "CodeBuild Project ARN",
    Value: { "Fn::GetAtt": ["CodeBuildProject", "Arn"] },
  };

  return [resources, outputs];
}
