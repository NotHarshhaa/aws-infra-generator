"use client";

import { Settings, ShieldCheck, Zap, RotateCcw, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useInfraStore,
  validateProjectName,
  normalizeProjectName,
} from "@/lib";
import { CostEstimator } from "@/components/wizard/cost-estimator/cost-estimator";
import { InfraDiagram } from "@/components/wizard/infra-diagram/infra-diagram";
import { TerraformPlanPreview } from "@/components/wizard/terraform-plan-preview/terraform-plan-preview";
import { wizardStyles, WizardHeader, GenerationStaleBanner } from "@/components/wizard/shared";
import { ProjectSettingsCard } from "./project-settings-card";
import { ConfigSummaryCard } from "./config-summary-card";
import { ServiceConfigAccordion } from "./service-config-accordion";
import { SecurityAuditCard } from "./security-audit-card";
import { ConfiguratorTabs } from "./configurator-tabs";
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
    backendType,
    setBackendType,
    ownerEmail,
    setOwnerEmail,
    costCenter,
    setCostCenter,
    applyBestPractices,
    applyFinOpsOptimizations,
    resetServiceConfigToDefault,
    resetAllServiceConfigs,
    setStep,
  } = useInfraStore();

  const {
    fieldErrors,
    validateField,
    validateAllFields,
    clearFieldError,
    setProjectNameError,
    hasValidationErrors,
    setFieldErrors,
  } = useConfigValidation(selectedServices, serviceConfig, projectName);

  useEffect(() => {
    initServiceConfig();
  }, [initServiceConfig, selectedServices]);

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
    const normalized = normalizeProjectName(name);
    setProjectName(normalized);
    const error = validateProjectName(normalized);
    setProjectNameError(error ?? undefined);
  };

  const handleApplyBestPractices = () => {
    applyBestPractices();
    toast.success("Security best practices applied (encryption, private subnets, access blocks).");
  };

  const handleApplyFinOps = () => {
    applyFinOpsOptimizations();
    toast.success("FinOps optimizations applied (switched to Graviton price/performance instances).");
  };

  const handleResetAllConfigs = () => {
    resetAllServiceConfigs();
    toast.info("All service parameters reset to standard defaults.");
  };

  const handleResetService = (serviceId: string) => {
    resetServiceConfigToDefault(serviceId);
    toast.info(`Reset ${serviceId.toUpperCase()} to default settings.`);
  };

  const handleContinue = () => {
    if (!validateAllFields()) {
      toast.error("Please resolve configuration errors before proceeding.");
      return;
    }
    setStep("generate");
  };

  const canContinue =
    selectedServices.length > 0 &&
    projectName.trim().length > 0 &&
    !hasValidationErrors;

  return (
    <div className={wizardStyles.shell}>
      <WizardHeader
        step="02"
        title="Configure Infrastructure"
        description="Fine-tune project options, regional constraints, and per-service parameters before generating IaC code."
        icon={Settings}
      />

      <GenerationStaleBanner />

      {/* Global Project Settings */}
      <ProjectSettingsCard
        projectName={projectName}
        region={region}
        environment={environment}
        outputFormat={outputFormat}
        backendType={backendType}
        ownerEmail={ownerEmail}
        costCenter={costCenter}
        projectNameError={fieldErrors.project?.projectName}
        onProjectNameChange={handleProjectNameChange}
        onRegionChange={setRegion}
        onEnvironmentChange={setEnvironment}
        onOutputFormatChange={setOutputFormat}
        onBackendTypeChange={setBackendType}
        onOwnerEmailChange={setOwnerEmail}
        onCostCenterChange={setCostCenter}
      />

      {/* 1-Click Optimization Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-orange-500" />
          <span>Quick Optimization Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleApplyBestPractices}
            className="h-7 sm:h-8 text-[11px] sm:text-xs gap-1.5 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Enforce Security Standards
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleApplyFinOps}
            className="h-7 sm:h-8 text-[11px] sm:text-xs gap-1.5 border-blue-500/30 hover:bg-blue-500/10 text-blue-700 dark:text-blue-300 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            FinOps Graviton Rightsizing
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetAllConfigs}
            className="h-7 sm:h-8 text-[11px] sm:text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset All
          </Button>
        </div>
      </div>

      <ConfigSummaryCard
        serviceCount={selectedServices.length}
        environment={environment}
        region={region}
        hasErrors={hasValidationErrors}
      />

      <SecurityAuditCard />

      <ConfiguratorTabs
        configuration={
          <ServiceConfigAccordion
            selectedServices={selectedServices}
            serviceConfig={serviceConfig}
            fieldErrors={fieldErrors}
            onFieldChange={handleFieldChange}
            onResetService={handleResetService}
            onResetAll={handleResetAllConfigs}
          />
        }
        cost={<CostEstimator />}
        diagram={<InfraDiagram />}
        plan={<TerraformPlanPreview />}
      />

      <ConfiguratorActions
        canContinue={canContinue}
        onBackToHome={onBackToHome}
        onBackToServices={() => setStep("services")}
        onContinue={handleContinue}
      />
    </div>
  );
}
