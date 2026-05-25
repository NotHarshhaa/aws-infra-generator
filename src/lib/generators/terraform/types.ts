export type {
  GeneratedFile,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ServiceConfig,
} from "../../types";

export interface GenerateRequest {
  services: string[];
  config: import("../../types").ServiceConfig;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}
