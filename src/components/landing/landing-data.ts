import {
  Cloud,
  Zap,
  ShieldCheck,
  Package,
  Server,
  Database,
  Network,
  HardDrive,
  GitFork,
  Globe,
  MessageSquare,
  Bell,
  Activity,
  Workflow,
  Lock,
  Key,
  FileCheck,
  Users,
  Hammer,
  GitBranch,
  Rocket,
  Layers,
  Code,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  features: string[];
}

export interface UseCaseItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface BenefitItem {
  title: string;
  desc: string;
}

export const HERO_STATS = [
  { value: "32+", label: "AWS Services" },
  { value: "2", label: "IaC Formats" },
  { value: "4", label: "Wizard Steps" },
  { value: "100%", label: "Open Source" },
] as const;

export interface ServiceOverviewItem {
  icon: LucideIcon;
  name: string;
  category: string;
}

export interface ServiceDetailItem {
  icon: LucideIcon;
  name: string;
  desc: string;
  features: string[];
}

export const LANDING_FEATURES: FeatureItem[] = [
  {
    icon: Cloud,
    title: "Service Selection",
    desc: "Choose from VPC, EC2, S3, RDS, ALB, IAM and more AWS services",
  },
  {
    icon: Zap,
    title: "Auto Dependencies",
    desc: "Service dependencies are automatically resolved and included",
  },
  {
    icon: ShieldCheck,
    title: "Validation",
    desc: "Infrastructure is validated for conflicts and missing resources",
  },
  {
    icon: Package,
    title: "Export & Deploy",
    desc: "Download Terraform or CloudFormation templates as a ZIP archive",
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: "1",
    title: "Select Services",
    desc: "Choose the AWS services you need from our comprehensive catalog. Dependencies are automatically resolved and included.",
    icon: Server,
    features: ["32+ AWS Services", "Visual Selection", "Auto Dependencies"],
  },
  {
    step: "2",
    title: "Configure & Generate",
    desc: "Set regions, instance types, and other parameters with our intuitive interface. Generate clean, production-ready IaC templates.",
    icon: Code,
    features: ["Best Practices", "Security Configs", "Multiple Formats"],
  },
  {
    step: "3",
    title: "Export & Deploy",
    desc: "Download as ZIP, copy files, and deploy with terraform apply or CloudFormation. Get your infrastructure running in minutes.",
    icon: Package,
    features: ["Terraform & CloudFormation", "Ready to Deploy", "Documentation"],
  },
];

export const USE_CASES: UseCaseItem[] = [
  {
    icon: Server,
    title: "DevOps Engineers",
    desc: "Quickly prototype and deploy infrastructure without manual IaC writing",
  },
  {
    icon: ShieldCheck,
    title: "Platform Teams",
    desc: "Build internal tools and standardized infrastructure patterns",
  },
  {
    icon: Database,
    title: "Developers",
    desc: "Learn cloud architecture and generate proper infrastructure for applications",
  },
  {
    icon: Zap,
    title: "Startups",
    desc: "Rapidly set up production-ready infrastructure without DevOps expertise",
  },
  {
    icon: Package,
    title: "Consultants",
    desc: "Generate consistent infrastructure templates for client projects",
  },
  {
    icon: Network,
    title: "Educators",
    desc: "Teach cloud concepts with practical, hands-on infrastructure examples",
  },
];

export const BENEFITS: BenefitItem[] = [
  {
    title: "Save Time & Reduce Errors",
    desc: "Eliminate manual IaC writing and avoid common configuration mistakes. Our templates follow AWS best practices and include proper security configurations.",
  },
  {
    title: "Learn Cloud Architecture",
    desc: "Understand how AWS services connect and depend on each other. Visualize relationships and learn proper infrastructure patterns.",
  },
  {
    title: "Consistent Standards",
    desc: "Generate standardized infrastructure across teams and projects. Ensure naming conventions, tagging, and security policies are consistent.",
  },
  {
    title: "Multi-Format Support",
    desc: "Choose between Terraform and CloudFormation based on your team's preferences. Export clean, readable, and production-ready code.",
  },
];

export const SERVICES_OVERVIEW: ServiceOverviewItem[] = [
  { icon: Server, name: "EC2", category: "compute" },
  { icon: Zap, name: "Lambda", category: "compute" },
  { icon: Package, name: "ECS", category: "compute" },
  { icon: Package, name: "EKS", category: "compute" },
  { icon: HardDrive, name: "S3", category: "storage" },
  { icon: HardDrive, name: "EFS", category: "storage" },
  { icon: Database, name: "RDS", category: "database" },
  { icon: Database, name: "DynamoDB", category: "database" },
  { icon: Database, name: "ElastiCache", category: "database" },
  { icon: Network, name: "VPC", category: "networking" },
  { icon: GitFork, name: "ALB", category: "networking" },
  { icon: Globe, name: "API Gateway", category: "networking" },
  { icon: Cloud, name: "CloudFront", category: "networking" },
  { icon: Globe, name: "Route 53", category: "networking" },
  { icon: ShieldCheck, name: "IAM", category: "security" },
  { icon: MessageSquare, name: "SQS", category: "messaging" },
  { icon: Bell, name: "SNS", category: "messaging" },
  { icon: Activity, name: "CloudWatch", category: "management" },
  { icon: Workflow, name: "Step Functions", category: "devops" },
  { icon: Zap, name: "EventBridge", category: "devops" },
  { icon: Activity, name: "Kinesis", category: "devops" },
  { icon: Lock, name: "Secrets Manager", category: "devops" },
  { icon: Key, name: "KMS", category: "devops" },
  { icon: FileCheck, name: "AWS Config", category: "devops" },
  { icon: ShieldCheck, name: "AWS Backup", category: "devops" },
  { icon: Users, name: "Cognito", category: "devops" },
  { icon: Hammer, name: "CodeBuild", category: "devops" },
  { icon: GitBranch, name: "CodePipeline", category: "devops" },
  { icon: Rocket, name: "CodeDeploy", category: "devops" },
  { icon: Layers, name: "StackSets", category: "devops" },
];

export const COMPUTE_SERVICES: ServiceDetailItem[] = [
  { icon: Server, name: "EC2", desc: "Scalable virtual servers", features: ["Multiple instance types", "Auto Scaling", "Load Balancing"] },
  { icon: Zap, name: "Lambda", desc: "Serverless computing", features: ["Multiple runtimes", "Event-driven", "Pay per use"] },
  { icon: Package, name: "ECS", desc: "Container orchestration", features: ["Docker support", "Fargate", "Task definitions"] },
  { icon: Package, name: "EKS", desc: "Managed Kubernetes", features: ["Managed control plane", "Auto-updates", "Integration"] },
];

export const STORAGE_SERVICES: ServiceDetailItem[] = [
  { icon: HardDrive, name: "S3", desc: "Object storage service", features: ["Versioning", "Encryption", "Lifecycle policies"] },
  { icon: HardDrive, name: "EFS", desc: "File system for EC2", features: ["Shared storage", "High availability", "Performance modes"] },
];

export const DATABASE_SERVICES: ServiceDetailItem[] = [
  { icon: Database, name: "RDS", desc: "Managed relational databases", features: ["Multiple engines", "Backups", "High availability"] },
  { icon: Database, name: "DynamoDB", desc: "NoSQL database service", features: ["Auto-scaling", "Global tables", "Streams"] },
  { icon: Database, name: "ElastiCache", desc: "In-memory caching", features: ["Redis/Memcached", "Clustering", "High performance"] },
];

export const NETWORKING_SERVICES: ServiceDetailItem[] = [
  { icon: Network, name: "VPC", desc: "Virtual Private Cloud", features: ["Isolated networks", "Subnets", "Route tables"] },
  { icon: GitFork, name: "ALB", desc: "Application Load Balancer", features: ["Health checks", "SSL termination", "Path routing"] },
  { icon: Globe, name: "API Gateway", desc: "API management", features: ["REST/HTTP APIs", "CORS support", "Throttling"] },
  { icon: Cloud, name: "CloudFront", desc: "Content delivery network", features: ["CDN", "Edge locations", "Security"] },
  { icon: Globe, name: "Route 53", desc: "DNS service", features: ["Domain registration", "Health checks", "Routing policies"] },
];

export const MESSAGING_SERVICES: ServiceDetailItem[] = [
  { icon: MessageSquare, name: "SQS", desc: "Message queue service", features: ["Standard/FIFO", "Dead letter queues"] },
  { icon: Bell, name: "SNS", desc: "Pub/sub messaging", features: ["Topics", "Multi-protocol", "Fan-out"] },
];

export const DEVOPS_SERVICES: ServiceDetailItem[] = [
  { icon: Workflow, name: "Step Functions", desc: "Workflow orchestration", features: ["Serverless", "State machines", "Visual workflows"] },
  { icon: Zap, name: "EventBridge", desc: "Event-driven architecture", features: ["Event bus", "Rules", "Targets"] },
  { icon: Activity, name: "Kinesis", desc: "Real-time data streaming", features: ["Data streams", "Analytics", "Real-time"] },
  { icon: Lock, name: "Secrets Manager", desc: "Secure secrets storage", features: ["Rotation", "Encryption", "API access"] },
  { icon: Key, name: "KMS", desc: "Key management", features: ["Encryption keys", "Key rotation", "Policies"] },
  { icon: FileCheck, name: "AWS Config", desc: "Configuration compliance", features: ["Rules", "Compliance", "Auditing"] },
  { icon: ShieldCheck, name: "AWS Backup", desc: "Centralized backup", features: ["Backup plans", "Policies", "Cross-account"] },
  { icon: Users, name: "Cognito", desc: "User authentication", features: ["User pools", "Social login", "MFA"] },
  { icon: Hammer, name: "CodeBuild", desc: "Continuous integration", features: ["Build projects", "Custom images", "Artifacts"] },
  { icon: GitBranch, name: "CodePipeline", desc: "Continuous delivery", features: ["Pipelines", "Stages", "Actions"] },
  { icon: Rocket, name: "CodeDeploy", desc: "Automated deployment", features: ["Deployment groups", "Strategies", "Rollbacks"] },
  { icon: Layers, name: "StackSets", desc: "Multi-account infra", features: ["Stack sets", "Multi-region", "Governance"] },
];
