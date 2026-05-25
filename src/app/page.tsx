"use client";

import { useState, useEffect, useMemo } from "react";
import { Header, ScrollToTop } from "@/components/layout";
import {
  ServiceSelector,
  ServiceConfigurator,
  InfraGenerator,
  InfraExport,
} from "@/components/wizard";
import { WizardStepNav } from "@/components/wizard/shared";
import { LandingPage } from "@/components/landing";
import { useInfraStore } from "@/lib/store";
import { WizardStep } from "@/lib/types";

export default function Home() {
  const { currentStep, setStep, selectedServices, generatedFiles, isGenerationStale, reset } =
    useInfraStore();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const state = useInfraStore.getState();
    if (
      state.selectedServices.length > 0 ||
      state.generatedFiles.length > 0 ||
      state.currentStep !== "services"
    ) {
      setShowWizard(true);
    }
  }, []);

  const completedSteps = useMemo(() => {
    const steps: WizardStep[] = [];
    if (selectedServices.length > 0) steps.push("services");
    if (currentStep === "generate" || currentStep === "export")
      steps.push("configure");
    if (generatedFiles.length > 0) steps.push("generate");
    if (generatedFiles.length > 0 && !isGenerationStale) steps.push("export");
    return steps;
  }, [selectedServices, currentStep, generatedFiles, isGenerationStale]);

  const handleGetStarted = () => {
    setShowWizard(true);
    setStep("services");
  };

  const handleTemplateSelect = () => {
    setShowWizard(true);
    setStep("configure");
  };

  useEffect(() => {
    const handleOpenWizard = () => {
      setShowWizard(true);
      setStep("services");
    };

    window.addEventListener("open-wizard", handleOpenWizard);
    return () => window.removeEventListener("open-wizard", handleOpenWizard);
  }, [setStep]);

  const handleBackToHome = () => {
    setShowWizard(false);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header
        onBackToHome={handleBackToHome}
        showNav={!showWizard}
        onGetStarted={handleGetStarted}
      />
      <main className="flex-1 container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 pt-16 sm:pt-16 overflow-x-hidden">
        {!showWizard ? (
          <LandingPage
            onGetStarted={handleGetStarted}
            onTemplateSelect={handleTemplateSelect}
          />
        ) : (
          <>
            <WizardStepNav
              currentStep={currentStep}
              onStepClick={setStep}
              completedSteps={completedSteps}
            />
            <div className="max-w-6xl mx-auto">
              {currentStep === "services" && (
                <ServiceSelector onBackToHome={handleBackToHome} />
              )}
              {currentStep === "configure" && (
                <ServiceConfigurator onBackToHome={handleBackToHome} />
              )}
              {currentStep === "generate" && (
                <InfraGenerator onBackToHome={handleBackToHome} />
              )}
              {currentStep === "export" && (
                <InfraExport onBackToHome={handleBackToHome} />
              )}
            </div>
          </>
        )}
      </main>
      <ScrollToTop />
    </div>
  );
}
