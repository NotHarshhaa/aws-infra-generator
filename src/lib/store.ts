import { create } from "zustand";
import {
  WizardStep,
  ServiceConfig,
  Environment,
  OutputFormat,
  GeneratedFile,
  ValidationResult,
} from "./types";
import { getServiceById, getServiceDependencies } from "./aws-services";

interface InfraStore {
  // Wizard navigation
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;

  // Service selection
  selectedServices: string[];
  toggleService: (serviceId: string) => void;
  setSelectedServices: (services: string[]) => void;

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

  // Reset
  reset: () => void;
}

const initialState = {
  currentStep: "services" as WizardStep,
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

export const useInfraStore = create<InfraStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  toggleService: (serviceId) => {
    const { selectedServices } = get();
    let updated: string[];

    if (selectedServices.includes(serviceId)) {
      // When removing, also check if any remaining service depends on this
      updated = selectedServices.filter((id) => id !== serviceId);
    } else {
      // When adding, also add dependencies
      const deps = getServiceDependencies(serviceId);
      const toAdd = [serviceId, ...deps];
      updated = [...new Set([...selectedServices, ...toAdd])];
    }

    set({ selectedServices: updated });
  },

  setSelectedServices: (services) => set({ selectedServices: services }),

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

  setProjectName: (name) => set({ projectName: name }),
  setEnvironment: (env) => set({ environment: env }),
  setRegion: (region) => set({ region: region }),
  setOutputFormat: (format) => set({ outputFormat: format }),

  setIsGenerating: (val) => set({ isGenerating: val }),
  setGeneratedFiles: (files) => set({ generatedFiles: files }),
  setValidationResult: (result) => set({ validationResult: result }),

  reset: () => set(initialState),
}));
