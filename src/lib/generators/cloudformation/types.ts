export interface ServiceConfig {
  enabled: boolean;
  config: Record<string, any>;
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface GenerateRequest {
  services: string[];
  config: Record<string, ServiceConfig>;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  service: string;
  message: string;
  type: "dependency" | "config" | "conflict";
}

export interface ValidationWarning {
  service: string;
  message: string;
}

export interface CloudFormationTemplate {
  AWSTemplateFormatVersion: string;
  Description: string;
  Parameters: Record<string, any>;
  Resources: Record<string, any>;
  Outputs: Record<string, any>;
}

export type ServiceBuilderResult = [resources: Record<string, any>, outputs: Record<string, any>];
