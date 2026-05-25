"use client";

import { Settings } from "lucide-react";
import { useInfraStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { CostEstimator } from "@/components/wizard/cost-estimator/cost-estimator";
import { InfraDiagram } from "@/components/wizard/infra-diagram/infra-diagram";
import { TerraformPlanPreview } from "@/components/wizard/terraform-plan-preview/terraform-plan-preview";
import { wizardStyles, WizardHeader } from "@/components/wizard/shared";
import { ProjectSettingsCard } from "./project-settings-card";
import { ConfigSummaryCard } from "./config-summary-card";
import { ServiceConfigAccordion } from "./service-config-accordion";
import { ConfiguratorActions } from "./configurator-actions";
import { ConfiguratorTabs } from "./configurator-tabs";
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
        [serviceId]: { ...prev[serviceId], [fieldName]: error },
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
    <div className={wizardStyles.shell}>
      <WizardHeader
        step="02"
        title="Configure Infrastructure"
        description="Set project options and tune each service before generation."
        icon={Settings}
      />

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

      <ConfiguratorTabs
        configuration={
          <ServiceConfigAccordion
            selectedServices={selectedServices}
            serviceConfig={serviceConfig}
            fieldErrors={fieldErrors}
            onFieldChange={handleFieldChange}
          />
        }
        cost={<CostEstimator />}
        diagram={<InfraDiagram />}
        plan={<TerraformPlanPreview />}
      />

      <ConfiguratorActions
        isGenerating={isGenerating}
        onBackToHome={onBackToHome}
        onBackToServices={() => setStep("services")}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
