import { GeneratedFile } from '../types';

export function generateCodePipeline(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const pipelineName = cfg.pipeline_name || 'my-pipeline';
  const repositoryName = cfg.repository_name || 'my-repo';
  const branchName = cfg.branch_name || 'main';

  const content = `# IAM Role for CodePipeline
resource "aws_iam_role" "codepipeline" {
  name = "\${var.project_name}-\${var.environment}-pipeline-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "codepipeline.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-pipeline-role"
  })
}

# IAM Policy for CodePipeline
resource "aws_iam_role_policy" "codepipeline_basic" {
  name = "codepipeline-basic-execution"
  role = aws_iam_role.codepipeline.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "codebuild:StartBuild",
          "codebuild:BatchGetBuilds"
        ]
        Resource = "*"
      }
    ]
  })
}

# S3 Bucket for Pipeline Artifacts
resource "aws_s3_bucket" "artifacts" {
  bucket = "\${var.project_name}-\${var.environment}-pipeline-artifacts"

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-pipeline-artifacts"
  })
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

# CodePipeline
resource "aws_codepipeline" "main" {
  name     = "\${var.project_name}-\${var.environment}"
  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    location = aws_s3_bucket.artifacts.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeCommit"
      version          = "1"
      output_artifacts = ["SourceArtifact"]

      configuration = {
        RepositoryName = "${repositoryName}"
        BranchName     = "${branchName}"
      }
    }
  }

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}"
  })
}`;

  return {
    name: "codepipeline.tf",
    path: `${projectName}/codepipeline.tf`,
    content,
    language: "hcl",
  };
}
