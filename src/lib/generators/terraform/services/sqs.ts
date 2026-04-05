import { GeneratedFile } from '../types';

export function generateSqs(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const queueName = cfg.queue_name || `${projectName}-${environment}-queue`;
  const queueType = cfg.queue_type || "standard";
  const visibilityTimeout = cfg.visibility_timeout || 30;
  const messageRetentionPeriod = cfg.message_retention_period || 345600; // 4 days in seconds
  const deadLetterQueue = cfg.dead_letter_queue === true;
  const enableEncryption = cfg.enable_encryption !== false;
  const enableMonitoring = cfg.enable_monitoring === true;

  let content = `# SQS Queue
resource "aws_sqs_queue" "main" {
  name = "${queueName}"
  
  ${queueType === 'fifo' ? `fifo_queue = true` : ''}
  visibility_timeout_seconds = ${visibilityTimeout}
  message_retention_seconds = ${messageRetentionPeriod}
  
  ${enableEncryption ? `sqs_managed_sse_enabled = true` : ''}
  
  tags = {
    Name = "${'${var.project_name}-${var.environment}-sqs'}"
    Environment = "${'${var.environment}'}"
  }
}

`;

  if (deadLetterQueue) {
    const maxReceiveCount = cfg.max_receive_count || 3;
    content += `# Dead Letter Queue
resource "aws_sqs_queue" "dlq" {
  name = "${queueName}-dlq"
  
  ${queueType === 'fifo' ? `fifo_queue = true` : ''}
  message_retention_seconds = 1209600  # 14 days
  
  ${enableEncryption ? `sqs_managed_sse_enabled = true` : ''}
  
  tags = {
    Name = "${'${var.project_name}-${var.environment}-sqs-dlq'}"
    Environment = "${'${var.environment}'}"
  }
}

# Redrive policy for main queue
resource "aws_sqs_queue_redrive_policy" "main" {
  queue_url = aws_sqs_queue.main.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = ${maxReceiveCount}
  })
}

`;
  }

  // Add IAM policy for queue access
  if (cfg.create_iam_policy === true) {
    content += `# IAM policy for SQS access
resource "aws_iam_policy" "sqs" {
  name        = "${'${var.project_name}-${var.environment}-sqs-policy'}"
  description = "Policy for SQS queue access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = [
          aws_sqs_queue.main.arn,
          ${deadLetterQueue ? `aws_sqs_queue.dlq.arn,` : ''}
        ]
      }
    ]
  })
}
`;
  }

  // Add CloudWatch monitoring
  if (enableMonitoring) {
    content += `# CloudWatch alarms for SQS
resource "aws_cloudwatch_metric_alarm" "sqs_messages_visible" {
  alarm_name          = "${'${var.project_name}-${var.environment}-sqs-visible-messages'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Average"
  threshold           = 100
  alarm_description   = "SQS queue has too many visible messages"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    QueueName = aws_sqs_queue.main.name
  }
}

resource "aws_cloudwatch_metric_alarm" "sqs_messages_deleted" {
  alarm_name          = "${'${var.project_name}-${var.environment}-sqs-deleted-messages'}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "NumberOfMessagesDeleted"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "SQS queue processing rate is too low"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    QueueName = aws_sqs_queue.main.name
  }
}

resource "aws_cloudwatch_metric_alarm" "sqs_age_of_oldest_message" {
  alarm_name          = "${'${var.project_name}-${var.environment}-sqs-oldest-message'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ApproximateAgeOfOldestMessage"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Maximum"
  threshold           = 3600  # 1 hour
  alarm_description   = "SQS queue has old messages"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    QueueName = aws_sqs_queue.main.name
  }
}
`;
  }

  return {
    name: "sqs.tf",
    path: `${projectName}/sqs.tf`,
    content,
    language: "hcl",
  };
}
