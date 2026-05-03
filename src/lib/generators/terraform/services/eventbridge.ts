import { GeneratedFile } from '../types';

export function generateEventBridge(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const eventBusName = cfg.event_bus_name || 'default';
  const createCustomBus = cfg.create_custom_bus === true;
  const enableArchive = cfg.enable_archive === true;
  const archiveRetentionDays = cfg.archive_retention_days || 30;

  const content = `${createCustomBus ? `# Custom Event Bus
resource "aws_cloudwatch_event_bus" "main" {
  name = "\${var.project_name}-\${var.environment}-${eventBusName}"

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-${eventBusName}"
  })
}` : ''}

${enableArchive ? `# EventBridge Archive
resource "aws_cloudwatch_event_archive" "main" {
  name              = "\${var.project_name}-\${var.environment}-archive"
  source_arn        = ${createCustomBus ? 'aws_cloudwatch_event_bus.main.arn' : 'aws_cloudwatch_event_bus.default.arn'}
  retention_days    = ${archiveRetentionDays}

  event_pattern = jsonencode({
    source = [{ prefix = "" }]
  })
}` : ''}

# EventBridge Rule
resource "aws_cloudwatch_event_rule" "main" {
  name          = "\${var.project_name}-\${var.environment}-rule"
  ${createCustomBus ? `event_bus_name = aws_cloudwatch_event_bus.main.name` : ''}
  event_pattern = jsonencode({
    source = ["aws.ec2"]
    detail-type = ["EC2 Instance State-change Notification"]
  })
  state         = "ENABLED"

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-rule"
  })
}

# CloudWatch Log Group for EventBridge
resource "aws_cloudwatch_log_group" "eventbridge" {
  name              = "/aws/events/\${var.project_name}-\${var.environment}"
  retention_in_days = 7

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-eventbridge-logs"
  })
}

# EventBridge Target (Log Group)
resource "aws_cloudwatch_event_target" "main" {
  rule           = aws_cloudwatch_event_rule.main.name
  ${createCustomBus ? `event_bus_name = aws_cloudwatch_event_bus.main.name` : ''}
  arn            = aws_cloudwatch_log_group.eventbridge.arn
  target_id      = "LogTarget"
}`;

  return {
    name: "eventbridge.tf",
    path: `${projectName}/eventbridge.tf`,
    content,
    language: "hcl",
  };
}
