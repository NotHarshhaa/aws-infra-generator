import { GeneratedFile } from '../types';

export function generateProvider(region: string, projectName: string, environment: string): GeneratedFile {
  const backendConfig = environment === 'production' 
    ? `  backend "s3" {
    bucket         = "${projectName}-${environment}-terraform-state"
    key            = "terraform.tfstate"
    region         = "${region}"
    encrypt        = true
    dynamodb_table = "${projectName}-${environment}-terraform-locks"
  }`
    : `  backend "local" {
    path = "terraform.tfstate"
  }`;

  const content = `terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

${backendConfig}
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      CostCenter  = var.cost_center
      Owner       = var.owner_email
    }
  }
}

provider "aws" {
  alias  = "logs"
  region = "us-east-1" # CloudWatch Logs global region
}

# Random resources for unique naming
resource "random_pet" "suffix" {
  length = 2
}

resource "random_id" "unique" {
  byte_length = 4
}`;

  return {
    name: "main.tf",
    path: `${projectName}/main.tf`,
    content,
    language: "hcl",
  };
}
