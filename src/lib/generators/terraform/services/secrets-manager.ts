import { GeneratedFile } from '../types';

export function generateSecretsManager(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const secretName = cfg.secret_name || 'db-credentials';
  const enableRotation = cfg.enable_rotation === true;
  const rotationIntervalDays = cfg.rotation_interval_days || 30;

  const content = `# Secrets Manager Secret
resource "aws_secretsmanager_secret" "main" {
  name                    = "\${var.project_name}-\${var.environment}-${secretName}"
  description             = "${cfg.secret_type || 'generic'} secret for \${var.project_name}"

  ${enableRotation ? `rotation_rules {
    automatically_after_days = ${rotationIntervalDays}
  }` : ''}

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-${secretName}"
  })
}

# Secret Value
resource "aws_secretsmanager_secret_version" "main" {
  secret_id = aws_secretsmanager_secret.main.id
  secret_string = jsonencode({
    username = "admin"
    password = "CHANGE_ME_PASSWORD"
  })
}`;

  return {
    name: "secrets-manager.tf",
    path: `${projectName}/secrets-manager.tf`,
    content,
    language: "hcl",
  };
}
