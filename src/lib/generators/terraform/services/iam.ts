import { GeneratedFile } from '../types';

export function generateIam(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const createAdmin = cfg.create_admin_role === true;
  const createEc2Role = cfg.create_ec2_role !== false;
  const createS3Policy = cfg.create_s3_policy === true;
  const createRdsPolicy = cfg.create_rds_policy === true;

  const lines: string[] = [];

  // Data source for caller identity
  if (createAdmin) {
    lines.push(
      `# Data source to get current AWS account and user information`,
      `data "aws_caller_identity" "current" {}`,
      ``
    );
  }

  // EC2 Role for instances
  if (createEc2Role) {
    lines.push(
      `# IAM Role for EC2 instances with least privilege access`,
      `resource "aws_iam_role" "ec2" {`,
      `  name = "${'${var.project_name}-${var.environment}-ec2-role'}"`,
      `  description = "IAM role for EC2 instances"`,
      ``,
      `  assume_role_policy = jsonencode({`,
      `    Version = "2012-10-17"`,
      `    Statement = [{`,
      `      Effect = "Allow"`,
      `      Principal = { Service = "ec2.amazonaws.com" },`,
      `      Action = "sts:AssumeRole"`,
      `    }]`,
      `  })`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-ec2-role'}"`,
      `  })`,
      `}`,
      ``,
      `# IAM Instance Profile for EC2 instances`,
      `resource "aws_iam_instance_profile" "ec2" {`,
      `  name = "${'${var.project_name}-${var.environment}-ec2-profile'}"`,
      `  role = aws_iam_role.ec2.name`,
      `}`,
      ``
    );
  }

  // Admin Role (use with caution)
  if (createAdmin) {
    lines.push(
      `# IAM Role with Administrator Access (WARNING: Full access)`,
      `resource "aws_iam_role" "admin" {`,
      `  name = "${'${var.project_name}-${var.environment}-admin-role'}"`,
      `  description = "IAM role with administrator access"`,
      ``,
      `  assume_role_policy = jsonencode({`,
      `    Version = "2012-10-17"`,
      `    Statement = [{`,
      `      Effect = "Allow",`,
      `      Principal = {`,
      `        AWS = data.aws_caller_identity.current.arn`,
      `      },`,
      `      Action = "sts:AssumeRole",`,
      `    }]`,
      `  })`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-admin-role'}"`,
      `  })`,
      `}`,
      ``,
      `# Attach Administrator Access policy to admin role`,
      `resource "aws_iam_role_policy_attachment" "admin" {`,
      `  role       = aws_iam_role.admin.name`,
      `  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"`,
      `}`,
      ``
    );
  }

  // S3 Access Policy
  if (createS3Policy) {
    lines.push(
      `# IAM Policy for S3 access with proper resource scoping`,
      `resource "aws_iam_policy" "s3_access" {`,
      `  name        = "${'${var.project_name}-${var.environment}-s3-access'}"`,
      `  description = "S3 access policy with proper resource scoping"`,
      ``,
      `  policy = jsonencode({`,
      `    Version = "2012-10-17"`,
      `    Statement = [`,
      `      {`,
      `        Effect = "Allow"`,
      `        Action = [`,
      `          "s3:GetObject",`,
      `          "s3:PutObject",`,
      `          "s3:DeleteObject",`,
      `          "s3:ListMultipartUploadParts",`,
      `          "s3:AbortMultipartUpload"`,
      `        ]`,
      `        Resource = [`,
      `          "${'${aws_s3_bucket.main.arn}/*'}",`,
      `        ]`,
      `      },`,
      `      {`,
      `        Effect = "Allow",`,
      `        Action = [`,
      `          "s3:ListBucket",`,
      `          "s3:GetBucketLocation",`,
      `        ]`,
      `        Resource = [`,
      `          aws_s3_bucket.main.arn,`,
      `        ]`,
      `      },`,
      `    ]`,
      `  })`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-s3-access-policy'}"`,
      `  })`,
      `}`,
      ``
    );
  }

  // RDS Access Policy
  if (createRdsPolicy) {
    lines.push(
      `# IAM Policy for RDS access with proper resource scoping`,
      `resource "aws_iam_policy" "rds_access" {`,
      `  name        = "${'${var.project_name}-${var.environment}-rds-access'}"`,
      `  description = "RDS access policy with proper resource scoping"`,
      ``,
      `  policy = jsonencode({`,
      `    Version = "2012-10-17"`,
      `    Statement = [`,
      `      {`,
      `        Effect = "Allow",`,
      `        Action = [`,
      `          "rds:Describe*",`,
      `          "rds:List*",`,
      `          "rds:Connect",`,
      `          "rds:Create*",`,
      `          "rds:Modify*",`,
      `          "rds:Delete*",`,
      `          "rds:Reboot*",`,
      `        ]`,
      `        Resource = [`,
      `          aws_db_instance.main.arn,`,
      `        ]`,
      `      },`,
      `      {`,
      `        Effect = "Allow",`,
      `        Action = [`,
      `          "rds:Describe*",`,
      `          "rds:List*",`,
      `        ]`,
      `        Resource = "*",`,
      `      },`,
      `    ]`,
      `  })`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-rds-access-policy'}"`,
      `  })`,
      `}`,
      ``
    );
  }

  if (lines.length === 0) {
    lines.push('# No IAM resources configured');
  }

  const content = lines.join('\n') + '\n';
  return {
    name: "iam.tf",
    path: `${projectName}/iam.tf`,
    content,
    language: "hcl",
  };
}
