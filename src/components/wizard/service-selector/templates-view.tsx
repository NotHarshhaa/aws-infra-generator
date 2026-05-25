"use client";

import { useMemo } from "react";
import { Zap, Star, ArrowRight, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRESET_TEMPLATES, PresetTemplate } from "@/lib/preset-templates";
import { SERVICE_CATEGORIES } from "@/lib/aws-services";
import { awsIconMap } from "@/components/shared/aws-icon-map";
import { WizardPanel } from "@/components/wizard/shared";
import { cn } from "@/lib/utils";

interface TemplatesViewProps {
  collapsedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onSelectTemplate: (template: PresetTemplate) => void;
}

export function TemplatesView({
  collapsedCategories,
  onToggleCategory,
  onSelectTemplate,
}: TemplatesViewProps) {
  const templatesByCategory = useMemo(() => {
    return PRESET_TEMPLATES.reduce(
      (acc, template) => {
        if (!acc[template.category]) acc[template.category] = [];
        acc[template.category].push(template);
        return acc;
      },
      {} as Record<string, PresetTemplate[]>
    );
  }, []);

  return (
    <WizardPanel title="All Templates" description="Browse by category" icon={Zap}>
      <div className="space-y-2">
        {Object.entries(templatesByCategory).map(([category, templates]) => {
          const categoryInfo = SERVICE_CATEGORIES.find((cat) => cat.id === category);
          const CategoryIcon = categoryInfo ? awsIconMap[categoryInfo.icon] : Package;
          const isCollapsed = collapsedCategories.has(category);

          return (
            <div key={category} className="rounded-lg border border-border/70 overflow-hidden">
              <button
                type="button"
                onClick={() => onToggleCategory(category)}
                className="flex w-full items-center justify-between gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5 text-orange-500 shrink-0" />}
                  <span className="text-xs sm:text-sm font-medium capitalize truncate">
                    {category}
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-4 shrink-0">
                    {templates.length}
                  </Badge>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>

              {!isCollapsed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 p-2">
                  {templates.map((template) => {
                    const Icon = awsIconMap[template.icon];
                    const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(
                      template.id
                    );

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => onSelectTemplate(template)}
                        className={cn(
                          "flex flex-col rounded-md border border-border/60 p-2 text-left",
                          "hover:border-orange-500/40 hover:bg-orange-500/5 transition-all"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-orange-500/15 text-orange-600">
                            {Icon && <Icon className="h-3 w-3" />}
                          </div>
                          <span className="text-xs font-semibold truncate flex-1">{template.name}</span>
                          {isPopular && (
                            <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex gap-1 mb-2">
                          <Badge className="text-[10px] h-4 px-1">{template.estimatedServices}</Badge>
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {template.difficulty.slice(0, 3)}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 inline-flex items-center gap-1">
                          Use <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </WizardPanel>
  );
}
