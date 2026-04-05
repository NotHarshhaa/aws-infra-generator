import { TerraformGenerator, GenerateRequest, ValidationResult, GeneratedFile } from '../generators/terraform';
import { CloudFormationGenerator } from '../generators/cloudformation';
import { InfraValidator } from '../services/validator';
import { DependencyResolver } from '../services/dependency';

// Client-side API that replaces the backend
export class ClientAPI {
  private terraformGenerator: TerraformGenerator;
  private cloudFormationGenerator: CloudFormationGenerator;
  private validator: InfraValidator;
  private resolver: DependencyResolver;

  constructor() {
    this.terraformGenerator = new TerraformGenerator();
    this.cloudFormationGenerator = new CloudFormationGenerator();
    this.validator = new InfraValidator();
    this.resolver = new DependencyResolver();
  }

  // Health check - simulates backend health check
  async health(): Promise<any> {
    try {
      // Test basic functionality
      const validator = new InfraValidator();
      const resolver = new DependencyResolver();
      const terraformGen = new TerraformGenerator();
      const cloudFormationGen = new CloudFormationGenerator();
      
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        components: {
          validator: "ok",
          dependency_resolver: "ok",
          terraform_generator: "ok",
          cloudformation_generator: "ok"
        }
      };
    } catch (error: any) {
      throw new Error(`Service unavailable: ${error.message}`);
    }
  }

  // Validate infrastructure configuration
  async validateInfrastructure(request: { services: string[], config: Record<string, any> }): Promise<ValidationResult> {
    try {
      console.log(`Validating infrastructure for services: ${request.services}`);
      
      const resolvedServices = this.resolver.resolve(request.services);
      const configDict = this._convertConfig(request.config);
      const result = this.validator.validate(resolvedServices, configDict);

      console.log(`Validation completed. Valid: ${result.valid}, Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);
      return result;
      
    } catch (error: any) {
      console.error(`Validation failed: ${error.message}`);
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  // Generate infrastructure templates
  async generateInfrastructure(request: GenerateRequest): Promise<{ files: GeneratedFile[], validation: ValidationResult }> {
    try {
      console.log(`Generating ${request.format} templates for project: ${request.projectName}, services: ${request.services}`);
      
      const resolvedServices = this.resolver.resolve(request.services);
      const configDict = this._convertConfig(request.config);

      const validation = this.validator.validate(resolvedServices, configDict);

      let generator: TerraformGenerator | CloudFormationGenerator;
      if (request.format === "terraform") {
        generator = this.terraformGenerator;
      } else {
        generator = this.cloudFormationGenerator;
      }

      const files = generator.generate(
        resolvedServices,
        configDict,
        request.environment,
        request.region,
        request.projectName,
      );

      console.log(`Generated ${files.length} files for ${request.format}`);
      return { files, validation };
      
    } catch (error: any) {
      console.error(`Generation failed: ${error.message}`);
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  // Download infrastructure templates as ZIP file (client-side)
  async downloadInfrastructure(request: GenerateRequest): Promise<Blob> {
    try {
      console.log(`Downloading ${request.format} templates for project: ${request.projectName}`);
      
      const { files } = await this.generateInfrastructure(request);
      
      // Create ZIP file in browser
      const zipBlob = await this._createZipFile(files);
      
      return zipBlob;
      
    } catch (error: any) {
      console.error(`Download failed: ${error.message}`);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  // Helper method to convert config format
  private _convertConfig(config: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'object' && value !== null) {
        result[key] = (value as any).config || {};
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  // Create ZIP file in browser using JSZip
  private async _createZipFile(files: GeneratedFile[]): Promise<Blob> {
    // Dynamic import of JSZip to avoid SSR issues
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const file of files) {
      zip.file(file.path, file.content);
    }

    return zip.generateAsync({ type: "blob" });
  }
}

// Singleton instance
export const clientAPI = new ClientAPI();
