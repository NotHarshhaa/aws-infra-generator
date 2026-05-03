import { GeneratedFile } from '../types';

export function generateAWSBackup(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const vaultName = cfg.vault_name || 'Default';
  const enableBackupPlan = cfg.enable_backup_plan !== false;
  const backupFrequency = cfg.backup_frequency || 'daily';
  const retentionDays = cfg.retention_days || 30;

  const scheduleExpression = backupFrequency === 'hourly' ? 'cron(0 * ? * * *)' : backupFrequency === 'daily' ? 'cron(0 0 ? * * *)' : backupFrequency === 'weekly' ? 'cron(0 0 ? * 1 *)' : 'cron(0 0 1 * ? *)';

  const content = `# AWS Backup Vault
resource "aws_backup_vault" "main" {
  name        = "\${var.project_name}-\${var.environment}-${vaultName}"

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-${vaultName}"
  })
}

${enableBackupPlan ? `# AWS Backup Plan
resource "aws_backup_plan" "main" {
  name = "\${var.project_name}-\${var.environment}-backup-plan"

  rule {
    name              = "\${var.project_name}-\${var.environment}-daily-rule"
    target_vault_arn  = aws_backup_vault.main.arn
    schedule_expression = "${scheduleExpression}"

    lifecycle {
      delete_after = ${retentionDays}
    }
  }
}` : ''}`;

  return {
    name: "aws-backup.tf",
    path: `${projectName}/aws-backup.tf`,
    content,
    language: "hcl",
  };
}
