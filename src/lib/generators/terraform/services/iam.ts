import { GeneratedFile } from '../types';

export function generateIam(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const createAdmin = cfg.create_admin_role === true;
  const createEc2Role = cfg.create_ec2_role !== false;
  const createS3Policy = cfg.create_s3_policy === true;
  const createRdsPolicy = cfg.create_rds_policy === true;

  let content = '';

  if (createEc2Role) {
    content += `resource "aws_iam_role" "ec2" {
  name = "${'${var.project_name}-${var.environment}-ec2-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${'${var.project_name}-${var.environment}-ec2-role'}"
  }
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${'${var.project_name}-${var.environment}-ec2-profile'}"
  role = aws_iam_role.ec2.name
}
`;
  }

  if (createAdmin) {
    content += `
resource "aws_iam_role" "admin" {
  name = "${'${var.project_name}-${var.environment}-admin-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = data.aws_caller_identity.current.arn
        }
      }
    ]
  })

  tags = {
    Name = "${'${var.project_name}-${var.environment}-admin-role'}"
  }
}

resource "aws_iam_role_policy_attachment" "admin" {
  role       = aws_iam_role.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

data "aws_caller_identity" "current" {}
`;
  }

  if (createS3Policy) {
    content += `
resource "aws_iam_policy" "s3_access" {
  name        = "${'${var.project_name}-${var.environment}-s3-access'}"
  description = "S3 access policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = ["*"]
      }
    ]
  })
}
`;
  }

  if (createRdsPolicy) {
    content += `
resource "aws_iam_policy" "rds_access" {
  name        = "${'${var.project_name}-${var.environment}-rds-access'}"
  description = "RDS access policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:Connect"
        ]
        Resource = ["*"]
      }
    ]
  })
}
`;
  }

  if (!content.trim()) {
    content = '# No IAM resources configured\n';
  }

  return {
    name: "iam.tf",
    path: `${projectName}/iam.tf`,
    content,
    language: "hcl",
  };
}
