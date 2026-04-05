import { ServiceBuilderResult } from '../types';

export function buildAlb(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
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
