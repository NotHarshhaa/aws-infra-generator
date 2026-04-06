import { AWSService, Environment } from "./types";

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
    environment: Environment;
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
          enable_dns: true,
          public_subnets: "2",
          private_subnets: "2",
          enable_nat: false,
        },
      },
      {
        serviceId: "ec2",
        enabled: true,
        config: {
          instance_type: "t3.micro",
          ami_type: "amazon-linux-2023",
          instance_count: 1,
          root_volume_size: 20,
          enable_public_ip: true,
        },
      },
      {
        serviceId: "alb",
        enabled: true,
        config: {
          internal: false,
          health_check_path: "/",
          listener_port: "80",
          target_port: 80,
        },
      },
      {
        serviceId: "rds",
        enabled: true,
        config: {
          engine: "mysql",
          engine_version: "8.0",
          instance_class: "db.t3.micro",
          allocated_storage: 20,
          multi_az: false,
          backup_retention: 7,
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
          create_admin_role: false,
          create_ec2_role: true,
          create_s3_policy: false,
          create_rds_policy: false,
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
          api_type: "rest",
          stage_name: "prod",
          enable_cors: true,
          enable_logging: true,
          enable_throttling: false,
        },
      },
      {
        serviceId: "dynamodb",
        enabled: true,
        config: {
          table_name: "api-data",
          billing_mode: "PAY_PER_REQUEST",
          read_capacity: 5,
          write_capacity: 5,
          enable_streams: false,
          enable_encryption: true,
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
          enable_dns: true,
          public_subnets: "2",
          private_subnets: "2",
          enable_nat: false,
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
          engine_version: "16",
          instance_class: "db.t3.medium",
          allocated_storage: 100,
          multi_az: false,
          backup_retention: 7,
        },
      },
      {
        serviceId: "s3",
        enabled: true,
        config: {
          bucket_name: "microservices-storage",
          versioning: true,
          encryption: "AES256",
          block_public_access: true,
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
          block_public_access: true,
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
          engine_version: "16",
          instance_class: "db.r5.large",
          allocated_storage: 500,
          multi_az: true,
          backup_retention: 30,
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
          block_public_access: true,
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
          api_type: "rest",
          stage_name: "prod",
          enable_cors: true,
          enable_logging: true,
          enable_throttling: false,
        },
      },
      {
        serviceId: "iam",
        enabled: true,
        config: {
          create_admin_role: false,
          create_ec2_role: true,
          create_s3_policy: true,
          create_rds_policy: false,
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
          block_public_access: false,
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
  {
    id: "simple-web-app-cf",
    name: "Simple Web App (CloudFormation)",
    description: "A basic web application with load balancer and database using CloudFormation",
    icon: "Globe",
    category: "web",
    difficulty: "Beginner",
    estimatedServices: 4,
    estimatedCost: "Low",
    tags: ["web", "database", "cloudformation", "beginner"],
    services: [
      {
        serviceId: "vpc",
        enabled: true,
        config: {
          cidr_block: "10.0.0.0/16",
          enable_dns: true,
          public_subnets: "2",
          private_subnets: "2",
          enable_nat: false,
        },
      },
      {
        serviceId: "ec2",
        enabled: true,
        config: {
          instance_type: "t3.micro",
          ami_type: "amazon-linux-2023",
          instance_count: 1,
          root_volume_size: 20,
          enable_public_ip: true,
        },
      },
      {
        serviceId: "alb",
        enabled: true,
        config: {
          internal: false,
          health_check_path: "/",
          listener_port: "80",
          target_port: 80,
        },
      },
      {
        serviceId: "rds",
        enabled: true,
        config: {
          engine: "mysql",
          engine_version: "8.0",
          instance_class: "db.t3.micro",
          allocated_storage: 20,
          multi_az: false,
          backup_retention: 7,
        },
      },
    ],
    globalConfig: {
      projectName: "simple-web-app-cf",
      region: "us-east-1",
      environment: "development",
      outputFormat: "cloudformation",
    },
  },
  {
    id: "serverless-api-cf",
    name: "Serverless API (CloudFormation)",
    description: "Fully serverless API with Lambda and API Gateway using CloudFormation",
    icon: "Zap",
    category: "serverless",
    difficulty: "Intermediate",
    estimatedServices: 4,
    estimatedCost: "Low",
    tags: ["serverless", "api", "lambda", "cloudformation"],
    services: [
      {
        serviceId: "iam",
        enabled: true,
        config: {
          create_admin_role: false,
          create_ec2_role: true,
          create_s3_policy: false,
          create_rds_policy: false,
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
          api_type: "rest",
          stage_name: "prod",
          enable_cors: true,
          enable_logging: true,
          enable_throttling: false,
        },
      },
      {
        serviceId: "dynamodb",
        enabled: true,
        config: {
          table_name: "api-data",
          billing_mode: "PAY_PER_REQUEST",
          read_capacity: 5,
          write_capacity: 5,
          enable_streams: false,
          enable_encryption: true,
        },
      },
    ],
    globalConfig: {
      projectName: "serverless-api-cf",
      region: "us-east-1",
      environment: "production",
      outputFormat: "cloudformation",
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
