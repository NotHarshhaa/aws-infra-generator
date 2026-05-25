import { GeneratedFile, ValidationResult, ServiceConfig } from "./types";
import { clientAPI } from "./api/client";

export async function generateInfrastructure(payload: {
  services: string[];
  config: ServiceConfig;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}): Promise<{ files: GeneratedFile[]; validation: ValidationResult }> {
  return clientAPI.generateInfrastructure(payload);
}

export async function validateInfrastructure(payload: {
  services: string[];
  config: ServiceConfig;
  environment?: string;
  projectName?: string;
}): Promise<ValidationResult> {
  return clientAPI.validateInfrastructure(payload);
}

export async function downloadInfrastructure(payload: {
  services: string[];
  config: ServiceConfig;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}, options?: {
  files?: GeneratedFile[];
  includeReadme?: boolean;
  includeGitignore?: boolean;
}): Promise<Blob> {
  return clientAPI.downloadInfrastructure(payload, options);
}
