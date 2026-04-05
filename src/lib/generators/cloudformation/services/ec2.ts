import { ServiceBuilderResult } from '../types';

export function buildEc2(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
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
