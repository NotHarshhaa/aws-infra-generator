import { Zap, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRESET_TEMPLATES, type PresetTemplate, cn } from "@/lib";
import { awsIconMap } from "@/components/shared/aws-icon-map";
import { WizardPanel } from "@/components/wizard/shared";

interface QuickStartTemplatesProps {
  onSelectTemplate: (template: PresetTemplate) => void;
}

export function QuickStartTemplates({ onSelectTemplate }: QuickStartTemplatesProps) {
  return (
    <WizardPanel
      variant="accent"
      title="Quick Start"
      description="Pre-built stacks · one click"
      icon={Zap}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PRESET_TEMPLATES.slice(0, 3).map((template) => {
          const Icon = awsIconMap[template.icon];
          const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(template.id);

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template)}
              className={cn(
                "group flex flex-col rounded-lg border border-border/70 bg-background/60 p-2.5 sm:p-3 text-left",
                "hover:border-orange-500/40 hover:bg-orange-500/5 transition-all hover:shadow-sm"
              )}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-500/15 text-orange-600">
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-semibold truncate">{template.name}</span>
                    {isPopular && <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 hidden sm:block">
                    {template.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge className="text-[10px] h-4 px-1 bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20">
                  {template.globalConfig.outputFormat === "terraform" ? "TF" : "CFN"}
                </Badge>
                <Badge variant="outline" className="text-[10px] h-4 px-1">
                  {template.estimatedServices} svc
                </Badge>
              </div>
              <span className="inline-flex items-center text-[10px] sm:text-xs font-medium text-orange-600 dark:text-orange-400 group-hover:gap-1.5 gap-1 transition-all">
                Use template <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          );
        })}
      </div>
    </WizardPanel>
  );
}
