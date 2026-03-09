export interface AWSService {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ServiceCategory;
  dependencies: string[];
  configFields: ConfigField[];
}

export type ServiceCategory = "compute" | "storage" | "database" | "networking" | "security";

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "boolean";
  default: string | number | boolean;
  options?: { label: string; value: string }[];
  required?: boolean;
  description?: string;
}

export interface ServiceConfig {
  [serviceId: string]: {
    enabled: boolean;
    config: { [key: string]: string | number | boolean };
  };
}

export interface InfraProject {
  services: string[];
  config: ServiceConfig;
  environment: Environment;
  region: string;
  format: OutputFormat;
  projectName: string;
}

export type Environment = "development" | "staging" | "production";
export type OutputFormat = "terraform" | "cloudformation";

export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  validation: ValidationResult;
  downloadUrl?: string;
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
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

export type WizardStep = "services" | "configure" | "generate" | "export";
