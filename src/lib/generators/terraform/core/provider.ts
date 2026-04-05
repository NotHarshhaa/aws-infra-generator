import { GeneratedFile } from '../types';

export function generateProvider(region: string, projectName: string, environment: string): GeneratedFile {
  const content = `terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "${projectName}"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}`;

  return {
    name: "main.tf",
    path: `${projectName}/main.tf`,
    content,
    language: "hcl",
  };
}
