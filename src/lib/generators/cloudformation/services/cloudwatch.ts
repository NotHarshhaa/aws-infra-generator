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

  const resources: any = {
    Parameters: {
      LogRetentionDays: {
        Type: "Number",
        Default: logRetentionDays.toString(),
        MinValue: "1",
        MaxValue: "365",
        Description: "Log retention period in days",
      },
    },
    Resources: {},
    Outputs: {},
  };

  // Log Groups
  if (enableLogGroup) {
    resources.Resources.ApplicationLogGroup = {
      Type: "AWS::Logs::LogGroup",
      Properties: {
        LogGroupName: `/aws/ec2/${projectName}-${environment}`,
        RetentionInDays: { Ref: "LogRetentionDays" },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-app-logs`,
          },
          {
            Key: "Environment",
            Value: environment,
          },
        ],
      },
    };

    resources.Resources.LambdaLogGroup = {
      Type: "AWS::Logs::LogGroup",
      Properties: {
        LogGroupName: `/aws/lambda/${projectName}-${environment}-lambda`,
        RetentionInDays: { Ref: "LogRetentionDays" },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-lambda-logs`,
          },
        ],
      },
    };

    resources.Resources.RDSLogGroup = {
      Type: "AWS::Logs::LogGroup",
      Properties: {
        LogGroupName: `/aws/rds/instance/${projectName}-${environment}-db`,
        RetentionInDays: { Ref: "LogRetentionDays" },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-rds-logs`,
          },
        ],
      },
    };

    resources.Resources.VPCFlowLogsLogGroup = {
      Type: "AWS::Logs::LogGroup",
      Properties: {
        LogGroupName: `/aws/vpc/${projectName}-${environment}-flow-logs`,
        RetentionInDays: environment === "production" ? "365" : { Ref: "LogRetentionDays" },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-vpc-logs`,
          },
        ],
      },
    };

    resources.Outputs.ApplicationLogGroupArn = {
      Description: "Application log group ARN",
      Value: { "Fn::GetAtt": ["ApplicationLogGroup", "Arn"] },
    };

    resources.Outputs.LambdaLogGroupArn = {
      Description: "Lambda log group ARN",
      Value: { "Fn::GetAtt": ["LambdaLogGroup", "Arn"] },
    };
  }

  // Metric Filters
  if (enableMetricFilters) {
    resources.Resources.Http5xxErrorsFilter = {
      Type: "AWS::Logs::MetricFilter",
      Properties: {
        LogGroupName: { Ref: "ApplicationLogGroup" },
        FilterPattern: "[timestamp, request_id, elb, client_ip, target_ip, request_processing_time, target_processing_time, response_processing_time, elb_status_code, target_status_code, ...]",
        MetricTransformations: [
          {
            MetricName: "Http5xxErrors",
            MetricNamespace: "Custom/Http",
            MetricValue: "1",
          },
        ],
      },
    };

    resources.Resources.AppErrorsFilter = {
      Type: "AWS::Logs::MetricFilter",
      Properties: {
        LogGroupName: { Ref: "ApplicationLogGroup" },
        FilterPattern: "[timestamp, request_id, level=ERROR, ...]",
        MetricTransformations: [
          {
            MetricName: "AppErrors",
            MetricNamespace: "Custom/Application",
            MetricValue: "1",
          },
        ],
      },
    };

    resources.Resources.DBErrorsFilter = {
      Type: "AWS::Logs::MetricFilter",
      Properties: {
        LogGroupName: { Ref: "ApplicationLogGroup" },
        FilterPattern: "[timestamp, request_id, db_connection_error, ...]",
        MetricTransformations: [
          {
            MetricName: "DatabaseErrors",
            MetricNamespace: "Custom/Database",
            MetricValue: "1",
          },
        ],
      },
    };
  }

  // Custom Metrics
  if (cfg.enable_custom_metrics === true) {
    resources.Resources.CustomMetricAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-custom-metric`,
        AlarmDescription: "Custom metric threshold exceeded",
        MetricName: "CustomMetric",
        Namespace: "Custom/Application",
        Period: "300",
        Statistic: "Average",
        Threshold: "100",
        EvaluationPeriods: "2",
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "Environment",
            Value: environment,
          },
          {
            Name: "Application",
            Value: projectName,
          },
        ],
      },
    };
  }

  // System Alarms
  if (enableAlarms) {
    // EC2 CPU Utilization Alarm
    resources.Resources.EC2CPUAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-ec2-cpu`,
        AlarmDescription: "EC2 CPU utilization is high",
        MetricName: "CPUUtilization",
        Namespace: "AWS/EC2",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: cfg.ec2_cpu_threshold || 80,
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "InstanceId",
            Value: { Ref: "Instance0" },
          },
        ],
      },
    };

    // EC2 Memory Utilization Alarm (requires CloudWatch agent)
    resources.Resources.EC2MemoryAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-ec2-memory`,
        AlarmDescription: "EC2 memory utilization is high",
        MetricName: "MemoryUtilization",
        Namespace: "CWAgent",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: cfg.ec2_memory_threshold || 85,
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "InstanceId",
            Value: { Ref: "Instance0" },
          },
        ],
      },
    };

    // EC2 Disk Utilization Alarm
    resources.Resources.EC2DiskAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-ec2-disk`,
        AlarmDescription: "EC2 disk utilization is high",
        MetricName: "DiskUtilization",
        Namespace: "CWAgent",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: cfg.ec2_disk_threshold || 85,
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "InstanceId",
            Value: { Ref: "Instance0" },
          },
          {
            Name: "Device",
            Value: "/dev/xvda1",
          },
        ],
      },
    };

    // RDS CPU Utilization Alarm
    resources.Resources.RDSCPUAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-rds-cpu`,
        AlarmDescription: "RDS CPU utilization is high",
        MetricName: "CPUUtilization",
        Namespace: "AWS/RDS",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: cfg.rds_cpu_threshold || 80,
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "DBInstanceIdentifier",
            Value: { Ref: "RDSInstance" },
          },
        ],
      },
    };

    // RDS Memory Utilization Alarm
    resources.Resources.RDSMemoryAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-rds-memory`,
        AlarmDescription: "RDS free memory is low",
        MetricName: "FreeableMemory",
        Namespace: "AWS/RDS",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "268435456", // 256MB in bytes
        ComparisonOperator: "LessThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "DBInstanceIdentifier",
            Value: { Ref: "RDSInstance" },
          },
        ],
      },
    };

    // RDS Storage Utilization Alarm
    resources.Resources.RDSStorageAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-rds-storage`,
        AlarmDescription: "RDS free storage space is low",
        MetricName: "FreeStorageSpace",
        Namespace: "AWS/RDS",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "10737418240", // 10GB in bytes
        ComparisonOperator: "LessThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "DBInstanceIdentifier",
            Value: { Ref: "RDSInstance" },
          },
        ],
      },
    };

    // ALB Response Time Alarm
    resources.Resources.ALBResponseTimeAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-alb-response-time`,
        AlarmDescription: "ALB response time is high",
        MetricName: "TargetResponseTime",
        Namespace: "AWS/ApplicationELB",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: cfg.alb_response_time_threshold || 5,
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "LoadBalancer",
            Value: { "Fn::GetAtt": ["ApplicationLoadBalancer", "LoadBalancerArn"] },
          },
          {
            Name: "TargetGroup",
            Value: { "Fn::GetAtt": ["TargetGroup", "TargetGroupArn"] },
          },
        ],
      },
    };

    // ALB 5XX Error Rate Alarm
    resources.Resources.ALB5xxErrorsAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-alb-5xx`,
        AlarmDescription: "ALB has too many 5XX errors",
        MetricName: "HTTPCode_Target_5XX_Count",
        Namespace: "AWS/ApplicationELB",
        Statistic: "Sum",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: cfg.alb_5xx_threshold || 10,
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "LoadBalancer",
            Value: { "Fn::GetAtt": ["ApplicationLoadBalancer", "LoadBalancerArn"] },
          },
        ],
      },
    };

    // S3 Bucket Size Alarm
    resources.Resources.S3BucketSizeAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-s3-size`,
        AlarmDescription: "S3 bucket size is large",
        MetricName: "BucketSizeBytes",
        Namespace: "AWS/S3",
        Period: "86400", // 1 day
        Statistic: "Average",
        Threshold: cfg.s3_size_threshold || 1073741824000, // 1TB
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "BucketName",
            Value: { Ref: "S3Bucket" },
          },
          {
            Name: "StorageType",
            Value: "StandardStorage",
          },
        ],
      },
    };
  }

  // Dashboard
  if (enableDashboard) {
    resources.Resources.Dashboard = {
      Type: "AWS::CloudWatch::Dashboard",
      Properties: {
        DashboardName: `${projectName}-${environment}-dashboard`,
        DashboardBody: JSON.stringify({
          widgets: [
            {
              type: "metric",
              x: 0,
              y: 0,
              width: 12,
              height: 6,
              properties: {
                metrics: [
                  ["AWS/EC2", "CPUUtilization", "InstanceId", { Ref: "Instance0" }],
                  [".", "NetworkIn", ".", "."],
                  [".", "NetworkOut", ".", "."],
                ],
                period: 300,
                stat: "Average",
                region: { Ref: "AWS::Region" },
                title: "EC2 Metrics",
                yAxis: {
                  left: {
                    min: 0,
                    max: 100,
                  },
                },
              },
            },
            {
              type: "metric",
              x: 12,
              y: 0,
              width: 12,
              height: 6,
              properties: {
                metrics: [
                  ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", { Ref: "RDSInstance" }],
                  [".", "FreeableMemory", ".", "."],
                  [".", "FreeStorageSpace", ".", "."],
                ],
                period: 300,
                stat: "Average",
                region: { Ref: "AWS::Region" },
                title: "RDS Metrics",
              },
            },
            {
              type: "metric",
              x: 0,
              y: 6,
              width: 12,
              height: 6,
              properties: {
                metrics: [
                  ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", { "Fn::GetAtt": ["ApplicationLoadBalancer", "LoadBalancerArn"] }],
                  [".", "RequestCount", ".", "."],
                  [".", "HTTPCode_Target_5XX_Count", ".", "."],
                ],
                period: 300,
                stat: "Average",
                region: { Ref: "AWS::Region" },
                title: "ALB Metrics",
              },
            },
            {
              type: "log",
              x: 12,
              y: 6,
              width: 12,
              height: 6,
              properties: {
                query: "fields @timestamp, @message | sort @timestamp desc | limit 100",
                region: { Ref: "AWS::Region" },
                title: "Application Logs",
                view: "table",
              },
            },
            {
              type: "metric",
              x: 0,
              y: 12,
              width: 24,
              height: 6,
              properties: {
                metrics: [
                  ["Custom/Application", "AppErrors"],
                  ["Custom/Database", "DatabaseErrors"],
                  ["Custom/Http", "Http5xxErrors"],
                ],
                period: 300,
                stat: "Sum",
                region: { Ref: "AWS::Region" },
                title: "Custom Application Metrics",
              },
            },
          ],
        }),
      },
    };
  }

  return {
    name: "cloudwatch.yaml",
    path: `${projectName}/cloudwatch.yaml`,
    content: JSON.stringify(resources, null, 2),
    language: "yaml",
  };
}
