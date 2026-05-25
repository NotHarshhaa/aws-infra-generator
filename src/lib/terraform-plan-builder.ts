import { TerraformGenerator } from "./generators/terraform";
import { DependencyResolver } from "./services/dependency";
import type { GeneratedFile, ServiceConfig } from "./types";
import type { TerraformPlanSummary } from "./terraform-plan-types";
import { buildPlanSummaryFromTerraformFiles } from "./terraform-plan-parser";

interface BuildTerraformPlanPreviewInput {
  selectedServices: string[];
  serviceConfig: ServiceConfig;
  projectName: string;
  region: string;
  environment: string;
  outputFormat: string;
  generatedFiles?: GeneratedFile[];
  useGeneratedFiles?: boolean;
}

export function buildTerraformPlanPreview(
  input: BuildTerraformPlanPreviewInput
): TerraformPlanSummary | null {
  if (input.outputFormat !== "terraform" || input.selectedServices.length === 0) {
    return null;
  }

  let files = input.generatedFiles ?? [];

  if (!input.useGeneratedFiles || files.length === 0) {
    const resolver = new DependencyResolver();
    const generator = new TerraformGenerator();
    const resolvedServices = resolver.resolve(input.selectedServices);

    files = generator.generate(
      resolvedServices,
      input.serviceConfig,
      input.environment,
      input.region,
      input.projectName
    );
  }

  const summary = buildPlanSummaryFromTerraformFiles(files);

  if (summary.actions.length === 0) {
    return null;
  }

  return summary;
}

export type { BuildTerraformPlanPreviewInput };
