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
import { getServiceById, getServiceDependencies } from "./aws-services";
import { PresetTemplate } from "./preset-templates";

interface InfraStore {
  // Wizard navigation
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;

  // Preset templates
  selectedTemplate: PresetTemplate | null;
  setSelectedTemplate: (template: PresetTemplate | null) => void;
  applyPresetTemplate: (template: PresetTemplate) => void;

  // Service selection
  selectedServices: string[];
  toggleService: (serviceId: string) => void;
  setSelectedServices: (services: string[]) => void;
  clearAllServices: () => void;

  // Service config
  serviceConfig: ServiceConfig;
  updateServiceConfig: (
    serviceId: string,
    key: string,
    value: string | number | boolean
  ) => void;
  initServiceConfig: () => void;

  // Project settings
  projectName: string;
  setProjectName: (name: string) => void;
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  region: string;
  setRegion: (region: string) => void;
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;

  // Generation
  isGenerating: boolean;
  generatedFiles: GeneratedFile[];
  validationResult: ValidationResult | null;
  setIsGenerating: (val: boolean) => void;
  setGeneratedFiles: (files: GeneratedFile[]) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  invalidateGeneration: () => void;

  // Reset
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
  isGenerating: false,
  generatedFiles: [] as GeneratedFile[],
  validationResult: null as ValidationResult | null,
};

const canNavigateToStep = (
  step: WizardStep,
  state: Pick<InfraStore, "selectedServices" | "generatedFiles">
): boolean => {
  if (step === "services") return true;
  if (step === "configure") return state.selectedServices.length > 0;
  if (step === "generate") return state.selectedServices.length > 0;
  if (step === "export") return state.generatedFiles.length > 0;
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
        const serviceIds = template.services
          .filter((service) => service.enabled)
          .map((service) => service.serviceId);

        const newServiceConfig: ServiceConfig = {};
        template.services.forEach((service) => {
          if (service.enabled) {
            newServiceConfig[service.serviceId] = {
              enabled: true,
              config: service.config,
            };
          }
        });

        set({
          selectedTemplate: template,
          selectedServices: serviceIds,
          serviceConfig: newServiceConfig,
          projectName: template.globalConfig.projectName,
          environment: template.globalConfig.environment,
          region: template.globalConfig.region,
          outputFormat: template.globalConfig.outputFormat,
          generatedFiles: [],
          validationResult: null,
        });
      },

      toggleService: (serviceId) => {
        const { selectedServices, serviceConfig } = get();
        let updated: string[];
        let nextConfig = { ...serviceConfig };

        if (selectedServices.includes(serviceId)) {
          updated = selectedServices.filter((id) => id !== serviceId);
          delete nextConfig[serviceId];
        } else {
          const deps = getServiceDependencies(serviceId);
          updated = [...new Set([...selectedServices, serviceId, ...deps])];
        }

        set({
          selectedServices: updated,
          serviceConfig: nextConfig,
          generatedFiles: [],
          validationResult: null,
        });
      },

      setSelectedServices: (services) => {
        const { serviceConfig } = get();
        const nextConfig = Object.fromEntries(
          Object.entries(serviceConfig).filter(([serviceId]) => services.includes(serviceId))
        );

        set({
          selectedServices: services,
          serviceConfig: nextConfig,
          generatedFiles: [],
          validationResult: null,
        });
      },

      clearAllServices: () => {
        set({
          selectedServices: [],
          selectedTemplate: null,
          serviceConfig: {},
          generatedFiles: [],
          validationResult: null,
        });
      },

      updateServiceConfig: (serviceId, key, value) => {
        const { serviceConfig } = get();
        set({
          serviceConfig: {
            ...serviceConfig,
            [serviceId]: {
              ...serviceConfig[serviceId],
              enabled: true,
              config: {
                ...serviceConfig[serviceId]?.config,
                [key]: value,
              },
            },
          },
          generatedFiles: [],
          validationResult: null,
        });
      },

      initServiceConfig: () => {
        const { selectedServices, serviceConfig } = get();
        const newConfig: ServiceConfig = { ...serviceConfig };

        for (const serviceId of selectedServices) {
          if (!newConfig[serviceId]) {
            const service = getServiceById(serviceId);
            if (service) {
              const defaults: { [key: string]: string | number | boolean } = {};
              for (const field of service.configFields) {
                defaults[field.name] = field.default;
              }
              newConfig[serviceId] = { enabled: true, config: defaults };
            }
          }
        }

        set({ serviceConfig: newConfig });
      },

      setProjectName: (name) =>
        set({ projectName: name, generatedFiles: [], validationResult: null }),
      setEnvironment: (env) =>
        set({ environment: env, generatedFiles: [], validationResult: null }),
      setRegion: (region) =>
        set({ region, generatedFiles: [], validationResult: null }),
      setOutputFormat: (format) =>
        set({ outputFormat: format, generatedFiles: [], validationResult: null }),

      setIsGenerating: (val) => set({ isGenerating: val }),
      setGeneratedFiles: (files) => set({ generatedFiles: files }),
      setValidationResult: (result) => set({ validationResult: result }),
      invalidateGeneration: () => set({ generatedFiles: [], validationResult: null }),

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
        generatedFiles: state.generatedFiles,
        validationResult: state.validationResult,
      }),
    }
  )
);
