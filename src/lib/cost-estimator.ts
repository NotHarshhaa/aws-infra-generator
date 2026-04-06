import { ServiceConfig } from "./types";

export interface CostEstimate {
  service: string;
  serviceName: string;
  monthlyCost: number;
  breakdown: CostBreakdown[];
  notes: string[];
}

export interface CostBreakdown {
  item: string;
  cost: number;
  unit: string;
}

export interface TotalCostEstimate {
  monthly: number;
  yearly: number;
  services: CostEstimate[];
  currency: string;
  region: string;
  environment: string;
  disclaimer: string;
}

// AWS pricing data (approximate, based on us-east-1 region)
const AWS_PRICING = {
  ec2: {
    "t3.micro": 0.0104,
    "t3.small": 0.0208,
    "t3.medium": 0.0416,
    "t3.large": 0.0832,
    "t3.xlarge": 0.1664,
    "t2.micro": 0.0116,
    "t2.small": 0.023,
    "t2.medium": 0.0464,
    "m5.large": 0.096,
    "m5.xlarge": 0.192,
    "c5.large": 0.085,
    "c5.xlarge": 0.17,
  },
  rds: {
    "db.t3.micro": 0.017,
    "db.t3.small": 0.034,
    "db.t3.medium": 0.068,
    "db.t3.large": 0.136,
    "db.r5.large": 0.24,
    "db.r5.xlarge": 0.48,
    storage: 0.115, // per GB/month
  },
  s3: {
    storage: 0.023, // per GB/month (Standard)
    requests: 0.0004, // per 1000 PUT requests
  },
  lambda: {
    requests: 0.20, // per 1M requests
    compute: 0.0000166667, // per GB-second
  },
  alb: {
    hourly: 0.0225,
    lcu: 0.008, // per LCU-hour
  },
  dynamodb: {
    storage: 0.25, // per GB/month
    writeUnit: 0.00065, // per WCU-hour
    readUnit: 0.00013, // per RCU-hour
  },
  elasticache: {
    "cache.t3.micro": 0.017,
    "cache.t3.small": 0.034,
    "cache.t3.medium": 0.068,
    "cache.r5.large": 0.188,
    "cache.r5.xlarge": 0.376,
  },
  vpc: {
    natGateway: 0.045, // per hour
    natGatewayData: 0.045, // per GB processed
  },
  cloudfront: {
    dataTransfer: 0.085, // per GB (first 10TB)
    requests: 0.0075, // per 10,000 HTTPS requests
  },
  route53: {
    hostedZone: 0.50, // per hosted zone per month
    queries: 0.40, // per million queries
  },
  apiGateway: {
    requests: 3.50, // per million requests
  },
  cloudwatch: {
    metrics: 0.30, // per custom metric per month
    logs: 0.50, // per GB ingested
    alarms: 0.10, // per alarm per month
  },
  efs: {
    storage: 0.30, // per GB/month (Standard)
  },
  eks: {
    cluster: 0.10, // per hour ($73/month)
    nodeHour: 0.0, // EC2 pricing applies
  },
  ecs: {
    fargate: {
      vcpu: 0.04048, // per vCPU per hour
      memory: 0.004445, // per GB per hour
    },
  },
  sqs: {
    requests: 0.40, // per million requests (after free tier)
  },
  sns: {
    requests: 0.50, // per million requests
  },
};

export function estimateInfrastructureCost(
  selectedServices: string[],
  serviceConfig: ServiceConfig,
  region: string,
  environment: string
): TotalCostEstimate {
  const estimates: CostEstimate[] = [];

  selectedServices.forEach((serviceId) => {
    const config = serviceConfig[serviceId]?.config || {};
    const estimate = estimateServiceCost(serviceId, config, environment);
    if (estimate) {
      estimates.push(estimate);
    }
  });

  const totalMonthly = estimates.reduce((sum, est) => sum + est.monthlyCost, 0);

  return {
    monthly: Math.round(totalMonthly * 100) / 100,
    yearly: Math.round(totalMonthly * 12 * 100) / 100,
    services: estimates,
    currency: "USD",
    region,
    environment,
    disclaimer:
      "Estimates are approximate and based on us-east-1 pricing. Actual costs may vary based on usage patterns, data transfer, and regional pricing differences. Does not include free tier benefits.",
  };
}

function estimateServiceCost(
  serviceId: string,
  config: any,
  environment: string
): CostEstimate | null {
  const hoursPerMonth = 730;

  switch (serviceId) {
    case "ec2": {
      const instanceType = config.instance_type || "t3.micro";
      const count = parseInt(config.instance_count) || 1;
      const volumeSize = parseInt(config.root_volume_size) || 20;
      
      const instanceCost = (AWS_PRICING.ec2[instanceType as keyof typeof AWS_PRICING.ec2] || 0.0104) * hoursPerMonth * count;
      const storageCost = volumeSize * 0.10 * count; // EBS GP3 pricing
      const monthlyCost = instanceCost + storageCost;

      return {
        service: serviceId,
        serviceName: "EC2",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: `${count}x ${instanceType} instance(s)`, cost: Math.round(instanceCost * 100) / 100, unit: "month" },
          { item: `${volumeSize * count} GB EBS storage`, cost: Math.round(storageCost * 100) / 100, unit: "month" },
        ],
        notes: ["Includes 24/7 runtime", "EBS GP3 storage pricing"],
      };
    }

    case "rds": {
      const instanceClass = config.instance_class || "db.t3.micro";
      const storage = parseInt(config.allocated_storage) || 20;
      const multiAz = config.multi_az === true;
      const backupRetention = parseInt(config.backup_retention) || 7;
      
      const instanceCost = (AWS_PRICING.rds[instanceClass as keyof typeof AWS_PRICING.rds] || 0.017) * hoursPerMonth * (multiAz ? 2 : 1);
      const storageCost = storage * AWS_PRICING.rds.storage;
      const backupCost = storage * backupRetention * 0.095; // Backup storage
      const monthlyCost = instanceCost + storageCost + backupCost;

      return {
        service: serviceId,
        serviceName: "RDS",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: `${instanceClass} ${multiAz ? "(Multi-AZ)" : ""}`, cost: Math.round(instanceCost * 100) / 100, unit: "month" },
          { item: `${storage} GB storage`, cost: Math.round(storageCost * 100) / 100, unit: "month" },
          { item: `Backup storage`, cost: Math.round(backupCost * 100) / 100, unit: "month" },
        ],
        notes: multiAz ? ["Multi-AZ deployment doubles instance cost"] : ["Single-AZ deployment"],
      };
    }

    case "s3": {
      const estimatedStorage = environment === "production" ? 100 : 50; // GB
      const estimatedRequests = environment === "production" ? 1000000 : 100000;
      
      const storageCost = estimatedStorage * AWS_PRICING.s3.storage;
      const requestCost = (estimatedRequests / 1000) * AWS_PRICING.s3.requests;
      const monthlyCost = storageCost + requestCost;

      return {
        service: serviceId,
        serviceName: "S3",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: `~${estimatedStorage} GB storage`, cost: Math.round(storageCost * 100) / 100, unit: "month" },
          { item: `~${(estimatedRequests / 1000000).toFixed(1)}M requests`, cost: Math.round(requestCost * 100) / 100, unit: "month" },
        ],
        notes: ["Estimated usage based on environment", "Standard storage class"],
      };
    }

    case "lambda": {
      const memorySize = parseInt(config.memory_size) || 128;
      const estimatedInvocations = environment === "production" ? 5000000 : 1000000;
      const avgDuration = parseInt(config.timeout) || 30; // seconds
      
      const requestCost = (estimatedInvocations / 1000000) * AWS_PRICING.lambda.requests;
      const computeCost = (estimatedInvocations * (avgDuration / 1000) * (memorySize / 1024)) * AWS_PRICING.lambda.compute;
      const monthlyCost = requestCost + computeCost;

      return {
        service: serviceId,
        serviceName: "Lambda",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: `~${(estimatedInvocations / 1000000).toFixed(1)}M invocations`, cost: Math.round(requestCost * 100) / 100, unit: "month" },
          { item: `Compute (${memorySize}MB)`, cost: Math.round(computeCost * 100) / 100, unit: "month" },
        ],
        notes: ["Estimated usage based on environment", "Includes free tier benefits"],
      };
    }

    case "alb": {
      const estimatedLCU = environment === "production" ? 5 : 2;
      
      const hourlyFee = AWS_PRICING.alb.hourly * hoursPerMonth;
      const lcuCost = estimatedLCU * AWS_PRICING.alb.lcu * hoursPerMonth;
      const monthlyCost = hourlyFee + lcuCost;

      return {
        service: serviceId,
        serviceName: "Application Load Balancer",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: "ALB hourly fee", cost: Math.round(hourlyFee * 100) / 100, unit: "month" },
          { item: `~${estimatedLCU} LCU`, cost: Math.round(lcuCost * 100) / 100, unit: "month" },
        ],
        notes: ["LCU based on connections, requests, and bandwidth"],
      };
    }

    case "dynamodb": {
      const billingMode = config.billing_mode || "PAY_PER_REQUEST";
      
      if (billingMode === "PAY_PER_REQUEST") {
        const estimatedStorage = environment === "production" ? 25 : 10; // GB
        const storageCost = estimatedStorage * AWS_PRICING.dynamodb.storage;

        return {
          service: serviceId,
          serviceName: "DynamoDB",
          monthlyCost: Math.round(storageCost * 100) / 100,
          breakdown: [
            { item: `~${estimatedStorage} GB storage`, cost: Math.round(storageCost * 100) / 100, unit: "month" },
            { item: "On-demand requests", cost: 0, unit: "variable" },
          ],
          notes: ["Pay-per-request pricing", "Request costs vary by usage"],
        };
      } else {
        const readCapacity = parseInt(config.read_capacity) || 5;
        const writeCapacity = parseInt(config.write_capacity) || 5;
        const estimatedStorage = environment === "production" ? 25 : 10;
        
        const readCost = readCapacity * AWS_PRICING.dynamodb.readUnit * hoursPerMonth;
        const writeCost = writeCapacity * AWS_PRICING.dynamodb.writeUnit * hoursPerMonth;
        const storageCost = estimatedStorage * AWS_PRICING.dynamodb.storage;
        const monthlyCost = readCost + writeCost + storageCost;

        return {
          service: serviceId,
          serviceName: "DynamoDB",
          monthlyCost: Math.round(monthlyCost * 100) / 100,
          breakdown: [
            { item: `${readCapacity} RCU`, cost: Math.round(readCost * 100) / 100, unit: "month" },
            { item: `${writeCapacity} WCU`, cost: Math.round(writeCost * 100) / 100, unit: "month" },
            { item: `~${estimatedStorage} GB storage`, cost: Math.round(storageCost * 100) / 100, unit: "month" },
          ],
          notes: ["Provisioned capacity mode"],
        };
      }
    }

    case "elasticache": {
      const nodeType = config.node_type || "cache.t3.micro";
      const numNodes = parseInt(config.num_cache_nodes) || 1;
      
      const nodeCost = (AWS_PRICING.elasticache[nodeType as keyof typeof AWS_PRICING.elasticache] || 0.017) * hoursPerMonth * numNodes;

      return {
        service: serviceId,
        serviceName: "ElastiCache",
        monthlyCost: Math.round(nodeCost * 100) / 100,
        breakdown: [
          { item: `${numNodes}x ${nodeType}`, cost: Math.round(nodeCost * 100) / 100, unit: "month" },
        ],
        notes: ["Includes 24/7 runtime"],
      };
    }

    case "vpc": {
      const enableNat = config.enable_nat === true;
      const numNatGateways = enableNat ? 2 : 0;
      const estimatedDataGB = environment === "production" ? 100 : 50;
      
      const natCost = numNatGateways * AWS_PRICING.vpc.natGateway * hoursPerMonth;
      const dataCost = estimatedDataGB * AWS_PRICING.vpc.natGatewayData * numNatGateways;
      const monthlyCost = natCost + dataCost;

      if (monthlyCost === 0) {
        return {
          service: serviceId,
          serviceName: "VPC",
          monthlyCost: 0,
          breakdown: [{ item: "VPC (no NAT Gateway)", cost: 0, unit: "free" }],
          notes: ["VPC itself is free", "NAT Gateway not enabled"],
        };
      }

      return {
        service: serviceId,
        serviceName: "VPC",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: `${numNatGateways}x NAT Gateway`, cost: Math.round(natCost * 100) / 100, unit: "month" },
          { item: `~${estimatedDataGB} GB data processed`, cost: Math.round(dataCost * 100) / 100, unit: "month" },
        ],
        notes: ["NAT Gateway enabled for private subnets"],
      };
    }

    case "cloudfront": {
      const estimatedDataGB = environment === "production" ? 500 : 100;
      const estimatedRequests = environment === "production" ? 10000000 : 1000000;
      
      const dataCost = estimatedDataGB * AWS_PRICING.cloudfront.dataTransfer;
      const requestCost = (estimatedRequests / 10000) * AWS_PRICING.cloudfront.requests;
      const monthlyCost = dataCost + requestCost;

      return {
        service: serviceId,
        serviceName: "CloudFront",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: `~${estimatedDataGB} GB data transfer`, cost: Math.round(dataCost * 100) / 100, unit: "month" },
          { item: `~${(estimatedRequests / 1000000).toFixed(1)}M requests`, cost: Math.round(requestCost * 100) / 100, unit: "month" },
        ],
        notes: ["Estimated usage based on environment"],
      };
    }

    case "route53": {
      const hostedZoneCost = AWS_PRICING.route53.hostedZone;
      const estimatedQueries = environment === "production" ? 5000000 : 1000000;
      const queryCost = (estimatedQueries / 1000000) * AWS_PRICING.route53.queries;
      const monthlyCost = hostedZoneCost + queryCost;

      return {
        service: serviceId,
        serviceName: "Route 53",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: "Hosted zone", cost: hostedZoneCost, unit: "month" },
          { item: `~${(estimatedQueries / 1000000).toFixed(1)}M queries`, cost: Math.round(queryCost * 100) / 100, unit: "month" },
        ],
        notes: ["First 25 hosted zones included"],
      };
    }

    case "api-gateway": {
      const estimatedRequests = environment === "production" ? 10000000 : 1000000;
      const requestCost = (estimatedRequests / 1000000) * AWS_PRICING.apiGateway.requests;

      return {
        service: serviceId,
        serviceName: "API Gateway",
        monthlyCost: Math.round(requestCost * 100) / 100,
        breakdown: [
          { item: `~${(estimatedRequests / 1000000).toFixed(1)}M requests`, cost: Math.round(requestCost * 100) / 100, unit: "month" },
        ],
        notes: ["REST API pricing", "Includes free tier benefits"],
      };
    }

    case "cloudwatch": {
      const enableAlarms = config.enable_alarms === true;
      const enableDashboard = config.enable_dashboard === true;
      const estimatedMetrics = 10;
      const estimatedLogGB = environment === "production" ? 50 : 10;
      const numAlarms = enableAlarms ? 5 : 0;
      
      const metricCost = estimatedMetrics * AWS_PRICING.cloudwatch.metrics;
      const logCost = estimatedLogGB * AWS_PRICING.cloudwatch.logs;
      const alarmCost = numAlarms * AWS_PRICING.cloudwatch.alarms;
      const monthlyCost = metricCost + logCost + alarmCost;

      return {
        service: serviceId,
        serviceName: "CloudWatch",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: `~${estimatedMetrics} custom metrics`, cost: Math.round(metricCost * 100) / 100, unit: "month" },
          { item: `~${estimatedLogGB} GB logs`, cost: Math.round(logCost * 100) / 100, unit: "month" },
          { item: `${numAlarms} alarms`, cost: Math.round(alarmCost * 100) / 100, unit: "month" },
        ],
        notes: ["Estimated usage based on configuration"],
      };
    }

    case "efs": {
      const estimatedStorage = environment === "production" ? 100 : 50;
      const storageCost = estimatedStorage * AWS_PRICING.efs.storage;

      return {
        service: serviceId,
        serviceName: "EFS",
        monthlyCost: Math.round(storageCost * 100) / 100,
        breakdown: [
          { item: `~${estimatedStorage} GB storage`, cost: Math.round(storageCost * 100) / 100, unit: "month" },
        ],
        notes: ["Standard storage class", "Estimated usage"],
      };
    }

    case "eks": {
      const clusterCost = AWS_PRICING.eks.cluster * hoursPerMonth;
      const desiredSize = parseInt(config.desired_size) || 2;
      const instanceTypes = config.instance_types || ["t3.medium"];
      const instanceType = Array.isArray(instanceTypes) ? instanceTypes[0] : instanceTypes;
      const nodeCost = (AWS_PRICING.ec2[instanceType as keyof typeof AWS_PRICING.ec2] || 0.0416) * hoursPerMonth * desiredSize;
      const monthlyCost = clusterCost + nodeCost;

      return {
        service: serviceId,
        serviceName: "EKS",
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        breakdown: [
          { item: "EKS cluster", cost: Math.round(clusterCost * 100) / 100, unit: "month" },
          { item: `${desiredSize}x ${instanceType} nodes`, cost: Math.round(nodeCost * 100) / 100, unit: "month" },
        ],
        notes: ["Includes control plane and worker nodes"],
      };
    }

    case "ecs": {
      const launchType = config.launch_type || "FARGATE";
      
      if (launchType === "FARGATE") {
        const vcpu = parseFloat(config.vcpu) || 0.25;
        const memory = parseFloat(config.memory) || 0.5;
        const taskCount = parseInt(config.task_count) || 2;
        
        const vcpuCost = vcpu * AWS_PRICING.ecs.fargate.vcpu * hoursPerMonth * taskCount;
        const memoryCost = memory * AWS_PRICING.ecs.fargate.memory * hoursPerMonth * taskCount;
        const monthlyCost = vcpuCost + memoryCost;

        return {
          service: serviceId,
          serviceName: "ECS Fargate",
          monthlyCost: Math.round(monthlyCost * 100) / 100,
          breakdown: [
            { item: `${taskCount}x tasks (${vcpu} vCPU)`, cost: Math.round(vcpuCost * 100) / 100, unit: "month" },
            { item: `${taskCount}x tasks (${memory} GB memory)`, cost: Math.round(memoryCost * 100) / 100, unit: "month" },
          ],
          notes: ["Fargate pricing", "24/7 runtime"],
        };
      }

      return {
        service: serviceId,
        serviceName: "ECS",
        monthlyCost: 0,
        breakdown: [{ item: "ECS cluster (EC2 launch type)", cost: 0, unit: "free" }],
        notes: ["EC2 instances billed separately"],
      };
    }

    case "sqs": {
      const estimatedRequests = environment === "production" ? 5000000 : 1000000;
      const requestCost = Math.max(0, (estimatedRequests - 1000000) / 1000000) * AWS_PRICING.sqs.requests;

      return {
        service: serviceId,
        serviceName: "SQS",
        monthlyCost: Math.round(requestCost * 100) / 100,
        breakdown: [
          { item: `~${(estimatedRequests / 1000000).toFixed(1)}M requests`, cost: Math.round(requestCost * 100) / 100, unit: "month" },
        ],
        notes: ["First 1M requests free", "Estimated usage"],
      };
    }

    case "sns": {
      const estimatedRequests = environment === "production" ? 2000000 : 500000;
      const requestCost = Math.max(0, (estimatedRequests - 1000000) / 1000000) * AWS_PRICING.sns.requests;

      return {
        service: serviceId,
        serviceName: "SNS",
        monthlyCost: Math.round(requestCost * 100) / 100,
        breakdown: [
          { item: `~${(estimatedRequests / 1000000).toFixed(1)}M requests`, cost: Math.round(requestCost * 100) / 100, unit: "month" },
        ],
        notes: ["First 1M requests free", "Estimated usage"],
      };
    }

    case "iam": {
      return {
        service: serviceId,
        serviceName: "IAM",
        monthlyCost: 0,
        breakdown: [{ item: "IAM roles and policies", cost: 0, unit: "free" }],
        notes: ["IAM is free to use"],
      };
    }

    default:
      return null;
  }
}
