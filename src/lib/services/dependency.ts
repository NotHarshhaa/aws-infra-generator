const DEPENDENCY_MAP: Record<string, string[]> = {
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
};

export class DependencyResolver {
  private dependencyMap: Record<string, string[]>;

  constructor() {
    this.dependencyMap = DEPENDENCY_MAP;
  }

  resolve(services: string[]): string[] {
    const resolved = new Set<string>();

    const _resolve = (serviceId: string) => {
      if (resolved.has(serviceId)) {
        return;
      }
      const deps = this.dependencyMap[serviceId] || [];
      for (const dep of deps) {
        _resolve(dep);
      }
      resolved.add(serviceId);
    };

    for (const svc of services) {
      _resolve(svc);
    }

    // Return in dependency order: dependencies first
    const order = [
      "vpc", "iam", "s3", "ec2", "rds", "alb", "lambda", "api-gateway", 
      "cloudfront", "ecs", "eks", "dynamodb", "elasticache", "sqs", "sns", "cloudwatch"
    ];
    const ordered = order.filter(s => resolved.has(s));
    
    // Add any remaining that aren't in our predefined order
    for (const s of resolved) {
      if (!ordered.includes(s)) {
        ordered.push(s);
      }
    }

    return ordered;
  }

  getDependencies(serviceId: string): string[] {
    const deps = new Set<string>();

    const _collect = (sid: string) => {
      const dependencies = this.dependencyMap[sid] || [];
      for (const dep of dependencies) {
        if (!deps.has(dep)) {
          deps.add(dep);
          _collect(dep);
        }
      }
    };

    _collect(serviceId);
    return Array.from(deps);
  }
}
