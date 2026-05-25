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
      const result = this.validator.validate(resolvedServices, request.config);

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
      const validation = this.validator.validate(resolvedServices, request.config);

      let generator: TerraformGenerator | CloudFormationGenerator;
      if (request.format === "terraform") {
        generator = this.terraformGenerator;
      } else {
        generator = this.cloudFormationGenerator;
      }

      const files = generator.generate(
        resolvedServices,
        request.config,
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
  async downloadInfrastructure(
    request: GenerateRequest,
    options?: {
      files?: GeneratedFile[];
      includeReadme?: boolean;
      includeGitignore?: boolean;
    }
  ): Promise<Blob> {
    try {
      console.log(`Downloading ${request.format} templates for project: ${request.projectName}`);

      const files =
        options?.files ??
        (await this.generateInfrastructure(request)).files;

      const zipBlob = await this._createZipFile(files, {
        includeReadme: options?.includeReadme,
        includeGitignore: options?.includeGitignore,
        projectName: request.projectName,
        environment: request.environment,
        region: request.region,
        outputFormat: request.format,
        services: request.services,
      });
      
      return zipBlob;
      
    } catch (error: any) {
      console.error(`Download failed: ${error.message}`);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  // Create ZIP file in browser using JSZip
  private async _createZipFile(
    files: GeneratedFile[],
    extras?: {
      includeReadme?: boolean;
      includeGitignore?: boolean;
      projectName: string;
      environment: string;
      region: string;
      outputFormat: string;
      services: string[];
    }
  ): Promise<Blob> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    let filesToZip = files;

    if (extras) {
      const { buildExportFileList } = await import('../export-utils');
      filesToZip = buildExportFileList(files, {
        includeReadme: extras.includeReadme ?? true,
        includeGitignore: extras.includeGitignore ?? true,
        projectName: extras.projectName,
        environment: extras.environment,
        region: extras.region,
        outputFormat: extras.outputFormat as 'terraform' | 'cloudformation',
        services: extras.services,
      });
    }

    for (const file of filesToZip) {
      zip.file(file.path, file.content);
    }

    return zip.generateAsync({ type: "blob" });
  }
}

// Singleton instance
export const clientAPI = new ClientAPI();
