import { GeneratedFile } from '../types';

export function generateKMS(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const keySpec = cfg.key_spec || 'SYMMETRIC_DEFAULT';
  const enableKeyRotation = cfg.enable_key_rotation === true;

  const content = `# KMS Key
resource "aws_kms_key" "main" {
  description             = "KMS key for \${var.project_name}"
  enabled                 = true
  enable_key_rotation     = ${enableKeyRotation}
  key_usage               = "ENCRYPT_DECRYPT"
  key_spec                = "${keySpec}"

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-key"
  })
}

# KMS Key Alias
resource "aws_kms_alias" "main" {
  name          = "alias/\${var.project_name}-\${var.environment}-key"
  target_key_id = aws_kms_key.main.key_id
}`;

  return {
    name: "kms.tf",
    path: `${projectName}/kms.tf`,
    content,
    language: "hcl",
  };
}
