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
  { value: "3", label: "IaC Formats" },
  { value: "4", label: "Compliance Frameworks" },
  { value: "100%", label: "Client-Side & Safe" },
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
    icon: Code,
    title: "Multi-Engine IaC",
    desc: "Generate production-grade Terraform, AWS CloudFormation, and TypeScript AWS CDK stacks.",
  },
  {
    icon: GitBranch,
    title: "Automated CI/CD Pipelines",
    desc: "Instant GitHub Actions (OIDC auth), GitLab CI/CD, and AWS CodeBuild specs ready to deploy.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-Framework Compliance",
    desc: "Real-time auditing & 1-click remediation for SOC 2 Type II, HIPAA, PCI-DSS, and CIS AWS Benchmark.",
  },
  {
    icon: Zap,
    title: "FinOps & Graviton Optimizer",
    desc: "Proactive cost right-sizing, Graviton processor savings, and 1-yr / 3-yr Savings Plans projections.",
  },
  {
    icon: Workflow,
    title: "Smart Dependency Graph",
    desc: "Automatic service topology resolution (VPC, Subnets, Security Groups, IAM roles auto-included).",
  },
  {
    icon: Package,
    title: "Full Deployment Toolkits",
    desc: "Downloadable ZIP bundles with Makefiles, deploy.sh scripts, and Dockerized IaC execution commands.",
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: "1",
    title: "Select Services & Architecture",
    desc: "Choose from 32+ AWS services or launch pre-built 1-click architecture blueprints. Dependencies are resolved automatically.",
    icon: Server,
    features: ["32+ AWS Services", "Architecture Blueprints", "Auto Dependencies"],
  },
  {
    step: "2",
    title: "Configure, Audit & Optimize",
    desc: "Tailor CIDRs, instance classes, and security policies. Review live FinOps cost projections and compliance readiness scores.",
    icon: Code,
    features: ["Well-Architected Rules", "SOC2 / HIPAA Compliance", "FinOps Advisor"],
  },
  {
    step: "3",
    title: "Generate, Export & Automate",
    desc: "Inspect synthesized code, generate CI/CD workflows, and download complete bundles with Makefiles and deployment scripts.",
    icon: Package,
    features: ["Terraform, CFN & CDK", "GitHub Actions & GitLab", "Docker & Makefiles"],
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
    title: "Enterprise Governance & Multi-Framework Compliance",
    desc: "Ensure continuous security posture with automated auditing and 1-click remediation for SOC 2 Type II, HIPAA, PCI-DSS, and CIS AWS Foundations.",
  },
  {
    title: "FinOps Intelligence & Graviton Savings",
    desc: "Proactively reduce AWS cloud spending. Automatically detect x86 instances and switch to Arm-based AWS Graviton for an immediate ~20% compute savings.",
  },
  {
    title: "Multi-Engine IaC Synthesis (Terraform, CFN & CDK)",
    desc: "Never get locked into a single format. Generate cleanly structured Terraform HCL, AWS CloudFormation JSON, or modern TypeScript AWS CDK constructs.",
  },
  {
    title: "Turnkey CI/CD & Deployment Automation",
    desc: "Ship infrastructure with enterprise-grade GitHub Actions workflows (OIDC token auth), GitLab CI/CD, AWS CodeBuild, Makefiles, and Docker runners.",
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
