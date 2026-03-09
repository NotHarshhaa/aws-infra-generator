import { AWSService } from "./types";

export const AWS_SERVICES: AWSService[] = [
  {
    id: "vpc",
    name: "VPC",
    description: "Virtual Private Cloud - Isolated network environment for your AWS resources",
    icon: "Network",
    category: "networking",
    dependencies: [],
    configFields: [
      {
        name: "cidr_block",
        label: "CIDR Block",
        type: "text",
        default: "10.0.0.0/16",
        required: true,
        description: "The IPv4 CIDR block for the VPC",
      },
      {
        name: "enable_dns",
        label: "Enable DNS Support",
        type: "boolean",
        default: true,
        description: "Enable DNS resolution in the VPC",
      },
      {
        name: "public_subnets",
        label: "Number of Public Subnets",
        type: "select",
        default: "2",
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
        ],
      },
      {
        name: "private_subnets",
        label: "Number of Private Subnets",
        type: "select",
        default: "2",
        options: [
          { label: "0", value: "0" },
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
        ],
      },
      {
        name: "enable_nat",
        label: "Enable NAT Gateway",
        type: "boolean",
        default: false,
        description: "Enable NAT gateway for private subnets",
      },
    ],
  },
  {
    id: "ec2",
    name: "EC2",
    description: "Elastic Compute Cloud - Scalable virtual servers in the cloud",
    icon: "Server",
    category: "compute",
    dependencies: ["vpc"],
    configFields: [
      {
        name: "instance_type",
        label: "Instance Type",
        type: "select",
        default: "t3.micro",
        options: [
          { label: "t3.micro", value: "t3.micro" },
          { label: "t3.small", value: "t3.small" },
          { label: "t3.medium", value: "t3.medium" },
          { label: "t3.large", value: "t3.large" },
          { label: "m5.large", value: "m5.large" },
          { label: "m5.xlarge", value: "m5.xlarge" },
          { label: "c5.large", value: "c5.large" },
          { label: "c5.xlarge", value: "c5.xlarge" },
        ],
        required: true,
      },
      {
        name: "instance_count",
        label: "Number of Instances",
        type: "number",
        default: 1,
        required: true,
        description: "Number of EC2 instances to launch",
      },
      {
        name: "ami_type",
        label: "AMI Type",
        type: "select",
        default: "amazon-linux-2023",
        options: [
          { label: "Amazon Linux 2023", value: "amazon-linux-2023" },
          { label: "Ubuntu 22.04", value: "ubuntu-22.04" },
          { label: "Ubuntu 24.04", value: "ubuntu-24.04" },
          { label: "Windows Server 2022", value: "windows-2022" },
        ],
      },
      {
        name: "root_volume_size",
        label: "Root Volume Size (GB)",
        type: "number",
        default: 20,
        description: "Size of the root EBS volume in GB",
      },
      {
        name: "enable_public_ip",
        label: "Assign Public IP",
        type: "boolean",
        default: true,
      },
    ],
  },
  {
    id: "s3",
    name: "S3",
    description: "Simple Storage Service - Scalable object storage for any data",
    icon: "HardDrive",
    category: "storage",
    dependencies: [],
    configFields: [
      {
        name: "bucket_name",
        label: "Bucket Name Suffix",
        type: "text",
        default: "data",
        required: true,
        description: "Suffix for the S3 bucket name",
      },
      {
        name: "versioning",
        label: "Enable Versioning",
        type: "boolean",
        default: true,
        description: "Enable versioning for the bucket",
      },
      {
        name: "encryption",
        label: "Encryption",
        type: "select",
        default: "AES256",
        options: [
          { label: "AES-256", value: "AES256" },
          { label: "AWS KMS", value: "aws:kms" },
          { label: "None", value: "none" },
        ],
      },
      {
        name: "block_public_access",
        label: "Block Public Access",
        type: "boolean",
        default: true,
        description: "Block all public access to the bucket",
      },
    ],
  },
  {
    id: "rds",
    name: "RDS",
    description: "Relational Database Service - Managed relational databases",
    icon: "Database",
    category: "database",
    dependencies: ["vpc"],
    configFields: [
      {
        name: "engine",
        label: "Database Engine",
        type: "select",
        default: "postgres",
        options: [
          { label: "PostgreSQL", value: "postgres" },
          { label: "MySQL", value: "mysql" },
          { label: "MariaDB", value: "mariadb" },
          { label: "SQL Server", value: "sqlserver" },
        ],
        required: true,
      },
      {
        name: "engine_version",
        label: "Engine Version",
        type: "select",
        default: "16",
        options: [
          { label: "PostgreSQL 16", value: "16" },
          { label: "PostgreSQL 15", value: "15" },
          { label: "MySQL 8.0", value: "8.0" },
          { label: "MariaDB 10.11", value: "10.11" },
        ],
      },
      {
        name: "instance_class",
        label: "Instance Class",
        type: "select",
        default: "db.t3.micro",
        options: [
          { label: "db.t3.micro", value: "db.t3.micro" },
          { label: "db.t3.small", value: "db.t3.small" },
          { label: "db.t3.medium", value: "db.t3.medium" },
          { label: "db.r5.large", value: "db.r5.large" },
          { label: "db.r5.xlarge", value: "db.r5.xlarge" },
        ],
        required: true,
      },
      {
        name: "allocated_storage",
        label: "Storage (GB)",
        type: "number",
        default: 20,
        required: true,
      },
      {
        name: "multi_az",
        label: "Multi-AZ Deployment",
        type: "boolean",
        default: false,
        description: "Enable Multi-AZ for high availability",
      },
      {
        name: "backup_retention",
        label: "Backup Retention (Days)",
        type: "number",
        default: 7,
      },
    ],
  },
  {
    id: "alb",
    name: "Application Load Balancer",
    description: "Distribute incoming traffic across multiple targets",
    icon: "GitFork",
    category: "networking",
    dependencies: ["vpc"],
    configFields: [
      {
        name: "internal",
        label: "Internal Load Balancer",
        type: "boolean",
        default: false,
        description: "Make load balancer internal (not internet-facing)",
      },
      {
        name: "health_check_path",
        label: "Health Check Path",
        type: "text",
        default: "/",
        description: "Path for target group health checks",
      },
      {
        name: "listener_port",
        label: "Listener Port",
        type: "select",
        default: "80",
        options: [
          { label: "80 (HTTP)", value: "80" },
          { label: "443 (HTTPS)", value: "443" },
        ],
      },
      {
        name: "target_port",
        label: "Target Port",
        type: "number",
        default: 80,
        description: "Port on which targets receive traffic",
      },
    ],
  },
  {
    id: "iam",
    name: "IAM",
    description: "Identity and Access Management - Manage access to AWS resources",
    icon: "Shield",
    category: "security",
    dependencies: [],
    configFields: [
      {
        name: "create_admin_role",
        label: "Create Admin Role",
        type: "boolean",
        default: false,
        description: "Create an IAM role with admin access",
      },
      {
        name: "create_ec2_role",
        label: "Create EC2 Instance Role",
        type: "boolean",
        default: true,
        description: "Create an IAM role for EC2 instances",
      },
      {
        name: "create_s3_policy",
        label: "Create S3 Access Policy",
        type: "boolean",
        default: false,
        description: "Create a policy for S3 bucket access",
      },
      {
        name: "create_rds_policy",
        label: "Create RDS Access Policy",
        type: "boolean",
        default: false,
        description: "Create a policy for RDS access",
      },
    ],
  },
];

export const AWS_REGIONS = [
  { label: "US East (N. Virginia)", value: "us-east-1" },
  { label: "US East (Ohio)", value: "us-east-2" },
  { label: "US West (N. California)", value: "us-west-1" },
  { label: "US West (Oregon)", value: "us-west-2" },
  { label: "EU (Ireland)", value: "eu-west-1" },
  { label: "EU (London)", value: "eu-west-2" },
  { label: "EU (Frankfurt)", value: "eu-central-1" },
  { label: "Asia Pacific (Mumbai)", value: "ap-south-1" },
  { label: "Asia Pacific (Singapore)", value: "ap-southeast-1" },
  { label: "Asia Pacific (Sydney)", value: "ap-southeast-2" },
  { label: "Asia Pacific (Tokyo)", value: "ap-northeast-1" },
  { label: "Canada (Central)", value: "ca-central-1" },
  { label: "South America (São Paulo)", value: "sa-east-1" },
];

export const SERVICE_CATEGORIES = [
  { id: "networking" as const, label: "Networking", icon: "Network" },
  { id: "compute" as const, label: "Compute", icon: "Server" },
  { id: "storage" as const, label: "Storage", icon: "HardDrive" },
  { id: "database" as const, label: "Database", icon: "Database" },
  { id: "security" as const, label: "Security", icon: "Shield" },
];

export function getServiceById(id: string): AWSService | undefined {
  return AWS_SERVICES.find((s) => s.id === id);
}

export function getServiceDependencies(serviceId: string): string[] {
  const service = getServiceById(serviceId);
  if (!service) return [];

  const allDeps: Set<string> = new Set();

  function resolveDeps(sid: string) {
    const s = getServiceById(sid);
    if (!s) return;
    for (const dep of s.dependencies) {
      if (!allDeps.has(dep)) {
        allDeps.add(dep);
        resolveDeps(dep);
      }
    }
  }

  resolveDeps(serviceId);
  return Array.from(allDeps);
}
