"use client";

import { useState } from "react";
import {
  Globe,
  Zap,
  Package,
  Database,
  GitBranch,
  Server,
  Star,
  ArrowRight,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useInfraStore } from "@/lib/store";
import { PRESET_TEMPLATES, PresetTemplate } from "@/lib/preset-templates";
import { landingStyles } from "@/components/landing/shared/landing-styles";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Zap,
  Package,
  Database,
  GitBranch,
  Server,
  Shield,
  TrendingUp,
};

const difficultyTone: Record<string, string> = {
  Beginner: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  Intermediate: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  Advanced: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
};

interface PresetTemplatesProps {
  onTemplateSelect?: () => void;
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        active ? landingStyles.pillActive : landingStyles.pill,
        "cursor-pointer transition-colors shrink-0"
      )}
    >
      {children}
    </button>
  );
}

export function PresetTemplates({ onTemplateSelect }: PresetTemplatesProps) {
  const { applyPresetTemplate, setStep } = useInfraStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  const filteredTemplates = PRESET_TEMPLATES.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || template.difficulty === selectedDifficulty;
    const matchesPopular =
      !showPopularOnly ||
      ["simple-web-app", "serverless-api", "static-website"].includes(template.id);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesPopular;
  });

  const handleTemplateSelect = (template: PresetTemplate) => {
    applyPresetTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect();
    } else {
      setStep("configure");
    }
  };

  const categories = [
    { id: "web", label: "Web", icon: Globe },
    { id: "api", label: "API", icon: Zap },
    { id: "database", label: "Data", icon: Database },
    { id: "microservices", label: "Microservices", icon: Package },
    { id: "serverless", label: "Serverless", icon: Zap },
    { id: "ml", label: "ML", icon: TrendingUp },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className={landingStyles.sectionHeader}>
        <span className={landingStyles.eyebrow}>Templates</span>
        <h2 className={landingStyles.sectionTitle}>Preset templates</h2>
        <p className={landingStyles.sectionDesc}>
          Jump-start with pre-configured stacks for common AWS architectures.
        </p>
      </div>

      <div className={cn(landingStyles.panel, "overflow-hidden")}>
        <div className="border-b border-border/60 px-3 py-3 sm:px-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold">Find templates</span>
        </div>
        <div className="p-3 sm:p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1.5 block">Category</Label>
              <div className={landingStyles.filterRail}>
                <div className={cn(landingStyles.filterList, "gap-1.5 py-0.5")}>
                  <FilterPill active={!selectedCategory} onClick={() => setSelectedCategory(null)}>
                    All
                  </FilterPill>
                  {categories.map((category) => (
                    <FilterPill
                      key={category.id}
                      active={selectedCategory === category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <category.icon className="h-3 w-3" />
                      {category.label}
                    </FilterPill>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground mb-1.5 block">Difficulty</Label>
              <div className={landingStyles.filterRail}>
                <div className={cn(landingStyles.filterList, "gap-1.5 py-0.5")}>
                  <FilterPill active={!selectedDifficulty} onClick={() => setSelectedDifficulty(null)}>
                    All
                  </FilterPill>
                  {(["Beginner", "Intermediate", "Advanced"] as const).map((difficulty) => (
                    <FilterPill
                      key={difficulty}
                      active={selectedDifficulty === difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                    >
                      {difficulty}
                    </FilterPill>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={showPopularOnly} onCheckedChange={setShowPopularOnly} />
              <Label className="text-xs flex items-center gap-1 cursor-pointer">
                <Star className="h-3 w-3 text-yellow-500" />
                Popular only
              </Label>
            </div>
          </div>

          {(searchQuery || selectedCategory || selectedDifficulty || showPopularOnly) && (
            <p className="text-[11px] text-muted-foreground">
              Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredTemplates.map((template) => {
          const Icon = iconMap[template.icon];
          const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(
            template.id
          );

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateSelect(template)}
              className={cn(
                landingStyles.card,
                "text-left cursor-pointer hover:border-orange-500/35 hover:shadow-md"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={landingStyles.iconBox}>
                  {Icon && <Icon className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-semibold truncate">{template.name}</h3>
                    {isPopular && (
                      <Star className="h-3.5 w-3.5 shrink-0 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] sm:text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={cn(landingStyles.pill, difficultyTone[template.difficulty])}>
                  {template.difficulty}
                </span>
                <span className={landingStyles.pill}>{template.estimatedCost} cost</span>
                <span className={landingStyles.pill}>{template.estimatedServices} services</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={landingStyles.pill}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {template.services.slice(0, 4).map((service) => (
                  <span key={service.serviceId} className={landingStyles.pill}>
                    {service.serviceId.toUpperCase()}
                  </span>
                ))}
                {template.services.length > 4 && (
                  <span className={landingStyles.pill}>+{template.services.length - 4}</span>
                )}
              </div>

              <span className={cn(landingStyles.pillActive, "mt-4 w-full justify-center py-2")}>
                Use template
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className={cn(landingStyles.panel, "p-6 text-center space-y-3")}>
          <p className="text-sm text-muted-foreground">No templates match your filters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
              setSelectedDifficulty(null);
              setShowPopularOnly(false);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
