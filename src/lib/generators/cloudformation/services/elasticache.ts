import { GeneratedFile } from '../types';
import {
  cfPrivateSubnetRefs,
  type CloudFormationBuildContext,
} from '../../../cloudformation-helpers';

export function generateElastiCache(
  cfg: Record<string, any>,
  environment: string,
  projectName: string,
  context?: CloudFormationBuildContext
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

  const resources: any = {
    Parameters: {
      Engine: {
        Type: "String",
        Default: engine,
        AllowedValues: ["redis", "memcached"],
        Description: "Cache engine",
      },
      NodeType: {
        Type: "String",
        Default: nodeType,
        Description: "Cache node type",
      },
      NumCacheNodes: {
        Type: "Number",
        Default: numCacheNodes.toString(),
        MinValue: "1",
        MaxValue: "6",
        Description: "Number of cache nodes",
      },
      AutomaticFailover: {
        Type: "String",
        Default: automaticFailover.toString(),
        AllowedValues: ["true", "false"],
        Description: "Enable automatic failover",
      },
      Encrypted: {
        Type: "String",
        Default: encrypted.toString(),
        AllowedValues: ["true", "false"],
        Description: "Enable encryption",
      },
    },
    Resources: {},
    Outputs: {},
  };

  // Subnet Group
  resources.Resources.CacheSubnetGroup = {
    Type: "AWS::ElastiCache::SubnetGroup",
    Properties: {
      CacheSubnetGroupName: `${projectName}-${environment}-cache-subnet-group`,
      Description: "Subnet group for ElastiCache cluster",
      SubnetIds: cfPrivateSubnetRefs(context?.privateSubnetCount ?? 2),
      Tags: [
        {
          Key: "Name",
          Value: `${projectName}-${environment}-cache-subnet-group`,
        },
      ],
    },
  };

  // Security Group
  resources.Resources.CacheSecurityGroup = {
    Type: "AWS::EC2::SecurityGroup",
    Properties: {
      GroupDescription: "Security group for ElastiCache cluster",
      VpcId: { Ref: "VPC" },
      SecurityGroupIngress: [
        {
          IpProtocol: "tcp",
          FromPort: engine === "redis" ? "6379" : "11211",
          ToPort: engine === "redis" ? "6379" : "11211",
          SourceSecurityGroupId: { Ref: "InstanceSecurityGroup" },
          Description: "Access from EC2 instances",
        },
      ],
      SecurityGroupEgress: [
        {
          IpProtocol: "-1",
          CidrIp: "0.0.0.0/0",
          Description: "Allow all outbound traffic",
        },
      ],
      Tags: [
        {
          Key: "Name",
          Value: `${projectName}-${environment}-elasticache-sg`,
        },
      ],
    },
  };

  if (engine === "redis") {
    // Redis Cluster
    const replicationGroupProperties: any = {
      ReplicationGroupId: `${projectName}-${environment}-redis`,
      Description: "Redis cluster for " + projectName,
      Engine: "redis",
      EngineVersion: cfg.engine_version || "7.0",
      CacheNodeType: { Ref: "NodeType" },
      CacheParameterGroupName: "default.redis7",
      NumCacheClusters: { Ref: "NumCacheNodes" },
      AutomaticFailoverEnabled: { Ref: "AutomaticFailover" },
      MultiAZEnabled: { Ref: "AutomaticFailover" },
      AtRestEncryptionEnabled: { Ref: "Encrypted" },
      SnapshotRetentionLimit: snapshotRetention,
      SnapshotWindow: snapshotWindow,
      PreferredMaintenanceWindow: maintenanceWindow,
      CacheSubnetGroupName: { Ref: "CacheSubnetGroup" },
      SecurityGroupIds: [{ Ref: "CacheSecurityGroup" }],
      AutoMinorVersionUpgrade: true,
      Tags: [
        {
          Key: "Name",
          Value: `${projectName}-${environment}-redis`,
        },
        {
          Key: "Environment",
          Value: environment,
        },
      ],
    };

    if (cfg.transit_encryption === true) {
      replicationGroupProperties.TransitEncryptionEnabled = true;
    }

    if (authToken) {
      replicationGroupProperties.AuthToken = authToken;
    }

    if (cfg.enable_cloudwatch_logs === true) {
      replicationGroupProperties.LogDeliveryConfiguration = {
        Destination: "cloudwatch-logs",
        DestinationType: "cloudwatch-logs",
        LogFormat: "text",
        LogType: ["slow-log"],
      };
    }

    resources.Resources.ReplicationGroup = {
      Type: "AWS::ElastiCache::ReplicationGroup",
      Properties: replicationGroupProperties,
    };

    resources.Outputs.RedisEndpoint = {
      Description: "Redis cluster endpoint",
      Value: { "Fn::GetAtt": ["ReplicationGroup", "PrimaryEndPoint.Address"] },
      Export: {
        Name: `${projectName}-${environment}-RedisEndpoint`,
      },
    };

    resources.Outputs.RedisPort = {
      Description: "Redis cluster port",
      Value: { "Fn::GetAtt": ["ReplicationGroup", "PrimaryEndPoint.Port"] },
    };

    resources.Outputs.RedisArn = {
      Description: "Redis cluster ARN",
      Value: { Ref: "ReplicationGroup" },
    };

  } else {
    // Memcached Cluster
    resources.Resources.CacheCluster = {
      Type: "AWS::ElastiCache::CacheCluster",
      Properties: {
        CacheClusterId: `${projectName}-${environment}-memcached`,
        Engine: "memcached",
        EngineVersion: cfg.engine_version || "1.6",
        CacheNodeType: { Ref: "NodeType" },
        NumCacheNodes: { Ref: "NumCacheNodes" },
        Port: 11211,
        CacheParameterGroupName: "default.memcached1.6",
        CacheSubnetGroupName: { Ref: "CacheSubnetGroup" },
        SecurityGroupIds: [{ Ref: "CacheSecurityGroup" }],
        PreferredMaintenanceWindow: maintenanceWindow,
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-memcached`,
          },
        ],
      },
    };

    resources.Outputs.MemcachedEndpoint = {
      Description: "Memcached cluster endpoint",
      Value: { "Fn::GetAtt": ["CacheCluster", "ConfigurationEndpoint.Address"] },
    };

    resources.Outputs.MemcachedPort = {
      Description: "Memcached cluster port",
      Value: { "Fn::GetAtt": ["CacheCluster", "ConfigurationEndpoint.Port"] },
    };
  }

  // CloudWatch Monitoring
  if (enableMonitoring) {
    if (engine === "redis") {
      resources.Resources.CPUAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-redis-cpu`,
          AlarmDescription: "Redis CPU utilization is high",
          MetricName: "CPUUtilization",
          Namespace: "AWS/ElastiCache",
          Statistic: "Average",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "80",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ReplicationGroupId",
              Value: { Ref: "ReplicationGroup" },
            },
          ],
        },
      };

      resources.Resources.MemoryAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-redis-memory`,
          AlarmDescription: "Redis memory usage is high",
          MetricName: "DatabaseMemoryUsagePercentage",
          Namespace: "AWS/ElastiCache",
          Statistic: "Average",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "85",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ReplicationGroupId",
              Value: { Ref: "ReplicationGroup" },
            },
          ],
        },
      };

      resources.Resources.ConnectionsAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-redis-connections`,
          AlarmDescription: "Redis has too many connections",
          MetricName: "CurrConnections",
          Namespace: "AWS/ElastiCache",
          Statistic: "Average",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "1000",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ReplicationGroupId",
              Value: { Ref: "ReplicationGroup" },
            },
          ],
        },
      };

      resources.Resources.EvictionsAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-redis-evictions`,
          AlarmDescription: "Redis is evicting keys",
          MetricName: "Evictions",
          Namespace: "AWS/ElastiCache",
          Statistic: "Sum",
          Period: "300",
          EvaluationPeriods: "1",
          Threshold: "0",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ReplicationGroupId",
              Value: { Ref: "ReplicationGroup" },
            },
          ],
        },
      };

    } else {
      resources.Resources.MemcachedCPUAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-memcached-cpu`,
          AlarmDescription: "Memcached CPU utilization is high",
          MetricName: "CPUUtilization",
          Namespace: "AWS/ElastiCache",
          Statistic: "Average",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "80",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "CacheClusterId",
              Value: { Ref: "CacheCluster" },
            },
          ],
        },
      };

      resources.Resources.MemcachedMemoryAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-memcached-memory`,
          AlarmDescription: "Memcached memory usage is high",
          MetricName: "BytesUsedForCacheItems",
          Namespace: "AWS/ElastiCache",
          Statistic: "Average",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "1000000000", // 1GB in bytes
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "CacheClusterId",
              Value: { Ref: "CacheCluster" },
            },
          ],
        },
      };
    }
  }

  return {
    name: "elasticache.yaml",
    path: `${projectName}/elasticache.yaml`,
    content: JSON.stringify(resources, null, 2),
    language: "yaml",
  };
}
