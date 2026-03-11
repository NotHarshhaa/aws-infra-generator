"""Service dependency resolver for AWS infrastructure."""

DEPENDENCY_MAP = {
    "vpc": [],
    "ec2": ["vpc"],
    "s3": [],
    "rds": ["vpc"],
    "alb": ["vpc"],
    "iam": [],
    "lambda": ["iam"],
    "api-gateway": ["iam"],
    "cloudfront": ["s3"],
    "ecs": ["vpc", "iam"],
    "eks": ["vpc", "iam"],
    "dynamodb": ["iam"],
    "elasticache": ["vpc"],
    "sqs": ["iam"],
    "sns": ["iam"],
    "cloudwatch": ["iam"],
}


class DependencyResolver:
    def __init__(self):
        self.dependency_map = DEPENDENCY_MAP

    def resolve(self, services: list[str]) -> list[str]:
        """Resolve all dependencies for the given services and return ordered list."""
        resolved = set()

        def _resolve(service_id: str):
            if service_id in resolved:
                return
            deps = self.dependency_map.get(service_id, [])
            for dep in deps:
                _resolve(dep)
            resolved.add(service_id)

        for svc in services:
            _resolve(svc)

        # Return in dependency order: dependencies first
        order = ["vpc", "iam", "s3", "ec2", "rds", "alb", "lambda", "api-gateway", "cloudfront", "ecs", "eks", "dynamodb", "elasticache", "sqs", "sns", "cloudwatch"]
        ordered = [s for s in order if s in resolved]
        # Add any remaining that aren't in our predefined order
        for s in resolved:
            if s not in ordered:
                ordered.append(s)

        return ordered

    def get_dependencies(self, service_id: str) -> list[str]:
        """Get all transitive dependencies for a service."""
        deps = set()

        def _collect(sid: str):
            for dep in self.dependency_map.get(sid, []):
                if dep not in deps:
                    deps.add(dep)
                    _collect(dep)

        _collect(service_id)
        return list(deps)
