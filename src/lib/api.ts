import { GeneratedFile, ValidationResult } from "./types";
import { clientAPI } from "./api/client";

export async function generateInfrastructure(payload: {
  services: string[];
  config: Record<string, { enabled: boolean; config: Record<string, unknown> }>;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}): Promise<{ files: GeneratedFile[]; validation: ValidationResult }> {
  return clientAPI.generateInfrastructure(payload);
}

export async function validateInfrastructure(payload: {
  services: string[];
  config: Record<string, { enabled: boolean; config: Record<string, unknown> }>;
}): Promise<ValidationResult> {
  return clientAPI.validateInfrastructure(payload);
}

export async function downloadInfrastructure(payload: {
  services: string[];
  config: Record<string, { enabled: boolean; config: Record<string, unknown> }>;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}): Promise<Blob> {
  return clientAPI.downloadInfrastructure(payload);
}
