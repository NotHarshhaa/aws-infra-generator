import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  WizardStep,
  ServiceConfig,
  Environment,
  OutputFormat,
  GeneratedFile,
  ValidationResult,
} from "./types";
import { PresetTemplate } from "./preset-templates";
import { computeConfigSnapshot } from "./service-dependencies";
import {
  ensureServiceConfigs,
  resolveServicesWithDependencies,
  createDefaultServiceConfig,
} from "./service-config-utils";

interface InfraStore {
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;

  selectedTemplate: PresetTemplate | null;
  setSelectedTemplate: (template: PresetTemplate | null) => void;
  applyPresetTemplate: (template: PresetTemplate) => void;
  importConfig: (data: {
    selectedServices?: string[];
    serviceConfig?: Record<string, unknown>;
    projectName?: string;
    environment?: Environment;
    region?: string;
    outputFormat?: OutputFormat;
  }) => void;

  selectedServices: string[];
  toggleService: (serviceId: string) => void;
  setSelectedServices: (services: string[]) => void;
  clearAllServices: () => void;

  serviceConfig: ServiceConfig;
  updateServiceConfig: (
    serviceId: string,
    key: string,
    value: string | number | boolean
  ) => void;
  initServiceConfig: () => void;

  projectName: string;
  setProjectName: (name: string) => void;
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  region: string;
  setRegion: (region: string) => void;
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;
  backendType: "local" | "s3";
  setBackendType: (type: "local" | "s3") => void;
  ownerEmail: string;
  setOwnerEmail: (email: string) => void;
  costCenter: string;
  setCostCenter: (costCenter: string) => void;

  applyBestPractices: () => void;
  applyFinOpsOptimizations: () => void;
  resetServiceConfigToDefault: (serviceId: string) => void;
  resetAllServiceConfigs: () => void;

  isGenerating: boolean;
  generatedFiles: GeneratedFile[];
  validationResult: ValidationResult | null;
  configSnapshot: string | null;
  isGenerationStale: boolean;
  setIsGenerating: (val: boolean) => void;
  setGeneratedFiles: (files: GeneratedFile[]) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  invalidateGeneration: () => void;

  reset: () => void;
}

const initialState = {
  currentStep: "services" as WizardStep,
  selectedTemplate: null as PresetTemplate | null,
  selectedServices: [] as string[],
  serviceConfig: {} as ServiceConfig,
  projectName: "my-infra",
  environment: "development" as Environment,
  region: "us-east-1",
  outputFormat: "terraform" as OutputFormat,
  backendType: "local" as "local" | "s3",
  ownerEmail: "admin@example.com",
  costCenter: "engineering",
  isGenerating: false,
  generatedFiles: [] as GeneratedFile[],
  validationResult: null as ValidationResult | null,
  configSnapshot: null as string | null,
  isGenerationStale: false,
};

type StoreState = typeof initialState;

const getSnapshot = (state: StoreState) =>
  computeConfigSnapshot({
    selectedServices: state.selectedServices,
    serviceConfig: state.serviceConfig,
    projectName: state.projectName,
    environment: state.environment,
    region: state.region,
    outputFormat: state.outputFormat,
  });

const markGenerationStale = (state: StoreState) => {
  if (state.generatedFiles.length === 0 || !state.configSnapshot) {
    return {};
  }

  const currentSnapshot = getSnapshot(state);
  if (currentSnapshot === state.configSnapshot) {
    return {};
  }

  return { isGenerationStale: true };
};

const canNavigateToStep = (
  step: WizardStep,
  state: Pick<InfraStore, "selectedServices" | "generatedFiles" | "isGenerationStale">
): boolean => {
  if (step === "services") return true;
  if (step === "configure") return state.selectedServices.length > 0;
  if (step === "generate") return state.selectedServices.length > 0;
  if (step === "export") {
    return state.generatedFiles.length > 0 && !state.isGenerationStale;
  }
  return false;
};

export const useInfraStore = create<InfraStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => {
        const state = get();
        if (!canNavigateToStep(step, state)) return;
        set({ currentStep: step });
      },

      setSelectedTemplate: (template) => set({ selectedTemplate: template }),

      applyPresetTemplate: (template) => {
        const enabledServices = template.services.filter((service) => service.enabled);
        const presetConfigs = Object.fromEntries(
          enabledServices.map((service) => [service.serviceId, service.config])
        );
        const resolvedServices = resolveServicesWithDependencies(
          enabledServices.map((service) => service.serviceId)
        );
        const serviceConfig = ensureServiceConfigs(resolvedServices, {}, presetConfigs);

        set({
          selectedTemplate: template,
          selectedServices: resolvedServices,
          serviceConfig,
          projectName: template.globalConfig.projectName,
          environment: template.globalConfig.environment,
          region: template.globalConfig.region,
          outputFormat: template.globalConfig.outputFormat,
          generatedFiles: [],
          validationResult: null,
          configSnapshot: null,
          isGenerationStale: false,
        });
      },

      importConfig: (data) => {
        const services = Array.isArray(data.selectedServices) ? data.selectedServices : [];
        const resolvedServices = resolveServicesWithDependencies(services);
        const importedCustomConfigs: Record<string, Record<string, string | number | boolean>> = {};
        if (data.serviceConfig && typeof data.serviceConfig === "object") {
          for (const [sId, item] of Object.entries(data.serviceConfig)) {
            if (item && typeof item === "object" && "config" in item) {
              const rawConfig = (item as { config?: Record<string, unknown> }).config;
              if (rawConfig && typeof rawConfig === "object") {
                const cleanConfig: Record<string, string | number | boolean> = {};
                for (const [k, v] of Object.entries(rawConfig)) {
                  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
                    cleanConfig[k] = v;
                  }
                }
                importedCustomConfigs[sId] = cleanConfig;
              }
            }
          }
        }
        const serviceConfig = ensureServiceConfigs(resolvedServices, {}, importedCustomConfigs);

        set({
          selectedServices: resolvedServices,
          serviceConfig,
          projectName: typeof data.projectName === "string" && data.projectName ? data.projectName : get().projectName,
          environment: data.environment || get().environment,
          region: data.region || get().region,
          outputFormat: data.outputFormat || get().outputFormat,
          generatedFiles: [],
          validationResult: null,
          configSnapshot: null,
          isGenerationStale: false,
        });
      },

      toggleService: (serviceId) => {
        const state = get();
        let updated: string[];
        let nextConfig = { ...state.serviceConfig };

        if (state.selectedServices.includes(serviceId)) {
          updated = state.selectedServices.filter((id) => id !== serviceId);
          delete nextConfig[serviceId];
        } else {
          updated = resolveServicesWithDependencies([
            ...state.selectedServices,
            serviceId,
          ]);
          nextConfig = ensureServiceConfigs(updated, nextConfig);
        }

        const nextState = {
          ...state,
          selectedServices: updated,
          serviceConfig: nextConfig,
        };

        set({
          selectedServices: updated,
          serviceConfig: nextConfig,
          ...markGenerationStale(nextState),
        });
      },

      setSelectedServices: (services) => {
        const state = get();
        const resolved = resolveServicesWithDependencies(services);
        const prunedConfig = Object.fromEntries(
          Object.entries(state.serviceConfig).filter(([serviceId]) =>
            resolved.includes(serviceId)
          )
        ) as ServiceConfig;
        const nextConfig = ensureServiceConfigs(resolved, prunedConfig);

        const nextState = {
          ...state,
          selectedServices: resolved,
          serviceConfig: nextConfig,
        };

        set({
          selectedServices: resolved,
          serviceConfig: nextConfig,
          ...markGenerationStale(nextState),
        });
      },

      clearAllServices: () => {
        set({
          selectedServices: [],
          selectedTemplate: null,
          serviceConfig: {},
          generatedFiles: [],
          validationResult: null,
          configSnapshot: null,
          isGenerationStale: false,
        });
      },

      updateServiceConfig: (serviceId, key, value) => {
        const state = get();
        const nextState = {
          ...state,
          serviceConfig: {
            ...state.serviceConfig,
            [serviceId]: {
              ...state.serviceConfig[serviceId],
              enabled: true,
              config: {
                ...state.serviceConfig[serviceId]?.config,
                [key]: value,
              },
            },
          },
        };

        set({
          serviceConfig: nextState.serviceConfig,
          ...markGenerationStale(nextState),
        });
      },

      initServiceConfig: () => {
        const { selectedServices, serviceConfig } = get();
        const newConfig = ensureServiceConfigs(selectedServices, serviceConfig);
        set({ serviceConfig: newConfig });
      },

      setProjectName: (name) => {
        const state = get();
        const nextState = { ...state, projectName: name };
        set({ projectName: name, ...markGenerationStale(nextState) });
      },
      setEnvironment: (env) => {
        const state = get();
        const nextState = { ...state, environment: env };
        set({ environment: env, ...markGenerationStale(nextState) });
      },
      setRegion: (region) => {
        const state = get();
        const nextState = { ...state, region };
        set({ region, ...markGenerationStale(nextState) });
      },
      setOutputFormat: (format) => {
        const state = get();
        const nextState = { ...state, outputFormat: format };
        set({ outputFormat: format, ...markGenerationStale(nextState) });
      },
      setBackendType: (type) => {
        const state = get();
        const nextState = { ...state, backendType: type };
        set({ backendType: type, ...markGenerationStale(nextState) });
      },
      setOwnerEmail: (email) => {
        const state = get();
        const nextState = { ...state, ownerEmail: email };
        set({ ownerEmail: email, ...markGenerationStale(nextState) });
      },
      setCostCenter: (costCenter) => {
        const state = get();
        const nextState = { ...state, costCenter };
        set({ costCenter, ...markGenerationStale(nextState) });
      },

      applyBestPractices: () => {
        const state = get();
        const nextConfig: ServiceConfig = { ...state.serviceConfig };

        if (state.selectedServices.includes("s3") && nextConfig.s3) {
          nextConfig.s3 = {
            ...nextConfig.s3,
            config: {
              ...nextConfig.s3.config,
              encryption: true,
              versioning: true,
              block_public_access: true,
            },
          };
        }

        if (state.selectedServices.includes("rds") && nextConfig.rds) {
          nextConfig.rds = {
            ...nextConfig.rds,
            config: {
              ...nextConfig.rds.config,
              storage_encrypted: true,
              backup_retention_period: 7,
              ...(state.environment !== "development" ? { multi_az: true } : {}),
            },
          };
        }

        if (state.selectedServices.includes("vpc") && nextConfig.vpc) {
          nextConfig.vpc = {
            ...nextConfig.vpc,
            config: {
              ...nextConfig.vpc.config,
              enable_dns: true,
              enable_nat: true,
            },
          };
        }

        if (state.selectedServices.includes("dynamodb") && nextConfig.dynamodb) {
          nextConfig.dynamodb = {
            ...nextConfig.dynamodb,
            config: {
              ...nextConfig.dynamodb.config,
              encryption: true,
              point_in_time_recovery: true,
            },
          };
        }

        const nextState = { ...state, serviceConfig: nextConfig };
        set({
          serviceConfig: nextConfig,
          ...markGenerationStale(nextState),
        });
      },

      applyFinOpsOptimizations: () => {
        const state = get();
        const nextConfig: ServiceConfig = { ...state.serviceConfig };

        // Switch EC2 to Graviton (t4g)
        if (state.selectedServices.includes("ec2") && nextConfig.ec2) {
          const currentType = String(nextConfig.ec2.config?.instance_type || "t3.micro");
          const graviton = currentType
            .replace("t3.", "t4g.")
            .replace("t2.", "t4g.")
            .replace("m5.", "m6g.")
            .replace("c5.", "c7g.");
          nextConfig.ec2 = {
            ...nextConfig.ec2,
            config: { ...nextConfig.ec2.config, instance_type: graviton },
          };
        }

        // Switch RDS to Graviton
        if (state.selectedServices.includes("rds") && nextConfig.rds) {
          const currentClass = String(nextConfig.rds.config?.instance_class || "db.t3.micro");
          const graviton = currentClass
            .replace("db.t3.", "db.t4g.")
            .replace("db.m5.", "db.m6g.");
          nextConfig.rds = {
            ...nextConfig.rds,
            config: { ...nextConfig.rds.config, instance_class: graviton },
          };
        }

        // If dev environment, avoid costly NAT gateways
        if (state.environment === "development" && state.selectedServices.includes("vpc") && nextConfig.vpc) {
          nextConfig.vpc = {
            ...nextConfig.vpc,
            config: { ...nextConfig.vpc.config, enable_nat: false },
          };
        }

        const nextState = { ...state, serviceConfig: nextConfig };
        set({
          serviceConfig: nextConfig,
          ...markGenerationStale(nextState),
        });
      },

      resetServiceConfigToDefault: (serviceId: string) => {
        const state = get();
        const defaults = createDefaultServiceConfig(serviceId);
        if (!defaults) return;

        const nextConfig: ServiceConfig = {
          ...state.serviceConfig,
          [serviceId]: defaults,
        };

        const nextState = { ...state, serviceConfig: nextConfig };
        set({
          serviceConfig: nextConfig,
          ...markGenerationStale(nextState),
        });
      },

      resetAllServiceConfigs: () => {
        const state = get();
        const nextConfig: ServiceConfig = {};
        for (const sId of state.selectedServices) {
          const defaults = createDefaultServiceConfig(sId);
          if (defaults) nextConfig[sId] = defaults;
        }

        const nextState = { ...state, serviceConfig: nextConfig };
        set({
          serviceConfig: nextConfig,
          ...markGenerationStale(nextState),
        });
      },

      setIsGenerating: (val) => set({ isGenerating: val }),
      setGeneratedFiles: (files) => {
        const state = get();
        set({
          generatedFiles: files,
          configSnapshot: getSnapshot(state),
          isGenerationStale: false,
        });
      },
      setValidationResult: (result) => set({ validationResult: result }),
      invalidateGeneration: () =>
        set({
          generatedFiles: [],
          validationResult: null,
          configSnapshot: null,
          isGenerationStale: false,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "aws-infra-generator",
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedTemplate: state.selectedTemplate,
        selectedServices: state.selectedServices,
        serviceConfig: state.serviceConfig,
        projectName: state.projectName,
        environment: state.environment,
        region: state.region,
        outputFormat: state.outputFormat,
        backendType: state.backendType,
        ownerEmail: state.ownerEmail,
        costCenter: state.costCenter,
        configSnapshot: state.configSnapshot,
        isGenerationStale:
          state.isGenerationStale || state.generatedFiles.length > 0,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.generatedFiles = [];
        state.validationResult = null;
        state.isGenerating = false;
      },
    }
  )
);

export const selectIsGenerationStale = (state: InfraStore) => state.isGenerationStale;
