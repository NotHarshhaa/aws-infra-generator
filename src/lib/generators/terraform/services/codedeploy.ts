import { GeneratedFile } from '../types';

export function generateCodeDeploy(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const applicationName = cfg.application_name || 'my-app';
  const deploymentPlatform = cfg.deployment_platform || 'ec2';

  const content = `# IAM Role for CodeDeploy
resource "aws_iam_role" "codedeploy" {
  name = "\${var.project_name}-\${var.environment}-codedeploy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "codedeploy.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
  ]

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-codedeploy-role"
  })
}

# CodeDeploy Application
resource "aws_codedeploy_app" "main" {
  name             = "\${var.project_name}-\${var.environment}-${applicationName}"
  compute_platform = "${deploymentPlatform === 'lambda' ? 'Lambda' : deploymentPlatform === 'ecs' ? 'ECS' : 'Server'}"

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-${applicationName}"
  })
}

# CodeDeploy Deployment Group
resource "aws_codedeploy_deployment_group" "main" {
  app_name              = aws_codedeploy_app.main.name
  deployment_group_name = "\${var.project_name}-\${var.environment}-deployment-group"
  service_role_arn      = aws_iam_role.codedeploy.arn
  deployment_config_name = "CodeDeployDefault.OneAtATime"

  deployment_style {
    deployment_type   = "IN_PLACE"
    deployment_option = "WITHOUT_TRAFFIC_CONTROL"
  }
}`;

  return {
    name: "codedeploy.tf",
    path: `${projectName}/codedeploy.tf`,
    content,
    language: "hcl",
  };
}
