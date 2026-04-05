// Re-export from the modular structure
export { TerraformGenerator } from './terraform/index';
export type { 
  ServiceConfig, 
  GeneratedFile, 
  GenerateRequest, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning 
} from './terraform/index';
