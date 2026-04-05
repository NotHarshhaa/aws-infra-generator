import { GeneratedFile } from '../types';

export function generateCloudWatch(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const enableLogGroup = cfg.enable_log_group !== false;
  const logRetentionDays = cfg.log_retention_days || 14;
  const enableAlarms = cfg.enable_alarms === true;
  const enableDashboard = cfg.enable_dashboard === true;
  const enableMetricFilters = cfg.enable_metric_filters === true;

  let content = '';

  // Log Groups
  if (enableLogGroup) {
    content += `# Application Log Group
resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/ec2/\${var.project_name}-\${var.environment}"
  retention_in_days = ${logRetentionDays}

  tags = {
    Name = "\${var.project_name}-\${var.environment}-app-logs"
    Environment = "\${var.environment}"
  }
}

# Lambda Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/\${var.project_name}-\${var.environment}-lambda"
  retention_in_days = ${logRetentionDays}

  tags = {
    Name = "\${var.project_name}-\${var.environment}-lambda-logs"
    Environment = "\${var.environment}"
  }
}

# RDS Log Group
resource "aws_cloudwatch_log_group" "rds" {
  name              = "/aws/rds/instance/\${var.project_name}-\${var.environment}-db"
  retention_in_days = ${logRetentionDays}

  tags = {
    Name = "\${var.project_name}-\${var.environment}-rds-logs"
    Environment = "\${var.environment}"
  }
}

# VPC Flow Logs Group
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/\${var.project_name}-\${var.environment}-flow-logs"
  retention_in_days = ${environment === "production" ? 365 : 14}

  tags = {
    Name = "\${var.project_name}-\${var.environment}-vpc-logs"
    Environment = "\${var.environment}"
  }
}

`;
  }

  // Metric Filters
  if (enableMetricFilters) {
    content += `# Metric Filter for HTTP 5xx Errors
resource "aws_cloudwatch_log_metric_filter" "http_5xx_errors" {
  name           = "\${var.project_name}-\${var.environment}-http-5xx-errors"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[timestamp, request_id, elb, client_ip, target_ip, request_processing_time, target_processing_time, response_processing_time, elb_status_code, target_status_code, ...]"

  metric_transformation {
    name      = "Http5xxErrors"
    namespace = "Custom/Http"
    value     = "1"
  }
}

# Metric Filter for Application Errors
resource "aws_cloudwatch_log_metric_filter" "app_errors" {
  name           = "\${var.project_name}-\${var.environment}-app-errors"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[timestamp, request_id, level=ERROR, ...]"

  metric_transformation {
    name      = "AppErrors"
    namespace = "Custom/Application"
    value     = "1"
  }
}

# Metric Filter for Database Connection Errors
resource "aws_cloudwatch_log_metric_filter" "db_errors" {
  name           = "\${var.project_name}-\${var.environment}-db-errors"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[timestamp, request_id, db_connection_error, ...]"

  metric_transformation {
    name      = "DatabaseErrors"
    namespace = "Custom/Database"
    value     = "1"
  }
}

`;
  }

  // Custom Metrics
  if (cfg.enable_custom_metrics === true) {
    content += `# Custom Metrics Namespace
resource "aws_cloudwatch_metric_alarm" "custom_metric_example" {
  alarm_name          = "\${var.project_name}-\${var.environment}-custom-metric"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CustomMetric"
  namespace           = "Custom/Application"
  period              = "300"
  statistic           = "Average"
  threshold           = 100
  alarm_description   = "Custom metric threshold exceeded"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    Environment = "\${var.environment}"
    Application = "\${var.project_name}"
  }
}

`;
  }

  // System Alarms
  if (enableAlarms) {
    content += `# EC2 CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "ec2_cpu" {
  alarm_name          = "\${var.project_name}-\${var.environment}-ec2-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = ${cfg.ec2_cpu_threshold || 80}
  alarm_description   = "EC2 CPU utilization is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    InstanceId = aws_instance.main[0].id
  }
}

# EC2 Memory Utilization Alarm (requires CloudWatch agent)
resource "aws_cloudwatch_metric_alarm" "ec2_memory" {
  alarm_name          = "\${var.project_name}-\${var.environment}-ec2-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "CWAgent"
  period              = "300"
  statistic           = "Average"
  threshold           = ${cfg.ec2_memory_threshold || 85}
  alarm_description   = "EC2 memory utilization is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    InstanceId = aws_instance.main[0].id
  }
}

# EC2 Disk Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "ec2_disk" {
  alarm_name          = "\${var.project_name}-\${var.environment}-ec2-disk"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DiskUtilization"
  namespace           = "CWAgent"
  period              = "300"
  statistic           = "Average"
  threshold           = ${cfg.ec2_disk_threshold || 85}
  alarm_description   = "EC2 disk utilization is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    InstanceId = aws_instance.main[0].id
    Device     = "/dev/xvda1"
  }
}

# RDS CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "\${var.project_name}-\${var.environment}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = ${cfg.rds_cpu_threshold || 80}
  alarm_description   = "RDS CPU utilization is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

# RDS Memory Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "rds_memory" {
  alarm_name          = "\${var.project_name}-\${var.environment}-rds-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = 268435456  # 256MB in bytes
  alarm_description   = "RDS free memory is low"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

# RDS Storage Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "\${var.project_name}-\${var.environment}-rds-storage"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = 10737418240  # 10GB in bytes
  alarm_description   = "RDS free storage space is low"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

# ALB Response Time Alarm
resource "aws_cloudwatch_metric_alarm" "alb_response_time" {
  alarm_name          = "\${var.project_name}-\${var.environment}-alb-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = ${cfg.alb_response_time_threshold || 5}
  alarm_description   = "ALB response time is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
    TargetGroup  = aws_lb_target_group.main.arn_suffix
  }
}

# ALB 5XX Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "\${var.project_name}-\${var.environment}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = ${cfg.alb_5xx_threshold || 10}
  alarm_description   = "ALB has too many 5XX errors"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# S3 Bucket Size Alarm
resource "aws_cloudwatch_metric_alarm" "s3_bucket_size" {
  alarm_name          = "\${var.project_name}-\${var.environment}-s3-size"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BucketSizeBytes"
  namespace           = "AWS/S3"
  period              = 86400  # 1 day
  statistic           = "Average"
  threshold           = ${cfg.s3_size_threshold || 1073741824000}  # 1TB
  alarm_description   = "S3 bucket size is large"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    BucketName = aws_s3_bucket.main.bucket
    StorageType = "StandardStorage"
  }
}

`;
  }

  // Dashboard
  if (enableDashboard) {
    content += `# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "\${var.project_name}-\${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.main[0].id],
            [".", "NetworkIn", ".", "."],
            [".", "NetworkOut", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = "\${var.aws_region}"
          title  = "EC2 Metrics"
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.main.id],
            [".", "FreeableMemory", ".", "."],
            [".", "FreeStorageSpace", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = "\${var.aws_region}"
          title  = "RDS Metrics"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix],
            [".", "RequestCount", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = "\${var.aws_region}"
          title  = "ALB Metrics"
        }
      },
      {
        type   = "log"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          query   = "fields @timestamp, @message | sort @timestamp desc | limit 100"
          region  = "\${var.aws_region}"
          title   = "Application Logs"
          view    = "table"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 24
        height = 6

        properties = {
          metrics = [
            ["Custom/Application", "AppErrors"],
            ["Custom/Database", "DatabaseErrors"],
            ["Custom/Http", "Http5xxErrors"]
          ]
          period = 300
          stat   = "Sum"
          region = "\${var.aws_region}"
          title  = "Custom Application Metrics"
        }
      }
    ]
  })
}

`;
  }

  return {
    name: "cloudwatch.tf",
    path: `${projectName}/cloudwatch.tf`,
    content,
    language: "hcl",
  };
}
