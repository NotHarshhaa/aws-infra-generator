import { ServiceBuilderResult } from "../types";
import {
  CLOUDFRONT_HOSTED_ZONE_ID,
  type CloudFormationBuildContext,
} from "../../../cloudformation-helpers";

export function generateRoute53(
  cfg: Record<string, any>,
  environment: string,
  projectName: string,
  context?: CloudFormationBuildContext
): ServiceBuilderResult {
  const domainName = cfg.domain_name || `${projectName}-${environment}.example.com`;
  const createHostedZone = cfg.create_hosted_zone !== false;
  const createRecords = cfg.create_records !== false;
  const subdomain = cfg.subdomain || "app";
  const healthChecks = cfg.health_checks === true;
  const selectedServices = context?.selectedServices ?? [];
  const hasAlb = selectedServices.includes("alb");
  const hasCloudFront = selectedServices.includes("cloudfront");

  const resources: Record<string, unknown> = {};
  const outputs: Record<string, unknown> = {};

  if (createHostedZone) {
    resources.HostedZone = {
      Type: "AWS::Route53::HostedZone",
      Properties: {
        Name: domainName,
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-route53-zone`,
          },
          {
            Key: "Environment",
            Value: environment,
          },
        ],
      },
    };

    outputs.HostedZoneId = {
      Description: "Route 53 hosted zone ID",
      Value: { Ref: "HostedZone" },
      Export: {
        Name: `${projectName}-${environment}-HostedZoneId`,
      },
    };

    outputs.NameServers = {
      Description: "Route 53 name servers",
      Value: { "Fn::GetAtt": ["HostedZone", "NameServers"] },
    };
  }

  if (createRecords) {
    const zoneId = createHostedZone
      ? { Ref: "HostedZone" }
      : { Ref: "ExistingHostedZoneId" };

    if (hasCloudFront && !hasAlb) {
      resources.AppRecord = {
        Type: "AWS::Route53::RecordSet",
        Properties: {
          HostedZoneId: zoneId,
          Name: `${subdomain}.${domainName}`,
          Type: "A",
          AliasTarget: {
            DNSName: { "Fn::GetAtt": ["CloudFrontDistribution", "DomainName"] },
            HostedZoneId: CLOUDFRONT_HOSTED_ZONE_ID,
            EvaluateTargetHealth: false,
          },
        },
      };

      outputs.AppUrl = {
        Description: "Application URL",
        Value: `https://${subdomain}.${domainName}`,
      };
    } else if (hasAlb) {
      resources.AppRecord = {
        Type: "AWS::Route53::RecordSet",
        Properties: {
          HostedZoneId: zoneId,
          Name: `${subdomain}.${domainName}`,
          Type: "A",
          AliasTarget: {
            DNSName: { "Fn::GetAtt": ["ApplicationLoadBalancer", "DNSName"] },
            HostedZoneId: {
              "Fn::GetAtt": ["ApplicationLoadBalancer", "CanonicalHostedZoneID"],
            },
            EvaluateTargetHealth: true,
          },
        },
      };

      resources.ApiRecord = {
        Type: "AWS::Route53::RecordSet",
        Properties: {
          HostedZoneId: zoneId,
          Name: `api.${domainName}`,
          Type: "CNAME",
          TTL: "300",
          ResourceRecords: [{ "Fn::GetAtt": ["ApplicationLoadBalancer", "DNSName"] }],
        },
      };

      outputs.AppUrl = {
        Description: "Application URL",
        Value: `https://${subdomain}.${domainName}`,
      };

      outputs.ApiUrl = {
        Description: "API URL",
        Value: `https://api.${domainName}`,
      };
    }
  }

  if (healthChecks && hasAlb) {
    resources.AppHealthCheck = {
      Type: "AWS::Route53::HealthCheck",
      Properties: {
        HealthCheckConfig: {
          Type: "HTTP",
          ResourcePath: cfg.health_check_path || "/health",
          FullyQualifiedDomainName: {
            "Fn::GetAtt": ["ApplicationLoadBalancer", "DNSName"],
          },
          Port: 80,
          RequestInterval: 30,
          FailureThreshold: 3,
        },
        HealthCheckTags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-app-health-check`,
          },
        ],
      },
    };
  }

  return [resources, outputs];
}
