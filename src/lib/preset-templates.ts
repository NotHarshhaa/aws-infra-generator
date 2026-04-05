import { AWSService } from "./types";

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "web" | "api" | "database" | "ml" | "microservices" | "serverless";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedServices: number;
  estimatedCost: "Low" | "Medium" | "High";
  tags: string[];
  services: {
    serviceId: string;
    enabled: boolean;
    config: Record<string, any>;
  }[];
  globalConfig: {
    projectName: string;
    region: string;
    environment: string;
    outputFormat: "terraform" | "cloudformation";
  };
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "simple-web-app",
    name: "Simple Web Application",
    description: "A basic web application with load balancer and database",
    icon: "Globe",
    category: "web",
    difficulty: "Beginner",
    estimatedServices: 4,
    estimatedCost: "Low",
    tags: ["web", "database", "beginner"],
    services: [
      {
        serviceId: "vpc",
        enabled: true,
        config: {
          cidr_block: "10.0.0.0/16",
          enable_dns_hostnames: true,
          enable_dns_support: true,
        },
      },
      {
        serviceId: "ec2",
        enabled: true,
        config: {
          instance_type: "t3.micro",
          ami_id: "ami-0c02fb55956c7d316",
          key_pair_name: "",
          security_groups: ["web-sg"],
          user_data: "",
        },
      },
      {
        serviceId: "alb",
        enabled: true,
        config: {
          load_balancer_type: "application",
          scheme: "internet-facing",
          security_groups: ["alb-sg"],
          target_groups: ["web-target"],
        },
      },
      {
        serviceId: "rds",
        enabled: true,
        config: {
          engine: "mysql",
          instance_class: "db.t3.micro",
          allocated_storage: 20,
          username: "admin",
          password: "changeme123!",
          database_name: "webapp_db",
        },
      },
    ],
    globalConfig: {
      projectName: "simple-web-app",
      region: "us-east-1",
      environment: "development",
      outputFormat: "terraform",
    },
  },
  {
    id: "serverless-api",
    name: "Serverless API",
    description: "Fully serverless API with Lambda and API Gateway",
    icon: "Zap",
    category: "serverless",
    difficulty: "Intermediate",
    estimatedServices: 4,
    estimatedCost: "Low",
    tags: ["serverless", "api", "lambda"],
    services: [
      {
        serviceId: "iam",
        enabled: true,
        config: {
          role_name: "lambda-execution-role",
          policy_arns: ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"],
        },
      },
      {
        serviceId: "lambda",
        enabled: true,
        config: {
          function_name: "api-handler",
          runtime: "python3.11",
          handler: "index.lambda_handler",
          memory_size: "128",
          timeout: 30,
          enable_vpc: false,
          enable_monitoring: true,
          enable_tracing: false,
          environment_variables: "",
        },
      },
      {
        serviceId: "api-gateway",
        enabled: true,
        config: {
          api_name: "serverless-api",
          api_type: "REST",
          stage_name: "prod",
          enable_cors: true,
          enable_logging: true,
        },
      },
      {
        serviceId: "dynamodb",
        enabled: true,
        config: {
          table_name: "api-data",
          billing_mode: "PAY_PER_REQUEST",
          hash_key_name: "id",
          hash_key_type: "S",
          enable_streams: false,
          enable_ttl: false,
        },
      },
    ],
    globalConfig: {
      projectName: "serverless-api",
      region: "us-east-1",
      environment: "production",
      outputFormat: "terraform",
    },
  },
  {
    id: "microservices-app",
    name: "Microservices Application",
    description: "Containerized microservices with EKS and service discovery",
    icon: "Package",
    category: "microservices",
    difficulty: "Advanced",
    estimatedServices: 6,
    estimatedCost: "High",
    tags: ["kubernetes", "microservices", "containers"],
    services: [
      {
        serviceId: "vpc",
        enabled: true,
        config: {
          cidr_block: "10.0.0.0/16",
          enable_dns_hostnames: true,
          enable_dns_support: true,
        },
      },
      {
        serviceId: "eks",
        enabled: true,
        config: {
          cluster_name: "microservices-cluster",
          kubernetes_version: "1.28",
          node_group_name: "worker-nodes",
          instance_types: ["t3.medium"],
          desired_size: 3,
          min_size: 1,
          max_size: 6,
        },
      },
      {
        serviceId: "rds",
        enabled: true,
        config: {
          engine: "postgres",
          instance_class: "db.t3.medium",
          allocated_storage: 100,
          username: "postgres",
          password: "changeme123!",
          database_name: "microservices_db",
        },
      },
      {
        serviceId: "s3",
        enabled: true,
        config: {
          bucket_name: "microservices-storage",
          versioning: true,
          encryption: "AES256",
          public_read: false,
          lifecycle_rules: "",
        },
      },
      {
        serviceId: "alb",
        enabled: true,
        config: {
          load_balancer_type: "application",
          scheme: "internet-facing",
          security_groups: ["alb-sg"],
          target_groups: ["service-target"],
        },
      },
      {
        serviceId: "cloudwatch",
        enabled: true,
        config: {
          enable_log_group: true,
          log_retention_days: "7",
          enable_alarms: true,
          enable_dashboard: true,
          enable_metric_filters: false,
        },
      },
    ],
    globalConfig: {
      projectName: "microservices-app",
      region: "us-east-1",
      environment: "production",
      outputFormat: "terraform",
    },
  },
  {
    id: "data-analytics",
    name: "Data Analytics Pipeline",
    description: "Complete data pipeline with processing and storage",
    icon: "Database",
    category: "database",
    difficulty: "Advanced",
    estimatedServices: 5,
    estimatedCost: "High",
    tags: ["data", "analytics", "processing"],
    services: [
      {
        serviceId: "s3",
        enabled: true,
        config: {
          bucket_name: "data-lake-raw",
          versioning: true,
          encryption: "AES256",
          public_read: false,
          lifecycle_rules: "glacier-transition",
        },
      },
      {
        serviceId: "lambda",
        enabled: true,
        config: {
          function_name: "data-processor",
          runtime: "python3.11",
          handler: "processor.lambda_handler",
          memory_size: "512",
          timeout: 900,
          enable_vpc: true,
          enable_monitoring: true,
          enable_tracing: true,
          environment_variables: "BUCKET=data-lake-raw",
        },
      },
      {
        serviceId: "rds",
        enabled: true,
        config: {
          engine: "postgres",
          instance_class: "db.r5.large",
          allocated_storage: 500,
          username: "dataadmin",
          password: "changeme123!",
          database_name: "analytics_db",
        },
      },
      {
        serviceId: "elasticache",
        enabled: true,
        config: {
          engine: "redis",
          node_type: "cache.r5.large",
          num_cache_nodes: "3",
          automatic_failover: true,
          encrypted: true,
          enable_monitoring: true,
        },
      },
      {
        serviceId: "cloudwatch",
        enabled: true,
        config: {
          enable_log_group: true,
          log_retention_days: "30",
          enable_alarms: true,
          enable_dashboard: true,
          enable_metric_filters: true,
        },
      },
    ],
    globalConfig: {
      projectName: "data-analytics",
      region: "us-east-1",
      environment: "production",
      outputFormat: "terraform",
    },
  },
  {
    id: "ml-pipeline",
    name: "Machine Learning Pipeline",
    description: "End-to-end ML pipeline with training and inference",
    icon: "Zap",
    category: "ml",
    difficulty: "Advanced",
    estimatedServices: 4,
    estimatedCost: "High",
    tags: ["machine-learning", "ai", "pipeline"],
    services: [
      {
        serviceId: "s3",
        enabled: true,
        config: {
          bucket_name: "ml-data-storage",
          versioning: true,
          encryption: "AES256",
          public_read: false,
          lifecycle_rules: "intelligent-tiering",
        },
      },
      {
        serviceId: "lambda",
        enabled: true,
        config: {
          function_name: "ml-inference",
          runtime: "python3.11",
          handler: "inference.lambda_handler",
          memory_size: "1024",
          timeout: 300,
          enable_vpc: false,
          enable_monitoring: true,
          enable_tracing: true,
          environment_variables: "MODEL_PATH=s3://ml-models/",
        },
      },
      {
        serviceId: "api-gateway",
        enabled: true,
        config: {
          api_name: "ml-inference-api",
          api_type: "REST",
          stage_name: "prod",
          enable_cors: true,
          enable_logging: true,
        },
      },
      {
        serviceId: "iam",
        enabled: true,
        config: {
          role_name: "ml-execution-role",
          policy_arns: [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
          ],
        },
      },
    ],
    globalConfig: {
      projectName: "ml-pipeline",
      region: "us-east-1",
      environment: "production",
      outputFormat: "terraform",
    },
  },
  {
    id: "static-website",
    name: "Static Website Hosting",
    description: "Cost-effective static website with CDN",
    icon: "Globe",
    category: "web",
    difficulty: "Beginner",
    estimatedServices: 3,
    estimatedCost: "Low",
    tags: ["website", "static", "cdn"],
    services: [
      {
        serviceId: "s3",
        enabled: true,
        config: {
          bucket_name: "static-website-hosting",
          versioning: true,
          encryption: "AES256",
          public_read: true,
          lifecycle_rules: "",
        },
      },
      {
        serviceId: "cloudfront",
        enabled: true,
        config: {
          distribution_name: "website-cdn",
          origin_domain: "static-website-hosting.s3.amazonaws.com",
          price_class: "PriceClass_100",
          enable_logging: true,
          default_ttl: 86400,
        },
      },
      {
        serviceId: "route53",
        enabled: true,
        config: {
          domain_name: "example.com",
          record_type: "A",
          ttl: 300,
          geo_routing: false,
        },
      },
    ],
    globalConfig: {
      projectName: "static-website",
      region: "us-east-1",
      environment: "production",
      outputFormat: "terraform",
    },
  },
];

export const getTemplateById = (id: string): PresetTemplate | undefined => {
  return PRESET_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): PresetTemplate[] => {
  return PRESET_TEMPLATES.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: string): PresetTemplate[] => {
  return PRESET_TEMPLATES.filter(template => template.difficulty === difficulty);
};
