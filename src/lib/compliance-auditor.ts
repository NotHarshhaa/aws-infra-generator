import { ServiceConfig } from "./types";

export type ComplianceFramework = "soc2" | "hipaa" | "pci-dss" | "cis";

export interface ComplianceRule {
  id: string;
  frameworks: ComplianceFramework[];
  name: string;
  description: string;
  severity: "critical" | "high" | "medium";
  serviceId: string;
  check: (config: ServiceConfig) => boolean;
  remediation: string;
  fixAction?: {
    serviceId: string;
    key: string;
    value: string | number | boolean;
  };
}

export interface ComplianceFinding {
  ruleId: string;
  frameworks: ComplianceFramework[];
  name: string;
  description: string;
  severity: "critical" | "high" | "medium";
  serviceId: string;
  remediation: string;
  fixAction?: {
    serviceId: string;
    key: string;
    value: string | number | boolean;
  };
}

export interface ComplianceScore {
  overallScore: number;
  frameworkScores: Record<ComplianceFramework, number>;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  findings: ComplianceFinding[];
}

export const COMPLIANCE_FRAMEWORKS: {
  id: ComplianceFramework;
  name: string;
  shortName: string;
  description: string;
}[] = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    shortName: "SOC 2",
    description: "Security, Availability & Confidentiality Trust Services Criteria",
  },
  {
    id: "hipaa",
    name: "HIPAA Security Rule",
    shortName: "HIPAA",
    description: "Protected Health Information (ePHI) encryption & audit controls",
  },
  {
    id: "pci-dss",
    name: "PCI-DSS v4.0",
    shortName: "PCI-DSS",
    description: "Payment card data protection, boundary isolation & logging",
  },
  {
    id: "cis",
    name: "CIS AWS Benchmark",
    shortName: "CIS AWS",
    description: "Center for Internet Security prescriptive AWS foundation standards",
  },
];

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: "COMP-S3-001",
    frameworks: ["soc2", "hipaa", "pci-dss", "cis"],
    name: "S3 Server-Side Encryption (KMS / AES-256)",
    description: "All S3 buckets storing customer data must enforce server-side encryption at rest.",
    severity: "critical",
    serviceId: "s3",
    check: (config) => {
      const s3 = config.s3?.config;
      if (!config.s3?.enabled) return true;
      return s3?.encryption === true || s3?.enable_encryption === true;
    },
    remediation: "Enable server-side encryption on S3 bucket configuration.",
    fixAction: {
      serviceId: "s3",
      key: "encryption",
      value: true,
    },
  },
  {
    id: "COMP-S3-002",
    frameworks: ["soc2", "pci-dss", "cis"],
    name: "S3 Block Public Access",
    description: "Public access block must be enabled to prevent accidental exposure of sensitive buckets.",
    severity: "critical",
    serviceId: "s3",
    check: (config) => {
      const s3 = config.s3?.config;
      if (!config.s3?.enabled) return true;
      return s3?.block_public_access !== false;
    },
    remediation: "Enable Block Public Access for the S3 bucket.",
    fixAction: {
      serviceId: "s3",
      key: "block_public_access",
      value: true,
    },
  },
  {
    id: "COMP-S3-003",
    frameworks: ["soc2", "hipaa"],
    name: "S3 Object Versioning & Immutability",
    description: "Object versioning protects against ransomware and accidental data deletion.",
    severity: "medium",
    serviceId: "s3",
    check: (config) => {
      const s3 = config.s3?.config;
      if (!config.s3?.enabled) return true;
      return s3?.versioning === true;
    },
    remediation: "Enable object versioning on S3 bucket.",
    fixAction: {
      serviceId: "s3",
      key: "versioning",
      value: true,
    },
  },
  {
    id: "COMP-RDS-001",
    frameworks: ["soc2", "hipaa", "pci-dss", "cis"],
    name: "RDS Database Storage Encryption",
    description: "Relational database storage volumes must be encrypted with KMS or AWS managed keys.",
    severity: "critical",
    serviceId: "rds",
    check: (config) => {
      const rds = config.rds?.config;
      if (!config.rds?.enabled) return true;
      return rds?.storage_encrypted === true || rds?.storage_encryption === true;
    },
    remediation: "Enable storage encryption on RDS database.",
    fixAction: {
      serviceId: "rds",
      key: "storage_encrypted",
      value: true,
    },
  },
  {
    id: "COMP-RDS-002",
    frameworks: ["soc2", "pci-dss", "cis"],
    name: "RDS Non-Public Subnet Isolation",
    description: "Databases must not be publicly accessible directly from the public internet.",
    severity: "critical",
    serviceId: "rds",
    check: (config) => {
      const rds = config.rds?.config;
      if (!config.rds?.enabled) return true;
      return rds?.publicly_accessible === false;
    },
    remediation: "Disable publicly accessible flag on RDS database.",
    fixAction: {
      serviceId: "rds",
      key: "publicly_accessible",
      value: false,
    },
  },
  {
    id: "COMP-RDS-003",
    frameworks: ["soc2", "hipaa"],
    name: "RDS Multi-AZ High Availability",
    description: "Production database environments must use Multi-AZ failover for disaster resilience.",
    severity: "high",
    serviceId: "rds",
    check: (config) => {
      const rds = config.rds?.config;
      if (!config.rds?.enabled) return true;
      return rds?.multi_az === true;
    },
    remediation: "Enable Multi-AZ deployment mode on RDS database.",
    fixAction: {
      serviceId: "rds",
      key: "multi_az",
      value: true,
    },
  },
  {
    id: "COMP-VPC-001",
    frameworks: ["soc2", "pci-dss", "cis"],
    name: "VPC Flow Logs Network Telemetry",
    description: "VPC flow logs capture IP traffic for security analysis and intrusion detection.",
    severity: "high",
    serviceId: "vpc",
    check: (config) => {
      const vpc = config.vpc?.config;
      if (!config.vpc?.enabled) return true;
      return vpc?.enable_flow_logs === true || vpc?.flow_logs === true;
    },
    remediation: "Enable VPC Flow Logs to CloudWatch.",
    fixAction: {
      serviceId: "vpc",
      key: "enable_flow_logs",
      value: true,
    },
  },
  {
    id: "COMP-EBS-001",
    frameworks: ["soc2", "hipaa", "pci-dss", "cis"],
    name: "EC2 EBS Volume Encryption",
    description: "All EBS root and data volumes attached to EC2 instances must be encrypted at rest.",
    severity: "high",
    serviceId: "ec2",
    check: (config) => {
      const ec2 = config.ec2?.config;
      if (!config.ec2?.enabled) return true;
      return ec2?.encrypted === true || ec2?.root_volume_encrypted === true;
    },
    remediation: "Enable EBS volume encryption on EC2 instances.",
    fixAction: {
      serviceId: "ec2",
      key: "encrypted",
      value: true,
    },
  },
  {
    id: "COMP-DDB-001",
    frameworks: ["soc2", "hipaa", "pci-dss"],
    name: "DynamoDB Point-in-Time Recovery (PITR)",
    description: "Point-in-time recovery protects NoSQL data against accidental writes or table corruption.",
    severity: "medium",
    serviceId: "dynamodb",
    check: (config) => {
      const ddb = config.dynamodb?.config;
      if (!config.dynamodb?.enabled) return true;
      return ddb?.point_in_time_recovery === true;
    },
    remediation: "Enable Point-in-Time Recovery on DynamoDB tables.",
    fixAction: {
      serviceId: "dynamodb",
      key: "point_in_time_recovery",
      value: true,
    },
  },
];

export function auditCompliance(
  selectedServices: string[],
  serviceConfig: ServiceConfig
): ComplianceScore {
  const applicableRules = COMPLIANCE_RULES.filter((rule) =>
    selectedServices.includes(rule.serviceId)
  );

  if (applicableRules.length === 0) {
    return {
      overallScore: 100,
      frameworkScores: {
        soc2: 100,
        hipaa: 100,
        "pci-dss": 100,
        cis: 100,
      },
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      findings: [],
    };
  }

  const findings: ComplianceFinding[] = [];
  let passedCount = 0;

  const frameworkTotals: Record<ComplianceFramework, { passed: number; total: number }> = {
    soc2: { passed: 0, total: 0 },
    hipaa: { passed: 0, total: 0 },
    "pci-dss": { passed: 0, total: 0 },
    cis: { passed: 0, total: 0 },
  };

  for (const rule of applicableRules) {
    const passed = rule.check(serviceConfig);

    for (const fw of rule.frameworks) {
      frameworkTotals[fw].total += 1;
      if (passed) {
        frameworkTotals[fw].passed += 1;
      }
    }

    if (passed) {
      passedCount += 1;
    } else {
      findings.push({
        ruleId: rule.id,
        frameworks: rule.frameworks,
        name: rule.name,
        description: rule.description,
        severity: rule.severity,
        serviceId: rule.serviceId,
        remediation: rule.remediation,
        fixAction: rule.fixAction,
      });
    }
  }

  const frameworkScores: Record<ComplianceFramework, number> = {
    soc2: frameworkTotals.soc2.total > 0
      ? Math.round((frameworkTotals.soc2.passed / frameworkTotals.soc2.total) * 100)
      : 100,
    hipaa: frameworkTotals.hipaa.total > 0
      ? Math.round((frameworkTotals.hipaa.passed / frameworkTotals.hipaa.total) * 100)
      : 100,
    "pci-dss": frameworkTotals["pci-dss"].total > 0
      ? Math.round((frameworkTotals["pci-dss"].passed / frameworkTotals["pci-dss"].total) * 100)
      : 100,
    cis: frameworkTotals.cis.total > 0
      ? Math.round((frameworkTotals.cis.passed / frameworkTotals.cis.total) * 100)
      : 100,
  };

  const overallScore = Math.round((passedCount / applicableRules.length) * 100);

  return {
    overallScore,
    frameworkScores,
    totalChecks: applicableRules.length,
    passedChecks: passedCount,
    failedChecks: findings.length,
    findings,
  };
}
