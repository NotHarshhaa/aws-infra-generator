"use client";

import { useState, useMemo } from "react";
import { AWS_SERVICES, SERVICE_CATEGORIES } from "@/lib/aws-services";
import { useInfraStore } from "@/lib/store";
import { PresetTemplate } from "@/lib/preset-templates";
import { QuickStartTemplates } from "./quick-start-templates";
import { SelectionModeToggle } from "./selection-mode-toggle";
import { InfrastructureOverview } from "./infrastructure-overview";
import { TemplatesView } from "./templates-view";
import { ServiceSearchFilters } from "./service-search-filters";
import { ServiceCardsList } from "./service-cards-list";
import { SelectedServicesFooter } from "./selected-services-footer";
import { ClearAllDialog } from "./clear-all-dialog";
import { useServiceStats } from "./use-service-stats";
import type { ServiceSelectorProps } from "./types";

export function ServiceSelector({ onBackToHome }: ServiceSelectorProps) {
  const { selectedServices, toggleService, setStep, applyPresetTemplate, clearAllServices } =
    useInfraStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"manual" | "templates">("manual");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const stats = useServiceStats(selectedServices);

  const handlePresetTemplateSelect = (template: PresetTemplate) => {
    applyPresetTemplate(template);
    setStep("configure");
  };

  const handleClearAll = () => {
    if (selectedServices.length > 0) {
      setShowClearConfirm(true);
    }
  };

  const confirmClearAll = () => {
    clearAllServices();
    setShowClearConfirm(false);
    setSearchQuery("");
    setSelectedCategory(null);
    setShowPopularOnly(false);
  };

  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredServices = useMemo(() => {
    return AWS_SERVICES.filter((service) => {
      const matchesSearch =
        searchQuery === "" ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || service.category === selectedCategory;
      const matchesPopular =
        !showPopularOnly || ["vpc", "ec2", "s3", "rds"].includes(service.id);

      return matchesSearch && matchesCategory && matchesPopular;
    });
  }, [searchQuery, selectedCategory, showPopularOnly]);

  const filteredServicesByCategory = useMemo(() => {
    return SERVICE_CATEGORIES.map((category) => ({
      category,
      services: filteredServices.filter((s) => s.category === category.id),
    })).filter(({ services }) => services.length > 0);
  }, [filteredServices]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">Select AWS Services</h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Choose the AWS services you need for your infrastructure. Dependencies
          will be automatically resolved.
        </p>
      </div>

      <QuickStartTemplates onSelectTemplate={handlePresetTemplateSelect} />
      <SelectionModeToggle mode={selectionMode} onModeChange={setSelectionMode} />
      <InfrastructureOverview
        stats={stats}
        hasSelection={selectedServices.length > 0}
        onClearAll={handleClearAll}
      />

      {selectionMode === "templates" ? (
        <TemplatesView
          collapsedCategories={collapsedCategories}
          onToggleCategory={toggleCategoryCollapse}
          onSelectTemplate={handlePresetTemplateSelect}
        />
      ) : (
        <>
          <ServiceSearchFilters
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            showPopularOnly={showPopularOnly}
            filteredCount={filteredServices.length}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onPopularOnlyChange={setShowPopularOnly}
          />
          <ServiceCardsList
            categories={filteredServicesByCategory}
            selectedServices={selectedServices}
            onToggleService={toggleService}
          />
        </>
      )}

      {selectionMode === "manual" && (
        <SelectedServicesFooter
          selectedServices={selectedServices}
          stats={stats}
          onBackToHome={onBackToHome}
          onNext={() => setStep("configure")}
        />
      )}

      {showClearConfirm && (
        <ClearAllDialog
          selectedCount={selectedServices.length}
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={confirmClearAll}
        />
      )}
    </div>
  );
}
