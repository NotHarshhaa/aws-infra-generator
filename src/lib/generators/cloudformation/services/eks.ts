import { ServiceBuilderResult } from '../types';
import {
  cfPrivateSubnetRefs,
  cfPublicSubnetRefs,
  type CloudFormationBuildContext,
} from '../../../cloudformation-helpers';

export function buildEks(
  cfg: Record<string, any>,
  environment: string,
  projectName: string,
  context?: CloudFormationBuildContext
): ServiceBuilderResult {
  const kubernetesVersion = cfg.kubernetes_version || "1.29";
  const nodeInstanceType = cfg.node_group_instance_type || "t3.medium";
  const nodeDesiredSize = cfg.node_group_desired_size || 2;
  const nodeMinSize = cfg.node_group_min_size || 1;
  const nodeMaxSize = cfg.node_group_max_size || 4;

  const resources: any = {
    EKSCluster: {
      Type: "AWS::EKS::Cluster",
      Properties: {
        Name: `${projectName}-${environment}-eks`,
        Version: kubernetesVersion,
        RoleArn: { "Fn::GetAtt": ["EKSClusterRole", "Arn"] },
        ResourcesVpcConfig: {
          SubnetIds: [
            ...cfPublicSubnetRefs(context?.publicSubnetCount ?? 2),
            ...cfPrivateSubnetRefs(context?.privateSubnetCount ?? 2),
          ],
          EndpointPublicAccess: true,
          EndpointPrivateAccess: true
        },
        Logging: {
          ClusterLogging: {
            Enabled: [
              "api",
              "audit",
              "authenticator",
              "controllerManager",
              "scheduler"
            ]
          }
        },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-eks-cluster`
          }
        ]
      }
    },
    EKSNodeGroup: {
      Type: "AWS::EKS::Nodegroup",
      Properties: {
        ClusterName: { "Ref": "EKSCluster" },
        NodegroupName: `${projectName}-${environment}-nodes`,
        NodeRole: { "Fn::GetAtt": ["EKSNodeRole", "Arn"] },
        Subnets: cfPrivateSubnetRefs(context?.privateSubnetCount ?? 2),
        ScalingConfig: {
          DesiredSize: nodeDesiredSize,
          MinSize: nodeMinSize,
          MaxSize: nodeMaxSize
        },
        InstanceTypes: [nodeInstanceType],
        RemoteAccess: {
          Ec2SshKey: { "Ref": "SSHKeyPairName" },
          SourceSecurityGroups: [{ "Ref": "EKSNodeSecurityGroup" }]
        },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-eks-node-group`
          }
        ]
      },
      DependsOn: [
        "EKSClusterRolePolicyAttachment",
        "EKSWorkerNodeRolePolicyAttachment",
        "EKSCNIPolicyAttachment",
        "EKSContainerRegistryPolicyAttachment"
      ]
    },
    EKSClusterRole: {
      Type: "AWS::IAM::Role",
      Properties: {
        RoleName: `${projectName}-${environment}-eks-cluster-role`,
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "eks.amazonaws.com"
              },
              Action: "sts:AssumeRole"
            }
          ]
        },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-eks-cluster-role`
          }
        ]
      }
    },
    EKSClusterRolePolicyAttachment: {
      Type: "AWS::IAM::RolePolicyAttachment",
      Properties: {
        PolicyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
        RoleName: { "Fn::GetAtt": ["EKSClusterRole", "RoleName"] }
      }
    },
    EKSNodeRole: {
      Type: "AWS::IAM::Role",
      Properties: {
        RoleName: `${projectName}-${environment}-eks-node-role`,
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "ec2.amazonaws.com"
              },
              Action: "sts:AssumeRole"
            }
          ]
        },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-eks-node-role`
          }
        ]
      }
    },
    EKSWorkerNodeRolePolicyAttachment: {
      Type: "AWS::IAM::RolePolicyAttachment",
      Properties: {
        PolicyArn: "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        RoleName: { "Fn::GetAtt": ["EKSNodeRole", "RoleName"] }
      }
    },
    EKSCNIPolicyAttachment: {
      Type: "AWS::IAM::RolePolicyAttachment",
      Properties: {
        PolicyArn: "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        RoleName: { "Fn::GetAtt": ["EKSNodeRole", "RoleName"] }
      }
    },
    EKSContainerRegistryPolicyAttachment: {
      Type: "AWS::IAM::RolePolicyAttachment",
      Properties: {
        PolicyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
        RoleName: { "Fn::GetAtt": ["EKSNodeRole", "RoleName"] }
      }
    },
    EKSNodeSecurityGroup: {
      Type: "AWS::EC2::SecurityGroup",
      Properties: {
        GroupName: `${projectName}-${environment}-eks-nodes-sg`,
        GroupDescription: "Security group for EKS nodes",
        VpcId: { "Ref": "VPC" },
        SecurityGroupEgress: [
          {
            IpProtocol: "-1",
            CidrIp: "0.0.0.0/0",
            Description: "Allow all outbound traffic"
          }
        ],
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-eks-nodes-sg`
          }
        ]
      }
    },
    EKSClusterIngressRule: {
      Type: "AWS::EC2::SecurityGroupIngress",
      Properties: {
        Description: "Allow EKS nodes to communicate with cluster API",
        IpProtocol: "tcp",
        FromPort: 443,
        ToPort: 443,
        GroupId: { "Ref": "EKSNodeSecurityGroup" },
        SourceSecurityGroupId: { "Ref": "EKSNodeSecurityGroup" }
      }
    },
    EKSNodeIngressRule: {
      Type: "AWS::EC2::SecurityGroupIngress",
      Properties: {
        Description: "Allow nodes to communicate with each other",
        IpProtocol: "-1",
        GroupId: { "Ref": "EKSNodeSecurityGroup" },
        SourceSecurityGroupId: { "Ref": "EKSNodeSecurityGroup" }
      }
    }
  };

  const outputs: any = {
    EKSClusterName: {
      Description: "EKS cluster name",
      Value: { "Fn::GetAtt": ["EKSCluster", "Name"] }
    },
    EKSClusterEndpoint: {
      Description: "EKS cluster endpoint",
      Value: { "Fn::GetAtt": ["EKSCluster", "Endpoint"] }
    },
    EKSClusterCertificateAuthorityData: {
      Description: "EKS cluster certificate authority data",
      Value: { "Fn::GetAtt": ["EKSCluster", "CertificateAuthorityData"] }
    },
    EKSNodeGroupName: {
      Description: "EKS node group name",
      Value: { "Fn::GetAtt": ["EKSNodeGroup", "NodegroupName"] }
    }
  };

  return [resources, outputs];
}
