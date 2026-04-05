import { GeneratedFile } from '../types';

export function generateEfs(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const performanceMode = cfg.performance_mode || "generalPurpose";
  const throughputMode = cfg.throughput_mode || "bursting";
  const encrypted = cfg.encrypted !== false;
  const enableBackup = cfg.enable_backup === true;
  const mountTargets = parseInt(cfg.mount_targets || "2");
  const storageSize = cfg.storage_size || null; // EFS is elastic, but can set provisioned throughput

  let content = `# EFS File System
resource "aws_efs_file_system" "main" {
  creation_token = "${'${var.project_name}-${var.environment}-efs'}"
  
  performance_mode = "${performanceMode}"
  throughput_mode  = "${throughputMode}"
  encrypted        = ${encrypted}

  ${storageSize ? `provisioned_throughput_in_mibps = ${storageSize}` : ''}

  tags = {
    Name = "${'${var.project_name}-${var.environment}-efs'}"
    Environment = "${'${var.environment}'}"
  }
}

`;

  // Add mount targets for each subnet
  for (let i = 0; i < mountTargets; i++) {
    const subnetName = i < 2 ? `private_${i}` : `public_${i - 2}`;
    content += `# Mount target for ${subnetName} subnet
resource "aws_efs_mount_target" "mount_${i}" {
  file_system_id  = aws_efs_file_system.main.id
  subnet_id       = aws_subnet.${subnetName}.id
  security_groups = [aws_security_group.efs.id]
}

`;
  }

  content += `# Security group for EFS
resource "aws_security_group" "efs" {
  name_prefix = "${'${var.project_name}-${var.environment}-efs-'}"
  vpc_id      = aws_vpc.main.id
  description = "Allow NFS traffic for EFS"

  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    security_groups = [aws_security_group.ec2.id]
    description = "NFS from EC2 instances"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${'${var.project_name}-${var.environment}-efs-sg'}"
  }
}

`;

  if (enableBackup) {
    content += `# EFS Backup
resource "aws_backup_vault" "efs" {
  name = "${'${var.project_name}-${var.environment}-efs-backup'}"
  
  tags = {
    Name = "${'${var.project_name}-${var.environment}-efs-backup'}"
  }
}

resource "aws_backup_plan" "efs" {
  name = "${'${var.project_name}-${var.environment}-efs-backup-plan'}"

  rule {
    rule_name         = "efs_daily_backup"
    target_vault_name = aws_backup_vault.efs.name
    schedule          = "cron(0 2 ? * * *)"

    lifecycle {
      delete_after = 30
    }

    recovery_point_tags = {
      Environment = "${'${var.environment}'}"
    }
  }
}

resource "aws_backup_selection" "efs" {
  iam_role_arn = aws_iam_role.backup.arn
  name         = "${'${var.project_name}-${var.environment}-efs-backup-selection'}"
  plan_id      = aws_backup_plan.efs.id

  resources = [aws_efs_file_system.main.arn]
}

resource "aws_iam_role" "backup" {
  name = "${'${var.project_name}-${var.environment}-backup-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "backup" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup.name
}

`;
  }

  // Add CloudWatch monitoring
  if (cfg.enable_monitoring === true) {
    content += `# CloudWatch metrics for EFS
resource "aws_cloudwatch_metric_alarm" "efs_burst_credit_balance" {
  alarm_name          = "${'${var.project_name}-${var.environment}-efs-burst-credits'}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "BurstCreditBalance"
  namespace           = "AWS/EFS"
  period              = "300"
  statistic           = "Average"
  threshold           = "1000000000"  # 1GB in bytes
  alarm_description   = "EFS burst credits running low"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    FileSystemId = aws_efs_file_system.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "efs_percent_io_limit" {
  alarm_name          = "${'${var.project_name}-${var.environment}-efs-io-limit'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "PercentIOLimit"
  namespace           = "AWS/EFS"
  period              = "300"
  statistic           = "Average"
  threshold           = "95"
  alarm_description   = "EFS approaching I/O limit"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    FileSystemId = aws_efs_file_system.main.id
  }
}
`;
  }

  return {
    name: "efs.tf",
    path: `${projectName}/efs.tf`,
    content,
    language: "hcl",
  };
}
