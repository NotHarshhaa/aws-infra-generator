import { ServiceBuilderResult } from '../types';

export function buildCodePipeline(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const pipelineName = cfg.pipeline_name || 'my-pipeline';
  const repositoryName = cfg.repository_name || 'my-repo';
  const branchName = cfg.branch_name || 'main';

  resources.CodePipelineRole = {
    Type: "AWS::IAM::Role",
    Properties: {
      RoleName: {
        "Fn::Sub": `${"${projectName}-${environment}-pipeline-role"}`,
      },
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "codepipeline.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
      Policies: [
        {
          PolicyName: "CodePipelineBasicExecution",
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: ["codebuild:StartBuild", "codebuild:BatchGetBuilds"],
                Resource: "*",
              },
            ],
          },
        },
      ],
    },
  };

  resources.ArtifactBucket = {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: {
        "Fn::Sub": `${"${projectName}-${environment}-pipeline-artifacts"}`,
      },
      VersioningConfiguration: {
        Status: "Enabled",
      },
    },
  };

  resources.CodePipeline = {
    Type: "AWS::CodePipeline::Pipeline",
    Properties: {
      Name: {
        "Fn::Sub": `${"${projectName}-${environment}"}`,
      },
      RoleArn: { "Fn::GetAtt": ["CodePipelineRole", "Arn"] },
      ArtifactStores: [
        {
          Region: {
            Ref: "AWS::Region",
          },
          ArtifactStore: {
            Type: "S3",
            Location: { Ref: "ArtifactBucket" },
          },
        },
      ],
      Stages: [
        {
          Name: "Source",
          Actions: [
            {
              Name: "Source",
              ActionTypeId: {
                Category: "Source",
                Owner: "AWS",
                Provider: "CodeCommit",
                Version: "1",
              },
              Configuration: {
                RepositoryName: repositoryName,
                BranchName: branchName,
              },
              OutputArtifacts: [{ Name: "SourceArtifact" }],
            },
          ],
        },
      ],
    },
  };

  outputs.PipelineArn = {
    Description: "CodePipeline ARN",
    Value: { "Fn::GetAtt": ["CodePipeline", "Arn"] },
  };

  return [resources, outputs];
}
