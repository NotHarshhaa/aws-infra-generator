import { ServiceBuilderResult } from '../types';

export function buildVpc(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
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
