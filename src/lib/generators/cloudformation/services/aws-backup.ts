import { ServiceBuilderResult } from '../types';

export function buildAWSBackup(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const vaultName = cfg.vault_name || 'Default';
  const enableBackupPlan = cfg.enable_backup_plan !== false;
  const backupFrequency = cfg.backup_frequency || 'daily';
  const retentionDays = cfg.retention_days || 30;

  resources.BackupVault = {
    Type: "AWS::Backup::BackupVault",
    Properties: {
      BackupVaultName: {
        "Fn::Sub": `${"${projectName}-${environment}-${vaultName}"}`,
      },
      Tags: [
        {
          Key: "Environment",
          Value: environment,
        },
      ],
    },
  };

  if (enableBackupPlan) {
    const scheduleExpression = backupFrequency === 'hourly' ? 'cron(0 * ? * * *)' : backupFrequency === 'daily' ? 'cron(0 0 ? * * *)' : backupFrequency === 'weekly' ? 'cron(0 0 ? * 1 *)' : 'cron(0 0 1 * ? *)';

    resources.BackupPlan = {
      Type: "AWS::Backup::BackupPlan",
      Properties: {
        BackupPlanName: {
          "Fn::Sub": `${"${projectName}-${environment}-backup-plan"}`,
        },
        BackupPlanRule: [
          {
            RuleName: {
              "Fn::Sub": `${"${projectName}-${environment}-daily-rule"}`,
            },
            TargetBackupVault: { Ref: "BackupVault" },
            ScheduleExpression: scheduleExpression,
            Lifecycle: {
              DeleteAfterDays: retentionDays,
            },
          },
        ],
      },
    };
  }

  outputs.VaultArn = {
    Description: "Backup Vault ARN",
    Value: { "Fn::GetAtt": ["BackupVault", "BackupVaultArn"] },
  };

  return [resources, outputs];
}
