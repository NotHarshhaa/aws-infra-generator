"use client";

import {
  Network,
  DollarSign,
  Projector,
  Eye,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfraStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { CostEstimator } from "@/components/wizard/cost-estimator/cost-estimator";
import { InfraDiagram } from "@/components/wizard/infra-diagram/infra-diagram";
import { TerraformPlanPreview } from "@/components/wizard/terraform-plan-preview/terraform-plan-preview";
import { ProjectSettingsCard } from "./project-settings-card";
import { ConfigSummaryCard } from "./config-summary-card";
import { ServiceConfigAccordion } from "./service-config-accordion";
import { ConfiguratorActions } from "./configurator-actions";
import { useConfigValidation } from "./use-config-validation";
import type { ServiceConfiguratorProps } from "./types";

export function ServiceConfigurator({ onBackToHome }: ServiceConfiguratorProps) {
  const {
    selectedServices,
    serviceConfig,
    updateServiceConfig,
    initServiceConfig,
    projectName,
    setProjectName,
    environment,
    setEnvironment,
    region,
    setRegion,
    outputFormat,
    setOutputFormat,
    setStep,
  } = useInfraStore();

  const [isGenerating, setIsGenerating] = useState(false);

  const {
    fieldErrors,
    validateField,
    validateAllFields,
    clearFieldError,
    setProjectNameError,
    hasValidationErrors,
    setFieldErrors,
  } = useConfigValidation(selectedServices, serviceConfig);

  useEffect(() => {
    initServiceConfig();
  }, [initServiceConfig]);

  const handleFieldChange = (
    serviceId: string,
    fieldName: string,
    value: string | number | boolean
  ) => {
    clearFieldError(serviceId, fieldName);
    updateServiceConfig(serviceId, fieldName, value);

    const error = validateField(serviceId, fieldName, value);
    if (error) {
      setFieldErrors((prev) => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          [fieldName]: error,
        },
      }));
    }
  };

  const handleProjectNameChange = (name: string) => {
    setProjectName(name);
    if (name.length > 0 && !/^[a-zA-Z0-9-_]+$/.test(name)) {
      setProjectNameError(
        "Project name can only contain letters, numbers, hyphens, and underscores"
      );
    } else {
      setProjectNameError(undefined);
    }
  };

  const handleGenerate = () => {
    if (!validateAllFields()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setStep("generate");
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-lg sm:text-2xl font-bold">Configure Infrastructure</h2>
        <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Set project-level options and fine-tune each service configuration.
        </p>
      </div>

      <ProjectSettingsCard
        projectName={projectName}
        region={region}
        environment={environment}
        outputFormat={outputFormat}
        projectNameError={fieldErrors.project?.projectName}
        onProjectNameChange={handleProjectNameChange}
        onRegionChange={setRegion}
        onEnvironmentChange={setEnvironment}
        onOutputFormatChange={setOutputFormat}
      />

      <ConfigSummaryCard
        serviceCount={selectedServices.length}
        environment={environment}
        region={region}
        hasErrors={hasValidationErrors}
      />

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="configuration" className="text-xs sm:text-sm flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="cost" className="text-xs sm:text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Cost Estimate</span>
            <span className="sm:hidden">Cost</span>
          </TabsTrigger>
          <TabsTrigger value="diagram" className="text-xs sm:text-sm flex items-center gap-2">
            <Projector className="h-4 w-4" />
            <span className="hidden sm:inline">Diagram</span>
            <span className="sm:hidden">Diagram</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="text-xs sm:text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Plan Preview</span>
            <span className="sm:hidden">Plan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="mt-4">
          <ServiceConfigAccordion
            selectedServices={selectedServices}
            serviceConfig={serviceConfig}
            fieldErrors={fieldErrors}
            onFieldChange={handleFieldChange}
          />
        </TabsContent>

        <TabsContent value="cost" className="mt-4">
          <CostEstimator />
        </TabsContent>

        <TabsContent value="diagram" className="mt-4">
          <InfraDiagram />
        </TabsContent>

        <TabsContent value="plan" className="mt-4">
          <TerraformPlanPreview />
        </TabsContent>
      </Tabs>

      <Separator />

      <ConfiguratorActions
        isGenerating={isGenerating}
        onBackToHome={onBackToHome}
        onBackToServices={() => setStep("services")}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
