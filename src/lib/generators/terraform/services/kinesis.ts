import { GeneratedFile } from '../types';

export function generateKinesis(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const streamName = cfg.stream_name || 'data-stream';
  const shardCount = cfg.shard_count || 1;
  const retentionPeriod = cfg.retention_period || 24;
  const enableEncryption = cfg.enable_encryption !== false;

  const content = `# Kinesis Data Stream
resource "aws_kinesis_stream" "main" {
  name             = "\${var.project_name}-\${var.environment}-${streamName}"
  shard_count      = ${shardCount}
  retention_period = ${retentionPeriod}
  stream_mode      = "PROVISIONED"

  ${enableEncryption ? `stream_encryption {
    encryption_type = "KMS"
    key_id         = "alias/aws/kinesis"
  }` : ''}

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-${streamName}"
  })
}`;

  return {
    name: "kinesis.tf",
    path: `${projectName}/kinesis.tf`,
    content,
    language: "hcl",
  };
}
