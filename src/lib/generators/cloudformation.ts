import { GeneratedFile } from './terraform';

export class CloudFormationGenerator {
  generate(
    services: string[],
    config: Record<string, any>,
    environment: string,
    region: string,
    projectName: string
  ): GeneratedFile[] {
    const template: any = {
      AWSTemplateFormatVersion: "2010-09-09",
      Description: `CloudFormation template for ${projectName} (${environment})`,
      Parameters: this._buildParameters(services, config, environment, region, projectName),
      Resources: {},
      Outputs: {},
    };

    for (const svc of services) {
      const svcConfig = config[svc]?.config || {};
      const builder = (this as any)[`_build_${svc}`];
      if (builder) {
        const [resources, outputs] = builder.call(this, svcConfig, environment, projectName);
        Object.assign(template.Resources, resources);
        Object.assign(template.Outputs, outputs);
      }
    }

    const content = JSON.stringify(template, null, 2);

    return [
      {
        name: "template.json",
        path: `${projectName}/template.json`,
        content,
        language: "json",
      },
    ];
  }

  private _buildParameters(
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
        Description: "Environment name",
      },
      ProjectName: {
        Type: "String",
        Default: projectName,
        Description: "Project name",
      },
    };

    if (services.includes("vpc")) {
      const vpcCfg = config.vpc?.config || {};
      params.VpcCidr = {
        Type: "String",
        Default: vpcCfg.cidr_block || "10.0.0.0/16",
        Description: "VPC CIDR block",
      };
    }

    if (services.includes("ec2")) {
      const ec2Cfg = config.ec2?.config || {};
      params.InstanceType = {
        Type: "String",
        Default: ec2Cfg.instance_type || "t3.micro",
        Description: "EC2 instance type",
      };
    }

    if (services.includes("rds")) {
      const rdsCfg = config.rds?.config || {};
      params.DBInstanceClass = {
        Type: "String",
        Default: rdsCfg.instance_class || "db.t3.micro",
        Description: "RDS instance class",
      };
      params.DBEngine = {
        Type: "String",
        Default: rdsCfg.engine || "postgres",
        Description: "Database engine",
      };
    }

    return params;
  }

  private _buildVpc(cfg: Record<string, any>, environment: string, projectName: string): [any, any] {
    const resources: any = {};
    const outputs: any = {};

    const cidr = cfg.cidr_block || "10.0.0.0/16";
    const enableDns = cfg.enable_dns !== false;
    const publicCount = parseInt(cfg.public_subnets || "2");
    const privateCount = parseInt(cfg.private_subnets || "2");
    const enableNat = cfg.enable_nat === true;

    resources.VPC = {
      Type: "AWS::EC2::VPC",
      Properties: {
        CidrBlock: { Ref: "VpcCidr" },
        EnableDnsSupport: enableDns,
        EnableDnsHostnames: enableDns,
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": "${ProjectName}-${Environment}-vpc" },
          },
        ],
      },
    };

    resources.InternetGateway = {
      Type: "AWS::EC2::InternetGateway",
      Properties: {
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": "${ProjectName}-${Environment}-igw" },
          },
        ],
      },
    };

    resources.VPCGatewayAttachment = {
      Type: "AWS::EC2::VPCGatewayAttachment",
      Properties: {
        VpcId: { Ref: "VPC" },
        InternetGatewayId: { Ref: "InternetGateway" },
      },
    };

    resources.PublicRouteTable = {
      Type: "AWS::EC2::RouteTable",
      Properties: {
        VpcId: { Ref: "VPC" },
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": "${ProjectName}-${Environment}-public-rt" },
          },
        ],
      },
    };

    resources.PublicRoute = {
      Type: "AWS::EC2::Route",
      DependsOn: "VPCGatewayAttachment",
      Properties: {
        RouteTableId: { Ref: "PublicRouteTable" },
        DestinationCidrBlock: "0.0.0.0/0",
        GatewayId: { Ref: "InternetGateway" },
      },
    };

    const azs = ["a", "b", "c"];
    for (let i = 0; i < publicCount; i++) {
      const subnetName = `PublicSubnet${i}`;
      resources[subnetName] = {
        Type: "AWS::EC2::Subnet",
        Properties: {
          VpcId: { Ref: "VPC" },
          CidrBlock: `10.0.${i}.0/24`,
          AvailabilityZone: {
            "Fn::Select": [
              String(i % 3),
              { "Fn::GetAZs": { Ref: "AWS::Region" } },
            ],
          },
          MapPublicIpOnLaunch: true,
          Tags: [
            {
              Key: "Name",
              Value: {
                "Fn::Sub": `${"${ProjectName}-${Environment}-public-"}${i}`,
              },
            },
          ],
        },
      };
      resources[`PublicSubnetRouteTableAssociation${i}`] = {
        Type: "AWS::EC2::SubnetRouteTableAssociation",
        Properties: {
          SubnetId: { Ref: subnetName },
          RouteTableId: { Ref: "PublicRouteTable" },
        },
      };
    }

    for (let i = 0; i < privateCount; i++) {
      const subnetName = `PrivateSubnet${i}`;
      resources[subnetName] = {
        Type: "AWS::EC2::Subnet",
        Properties: {
          VpcId: { Ref: "VPC" },
          CidrBlock: `10.0.${i + 10}.0/24`,
          AvailabilityZone: {
            "Fn::Select": [
              String(i % 3),
              { "Fn::GetAZs": { Ref: "AWS::Region" } },
            ],
          },
          Tags: [
            {
              Key: "Name",
              Value: {
                "Fn::Sub": `${"${ProjectName}-${Environment}-private-"}${i}`,
              },
            },
          ],
        },
      };
    }

    if (enableNat && privateCount > 0) {
      resources.NatEIP = {
        Type: "AWS::EC2::EIP",
        Properties: { Domain: "vpc" },
      };
      resources.NatGateway = {
        Type: "AWS::EC2::NatGateway",
        Properties: {
          AllocationId: { "Fn::GetAtt": ["NatEIP", "AllocationId"] },
          SubnetId: { Ref: "PublicSubnet0" },
          Tags: [
            {
              Key: "Name",
              Value: { "Fn::Sub": "${ProjectName}-${Environment}-nat" },
            },
          ],
        },
      };
      resources.PrivateRouteTable = {
        Type: "AWS::EC2::RouteTable",
        Properties: {
          VpcId: { Ref: "VPC" },
          Tags: [
            {
              Key: "Name",
              Value: {
                "Fn::Sub": "${ProjectName}-${Environment}-private-rt",
              },
            },
          ],
        },
      };
      resources.PrivateRoute = {
        Type: "AWS::EC2::Route",
        Properties: {
          RouteTableId: { Ref: "PrivateRouteTable" },
          DestinationCidrBlock: "0.0.0.0/0",
          NatGatewayId: { Ref: "NatGateway" },
        },
      };
    }

    outputs.VpcId = {
      Description: "VPC ID",
      Value: { Ref: "VPC" },
      Export: { Name: { "Fn::Sub": "${ProjectName}-${Environment}-vpc-id" } },
    };

    return [resources, outputs];
  }

  private _buildEc2(cfg: Record<string, any>, environment: string, projectName: string): [any, any] {
    const resources: any = {};
    const outputs: any = {};

    const volumeSize = cfg.root_volume_size || 20;
    const publicIp = cfg.enable_public_ip !== false;

    resources.EC2SecurityGroup = {
      Type: "AWS::EC2::SecurityGroup",
      Properties: {
        GroupDescription: "EC2 security group",
        VpcId: { Ref: "VPC" },
        SecurityGroupIngress: [
          {
            IpProtocol: "tcp",
            FromPort: 22,
            ToPort: 22,
            CidrIp: "0.0.0.0/0",
            Description: "SSH access",
          },
          {
            IpProtocol: "tcp",
            FromPort: 80,
            ToPort: 80,
            CidrIp: "0.0.0.0/0",
            Description: "HTTP access",
          },
          {
            IpProtocol: "tcp",
            FromPort: 443,
            ToPort: 443,
            CidrIp: "0.0.0.0/0",
            Description: "HTTPS access",
          },
        ],
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": "${ProjectName}-${Environment}-ec2-sg" },
          },
        ],
      },
    };

    resources.EC2Instance = {
      Type: "AWS::EC2::Instance",
      Properties: {
        InstanceType: { Ref: "InstanceType" },
        ImageId: "{{resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64}}",
        SubnetId: { Ref: "PublicSubnet0" },
        SecurityGroupIds: [{ Ref: "EC2SecurityGroup" }],
        BlockDeviceMappings: [
          {
            DeviceName: "/dev/xvda",
            Ebs: {
              VolumeSize: volumeSize,
              VolumeType: "gp3",
              Encrypted: true,
            },
          },
        ],
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": "${ProjectName}-${Environment}-instance" },
          },
        ],
      },
    };

    outputs.EC2InstanceId = {
      Description: "EC2 Instance ID",
      Value: { Ref: "EC2Instance" },
    };

    if (publicIp) {
      outputs.EC2PublicIp = {
        Description: "EC2 Public IP",
        Value: { "Fn::GetAtt": ["EC2Instance", "PublicIp"] },
      };
    }

    return [resources, outputs];
  }

  private _buildS3(cfg: Record<string, any>, environment: string, projectName: string): [any, any] {
    const resources: any = {};
    const outputs: any = {};

    const bucketSuffix = cfg.bucket_name || "data";
    const versioning = cfg.versioning !== false;
    const encryption = cfg.encryption || "AES256";
    const blockPublic = cfg.block_public_access !== false;

    const bucketConfig: any = {
      Type: "AWS::S3::Bucket",
      Properties: {
        BucketName: {
          "Fn::Sub": `${"${ProjectName}-${Environment}-"}${bucketSuffix}`,
        },
        Tags: [
          {
            Key: "Name",
            Value: {
              "Fn::Sub": `${"${ProjectName}-${Environment}-"}${bucketSuffix}`,
            },
          },
        ],
      },
    };

    if (versioning) {
      bucketConfig.Properties.VersioningConfiguration = {
        Status: "Enabled",
      };
    }

    if (encryption !== "none") {
      bucketConfig.Properties.BucketEncryption = {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: encryption,
            },
          },
        ],
      };
    }

    if (blockPublic) {
      bucketConfig.Properties.PublicAccessBlockConfiguration = {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      };
    }

    resources.S3Bucket = bucketConfig;

    outputs.S3BucketName = {
      Description: "S3 Bucket Name",
      Value: { Ref: "S3Bucket" },
    };
    outputs.S3BucketArn = {
      Description: "S3 Bucket ARN",
      Value: { "Fn::GetAtt": ["S3Bucket", "Arn"] },
    };

    return [resources, outputs];
  }

  private _buildRds(cfg: Record<string, any>, environment: string, projectName: string): [any, any] {
    const resources: any = {};
    const outputs: any = {};

    const engine = cfg.engine || "postgres";
    const engineVersion = cfg.engine_version || "16";
    const instanceClass = cfg.instance_class || "db.t3.micro";
    const storage = cfg.allocated_storage || 20;
    const multiAz = cfg.multi_az === true;
    const backupRetention = cfg.backup_retention || 7;
    const port = engine === "postgres" ? 5432 : 3306;

    resources.DBSubnetGroup = {
      Type: "AWS::RDS::DBSubnetGroup",
      Properties: {
        DBSubnetGroupDescription: "Database subnet group",
        SubnetIds: [
          { Ref: "PrivateSubnet0" },
          { Ref: "PrivateSubnet1" },
        ],
        Tags: [
          {
            Key: "Name",
            Value: {
              "Fn::Sub": "${ProjectName}-${Environment}-db-subnet",
            },
          },
        ],
      },
    };

    resources.RDSSecurityGroup = {
      Type: "AWS::EC2::SecurityGroup",
      Properties: {
        GroupDescription: "RDS security group",
        VpcId: { Ref: "VPC" },
        SecurityGroupIngress: [
          {
            IpProtocol: "tcp",
            FromPort: port,
            ToPort: port,
            CidrIp: { Ref: "VpcCidr" },
            Description: "Database access from VPC",
          },
        ],
        Tags: [
          {
            Key: "Name",
            Value: {
              "Fn::Sub": "${ProjectName}-${Environment}-rds-sg",
            },
          },
        ],
      },
    };

    resources.RDSInstance = {
      Type: "AWS::RDS::DBInstance",
      Properties: {
        DBInstanceIdentifier: {
          "Fn::Sub": "${ProjectName}-${Environment}-db",
        },
        Engine: { Ref: "DBEngine" },
        EngineVersion: engineVersion,
        DBInstanceClass: { Ref: "DBInstanceClass" },
        AllocatedStorage: storage,
        StorageType: "gp3",
        StorageEncrypted: true,
        MasterUsername: "dbadmin",
        MasterUserPassword: "CHANGE_ME_IMMEDIATELY",
        DBSubnetGroupName: { Ref: "DBSubnetGroup" },
        VPCSecurityGroups: [{ Ref: "RDSSecurityGroup" }],
        MultiAZ: multiAz,
        BackupRetentionPeriod: backupRetention,
        Tags: [
          {
            Key: "Name",
            Value: {
              "Fn::Sub": "${ProjectName}-${Environment}-db",
            },
          },
        ],
      },
    };

    outputs.RDSEndpoint = {
      Description: "RDS Endpoint",
      Value: { "Fn::GetAtt": ["RDSInstance", "Endpoint.Address"] },
    };
    outputs.RDSPort = {
      Description: "RDS Port",
      Value: { "Fn::GetAtt": ["RDSInstance", "Endpoint.Port"] },
    };

    return [resources, outputs];
  }

  private _buildAlb(cfg: Record<string, any>, environment: string, projectName: string): [any, any] {
    const resources: any = {};
    const outputs: any = {};

    const internal = cfg.internal === true;
    const healthPath = cfg.health_check_path || "/";
    const listenerPort = parseInt(cfg.listener_port || "80");
    const targetPort = parseInt(cfg.target_port || "80");

    resources.ALBSecurityGroup = {
      Type: "AWS::EC2::SecurityGroup",
      Properties: {
        GroupDescription: "ALB security group",
        VpcId: { Ref: "VPC" },
        SecurityGroupIngress: [
          {
            IpProtocol: "tcp",
            FromPort: listenerPort,
            ToPort: listenerPort,
            CidrIp: "0.0.0.0/0",
          },
        ],
        Tags: [
          {
            Key: "Name",
            Value: {
              "Fn::Sub": "${ProjectName}-${Environment}-alb-sg",
            },
          },
        ],
      },
    };

    resources.ApplicationLoadBalancer = {
      Type: "AWS::ElasticLoadBalancingV2::LoadBalancer",
      Properties: {
        Name: { "Fn::Sub": "${ProjectName}-${Environment}-alb" },
        Scheme: internal ? "internal" : "internet-facing",
        Type: "application",
        SecurityGroups: [{ Ref: "ALBSecurityGroup" }],
        Subnets: [
          { Ref: "PublicSubnet0" },
          { Ref: "PublicSubnet1" },
        ],
        Tags: [
          {
            Key: "Name",
            Value: {
              "Fn::Sub": "${ProjectName}-${Environment}-alb",
            },
          },
        ],
      },
    };

    resources.ALBTargetGroup = {
      Type: "AWS::ElasticLoadBalancingV2::TargetGroup",
      Properties: {
        Name: { "Fn::Sub": "${ProjectName}-${Environment}-tg" },
        Port: targetPort,
        Protocol: "HTTP",
        VpcId: { Ref: "VPC" },
        HealthCheckPath: healthPath,
        HealthyThresholdCount: 3,
        UnhealthyThresholdCount: 3,
        HealthCheckTimeoutSeconds: 5,
        HealthCheckIntervalSeconds: 30,
      },
    };

    resources.ALBListener = {
      Type: "AWS::ElasticLoadBalancingV2::Listener",
      Properties: {
        LoadBalancerArn: { Ref: "ApplicationLoadBalancer" },
        Port: listenerPort,
        Protocol: listenerPort === 80 ? "HTTP" : "HTTPS",
        DefaultActions: [
          {
            Type: "forward",
            TargetGroupArn: { Ref: "ALBTargetGroup" },
          },
        ],
      },
    };

    outputs.ALBDnsName = {
      Description: "ALB DNS Name",
      Value: {
        "Fn::GetAtt": ["ApplicationLoadBalancer", "DNSName"],
      },
    };

    return [resources, outputs];
  }

  private _buildIam(cfg: Record<string, any>, environment: string, projectName: string): [any, any] {
    const resources: any = {};
    const outputs: any = {};

    const createEc2Role = cfg.create_ec2_role !== false;
    const createAdmin = cfg.create_admin_role === true;
    const createS3Policy = cfg.create_s3_policy === true;
    const createRdsPolicy = cfg.create_rds_policy === true;

    if (createEc2Role) {
      resources.EC2Role = {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: {
            "Fn::Sub": "${ProjectName}-${Environment}-ec2-role",
          },
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: { Service: "ec2.amazonaws.com" },
                Action: "sts:AssumeRole",
              },
            ],
          },
          Tags: [
            {
              Key: "Name",
              Value: {
                "Fn::Sub": "${ProjectName}-${Environment}-ec2-role",
              },
            },
          ],
        },
      };
      resources.EC2InstanceProfile = {
        Type: "AWS::IAM::InstanceProfile",
        Properties: {
          InstanceProfileName: {
            "Fn::Sub": "${ProjectName}-${Environment}-ec2-profile",
          },
          Roles: [{ Ref: "EC2Role" }],
        },
      };
      outputs.EC2RoleArn = {
        Description: "EC2 Role ARN",
        Value: { "Fn::GetAtt": ["EC2Role", "Arn"] },
      };
    }

    if (createS3Policy) {
      resources.S3AccessPolicy = {
        Type: "AWS::IAM::ManagedPolicy",
        Properties: {
          ManagedPolicyName: {
            "Fn::Sub": "${ProjectName}-${Environment}-s3-access",
          },
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: [
                  "s3:GetObject",
                  "s3:PutObject",
                  "s3:ListBucket",
                  "s3:DeleteObject",
                ],
                Resource: "*",
              },
            ],
          },
        },
      };
    }

    if (createRdsPolicy) {
      resources.RDSAccessPolicy = {
        Type: "AWS::IAM::ManagedPolicy",
        Properties: {
          ManagedPolicyName: {
            "Fn::Sub": "${ProjectName}-${Environment}-rds-access",
          },
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: ["rds:DescribeDBInstances", "rds:Connect"],
                Resource: "*",
              },
            ],
          },
        },
      };
    }

    return [resources, outputs];
  }
}
