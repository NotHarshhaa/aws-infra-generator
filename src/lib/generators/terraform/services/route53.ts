import { GeneratedFile } from '../types';

export function generateRoute53(
  cfg: Record<string, any>,
  environment: string,
  projectName: string,
  selectedServices: string[] = []
): GeneratedFile {
  const domainName = cfg.domain_name || `${projectName}-${environment}.example.com`;
  const createHostedZone = cfg.create_hosted_zone !== false;
  const createRecords = cfg.create_records !== false;
  const subdomain = cfg.subdomain || 'app';
  const hasAlb = selectedServices.includes('alb');
  const hasCloudFront = selectedServices.includes('cloudfront');

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

    if (hasCloudFront && !hasAlb) {
      content += `# A record alias to CloudFront distribution
resource "aws_route53_record" "app" {
  zone_id = ${zoneReference}
  name    = "${subdomain}.${domainName}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}
`;
    } else if (hasAlb) {
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
    } else {
      content += `# DNS records skipped — enable ALB or CloudFront to create alias records
`;
    }
  }

  return {
    name: "route53.tf",
    path: `${projectName}/route53.tf`,
    content: content || "# Route53 resources not configured",
    language: "hcl",
  };
}
