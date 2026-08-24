import { ServiceConfig, Environment } from "./types";

export interface AuditFinding {
  id: string;
  serviceId: string;
  serviceName: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "info";
  category: "security" | "reliability" | "cost" | "performance";
  autoFixAvailable: boolean;
  fixAction?: {
    serviceId: string;
    key: string;
    value: string | number | boolean;
  };
}

export function runSecurityAudit(
  selectedServices: string[],
  serviceConfig: ServiceConfig,
  environment: Environment = "development"
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  const getCfg = (serviceId: string, key: string, fallback: any) =>
    serviceConfig[serviceId]?.config?.[key] ?? fallback;

  // 1. S3 Public Access Block
  if (selectedServices.includes("s3")) {
    const blockPublic = getCfg("s3", "block_public_access", true);
    if (!blockPublic) {
      findings.push({
        id: "s3-public-access",
        serviceId: "s3",
        serviceName: "S3 Storage",
        title: "S3 Public Access Enabled",
        description:
          "S3 bucket allows public access. This exposes data to unauthorized internet users.",
        severity: "critical",
        category: "security",
        autoFixAvailable: true,
        fixAction: {
          serviceId: "s3",
          key: "block_public_access",
          value: true,
        },
      });
    }

    const encryption = getCfg("s3", "encryption", "AES256");
    if (encryption === "none") {
      findings.push({
        id: "s3-unencrypted",
        serviceId: "s3",
        serviceName: "S3 Storage",
        title: "S3 Bucket Unencrypted",
        description:
          "Objects stored in S3 are not encrypted at rest.",
        severity: "high",
        category: "security",
        autoFixAvailable: true,
        fixAction: {
          serviceId: "s3",
          key: "encryption",
          value: "AES256",
        },
      });
    }
  }

  // 2. RDS High Availability & Backups
  if (selectedServices.includes("rds")) {
    const multiAz = getCfg("rds", "multi_az", false);
    if (environment === "production" && !multiAz) {
      findings.push({
        id: "rds-single-az-prod",
        serviceId: "rds",
        serviceName: "RDS Database",
        title: "Single-AZ Database in Production",
        description:
          "RDS is running in Single-AZ for production environment. An AZ outage could cause total service disruption.",
        severity: "high",
        category: "reliability",
        autoFixAvailable: true,
        fixAction: {
          serviceId: "rds",
          key: "multi_az",
          value: true,
        },
      });
    }

    const backupDays = Number(getCfg("rds", "backup_retention", 7));
    if (backupDays < 7) {
      findings.push({
        id: "rds-short-backup",
        serviceId: "rds",
        serviceName: "RDS Database",
        title: "Short Backup Retention Window",
        description: `Automated backup retention is only ${backupDays} days. Recommended minimum is 7 days.`,
        severity: "medium",
        category: "reliability",
        autoFixAvailable: true,
        fixAction: {
          serviceId: "rds",
          key: "backup_retention",
          value: 7,
        },
      });
    }
  }

  // 3. VPC NAT Gateway for Private Subnets
  if (selectedServices.includes("vpc")) {
    const privateSubnets = Number(getCfg("vpc", "private_subnets", 2));
    const enableNat = getCfg("vpc", "enable_nat", false);

    if (privateSubnets > 0 && !enableNat) {
      findings.push({
        id: "vpc-private-no-nat",
        serviceId: "vpc",
        serviceName: "VPC Networking",
        title: "Private Subnets Omit NAT Gateway",
        description:
          "Private subnets are configured without a NAT Gateway. Resources in private subnets will not have outbound internet access for updates or third-party APIs.",
        severity: "medium",
        category: "reliability",
        autoFixAvailable: true,
        fixAction: {
          serviceId: "vpc",
          key: "enable_nat",
          value: true,
        },
      });
    }
  }

  // 4. EC2 Public IP & Root Volume
  if (selectedServices.includes("ec2")) {
    const enablePublicIp = getCfg("ec2", "enable_public_ip", true);
    if (environment === "production" && enablePublicIp && selectedServices.includes("alb")) {
      findings.push({
        id: "ec2-public-ip-behind-alb",
        serviceId: "ec2",
        serviceName: "EC2 Server",
        title: "Public IP Assigned Behind Load Balancer",
        description:
          "EC2 instances have direct public IPs assigned despite sitting behind an Application Load Balancer.",
        severity: "medium",
        category: "security",
        autoFixAvailable: true,
        fixAction: {
          serviceId: "ec2",
          key: "enable_public_ip",
          value: false,
        },
      });
    }
  }

  // 5. CloudFront HTTPS
  if (selectedServices.includes("cloudfront") && selectedServices.includes("s3")) {
    findings.push({
      id: "cloudfront-s3-oai",
      serviceId: "cloudfront",
      serviceName: "CloudFront CDN",
      title: "Enforce HTTPS & Origin Access Control",
      description:
        "Using CloudFront with S3 speeds up content distribution globally while keeping S3 buckets secure via Origin Access Control.",
      severity: "info",
      category: "performance",
      autoFixAvailable: false,
    });
  }

  return findings;
}
