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

  let content = '';

  if (createHostedZone) {
    content += `resource "aws_route53_zone" "main" {
  name = "${domainName}"
  
  tags = {
    Name = "\${var.project_name}-\${var.environment}-route53-zone"
    Environment = "\${var.environment}"
  }
}

`;
  }

  if (createRecords) {
    const zoneReference = createHostedZone 
      ? 'aws_route53_zone.main.zone_id' 
      : 'var.hosted_zone_id';

    content += `# A record for application load balancer
resource "aws_route53_record" "app" {
  zone_id = ${zoneReference}
  name    = "${subdomain}.${domainName}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id               = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# CNAME record for API
resource "aws_route53_record" "api" {
  zone_id = ${zoneReference}
  name    = "api.${domainName}"
  type    = "CNAME"
  ttl     = 300
  records = [aws_lb.main.dns_name]
}
`;
  }

  return {
    name: "route53.tf",
    path: `${projectName}/route53.tf`,
    content: content || "# Route53 resources not configured",
    language: "hcl",
  };
}
