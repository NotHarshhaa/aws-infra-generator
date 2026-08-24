// Types
export type {
  AWSService,
  ServiceCategory,
  ConfigField,
  ServiceConfig,
  InfraProject,
  Environment,
  OutputFormat,
  GenerationResult,
  GeneratedFile,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  WizardStep,
} from "./types";

// Store
export { useInfraStore, selectIsGenerationStale } from "./store";

// API
export {
  generateInfrastructure,
  validateInfrastructure,
  downloadInfrastructure,
} from "./api";

// AWS catalog
export {
  AWS_SERVICES,
  AWS_REGIONS,
  SERVICE_CATEGORIES,
  getServiceById,
  getServiceDependencies,
  resolveServicesInOrder,
} from "./aws-services";

// Presets
export { PRESET_TEMPLATES, type PresetTemplate } from "./preset-templates";

// Dependencies & config helpers
export {
  getDirectDependencies,
  computeConfigSnapshot,
  buildServiceDependencyMap,
} from "./service-dependencies";
export {
  createDefaultServiceConfig,
  ensureServiceConfigs,
  resolveServicesWithDependencies,
} from "./service-config-utils";

// Validation
export {
  validateProjectName,
  normalizeProjectName,
  PROJECT_NAME_PATTERN,
  PROJECT_NAME_RULE,
} from "./validation/project-name";

// Serialization & export
export { stableJsonStringify } from "./stable-json";
export {
  buildReadmeContent,
  buildGitignoreContent,
  buildExportFileList,
} from "./export-utils";

// Cost & plan preview
export {
  estimateInfrastructureCost,
  type CostEstimate,
  type CostBreakdown,
  type TotalCostEstimate,
} from "./cost-estimator";
export { buildTerraformPlanPreview } from "./terraform-plan-builder";
export type {
  TerraformPlanAction,
  PlanChange,
  TerraformPlanSummary,
} from "./terraform-plan-types";

// CI/CD Generators
export {
  generateGithubActionsWorkflow,
  generateGitlabCiPipeline,
  generateCodeBuildSpec,
  getAllCicdPipelines,
  type CicdPipeline,
} from "./cicd-generators";

// Compliance & Governance
export {
  auditCompliance,
  COMPLIANCE_FRAMEWORKS,
  COMPLIANCE_RULES,
  type ComplianceFramework,
  type ComplianceFinding,
  type ComplianceScore,
} from "./compliance-auditor";

// FinOps & Cost Optimization
export {
  analyzeFinOps,
  type FinOpsAnalysis,
  type FinOpsRecommendation,
} from "./finops-analyzer";

// Generator helpers
export {
  terraformSubnetIdList,
  terraformLocalSubnetIds,
} from "./terraform-helpers";
export {
  CLOUDFRONT_HOSTED_ZONE_ID,
  getCloudFormationBuildContext,
  cfPublicSubnetRefs,
  cfPrivateSubnetRefs,
  cfSubnetRefAt,
  cfPublicSubnetIdsJoin,
  cfPrivateSubnetIdsJoin,
  type CloudFormationBuildContext,
} from "./cloudformation-helpers";

// Utilities
export { cn } from "./utils";
