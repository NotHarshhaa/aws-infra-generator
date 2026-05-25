import { ServiceBuilderResult } from '../types';
import {
  cfPublicSubnetIdsJoin,
  cfPrivateSubnetIdsJoin,
} from '../../../cloudformation-helpers';

export function buildVpc(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const cidr = cfg.cidr_block || "10.0.0.0/16";
  const enableDns = cfg.enable_dns !== false;
  const publicCount = parseInt(cfg.public_subnets || "2");
  const privateCount = parseInt(cfg.private_subnets || "2");
  const enableNat = cfg.enable_nat === true;
  const enableFlowLogs = cfg.enable_flow_logs !== false;

  // VPC with enhanced networking and security
  resources.VPC = {
    Type: "AWS::EC2::VPC",
    Properties: {
      CidrBlock: { Ref: "VpcCidr" },
      EnableDnsSupport: enableDns,
      EnableDnsHostnames: enableDns,
      EnableNetworkAddressUsageMetrics: true,
      Tags: [
        {
          Key: "Name",
          Value: { "Fn::Sub": "${ProjectName}-${Environment}-vpc" },
        },
        {
          Key: "Type",
          Value: "VPC",
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

  // Internet Gateway for public internet access
  resources.InternetGateway = {
    Type: "AWS::EC2::InternetGateway",
    Properties: {
      Tags: [
        {
          Key: "Name",
          Value: { "Fn::Sub": "${ProjectName}-${Environment}-igw" },
        },
        {
          Key: "Type",
          Value: "InternetGateway",
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

  // Attach Internet Gateway to VPC
  resources.VPCGatewayAttachment = {
    Type: "AWS::EC2::VPCGatewayAttachment",
    Properties: {
      VpcId: { Ref: "VPC" },
      InternetGatewayId: { Ref: "InternetGateway" },
    },
  };

  // VPC Flow Logs for security monitoring
  if (enableFlowLogs) {
    resources.VPCFlowLogGroup = {
      Type: "AWS::Logs::LogGroup",
      Properties: {
        LogGroupName: { "Fn::Sub": "/aws/vpc/flow-logs/${ProjectName}-${Environment}" },
        RetentionInDays: environment === "production" ? 90 : 30,
      },
    };

    resources.VPCFlowLogRole = {
      Type: "AWS::IAM::Role",
      Properties: {
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { Service: "vpc-flow-logs.amazonaws.com" },
              Action: "sts:AssumeRole",
            },
          ],
        },
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": "${ProjectName}-${Environment}-vpc-flow-logs-role" },
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

    resources.VPCFlowLogPolicy = {
      Type: "AWS::IAM::Policy",
      Properties: {
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
              ],
              Resource: "*",
            },
          ],
        },
        Roles: [{ Ref: "VPCFlowLogRole" }],
      },
    };

    resources.VPCFlowLog = {
      Type: "AWS::EC2::FlowLog",
      Properties: {
        ResourceId: { Ref: "VPC" },
        ResourceType: "VPC",
        TrafficType: "ALL",
        LogGroupName: { Ref: "VPCFlowLogGroup" },
        DeliverLogsPermissionArn: { "Fn::GetAtt": ["VPCFlowLogRole", "Arn"] },
      },
    };
  }

  // Public subnets with high availability
  for (let i = 0; i < publicCount; i++) {
    const subnetName = `PublicSubnet${i}`;
    resources[subnetName] = {
      Type: "AWS::EC2::Subnet",
      Properties: {
        VpcId: { Ref: "VPC" },
        CidrBlock: { "Fn::Select": [i, { "Fn::Cidr": [{ Ref: "VpcCidr" }, 8, 4] }] },
        AvailabilityZone: { "Fn::Select": [i, { Ref: "AvailabilityZones" }] },
        MapPublicIpOnLaunch: true,
        AssignIpv6AddressOnCreation: false,
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": `${"${ProjectName}-${Environment}-public-"}${i + 1}` },
          },
          {
            Key: "Type",
            Value: "Public",
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

    resources[`PublicSubnetRouteTableAssociation${i}`] = {
      Type: "AWS::EC2::SubnetRouteTableAssociation",
      Properties: {
        SubnetId: { Ref: subnetName },
        RouteTableId: { Ref: "PublicRouteTable" },
      },
    };
  }

  // Private subnets for application servers
  for (let i = 0; i < privateCount; i++) {
    const subnetName = `PrivateSubnet${i}`;
    resources[subnetName] = {
      Type: "AWS::EC2::Subnet",
      Properties: {
        VpcId: { Ref: "VPC" },
        CidrBlock: { "Fn::Select": [i + publicCount, { "Fn::Cidr": [{ Ref: "VpcCidr" }, 8, 4] }] },
        AvailabilityZone: { "Fn::Select": [i, { Ref: "AvailabilityZones" }] },
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": `${"${ProjectName}-${Environment}-private-"}${i + 1}` },
          },
          {
            Key: "Type",
            Value: "Private",
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
  }

  // Public route table and routes
  resources.PublicRouteTable = {
    Type: "AWS::EC2::RouteTable",
    Properties: {
      VpcId: { Ref: "VPC" },
      Tags: [
        {
          Key: "Name",
          Value: { "Fn::Sub": "${ProjectName}-${Environment}-public-rt" },
        },
        {
          Key: "Type",
          Value: "PublicRouteTable",
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

  resources.PublicRoute = {
    Type: "AWS::EC2::Route",
    DependsOn: "VPCGatewayAttachment",
    Properties: {
      RouteTableId: { Ref: "PublicRouteTable" },
      DestinationCidrBlock: "0.0.0.0/0",
      GatewayId: { Ref: "InternetGateway" },
    },
  };

  // NAT Gateway for private subnets (production best practice)
  if (enableNat && privateCount > 0) {
    resources.NatEIP = {
      Type: "AWS::EC2::EIP",
      Properties: {
        Domain: "vpc",
        DependsOn: "VPCGatewayAttachment",
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": "${ProjectName}-${Environment}-nat-eip" },
          },
          {
            Key: "Type",
            Value: "NatEIP",
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
          {
            Key: "Type",
            Value: "NatGateway",
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

    resources.PrivateRouteTable = {
      Type: "AWS::EC2::RouteTable",
      Properties: {
        VpcId: { Ref: "VPC" },
        Tags: [
          {
            Key: "Name",
            Value: { "Fn::Sub": "${ProjectName}-${Environment}-private-rt" },
          },
          {
            Key: "Type",
            Value: "PrivateRouteTable",
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

    resources.PrivateRoute = {
      Type: "AWS::EC2::Route",
      Properties: {
        RouteTableId: { Ref: "PrivateRouteTable" },
        DestinationCidrBlock: "0.0.0.0/0",
        NatGatewayId: { Ref: "NatGateway" },
      },
    };

    // Associate private subnets with private route table
    for (let i = 0; i < privateCount; i++) {
      resources[`PrivateSubnetRouteTableAssociation${i}`] = {
        Type: "AWS::EC2::SubnetRouteTableAssociation",
        Properties: {
          SubnetId: { Ref: `PrivateSubnet${i}` },
          RouteTableId: { Ref: "PrivateRouteTable" },
        },
      };
    }
  }

  // Outputs
  outputs.VpcId = {
    Description: "VPC ID",
    Value: { Ref: "VPC" },
    Export: { Name: { "Fn::Sub": "${ProjectName}-${Environment}-vpc-id" } },
  };

  outputs.VpcCidrBlock = {
    Description: "VPC CIDR block",
    Value: { "Fn::GetAtt": ["VPC", "CidrBlock"] },
  };

  if (publicCount > 0) {
    outputs.PublicSubnetIds = {
      Description: "Comma-separated public subnet IDs",
      Value: cfPublicSubnetIdsJoin(publicCount),
    };
  }

  if (privateCount > 0) {
    outputs.PrivateSubnetIds = {
      Description: "Comma-separated private subnet IDs",
      Value: cfPrivateSubnetIdsJoin(privateCount),
    };
  }

  if (enableNat) {
    outputs.NatGatewayId = {
      Description: "NAT Gateway ID",
      Value: { Ref: "NatGateway" },
    };
  }

  return [resources, outputs];
}
