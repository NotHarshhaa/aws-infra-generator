import { GeneratedFile } from '../types';

export function generateElastiCache(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const engine = cfg.engine || "redis";
  const nodeType = cfg.node_type || "cache.t3.micro";
  const numCacheNodes = cfg.num_cache_nodes || 1;
  const automaticFailover = cfg.automatic_failover === true;
  const multiAz = cfg.multi_az === true;
  const encrypted = cfg.encrypted !== false;
  const authToken = cfg.auth_token || null;
  const enableMonitoring = cfg.enable_monitoring === true;
  const maintenanceWindow = cfg.maintenance_window || "sun:03:00-sun:04:00";
  const snapshotWindow = cfg.snapshot_window || "05:00-06:00";
  const snapshotRetention = cfg.snapshot_retention || 7;

  let content = `# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${'${var.project_name}-${var.environment}-cache-subnet-group'}"
  subnet_ids = [aws_subnet.private_0.id, aws_subnet.private_1.id]

  tags = {
    Name = "${'${var.project_name}-${var.environment}-cache-subnet-group'}"
  }
}

# Security group for ElastiCache
resource "aws_security_group" "elasticache" {
  name_prefix = "${'${var.project_name}-${var.environment}-elasticache-'}"
  vpc_id      = aws_vpc.main.id
  description = "Security group for ElastiCache cluster"

  ingress {
    from_port       = ${engine === 'redis' ? 6379 : 11211}
    to_port         = ${engine === 'redis' ? 6379 : 11211}
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
    description     = "Access from EC2 instances"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${'${var.project_name}-${var.environment}-elasticache-sg'}"
  }
}

`;

  if (engine === "redis") {
    content += `# Redis Cluster
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${projectName}-${environment}-redis"
  description                = "Redis cluster for ${projectName}"
  
  engine                     = "redis"
  engine_version             = "${cfg.engine_version || "7.0"}"
  node_type                  = "${nodeType}"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = ${numCacheNodes}
  automatic_failover_enabled = ${automaticFailover}
  multi_az_enabled           = ${multiAz}
  
  ${encrypted ? `at_rest_encryption_enabled = true` : ''}
  ${authToken ? `auth_token = "${authToken}"` : ''}
  ${cfg.transit_encryption === true ? `transit_encryption_enabled = true` : ''}
  
  snapshot_retention_limit   = ${snapshotRetention}
  snapshot_window           = "${snapshotWindow}"
  maintenance_window        = "${maintenanceWindow}"
  
  subnet_group_name         = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.elasticache.id]
  
  auto_minor_version_upgrade = true
  
  log_delivery_configuration {
    destination = "${cfg.enable_cloudwatch_logs === true ? 'cloudwatch-logs' : 'none'}"
    destination_type = "cloudwatch-logs"
    log_format = "text"
    log_type = ["slow-log"]
  }
  
  tags = {
    Name = "${'${var.project_name}-${var.environment}-redis'}"
    Environment = "${'${var.environment}'}"
  }
}

`;
  } else {
    content += `# Memcached Cluster
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${projectName}-${environment}-memcached"
  engine               = "memcached"
  engine_version       = "${cfg.engine_version || "1.6"}"
  node_type            = "${nodeType}"
  num_cache_nodes      = ${numCacheNodes}
  port                 = 11211
  parameter_group_name = "default.memcached1.6"
  
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.elasticache.id]
  
  maintenance_window   = "${maintenanceWindow}"
  
  tags = {
    Name = "${'${var.project_name}-${var.environment}-memcached'}"
    Environment = "${'${var.environment}'}"
  }
}

`;
  }

  // Add CloudWatch monitoring
  if (enableMonitoring) {
    if (engine === "redis") {
      content += `# CloudWatch alarms for Redis
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "${'${var.project_name}-${var.environment}-redis-cpu'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Redis CPU utilization is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    ReplicationGroupId = aws_elasticache_replication_group.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "${'${var.project_name}-${var.environment}-redis-memory'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "Redis memory usage is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    ReplicationGroupId = aws_elasticache_replication_group.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "redis_connections" {
  alarm_name          = "${'${var.project_name}-${var.environment}-redis-connections'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CurrConnections"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = 1000
  alarm_description   = "Redis has too many connections"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    ReplicationGroupId = aws_elasticache_replication_group.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "redis_evictions" {
  alarm_name          = "${'${var.project_name}-${var.environment}-redis-evictions'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Evictions"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Redis is evicting keys"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    ReplicationGroupId = aws_elasticache_replication_group.main.id
  }
}
`;
    } else {
      content += `# CloudWatch alarms for Memcached
resource "aws_cloudwatch_metric_alarm" "memcached_cpu" {
  alarm_name          = "${'${var.project_name}-${var.environment}-memcached-cpu'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Memcached CPU utilization is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    CacheClusterId = aws_elasticache_cluster.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "memcached_memory" {
  alarm_name          = "${'${var.project_name}-${var.environment}-memcached-memory'}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "BytesUsedForCacheItems"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = 1000000000  # 1GB
  alarm_description   = "Memcached memory usage is high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    CacheClusterId = aws_elasticache_cluster.main.id
  }
}
`;
    }
  }

  return {
    name: "elasticache.tf",
    path: `${projectName}/elasticache.tf`,
    content,
    language: "hcl",
  };
}
