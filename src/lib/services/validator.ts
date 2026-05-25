import { DependencyResolver } from './dependency';
import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  Environment,
} from '../types';
import { validateProjectName } from '../validation/project-name';

export class InfraValidator {
  private resolver: DependencyResolver;

  constructor() {
    this.resolver = new DependencyResolver();
  }

  validate(
    services: string[],
    config: Record<string, any>,
    options?: { environment?: Environment; projectName?: string }
  ): ValidationResult {
    const environment = options?.environment;
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (options?.projectName !== undefined) {
      const projectNameError = validateProjectName(options.projectName);
      if (projectNameError) {
        errors.push({
          service: "Project",
          message: projectNameError,
          type: "config",
        });
      }
    }

    for (const svc of services) {
      const deps = this.resolver.getDependencies(svc);
      for (const dep of deps) {
        if (!services.includes(dep)) {
          errors.push({
            service: svc,
            message: `Missing required dependency: ${dep}`,
            type: "dependency",
          });
        }
      }
    }

    if (services.includes("ec2")) {
      const ec2Config = config.ec2?.config || {};
      const instanceCount = ec2Config.instance_count || 1;

      if (typeof instanceCount === "number" && instanceCount > 20) {
        warnings.push({
          service: "EC2",
          message: `High instance count (${instanceCount}). Consider using Auto Scaling Groups.`,
        });
      }

      if (typeof instanceCount === "number" && instanceCount < 1) {
        errors.push({
          service: "EC2",
          message: "Instance count must be at least 1.",
          type: "config",
        });
      }
    }

    if (services.includes("rds")) {
      const rdsConfig = config.rds?.config || {};
      const storage = rdsConfig.allocated_storage || 20;

      if (typeof storage === "number" && storage < 20) {
        errors.push({
          service: "RDS",
          message: "Minimum storage for RDS is 20 GB.",
          type: "config",
        });
      }

      if (rdsConfig.multi_az === true) {
        warnings.push({
          service: "RDS",
          message: "Multi-AZ deployment increases costs but provides high availability.",
        });
      }

      if (environment === "production" && !rdsConfig.multi_az) {
        warnings.push({
          service: "RDS",
          message: "Consider enabling Multi-AZ for production workloads.",
        });
      }
    }

    if (services.includes("alb") && !services.includes("ec2") && !services.includes("ecs")) {
      warnings.push({
        service: "ALB",
        message:
          "Application Load Balancer is configured without EC2 or ECS targets.",
      });
    }

    if (services.includes("vpc")) {
      const vpcConfig = config.vpc?.config || {};
      const cidr = vpcConfig.cidr_block || "10.0.0.0/16";

      if (typeof cidr === "string" && !this._validateCidr(cidr)) {
        errors.push({
          service: "VPC",
          message: `Invalid CIDR block: ${cidr}`,
          type: "config",
        });
      }

      const enableNat = vpcConfig.enable_nat === true;
      const privateSubnets = vpcConfig.private_subnets || "2";

      if (enableNat && String(privateSubnets) === "0") {
        warnings.push({
          service: "VPC",
          message: "NAT Gateway is enabled but no private subnets are configured.",
        });
      }
    }

    if (services.includes("route53")) {
      const route53Config = config.route53?.config || {};
      const createRecords = route53Config.create_records !== false;
      const hasAlb = services.includes("alb");
      const hasCloudFront = services.includes("cloudfront");

      if (createRecords && !hasAlb && !hasCloudFront) {
        warnings.push({
          service: "Route 53",
          message:
            "DNS records are enabled but no ALB or CloudFront service is selected for alias targets.",
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private _validateCidr(cidr: string): boolean {
    try {
      const parts = cidr.split("/");
      if (parts.length !== 2) {
        return false;
      }
      const prefix = parseInt(parts[1]);
      if (prefix < 16 || prefix > 28) {
        return false;
      }
      const octets = parts[0].split(".");
      if (octets.length !== 4) {
        return false;
      }
      for (const octet of octets) {
        const val = parseInt(octet);
        if (val < 0 || val > 255) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}
