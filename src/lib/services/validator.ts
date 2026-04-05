import { DependencyResolver } from './dependency';
import { ValidationResult, ValidationError, ValidationWarning } from '../generators/terraform';

export class InfraValidator {
  private resolver: DependencyResolver;

  constructor() {
    this.resolver = new DependencyResolver();
  }

  validate(services: string[], config: Record<string, any>): ValidationResult {
    console.log(`Validating services: ${services}`);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check dependencies
    for (const svc of services) {
      const deps = this.resolver.getDependencies(svc);
      for (const dep of deps) {
        if (!services.includes(dep)) {
          errors.push({
            service: svc,
            message: `Missing required dependency: ${dep}`,
            type: "dependency" as const,
          });
        }
      }
    }

    // Validate EC2 config
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
          type: "config" as const,
        });
      }
    }

    // Validate RDS config
    if (services.includes("rds")) {
      const rdsConfig = config.rds?.config || {};
      const storage = rdsConfig.allocated_storage || 20;
      
      if (typeof storage === "number" && storage < 20) {
        errors.push({
          service: "RDS",
          message: "Minimum storage for RDS is 20 GB.",
          type: "config" as const,
        });
      }
      
      const multiAz = rdsConfig.multi_az === true;
      if (multiAz) {
        warnings.push({
          service: "RDS",
          message: "Multi-AZ deployment increases costs but provides high availability.",
        });
      }
    }

    // Validate ALB config
    if (services.includes("alb")) {
      if (!services.includes("ec2")) {
        warnings.push({
          service: "ALB",
          message: "Application Load Balancer is configured without EC2 targets. Consider adding EC2 instances.",
        });
      }
    }

    // Validate VPC config
    if (services.includes("vpc")) {
      const vpcConfig = config.vpc?.config || {};
      const cidr = vpcConfig.cidr_block || "10.0.0.0/16";
      
      if (typeof cidr === "string" && !this._validateCidr(cidr)) {
        errors.push({
          service: "VPC",
          message: `Invalid CIDR block: ${cidr}`,
          type: "config" as const,
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

    // Production warnings
    for (const svcId of services) {
      const svcConfig = config[svcId]?.config || {};
      
      // Check if any service has production-inappropriate settings
      if (svcId === "rds" && !svcConfig.multi_az) {
        warnings.push({
          service: "RDS",
          message: "Consider enabling Multi-AZ for production workloads.",
        });
      }
    }

    const valid = errors.length === 0;
    return { valid, errors, warnings };
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
    } catch (error) {
      return false;
    }
  }
}
