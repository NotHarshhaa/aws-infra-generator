import { ServiceBuilderResult } from '../types';
import {
  cfPublicSubnetRefs,
  type CloudFormationBuildContext,
} from '../../../cloudformation-helpers';

export function buildEc2(
  cfg: Record<string, any>,
  environment: string,
  projectName: string,
  context?: CloudFormationBuildContext
): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const volumeSize = cfg.root_volume_size || 50;
  const publicIp = cfg.enable_public_ip !== false;
  const enableMonitoring = cfg.enable_monitoring !== false;

  // Security Group for EC2 instances with strict security rules
  resources.EC2SecurityGroup = {
    Type: "AWS::EC2::SecurityGroup",
    Properties: {
      GroupDescription: "Security group for EC2 instances",
      VpcId: { Ref: "VPC" },
      SecurityGroupIngress: [
        {
          IpProtocol: "tcp",
          FromPort: 22,
          ToPort: 22,
          CidrIp: { "Fn::Select": ["0", { Ref: "AllowedCidrBlocks" }] },
          Description: "SSH access from allowed CIDR blocks",
        },
        // HTTP access (restricted in production)
        ...(environment !== "production" ? [{
          IpProtocol: "tcp",
          FromPort: 80,
          ToPort: 80,
          CidrIp: "0.0.0.0/0",
          Description: "HTTP access",
        }] : []),
        // HTTPS access (restricted in production)
        ...(environment !== "production" ? [{
          IpProtocol: "tcp",
          FromPort: 443,
          ToPort: 443,
          CidrIp: "0.0.0.0/0",
          Description: "HTTPS access",
        }] : []),
      ],
      SecurityGroupEgress: [
        {
          IpProtocol: "-1",
          FromPort: 0,
          ToPort: 0,
          CidrIp: "0.0.0.0/0",
          Description: "Allow all outbound traffic",
        },
      ],
      Tags: [
        {
          Key: "Name",
          Value: { "Fn::Sub": "${ProjectName}-${Environment}-ec2-sg" },
        },
        {
          Key: "Type",
          Value: "SecurityGroup",
        },
        {
          Key: "Environment",
          Value: { Ref: "Environment" },
        },
        {
          Key: "CostCenter",
          Value: { Ref: "CostCenter" },
        },
        {
          Key: "Owner",
          Value: { Ref: "OwnerEmail" },
        },
      ],
    },
  };

  // IAM Role for EC2 instances with least privilege
  resources.EC2Role = {
    Type: "AWS::IAM::Role",
    Properties: {
      RoleName: { "Fn::Sub": "${ProjectName}-${Environment}-ec2-role" },
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
          Value: { "Fn::Sub": "${ProjectName}-${Environment}-ec2-role" },
        },
        {
          Key: "Type",
          Value: "IAMRole",
        },
        {
          Key: "Environment",
          Value: { Ref: "Environment" },
        },
        {
          Key: "CostCenter",
          Value: { Ref: "CostCenter" },
        },
        {
          Key: "Owner",
          Value: { Ref: "OwnerEmail" },
        },
      ],
    },
  };

  // IAM Policy for EC2 instances - basic permissions
  resources.EC2Policy = {
    Type: "AWS::IAM::Policy",
    Properties: {
      PolicyName: { "Fn::Sub": "${ProjectName}-${Environment}-ec2-policy" },
      PolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: [
              "cloudwatch:PutMetricData",
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents",
              "logs:DescribeLogGroups",
              "logs:DescribeLogStreams",
            ],
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: [
              "s3:GetObject",
              "s3:PutObject",
            ],
            Resource: [
              { "Fn::Sub": "arn:aws:s3:::${ProjectName}-${Environment}-app-data/*" },
              { "Fn::Sub": "arn:aws:s3:::${ProjectName}-${Environment}-app-data" },
            ],
          },
        ],
      },
      Roles: [{ Ref: "EC2Role" }],
    },
  };

  // Instance Profile for EC2 instances
  resources.EC2InstanceProfile = {
    Type: "AWS::IAM::InstanceProfile",
    Properties: {
      InstanceProfileName: { "Fn::Sub": "${ProjectName}-${Environment}-ec2-profile" },
      Roles: [{ Ref: "EC2Role" }],
    },
  };

  // CloudWatch Log Group for EC2 instances
  resources.EC2LogGroup = {
    Type: "AWS::Logs::LogGroup",
    Properties: {
      LogGroupName: { "Fn::Sub": "/aws/ec2/${ProjectName}-${Environment}" },
      RetentionInDays: environment === "production" ? 90 : 30,
    },
  };

  // EC2 instances with production-ready configuration
  resources.EC2Instance = {
    Type: "AWS::EC2::Instance",
    Properties: {
      InstanceType: { Ref: "InstanceType" },
      ImageId: {
        "Fn::If": [
          { "Fn::Equals": [{ Ref: "AmiId" }, ""] },
          "{{resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64}}",
          { Ref: "AmiId" },
        ],
      },
      SubnetId: cfPublicSubnetRefs(context?.publicSubnetCount ?? 2)[0] ?? {
        Ref: "PublicSubnet0",
      },
      SecurityGroupIds: [{ Ref: "EC2SecurityGroup" }],
      IamInstanceProfile: { Ref: "EC2InstanceProfile" },
      AssociatePublicIpAddress: publicIp,
      Monitoring: enableMonitoring,
      KeyName: { Ref: "SshKeyPairName" },
      RootBlockDevice: {
        DeviceName: "/dev/xvda",
        Ebs: {
          VolumeSize: { Ref: "RootVolumeSize" },
          VolumeType: "gp3",
          Encrypted: true,
          DeleteOnTermination: true,
          Iops: 3000,
          Throughput: 125,
        },
      },
      // Additional data volume for applications
      BlockDeviceMappings: [
        {
          DeviceName: "/dev/sdf",
          Ebs: {
            VolumeSize: 100,
            VolumeType: "gp3",
            Encrypted: true,
            DeleteOnTermination: true,
            Iops: 3000,
            Throughput: 125,
          },
        },
      ],
      Tags: [
        {
          Key: "Name",
          Value: { "Fn::Sub": "${ProjectName}-${Environment}-instance" },
        },
        {
          Key: "Type",
          Value: "EC2Instance",
        },
        {
          Key: "Environment",
          Value: { Ref: "Environment" },
        },
        {
          Key: "CostCenter",
          Value: { Ref: "CostCenter" },
        },
        {
          Key: "Owner",
          Value: { Ref: "OwnerEmail" },
        },
      ],
    },
  };

  // EBS volume attachment for additional storage
  resources.EBSVolumeAttachment = {
    Type: "AWS::EC2::VolumeAttachment",
    Properties: {
      DeviceName: "/dev/sdf",
      InstanceId: { Ref: "EC2Instance" },
      VolumeId: { "Fn::GetAtt": ["EC2Instance", "BlockDeviceMappings.0.Ebs.VolumeId"] },
    },
  };

  // Outputs
  outputs.EC2InstanceId = {
    Description: "EC2 Instance ID",
    Value: { Ref: "EC2Instance" },
  };

  outputs.EC2PublicIp = {
    Description: "EC2 Public IP",
    Value: { "Fn::GetAtt": ["EC2Instance", "PublicIp"] },
  };

  outputs.EC2PrivateIp = {
    Description: "EC2 Private IP",
    Value: { "Fn::GetAtt": ["EC2Instance", "PrivateIp"] },
  };

  outputs.EC2SecurityGroupId = {
    Description: "EC2 Security Group ID",
    Value: { Ref: "EC2SecurityGroup" },
  };

  return [resources, outputs];
}
