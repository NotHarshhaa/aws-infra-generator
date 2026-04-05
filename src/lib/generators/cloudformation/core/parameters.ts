export function buildParameters(
  services: string[],
  config: Record<string, any>,
  environment: string,
  region: string,
  projectName: string
): any {
  const params: any = {
    Environment: {
      Type: "String",
      Default: environment,
      AllowedValues: ["development", "staging", "production"],
      Description: "Environment name (development, staging, production)",
      ConstraintDescription: "Must be a valid environment name",
    },
    ProjectName: {
      Type: "String",
      Default: projectName,
      MinLength: 3,
      MaxLength: 16,
      AllowedPattern: "[a-z0-9-]*",
      Description: "Project name for resource naming",
      ConstraintDescription: "Must be 3-16 characters, lowercase, numbers and hyphens only",
    },
    CostCenter: {
      Type: "String",
      Default: "engineering",
      Description: "Cost center for billing purposes",
    },
    OwnerEmail: {
      Type: "String",
      Default: "team@example.com",
      AllowedPattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      Description: "Email of the resource owner",
      ConstraintDescription: "Must be a valid email address",
    },
    AllowedCidrBlocks: {
      Type: "CommaDelimitedList",
      Default: "0.0.0.0/0",
      Description: "Comma-separated list of CIDR blocks allowed for SSH access",
    },
    SshKeyPairName: {
      Type: "String",
      Default: "",
      Description: "Name of the SSH key pair for EC2 instances",
      ConstraintDescription: "Must be a valid SSH key pair name in the region",
    },
  };

  if (services.includes("vpc")) {
    const vpcCfg = config.vpc?.config || {};
    params.VpcCidr = {
      Type: "String",
      Default: vpcCfg.cidr_block || "10.0.0.0/16",
      AllowedPattern: "^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$",
      Description: "CIDR block for the VPC",
      ConstraintDescription: "Must be a valid CIDR notation",
    };
    params.AvailabilityZones = {
      Type: "List<AWS::EC2::AvailabilityZone::Name>",
      Default: vpcCfg.availability_zones || ["us-east-1a", "us-east-1b", "us-east-1c"],
      Description: "List of availability zones to use",
    };
    params.EnableNatGateway = {
      Type: "String",
      Default: vpcCfg.enable_nat !== false ? "true" : "false",
      AllowedValues: ["true", "false"],
      Description: "Enable NAT gateway for private subnets",
    };
    params.EnableVpcFlowLogs = {
      Type: "String",
      Default: "true",
      AllowedValues: ["true", "false"],
      Description: "Enable VPC Flow Logs for network monitoring",
    };
  }

  if (services.includes("ec2")) {
    const ec2Cfg = config.ec2?.config || {};
    params.InstanceType = {
      Type: "String",
      Default: ec2Cfg.instance_type || "t3.medium",
      AllowedValues: ["t3.micro", "t3.small", "t3.medium", "t3.large", "m5.large", "m5.xlarge"],
      Description: "EC2 instance type",
      ConstraintDescription: "Must be a supported instance type",
    };
    params.InstanceCount = {
      Type: "Number",
      Default: ec2Cfg.instance_count || 2,
      MinValue: 1,
      MaxValue: 10,
      Description: "Number of EC2 instances to deploy",
      ConstraintDescription: "Must be between 1 and 10",
    };
    params.RootVolumeSize = {
      Type: "Number",
      Default: ec2Cfg.root_volume_size || 50,
      MinValue: 20,
      MaxValue: 1000,
      Description: "Size of the root volume in GB",
      ConstraintDescription: "Must be between 20 and 1000 GB",
    };
    params.EnableMonitoring = {
      Type: "String",
      Default: ec2Cfg.enable_monitoring !== false ? "true" : "false",
      AllowedValues: ["true", "false"],
      Description: "Enable detailed monitoring for EC2 instances",
    };
    params.AmiId = {
      Type: "String",
      Default: "",
      Description: "Custom AMI ID (overrides default AMI selection)",
    };
  }

  if (services.includes("rds")) {
    const rdsCfg = config.rds?.config || {};
    params.DBEngine = {
      Type: "String",
      Default: rdsCfg.engine || "postgres",
      AllowedValues: ["postgres", "mysql"],
      Description: "Database engine",
      ConstraintDescription: "Database engine must be postgres or mysql",
    };
    params.DBInstanceClass = {
      Type: "String",
      Default: rdsCfg.instance_class || "db.t3.medium",
      Description: "RDS instance class",
    };
    params.DBAllocatedStorage = {
      Type: "Number",
      Default: rdsCfg.allocated_storage || 100,
      MinValue: 20,
      MaxValue: 65536,
      Description: "RDS allocated storage in GB",
      ConstraintDescription: "RDS storage must be between 20 and 65536 GB",
    };
    params.DBName = {
      Type: "String",
      Default: rdsCfg.database_name || "appdb",
      AllowedPattern: "[a-zA-Z][a-zA-Z0-9_]*",
      Description: "Database name",
      ConstraintDescription: "Database name must start with a letter and contain only letters, numbers, and underscores",
    };
    params.DBUsername = {
      Type: "String",
      Default: rdsCfg.username || "appadmin",
      AllowedPattern: "[a-zA-Z][a-zA-Z0-9_]*",
      MinLength: 1,
      MaxLength: 63,
      NoEcho: true,
      Description: "Database master username",
      ConstraintDescription: "Must be 1-63 characters, start with letter, contain only letters, numbers, and underscores",
    };
    params.DBPassword = {
      Type: "String",
      Default: "",
      MinLength: 8,
      NoEcho: true,
      Description: "Database master password",
      ConstraintDescription: "Database password must be at least 8 characters long",
    };
    params.EnableDbBackupRetention = {
      Type: "String",
      Default: "true",
      AllowedValues: ["true", "false"],
      Description: "Enable automated backups",
    };
    params.DBBackupRetentionPeriod = {
      Type: "Number",
      Default: rdsCfg.backup_retention || 7,
      MinValue: 1,
      MaxValue: 35,
      Description: "Backup retention period in days",
      ConstraintDescription: "Backup retention period must be between 1 and 35 days",
    };
    params.EnableMultiAz = {
      Type: "String",
      Default: environment === "production" ? "true" : "false",
      AllowedValues: ["true", "false"],
      Description: "Enable Multi-AZ deployment for high availability",
    };
  }

  if (services.includes("s3")) {
    const s3Cfg = config.s3?.config || {};
    params.S3BucketNamePrefix = {
      Type: "String",
      Default: s3Cfg.bucket_name || "app-data",
      Description: "Prefix for S3 bucket name",
    };
    params.EnableS3Versioning = {
      Type: "String",
      Default: s3Cfg.versioning !== false ? "true" : "false",
      AllowedValues: ["true", "false"],
      Description: "Enable S3 bucket versioning",
    };
    params.S3LifecycleTransitionDays = {
      Type: "Number",
      Default: s3Cfg.lifecycle_days || 30,
      MinValue: 30,
      Description: "Days after which to transition to IA storage",
      ConstraintDescription: "S3 lifecycle transition must be at least 30 days",
    };
    params.EnableS3Encryption = {
      Type: "String",
      Default: "true",
      AllowedValues: ["true", "false"],
      Description: "Enable S3 server-side encryption",
    };
    params.S3EncryptionAlgorithm = {
      Type: "String",
      Default: s3Cfg.encryption || "AES256",
      AllowedValues: ["AES256", "aws:kms"],
      Description: "S3 encryption algorithm",
      ConstraintDescription: "Encryption algorithm must be AES256 or aws:kms",
    };
  }

  return params;
}
