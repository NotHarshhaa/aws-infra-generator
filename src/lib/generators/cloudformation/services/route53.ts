import { GeneratedFile } from '../types';

export function generateRoute53(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const domainName = cfg.domain_name || `${projectName}-${environment}.example.com`;
  const createHostedZone = cfg.create_hosted_zone !== false;
  const createRecords = cfg.create_records === true;
  const subdomain = cfg.subdomain || 'app';
  const healthChecks = cfg.health_checks === true;

  const resources: any = {
    Parameters: {
      DomainName: {
        Type: "String",
        Default: domainName,
        Description: "Domain name for Route 53 hosted zone",
      },
      Subdomain: {
        Type: "String",
        Default: subdomain,
        Description: "Subdomain for application",
      },
    },
    Resources: {},
    Outputs: {},
  };

  // Hosted Zone
  if (createHostedZone) {
    resources.Resources.HostedZone = {
      Type: "AWS::Route53::HostedZone",
      Properties: {
        Name: { Ref: "DomainName" },
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

    resources.Outputs.HostedZoneId = {
      Description: "Route 53 hosted zone ID",
      Value: { Ref: "HostedZone" },
      Export: {
        Name: `${projectName}-${environment}-HostedZoneId`,
      },
    };

    resources.Outputs.NameServers = {
      Description: "Route 53 name servers",
      Value: { "Fn::GetAtt": ["HostedZone", "NameServers"] },
    };
  }

  // DNS Records
  if (createRecords) {
    const zoneId = createHostedZone ? { Ref: "HostedZone" } : { Ref: "ExistingHostedZoneId" };

    // A Record for Application
    resources.Resources.AppRecord = {
      Type: "AWS::Route53::RecordSet",
      Properties: {
        HostedZoneId: zoneId,
        Name: { "Fn::Sub": "${Subdomain}.${DomainName}" },
        Type: "A",
        AliasTarget: [
          {
            DNSName: { "Fn::GetAtt": ["LoadBalancer", "DNSName"] },
            EvaluateTargetHealth: true,
            HostedZoneId: { "Fn::GetAtt": ["LoadBalancer", "CanonicalHostedZoneID"] },
          },
        ],
      },
    };

    // CNAME Record for API
    resources.Resources.ApiRecord = {
      Type: "AWS::Route53::RecordSet",
      Properties: {
        HostedZoneId: zoneId,
        Name: { "Fn::Sub": "api.${DomainName}" },
        Type: "CNAME",
        TTL: "300",
        ResourceRecords: [{ "Fn::GetAtt": ["LoadBalancer", "DNSName"] }],
      },
    };

    // MX Records for Email
    resources.Resources.MXRecord = {
      Type: "AWS::Route53::RecordSet",
      Properties: {
        HostedZoneId: zoneId,
        Name: { Ref: "DomainName" },
        Type: "MX",
        TTL: "3600",
        ResourceRecords: [
          "10 aspmx.l.google.com.",
          "20 alt1.aspmx.l.google.com.",
          "30 alt2.aspmx.l.google.com.",
          "40 aspmx2.l.google.com.",
        ],
      },
    };

    // SPF Record
    resources.Resources.SPFRecord = {
      Type: "AWS::Route53::RecordSet",
      Properties: {
        HostedZoneId: zoneId,
        Name: { Ref: "DomainName" },
        Type: "TXT",
        TTL: "3600",
        ResourceRecords: ["v=spf1 include:_spf.google.com ~all"],
      },
    };

    // DMARC Record
    resources.Resources.DMARCRecord = {
      Type: "AWS::Route53::RecordSet",
      Properties: {
        HostedZoneId: zoneId,
        Name: { "Fn::Sub": "_dmarc.${DomainName}" },
        Type: "TXT",
        TTL: "3600",
        ResourceRecords: [{ "Fn::Sub": "v=DMARC1; p=quarantine; rua=mailto:dmarc@${DomainName}" }],
      },
    };

    resources.Outputs.AppUrl = {
      Description: "Application URL",
      Value: { "Fn::Sub": "https://${Subdomain}.${DomainName}" },
    };

    resources.Outputs.ApiUrl = {
      Description: "API URL",
      Value: { "Fn::Sub": "https://api.${DomainName}" },
    };
  }

  // Health Checks
  if (healthChecks) {
    resources.Resources.AppHealthCheck = {
      Type: "AWS::Route53::HealthCheck",
      Properties: {
        FailureThreshold: "3",
        IPAddress: { "Fn::GetAtt": ["LoadBalancer", "CanonicalHostedZoneID"] },
        Port: "80",
        RequestInterval: "30",
        ResourcePath: cfg.health_check_path || "/health",
        SearchString: "200 OK",
        Type: "HTTP",
        CloudWatchAlarmRegion: { Ref: "AWS::Region" },
        CloudWatchAlarmName: { "Fn::Sub": "${projectName}-${environment}-app-health-check" },
        InsufficientDataHealthStatus: "Failure",
        MeasureLatency: true,
        EnableSNI: true,
      },
    };

    // CloudWatch Alarm for Health Check
    resources.Resources.HealthCheckAlarm = {
      Type: "AWS::CloudWatch::Alarm",
      Properties: {
        AlarmName: { "Fn::Sub": "${projectName}-${environment}-route53-health-check" },
        AlarmDescription: "Route 53 health check alarm",
        MetricName: "HealthCheckStatus",
        Namespace: "AWS/Route53",
        Statistic: "Minimum",
        Period: "60",
        EvaluationPeriods: "2",
        Threshold: "1",
        ComparisonOperator: "LessThanThreshold",
        AlarmActions: [{ Ref: "SNSTopic" }],
        Dimensions: [
          {
            Name: "HealthCheckId",
            Value: { Ref: "AppHealthCheck" },
          },
        ],
      },
    };
  }

  return {
    name: "route53.yaml",
    path: `${projectName}/route53.yaml`,
    content: JSON.stringify(resources, null, 2),
    language: "yaml",
  };
}
