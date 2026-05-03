import { GeneratedFile } from '../types';

export function generateAWSConfig(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const enableRecorder = cfg.enable_recorder !== false;
  const includeGlobalResources = cfg.include_global_resources !== false;

  const content = `${enableRecorder ? `# AWS Config Recorder
resource "aws_config_configuration_recorder" "main" {
  name     = "\${var.project_name}-\${var.environment}-recorder"
  role_arn = "arn:aws:iam::\${data.aws_caller_identity.current.account_id}:role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig"

  recording_group {
    all_supported = true
    include_global_resource_types = ${includeGlobalResources}
  }
}

# AWS Config Delivery Channel
resource "aws_config_delivery_channel" "main" {
  name           = "\${var.project_name}-\${var.environment}-delivery-channel"
  s3_bucket_name = "\${var.project_name}-\${var.environment}-config-logs"

  depends_on = [aws_config_configuration_recorder.main]
}` : ''}

# AWS Config Recorder Status
resource "aws_config_configuration_recorder_status" "main" {
  name       = aws_config_configuration_recorder.main.name
  is_enabled = true
  depends_on = [aws_config_delivery_channel.main]
}`;

  return {
    name: "aws-config.tf",
    path: `${projectName}/aws-config.tf`,
    content,
    language: "hcl",
  };
}
