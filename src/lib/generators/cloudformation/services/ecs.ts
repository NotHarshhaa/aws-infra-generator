import { ServiceBuilderResult } from '../types';
import {
  cfPrivateSubnetRefs,
  cfPublicSubnetRefs,
  type CloudFormationBuildContext,
} from '../../../cloudformation-helpers';

export function buildEcs(
  cfg: Record<string, any>,
  environment: string,
  projectName: string,
  context?: CloudFormationBuildContext
): ServiceBuilderResult {
  const launchType = cfg.launch_type || "FARGATE";
  const taskCpu = cfg.task_cpu || "256";
  const taskMemory = cfg.task_memory || "512";
  const desiredCount = cfg.desired_count || 1;
  const enableLoadBalancing = cfg.enable_load_balancing === true;

  const resources: any = {
    ECSCluster: {
      Type: "AWS::ECS::Cluster",
      Properties: {
        ClusterName: `${projectName}-${environment}-cluster`,
        CapacityProviders: ["FARGATE", "FARGATE_SPOT"],
        DefaultCapacityProviderStrategy: [
          {
            CapacityProvider: "FARGATE",
            Weight: 1
          }
        ],
        Configuration: {
          ExecuteCommandConfiguration: {
            Logging: "DEFAULT"
          }
        },
        ServiceConnectDefaults: {
          Namespace: { "Ref": "ServiceConnectNamespace" }
        }
      }
    },
    TaskDefinition: {
      Type: "AWS::ECS::TaskDefinition",
      Properties: {
        Family: `${projectName}-${environment}-task`,
        NetworkMode: "awsvpc",
        RequiresCompatibilities: [launchType],
        Cpu: taskCpu,
        Memory: taskMemory,
        ExecutionRoleArn: { "Fn::GetAtt": ["ECSTaskExecutionRole", "Arn"] },
        TaskRoleArn: { "Fn::GetAtt": ["ECSTaskRole", "Arn"] },
        ContainerDefinitions: [
          {
            Name: "app",
            Image: "nginx:latest",
            PortMappings: [
              {
                ContainerPort: 80,
                Protocol: "tcp"
              }
            ],
            LogConfiguration: {
              LogDriver: "awslogs",
              Options: {
                "awslogs-group": { "Ref": "ECSLogGroup" },
                "awslogs-region": { "Ref": "AWS::Region" },
                "awslogs-stream-prefix": "ecs"
              }
            }
          }
        ]
      }
    },
    ECSService: {
      Type: "AWS::ECS::Service",
      Properties: {
        ServiceName: `${projectName}-${environment}-service`,
        Cluster: { "Ref": "ECSCluster" },
        TaskDefinition: { "Ref": "TaskDefinition" },
        DesiredCount: desiredCount,
        LaunchType: launchType,
        NetworkConfiguration: {
          AwsvpcConfiguration: {
            Subnets: cfPrivateSubnetRefs(context?.privateSubnetCount ?? 2),
            SecurityGroups: [{ "Ref": "ECSSecurityGroup" }],
            AssignPublicIp: "DISABLED"
          }
        },
        ...(enableLoadBalancing && {
          LoadBalancers: [
            {
              TargetGroupArn: { "Ref": "ECSTargetGroup" },
              ContainerName: "app",
              ContainerPort: 80
            }
          ]
        })
      },
      DependsOn: enableLoadBalancing ? ["ECSTargetGroup", "ALBListener"] : undefined
    },
    ECSSecurityGroup: {
      Type: "AWS::EC2::SecurityGroup",
      Properties: {
        GroupName: `${projectName}-${environment}-ecs-sg`,
        GroupDescription: "Security group for ECS tasks",
        VpcId: { "Ref": "VPC" },
        SecurityGroupIngress: enableLoadBalancing ? [
          {
            IpProtocol: "tcp",
            FromPort: 80,
            ToPort: 80,
            SourceSecurityGroupId: { "Ref": "ALBSecurityGroup" },
            Description: "HTTP from ALB"
          }
        ] : [],
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
            Value: `${projectName}-${environment}-ecs-sg`
          }
        ]
      }
    },
    ECSTaskExecutionRole: {
      Type: "AWS::IAM::Role",
      Properties: {
        RoleName: `${projectName}-${environment}-ecs-task-execution`,
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "ecs-tasks.amazonaws.com"
              },
              Action: "sts:AssumeRole"
            }
          ]
        },
        ManagedPolicyArns: [
          "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
        ],
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-ecs-task-execution-role`
          }
        ]
      }
    },
    ECSTaskRole: {
      Type: "AWS::IAM::Role",
      Properties: {
        RoleName: `${projectName}-${environment}-ecs-task`,
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "ecs-tasks.amazonaws.com"
              },
              Action: "sts:AssumeRole"
            }
          ]
        },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-ecs-task-role`
          }
        ]
      }
    },
    ECSLogGroup: {
      Type: "AWS::Logs::LogGroup",
      Properties: {
        LogGroupName: `/ecs/${projectName}-${environment}`,
        RetentionInDays: environment === "production" ? 90 : 30,
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-ecs-logs`
          }
        ]
      }
    },
    ServiceConnectNamespace: {
      Type: "AWS::ServiceDiscovery::HttpNamespace",
      Properties: {
        Name: `${projectName}-${environment}-sc`,
        Description: "Service Connect namespace for ECS services"
      }
    },
    ...(enableLoadBalancing && {
      ECSTargetGroup: {
        Type: "AWS::ElasticLoadBalancingV2::TargetGroup",
        Properties: {
          Name: `${projectName}-${environment}-ecs-tg`,
          Port: 80,
          Protocol: "HTTP",
          VpcId: { "Ref": "VPC" },
          HealthCheckConfig: {
            Enabled: true,
            HealthyThresholdCount: 2,
            IntervalSeconds: 30,
            Matcher: {
              HttpCode: "200"
            },
            Path: "/",
            Port: "traffic-port",
            Protocol: "HTTP",
            TimeoutSeconds: 5,
            UnhealthyThresholdCount: 2
          },
          TargetGroupAttributes: [
            {
              Key: "deregistration_delay.timeout_seconds",
              Value: "300"
            }
          ],
          Tags: [
            {
              Key: "Name",
              Value: `${projectName}-${environment}-ecs-tg`
            }
          ]
        }
      },
      ALBListener: {
        Type: "AWS::ElasticLoadBalancingV2::Listener",
        Properties: {
          LoadBalancerArn: { "Ref": "ApplicationLoadBalancer" },
          Port: 80,
          Protocol: "HTTP",
          DefaultActions: [
            {
              Type: "forward",
              TargetGroupArn: { "Ref": "ECSTargetGroup" }
            }
          ]
        }
      }
    })
  };

  const outputs: any = {
    ECSClusterName: {
      Description: "ECS cluster name",
      Value: { "Ref": "ECSCluster" }
    },
    ECSServiceName: {
      Description: "ECS service name",
      Value: { "Fn::GetAtt": ["ECSService", "Name"] }
    },
    ECSTaskDefinitionArn: {
      Description: "ECS task definition ARN",
      Value: { "Ref": "TaskDefinition" }
    },
    ...(enableLoadBalancing && {
      ECSTargetGroupArn: {
        Description: "ECS target group ARN",
        Value: { "Ref": "ECSTargetGroup" }
      }
    })
  };

  return [resources, outputs];
}
