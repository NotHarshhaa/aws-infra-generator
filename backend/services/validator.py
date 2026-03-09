"""Infrastructure validation engine."""

from services.dependency import DependencyResolver


class InfraValidator:
    def __init__(self):
        self.resolver = DependencyResolver()

    def validate(self, services: list[str], config: dict) -> dict:
        """Validate infrastructure configuration."""
        errors = []
        warnings = []

        # Check dependencies
        for svc in services:
            deps = self.resolver.get_dependencies(svc)
            for dep in deps:
                if dep not in services:
                    errors.append({
                        "service": svc,
                        "message": f"Missing required dependency: {dep}",
                        "type": "dependency",
                    })

        # Validate EC2 config
        if "ec2" in services:
            ec2_config = config.get("ec2", {}).get("config", {})
            instance_count = ec2_config.get("instance_count", 1)
            if isinstance(instance_count, int) and instance_count > 20:
                warnings.append({
                    "service": "EC2",
                    "message": f"High instance count ({instance_count}). Consider using Auto Scaling Groups.",
                })
            if isinstance(instance_count, int) and instance_count < 1:
                errors.append({
                    "service": "EC2",
                    "message": "Instance count must be at least 1.",
                    "type": "config",
                })

        # Validate RDS config
        if "rds" in services:
            rds_config = config.get("rds", {}).get("config", {})
            storage = rds_config.get("allocated_storage", 20)
            if isinstance(storage, int) and storage < 20:
                errors.append({
                    "service": "RDS",
                    "message": "Minimum storage for RDS is 20 GB.",
                    "type": "config",
                })
            multi_az = rds_config.get("multi_az", False)
            if multi_az:
                warnings.append({
                    "service": "RDS",
                    "message": "Multi-AZ deployment increases costs but provides high availability.",
                })

        # Validate ALB config
        if "alb" in services:
            if "ec2" not in services:
                warnings.append({
                    "service": "ALB",
                    "message": "Application Load Balancer is configured without EC2 targets. Consider adding EC2 instances.",
                })

        # Validate VPC config
        if "vpc" in services:
            vpc_config = config.get("vpc", {}).get("config", {})
            cidr = vpc_config.get("cidr_block", "10.0.0.0/16")
            if isinstance(cidr, str) and not self._validate_cidr(cidr):
                errors.append({
                    "service": "VPC",
                    "message": f"Invalid CIDR block: {cidr}",
                    "type": "config",
                })

            enable_nat = vpc_config.get("enable_nat", False)
            private_subnets = vpc_config.get("private_subnets", "2")
            if enable_nat and str(private_subnets) == "0":
                warnings.append({
                    "service": "VPC",
                    "message": "NAT Gateway is enabled but no private subnets are configured.",
                })

        # Production warnings
        for svc_id in services:
            svc_config = config.get(svc_id, {}).get("config", {})
            # Check if any service has production-inappropriate settings
            if svc_id == "rds" and not svc_config.get("multi_az", False):
                warnings.append({
                    "service": "RDS",
                    "message": "Consider enabling Multi-AZ for production workloads.",
                })

        valid = len(errors) == 0
        return {"valid": valid, "errors": errors, "warnings": warnings}

    def _validate_cidr(self, cidr: str) -> bool:
        """Basic CIDR validation."""
        try:
            parts = cidr.split("/")
            if len(parts) != 2:
                return False
            prefix = int(parts[1])
            if prefix < 16 or prefix > 28:
                return False
            octets = parts[0].split(".")
            if len(octets) != 4:
                return False
            for octet in octets:
                val = int(octet)
                if val < 0 or val > 255:
                    return False
            return True
        except (ValueError, IndexError):
            return False
