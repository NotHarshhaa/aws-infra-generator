import { GeneratedFile } from '../types';

export function generateCodeBuild(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const buildRuntime = cfg.build_runtime || 'ubuntu-standard';
  const computeType = cfg.compute_type || 'BUILD_GENERAL1_SMALL';
  const buildTimeout = cfg.build_timeout || 60;

  const image = buildRuntime === 'ubuntu-standard' ? "aws/codebuild/standard:6.0" : buildRuntime === 'amazonlinux2' ? "aws/codebuild/amazonlinux2-aarch64-standard:3.0" : "aws/codebuild/standard:6.0";

  const content = `# IAM Role for CodeBuild
resource "aws_iam_role" "codebuild" {
  name = "\${var.project_name}-\${var.environment}-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-codebuild-role"
  })
}

# IAM Policy for CodeBuild
resource "aws_iam_role_policy" "codebuild_basic" {
  name = "codebuild-basic-execution"
  role = aws_iam_role.codebuild.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# CodeBuild Project
resource "aws_codebuild_project" "main" {
  name         = "\${var.project_name}-\${var.environment}"
  description  = "CodeBuild project for \${var.project_name}"
  service_role = aws_iam_role.codebuild.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    type        = "LINUX_CONTAINER"
    compute_type = "${computeType}"
    image       = "${image}"
  }

  source {
    type         = "GITHUB"
    location     = "https://github.com/example/repo.git"
    buildspec    = "buildspec.yml"
  }

  timeout_in_minutes = ${buildTimeout}

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}"
  })
}`;

  return {
    name: "codebuild.tf",
    path: `${projectName}/codebuild.tf`,
    content,
    language: "hcl",
  };
}
