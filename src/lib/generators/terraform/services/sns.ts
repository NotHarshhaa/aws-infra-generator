import { GeneratedFile } from '../types';

export function generateSns(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const topicName = cfg.topic_name || `${projectName}-${environment}-notifications`;
  const displayName = cfg.display_name || `${projectName} Notifications`;
  const topicType = cfg.topic_type || "standard";
  const enableDeliveryPolicy = cfg.enable_delivery_policy === true;
  const enableEncryption = cfg.enable_encryption !== false;
  const enableMonitoring = cfg.enable_monitoring === true;

  let content = `# SNS Topic
resource "aws_sns_topic" "main" {
  name = "${topicName}"
  
  ${topicType === 'fifo' ? `fifo_topic = true` : ''}
  ${enableEncryption ? `kms_master_key_id = "alias/aws/sns"` : ''}
  
  ${displayName ? `display_name = "${displayName}"` : ''}
  
  tags = {
    Name = "${'${var.project_name}-${var.environment}-sns'}"
    Environment = "${'${var.environment}'}"
  }
}

`;

  // Add email subscriptions
  if (cfg.email_subscriptions && Array.isArray(cfg.email_subscriptions)) {
    content += cfg.email_subscriptions.map(email => 
      `resource "aws_sns_topic_subscription" "email_${email.replace(/[^a-zA-Z0-9]/g, '')}" {
  topic_arn = aws_sns_topic.main.arn
  protocol  = "email"
  endpoint  = "${email}"
  auto_confirm = true
}

`
    ).join('');
  }

  // Add SQS subscription
  if (cfg.sqs_subscription === true) {
    const queueArn = cfg.sqs_queue_arn || 'aws_sqs_queue.main.arn';
    content += `# SQS subscription
resource "aws_sns_topic_subscription" "sqs" {
  topic_arn = aws_sns_topic.main.arn
  protocol  = "sqs"
  endpoint  = ${queueArn}
}

# SQS policy to allow SNS to write to queue
resource "aws_sqs_queue_policy" "sns" {
  queue_url = aws_sqs_queue.main.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource  = aws_sqs_queue.main.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.main.arn
          }
        }
      }
    ]
  })
}

`;
  }

  // Add Lambda subscription
  if (cfg.lambda_subscription === true) {
    const lambdaArn = cfg.lambda_function_arn || 'aws_lambda_function.main.arn';
    content += `# Lambda subscription
resource "aws_sns_topic_subscription" "lambda" {
  topic_arn = aws_sns_topic.main.arn
  protocol  = "lambda"
  endpoint  = ${lambdaArn}
}

# Lambda permission for SNS
resource "aws_lambda_permission" "sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.main.arn
}

`;
  }

  // Add HTTP/HTTPS subscription
  if (cfg.http_subscription && cfg.http_endpoint) {
    content += `# HTTP subscription
resource "aws_sns_topic_subscription" "http" {
  topic_arn = aws_sns_topic.main.arn
  protocol  = "${cfg.http_subscription}"
  endpoint  = "${cfg.http_endpoint}"
}

`;
  }

  // Add delivery policy
  if (enableDeliveryPolicy) {
    content += `# Delivery policy
resource "aws_sns_topic_policy" "main" {
  arn = aws_sns_topic.main.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.main.arn
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "cloudwatch.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.main.arn
      }
    ]
  })
}

`;
  }

  // Add CloudWatch monitoring
  if (enableMonitoring) {
    content += `# CloudWatch alarms for SNS
resource "aws_cloudwatch_metric_alarm" "sns_notifications_failed" {
  alarm_name          = "${'${var.project_name}-${var.environment}-sns-failed'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "NumberOfNotificationsFailed"
  namespace           = "AWS/SNS"
  period              = "300"
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "SNS topic has failed notifications"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    TopicName = aws_sns_topic.main.name
  }
}

resource "aws_cloudwatch_metric_alarm" "sns_notifications_delivered" {
  alarm_name          = "${'${var.project_name}-${var.environment}-sns-delivered'}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "NumberOfNotificationsDelivered"
  namespace           = "AWS/SNS"
  period              = "300"
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "SNS topic delivery rate is too low"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    TopicName = aws_sns_topic.main.name
  }
}
`;
  }

  return {
    name: "sns.tf",
    path: `${projectName}/sns.tf`,
    content,
    language: "hcl",
  };
}
