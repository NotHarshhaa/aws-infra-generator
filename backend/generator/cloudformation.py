"""CloudFormation infrastructure template generator."""

import json


class CloudFormationGenerator:
    def generate(
        self,
        services: list[str],
        config: dict,
        environment: str,
        region: str,
        project_name: str,
    ) -> list[dict]:
        template = {
            "AWSTemplateFormatVersion": "2010-09-09",
            "Description": f"CloudFormation template for {project_name} ({environment})",
            "Parameters": self._build_parameters(services, config, environment, region, project_name),
            "Resources": {},
            "Outputs": {},
        }

        for svc in services:
            svc_config = config.get(svc, {}).get("config", {})
            builder = getattr(self, f"_build_{svc}", None)
            if builder:
                resources, outputs = builder(svc_config, environment, project_name)
                template["Resources"].update(resources)
                template["Outputs"].update(outputs)

        content = json.dumps(template, indent=2)

        return [
            {
                "name": "template.json",
                "path": f"{project_name}/template.json",
                "content": content,
                "language": "json",
            }
        ]

    def _build_parameters(self, services, config, environment, region, project_name):
        params = {
            "Environment": {
                "Type": "String",
                "Default": environment,
                "AllowedValues": ["development", "staging", "production"],
                "Description": "Environment name",
            },
            "ProjectName": {
                "Type": "String",
                "Default": project_name,
                "Description": "Project name",
            },
        }

        if "vpc" in services:
            vpc_cfg = config.get("vpc", {}).get("config", {})
            params["VpcCidr"] = {
                "Type": "String",
                "Default": vpc_cfg.get("cidr_block", "10.0.0.0/16"),
                "Description": "VPC CIDR block",
            }

        if "ec2" in services:
            ec2_cfg = config.get("ec2", {}).get("config", {})
            params["InstanceType"] = {
                "Type": "String",
                "Default": ec2_cfg.get("instance_type", "t3.micro"),
                "Description": "EC2 instance type",
            }

        if "rds" in services:
            rds_cfg = config.get("rds", {}).get("config", {})
            params["DBInstanceClass"] = {
                "Type": "String",
                "Default": rds_cfg.get("instance_class", "db.t3.micro"),
                "Description": "RDS instance class",
            }
            params["DBEngine"] = {
                "Type": "String",
                "Default": rds_cfg.get("engine", "postgres"),
                "Description": "Database engine",
            }

        return params

    def _build_vpc(self, cfg, environment, project_name):
        resources = {}
        outputs = {}

        cidr = cfg.get("cidr_block", "10.0.0.0/16")
        enable_dns = cfg.get("enable_dns", True)
        public_count = int(cfg.get("public_subnets", 2))
        private_count = int(cfg.get("private_subnets", 2))
        enable_nat = cfg.get("enable_nat", False)

        resources["VPC"] = {
            "Type": "AWS::EC2::VPC",
            "Properties": {
                "CidrBlock": {"Ref": "VpcCidr"},
                "EnableDnsSupport": enable_dns,
                "EnableDnsHostnames": enable_dns,
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {"Fn::Sub": "${ProjectName}-${Environment}-vpc"},
                    }
                ],
            },
        }

        resources["InternetGateway"] = {
            "Type": "AWS::EC2::InternetGateway",
            "Properties": {
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {"Fn::Sub": "${ProjectName}-${Environment}-igw"},
                    }
                ]
            },
        }

        resources["VPCGatewayAttachment"] = {
            "Type": "AWS::EC2::VPCGatewayAttachment",
            "Properties": {
                "VpcId": {"Ref": "VPC"},
                "InternetGatewayId": {"Ref": "InternetGateway"},
            },
        }

        resources["PublicRouteTable"] = {
            "Type": "AWS::EC2::RouteTable",
            "Properties": {
                "VpcId": {"Ref": "VPC"},
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {"Fn::Sub": "${ProjectName}-${Environment}-public-rt"},
                    }
                ],
            },
        }

        resources["PublicRoute"] = {
            "Type": "AWS::EC2::Route",
            "DependsOn": "VPCGatewayAttachment",
            "Properties": {
                "RouteTableId": {"Ref": "PublicRouteTable"},
                "DestinationCidrBlock": "0.0.0.0/0",
                "GatewayId": {"Ref": "InternetGateway"},
            },
        }

        azs = ["a", "b", "c"]
        for i in range(public_count):
            subnet_name = f"PublicSubnet{i}"
            resources[subnet_name] = {
                "Type": "AWS::EC2::Subnet",
                "Properties": {
                    "VpcId": {"Ref": "VPC"},
                    "CidrBlock": f"10.0.{i}.0/24",
                    "AvailabilityZone": {
                        "Fn::Select": [
                            str(i % 3),
                            {"Fn::GetAZs": {"Ref": "AWS::Region"}},
                        ]
                    },
                    "MapPublicIpOnLaunch": True,
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": {
                                "Fn::Sub": f"${{ProjectName}}-${{Environment}}-public-{i}"
                            },
                        }
                    ],
                },
            }
            resources[f"PublicSubnetRouteTableAssociation{i}"] = {
                "Type": "AWS::EC2::SubnetRouteTableAssociation",
                "Properties": {
                    "SubnetId": {"Ref": subnet_name},
                    "RouteTableId": {"Ref": "PublicRouteTable"},
                },
            }

        for i in range(private_count):
            subnet_name = f"PrivateSubnet{i}"
            resources[subnet_name] = {
                "Type": "AWS::EC2::Subnet",
                "Properties": {
                    "VpcId": {"Ref": "VPC"},
                    "CidrBlock": f"10.0.{i + 10}.0/24",
                    "AvailabilityZone": {
                        "Fn::Select": [
                            str(i % 3),
                            {"Fn::GetAZs": {"Ref": "AWS::Region"}},
                        ]
                    },
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": {
                                "Fn::Sub": f"${{ProjectName}}-${{Environment}}-private-{i}"
                            },
                        }
                    ],
                },
            }

        if enable_nat and private_count > 0:
            resources["NatEIP"] = {
                "Type": "AWS::EC2::EIP",
                "Properties": {"Domain": "vpc"},
            }
            resources["NatGateway"] = {
                "Type": "AWS::EC2::NatGateway",
                "Properties": {
                    "AllocationId": {"Fn::GetAtt": ["NatEIP", "AllocationId"]},
                    "SubnetId": {"Ref": "PublicSubnet0"},
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": {"Fn::Sub": "${ProjectName}-${Environment}-nat"},
                        }
                    ],
                },
            }
            resources["PrivateRouteTable"] = {
                "Type": "AWS::EC2::RouteTable",
                "Properties": {
                    "VpcId": {"Ref": "VPC"},
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": {
                                "Fn::Sub": "${ProjectName}-${Environment}-private-rt"
                            },
                        }
                    ],
                },
            }
            resources["PrivateRoute"] = {
                "Type": "AWS::EC2::Route",
                "Properties": {
                    "RouteTableId": {"Ref": "PrivateRouteTable"},
                    "DestinationCidrBlock": "0.0.0.0/0",
                    "NatGatewayId": {"Ref": "NatGateway"},
                },
            }

        outputs["VpcId"] = {
            "Description": "VPC ID",
            "Value": {"Ref": "VPC"},
            "Export": {"Name": {"Fn::Sub": "${ProjectName}-${Environment}-vpc-id"}},
        }

        return resources, outputs

    def _build_ec2(self, cfg, environment, project_name):
        resources = {}
        outputs = {}

        volume_size = cfg.get("root_volume_size", 20)
        public_ip = cfg.get("enable_public_ip", True)

        resources["EC2SecurityGroup"] = {
            "Type": "AWS::EC2::SecurityGroup",
            "Properties": {
                "GroupDescription": "EC2 security group",
                "VpcId": {"Ref": "VPC"},
                "SecurityGroupIngress": [
                    {
                        "IpProtocol": "tcp",
                        "FromPort": 22,
                        "ToPort": 22,
                        "CidrIp": "0.0.0.0/0",
                        "Description": "SSH access",
                    },
                    {
                        "IpProtocol": "tcp",
                        "FromPort": 80,
                        "ToPort": 80,
                        "CidrIp": "0.0.0.0/0",
                        "Description": "HTTP access",
                    },
                    {
                        "IpProtocol": "tcp",
                        "FromPort": 443,
                        "ToPort": 443,
                        "CidrIp": "0.0.0.0/0",
                        "Description": "HTTPS access",
                    },
                ],
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {"Fn::Sub": "${ProjectName}-${Environment}-ec2-sg"},
                    }
                ],
            },
        }

        resources["EC2Instance"] = {
            "Type": "AWS::EC2::Instance",
            "Properties": {
                "InstanceType": {"Ref": "InstanceType"},
                "ImageId": "{{resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64}}",
                "SubnetId": {"Ref": "PublicSubnet0"},
                "SecurityGroupIds": [{"Ref": "EC2SecurityGroup"}],
                "BlockDeviceMappings": [
                    {
                        "DeviceName": "/dev/xvda",
                        "Ebs": {
                            "VolumeSize": volume_size,
                            "VolumeType": "gp3",
                            "Encrypted": True,
                        },
                    }
                ],
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {"Fn::Sub": "${ProjectName}-${Environment}-instance"},
                    }
                ],
            },
        }

        outputs["EC2InstanceId"] = {
            "Description": "EC2 Instance ID",
            "Value": {"Ref": "EC2Instance"},
        }
        if public_ip:
            outputs["EC2PublicIp"] = {
                "Description": "EC2 Public IP",
                "Value": {"Fn::GetAtt": ["EC2Instance", "PublicIp"]},
            }

        return resources, outputs

    def _build_s3(self, cfg, environment, project_name):
        resources = {}
        outputs = {}

        bucket_suffix = cfg.get("bucket_name", "data")
        versioning = cfg.get("versioning", True)
        encryption = cfg.get("encryption", "AES256")
        block_public = cfg.get("block_public_access", True)

        bucket_config = {
            "Type": "AWS::S3::Bucket",
            "Properties": {
                "BucketName": {
                    "Fn::Sub": f"${{ProjectName}}-${{Environment}}-{bucket_suffix}"
                },
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {
                            "Fn::Sub": f"${{ProjectName}}-${{Environment}}-{bucket_suffix}"
                        },
                    }
                ],
            },
        }

        if versioning:
            bucket_config["Properties"]["VersioningConfiguration"] = {
                "Status": "Enabled"
            }

        if encryption != "none":
            bucket_config["Properties"]["BucketEncryption"] = {
                "ServerSideEncryptionConfiguration": [
                    {
                        "ServerSideEncryptionByDefault": {
                            "SSEAlgorithm": encryption
                        }
                    }
                ]
            }

        if block_public:
            bucket_config["Properties"]["PublicAccessBlockConfiguration"] = {
                "BlockPublicAcls": True,
                "BlockPublicPolicy": True,
                "IgnorePublicAcls": True,
                "RestrictPublicBuckets": True,
            }

        resources["S3Bucket"] = bucket_config

        outputs["S3BucketName"] = {
            "Description": "S3 Bucket Name",
            "Value": {"Ref": "S3Bucket"},
        }
        outputs["S3BucketArn"] = {
            "Description": "S3 Bucket ARN",
            "Value": {"Fn::GetAtt": ["S3Bucket", "Arn"]},
        }

        return resources, outputs

    def _build_rds(self, cfg, environment, project_name):
        resources = {}
        outputs = {}

        engine = cfg.get("engine", "postgres")
        engine_version = cfg.get("engine_version", "16")
        instance_class = cfg.get("instance_class", "db.t3.micro")
        storage = cfg.get("allocated_storage", 20)
        multi_az = cfg.get("multi_az", False)
        backup_retention = cfg.get("backup_retention", 7)
        port = 5432 if engine == "postgres" else 3306

        resources["DBSubnetGroup"] = {
            "Type": "AWS::RDS::DBSubnetGroup",
            "Properties": {
                "DBSubnetGroupDescription": "Database subnet group",
                "SubnetIds": [
                    {"Ref": "PrivateSubnet0"},
                    {"Ref": "PrivateSubnet1"},
                ],
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {
                            "Fn::Sub": "${ProjectName}-${Environment}-db-subnet"
                        },
                    }
                ],
            },
        }

        resources["RDSSecurityGroup"] = {
            "Type": "AWS::EC2::SecurityGroup",
            "Properties": {
                "GroupDescription": "RDS security group",
                "VpcId": {"Ref": "VPC"},
                "SecurityGroupIngress": [
                    {
                        "IpProtocol": "tcp",
                        "FromPort": port,
                        "ToPort": port,
                        "CidrIp": {"Ref": "VpcCidr"},
                        "Description": "Database access from VPC",
                    }
                ],
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {
                            "Fn::Sub": "${ProjectName}-${Environment}-rds-sg"
                        },
                    }
                ],
            },
        }

        resources["RDSInstance"] = {
            "Type": "AWS::RDS::DBInstance",
            "Properties": {
                "DBInstanceIdentifier": {
                    "Fn::Sub": "${ProjectName}-${Environment}-db"
                },
                "Engine": {"Ref": "DBEngine"},
                "EngineVersion": engine_version,
                "DBInstanceClass": {"Ref": "DBInstanceClass"},
                "AllocatedStorage": storage,
                "StorageType": "gp3",
                "StorageEncrypted": True,
                "MasterUsername": "dbadmin",
                "MasterUserPassword": "CHANGE_ME_IMMEDIATELY",
                "DBSubnetGroupName": {"Ref": "DBSubnetGroup"},
                "VPCSecurityGroups": [{"Ref": "RDSSecurityGroup"}],
                "MultiAZ": multi_az,
                "BackupRetentionPeriod": backup_retention,
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {
                            "Fn::Sub": "${ProjectName}-${Environment}-db"
                        },
                    }
                ],
            },
        }

        outputs["RDSEndpoint"] = {
            "Description": "RDS Endpoint",
            "Value": {"Fn::GetAtt": ["RDSInstance", "Endpoint.Address"]},
        }
        outputs["RDSPort"] = {
            "Description": "RDS Port",
            "Value": {"Fn::GetAtt": ["RDSInstance", "Endpoint.Port"]},
        }

        return resources, outputs

    def _build_alb(self, cfg, environment, project_name):
        resources = {}
        outputs = {}

        internal = cfg.get("internal", False)
        health_path = cfg.get("health_check_path", "/")
        listener_port = int(cfg.get("listener_port", 80))
        target_port = int(cfg.get("target_port", 80))

        resources["ALBSecurityGroup"] = {
            "Type": "AWS::EC2::SecurityGroup",
            "Properties": {
                "GroupDescription": "ALB security group",
                "VpcId": {"Ref": "VPC"},
                "SecurityGroupIngress": [
                    {
                        "IpProtocol": "tcp",
                        "FromPort": listener_port,
                        "ToPort": listener_port,
                        "CidrIp": "0.0.0.0/0",
                    }
                ],
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {
                            "Fn::Sub": "${ProjectName}-${Environment}-alb-sg"
                        },
                    }
                ],
            },
        }

        resources["ApplicationLoadBalancer"] = {
            "Type": "AWS::ElasticLoadBalancingV2::LoadBalancer",
            "Properties": {
                "Name": {"Fn::Sub": "${ProjectName}-${Environment}-alb"},
                "Scheme": "internal" if internal else "internet-facing",
                "Type": "application",
                "SecurityGroups": [{"Ref": "ALBSecurityGroup"}],
                "Subnets": [
                    {"Ref": "PublicSubnet0"},
                    {"Ref": "PublicSubnet1"},
                ],
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": {
                            "Fn::Sub": "${ProjectName}-${Environment}-alb"
                        },
                    }
                ],
            },
        }

        resources["ALBTargetGroup"] = {
            "Type": "AWS::ElasticLoadBalancingV2::TargetGroup",
            "Properties": {
                "Name": {"Fn::Sub": "${ProjectName}-${Environment}-tg"},
                "Port": target_port,
                "Protocol": "HTTP",
                "VpcId": {"Ref": "VPC"},
                "HealthCheckPath": health_path,
                "HealthyThresholdCount": 3,
                "UnhealthyThresholdCount": 3,
                "HealthCheckTimeoutSeconds": 5,
                "HealthCheckIntervalSeconds": 30,
            },
        }

        resources["ALBListener"] = {
            "Type": "AWS::ElasticLoadBalancingV2::Listener",
            "Properties": {
                "LoadBalancerArn": {"Ref": "ApplicationLoadBalancer"},
                "Port": listener_port,
                "Protocol": "HTTP" if listener_port == 80 else "HTTPS",
                "DefaultActions": [
                    {
                        "Type": "forward",
                        "TargetGroupArn": {"Ref": "ALBTargetGroup"},
                    }
                ],
            },
        }

        outputs["ALBDnsName"] = {
            "Description": "ALB DNS Name",
            "Value": {
                "Fn::GetAtt": ["ApplicationLoadBalancer", "DNSName"]
            },
        }

        return resources, outputs

    def _build_iam(self, cfg, environment, project_name):
        resources = {}
        outputs = {}

        create_ec2_role = cfg.get("create_ec2_role", True)
        create_admin = cfg.get("create_admin_role", False)
        create_s3_policy = cfg.get("create_s3_policy", False)
        create_rds_policy = cfg.get("create_rds_policy", False)

        if create_ec2_role:
            resources["EC2Role"] = {
                "Type": "AWS::IAM::Role",
                "Properties": {
                    "RoleName": {
                        "Fn::Sub": "${ProjectName}-${Environment}-ec2-role"
                    },
                    "AssumeRolePolicyDocument": {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Principal": {"Service": "ec2.amazonaws.com"},
                                "Action": "sts:AssumeRole",
                            }
                        ],
                    },
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": {
                                "Fn::Sub": "${ProjectName}-${Environment}-ec2-role"
                            },
                        }
                    ],
                },
            }
            resources["EC2InstanceProfile"] = {
                "Type": "AWS::IAM::InstanceProfile",
                "Properties": {
                    "InstanceProfileName": {
                        "Fn::Sub": "${ProjectName}-${Environment}-ec2-profile"
                    },
                    "Roles": [{"Ref": "EC2Role"}],
                },
            }
            outputs["EC2RoleArn"] = {
                "Description": "EC2 Role ARN",
                "Value": {"Fn::GetAtt": ["EC2Role", "Arn"]},
            }

        if create_s3_policy:
            resources["S3AccessPolicy"] = {
                "Type": "AWS::IAM::ManagedPolicy",
                "Properties": {
                    "ManagedPolicyName": {
                        "Fn::Sub": "${ProjectName}-${Environment}-s3-access"
                    },
                    "PolicyDocument": {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Action": [
                                    "s3:GetObject",
                                    "s3:PutObject",
                                    "s3:ListBucket",
                                    "s3:DeleteObject",
                                ],
                                "Resource": "*",
                            }
                        ],
                    },
                },
            }

        if create_rds_policy:
            resources["RDSAccessPolicy"] = {
                "Type": "AWS::IAM::ManagedPolicy",
                "Properties": {
                    "ManagedPolicyName": {
                        "Fn::Sub": "${ProjectName}-${Environment}-rds-access"
                    },
                    "PolicyDocument": {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Action": [
                                    "rds:DescribeDBInstances",
                                    "rds:Connect",
                                ],
                                "Resource": "*",
                            }
                        ],
                    },
                },
            }

        return resources, outputs
