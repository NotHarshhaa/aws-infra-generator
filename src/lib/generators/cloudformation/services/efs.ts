import { GeneratedFile } from '../types';

export function generateEfs(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const performanceMode = cfg.performance_mode || "generalPurpose";
  const throughputMode = cfg.throughput_mode || "bursting";
  const encrypted = cfg.encrypted !== false;
  const enableBackup = cfg.enable_backup === true;
  const mountTargets = parseInt(cfg.mount_targets || "2");
  const storageSize = cfg.storage_size || null;

  const resources: any = {
    Parameters: {
      PerformanceMode: {
        Type: "String",
        Default: performanceMode,
        AllowedValues: ["generalPurpose", "maxIO"],
        Description: "EFS performance mode",
      },
      ThroughputMode: {
        Type: "String",
        Default: throughputMode,
        AllowedValues: ["bursting", "provisioned"],
        Description: "EFS throughput mode",
      },
      Encrypted: {
        Type: "String",
        Default: encrypted.toString(),
        AllowedValues: ["true", "false"],
        Description: "Enable encryption at rest",
      },
      MountTargets: {
        Type: "Number",
        Default: mountTargets,
        MinValue: "1",
        MaxValue: "4",
        Description: "Number of mount targets",
      },
    },
    Resources: {},
    Outputs: {},
  };

  // EFS File System
  resources.Resources.FileSystem = {
    Type: "AWS::EFS::FileSystem",
    Properties: {
      PerformanceMode: { Ref: "PerformanceMode" },
      ThroughputMode: { Ref: "ThroughputMode" },
      Encrypted: { Ref: "Encrypted" },
      ...(storageSize && throughputMode === "provisioned" && {
        ProvisionedThroughputInMibps: storageSize,
      }),
      Tags: [
        {
          Key: "Name",
          Value: `${projectName}-${environment}-efs`,
        },
        {
          Key: "Environment",
          Value: environment,
        },
      ],
    },
  };

  resources.Outputs.FileSystemId = {
    Description: "EFS file system ID",
    Value: { Ref: "FileSystem" },
    Export: {
      Name: `${projectName}-${environment}-FileSystemId`,
    },
  };

  resources.Outputs.FileSystemArn = {
    Description: "EFS file system ARN",
    Value: { "Fn::GetAtt": ["FileSystem", "Arn"] },
  };

  // Mount Targets
  for (let i = 0; i < mountTargets; i++) {
    const subnetName = i < 2 ? `PrivateSubnet${i}` : `PublicSubnet${i - 2}`;
    
    resources.Resources[`MountTarget${i}`] = {
      Type: "AWS::EFS::MountTarget",
      Properties: {
        FileSystemId: { Ref: "FileSystem" },
        SubnetId: { Ref: subnetName },
        SecurityGroups: [{ Ref: "EFSSecurityGroup" }],
      },
    };

    resources.Resources[`MountTarget${i}Attachment`] = {
      Type: "AWS::EFS::MountTargetAttachment",
      Properties: {
        InstanceId: { Ref: `Instance${i}` },
        MountTargetId: { Ref: `MountTarget${i}` },
      },
    };
  }

  // Security Group
  resources.Resources.EFSSecurityGroup = {
    Type: "AWS::EC2::SecurityGroup",
    Properties: {
      GroupDescription: "Security group for EFS",
      VpcId: { Ref: "VPC" },
      SecurityGroupIngress: [
        {
          IpProtocol: "tcp",
          FromPort: "2049",
          ToPort: "2049",
          SourceSecurityGroupId: { Ref: "InstanceSecurityGroup" },
          Description: "NFS from EC2 instances",
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
          Value: `${projectName}-${environment}-efs-sg`,
        },
      ],
    },
  };

  // Backup
  if (enableBackup) {
    resources.Resources.BackupVault = {
      Type: "AWS::Backup::BackupVault",
      Properties: {
        BackupVaultName: `${projectName}-${environment}-efs-backup`,
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-efs-backup`,
          },
        ],
      },
    };

    resources.Resources.BackupPlan = {
      Type: "AWS::Backup::BackupPlan",
      Properties: {
        BackupPlanName: `${projectName}-${environment}-efs-backup-plan`,
        BackupPlanRule: [
          {
            RuleName: "efs_daily_backup",
            TargetBackupVault: { Ref: "BackupVault" },
            ScheduleExpression: "cron(0 2 ? * * *)",
            Lifecycle: {
              DeleteAfterDays: environment === "production" ? "30" : "7",
            },
          },
        ],
      },
    };

    resources.Resources.BackupSelection = {
      Type: "AWS::Backup::BackupSelection",
      Properties: {
        BackupSelectionName: `${projectName}-${environment}-efs-backup-selection`,
        BackupPlanId: { Ref: "BackupPlan" },
        Resources: [{ "Fn::Join": ["", ["arn:aws:elasticfilesystem:", { Ref: "AWS::Region" }, ":", { Ref: "AWS::AccountId" }, ":file-system/", { Ref: "FileSystem" }]] }],
        IamRoleArn: { "Fn::GetAtt": ["BackupRole", "Arn"] },
      },
    };

    resources.Resources.BackupRole = {
      Type: "AWS::IAM::Role",
      Properties: {
        RoleName: `${projectName}-${environment}-backup-role`,
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "backup.amazonaws.com",
              },
              Action: "sts:AssumeRole",
            },
          ],
        },
      },
    };

    resources.Resources.BackupRolePolicy = {
      Type: "AWS::IAM::RolePolicy",
      Properties: {
        RoleName: `${projectName}-${environment}-backup-role-policy`,
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: "backup:CreateBackupVault",
              Resource: { Ref: "BackupVault" },
            },
            {
              Effect: "Allow",
              Action: [
                "backup:StartBackupJob",
                "backup:CompleteBackupJob",
                "backup:PutBackupVaultAccessPolicy",
              ],
              Resource: "*",
            },
          ],
        },
        Roles: [{ Ref: "BackupRole" }],
      },
    };

    resources.Resources.BackupRolePolicyAttachment = {
      Type: "AWS::IAM::RolePolicyAttachment",
      Properties: {
        PolicyArn: "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup",
        RoleName: { Ref: "BackupRole" },
      },
    };
  }

  // CloudWatch Monitoring
  if (cfg.enable_monitoring === true) {
    resources.Resources.BurstCreditBalanceAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-efs-burst-credits`,
        AlarmDescription: "EFS burst credits running low",
        MetricName: "BurstCreditBalance",
        Namespace: "AWS/EFS",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "1000000000", // 1GB in bytes
        ComparisonOperator: "LessThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "FileSystemId",
            Value: { Ref: "FileSystem" },
          },
        ],
      },
    };

    resources.Resources.PercentIOLimitAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: `${projectName}-${environment}-efs-io-limit`,
        AlarmDescription: "EFS approaching I/O limit",
        MetricName: "PercentIOLimit",
        Namespace: "AWS/EFS",
        Statistic: "Average",
        Period: "300",
        EvaluationPeriods: "2",
        Threshold: "95",
        ComparisonOperator: "GreaterThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "FileSystemId",
            Value: { Ref: "FileSystem" },
          },
        ],
      },
    };
  }

  return {
    name: "efs.yaml",
    path: `${projectName}/efs.yaml`,
    content: JSON.stringify(resources, null, 2),
    language: "yaml",
  };
}
