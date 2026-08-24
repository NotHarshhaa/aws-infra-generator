import { Zap, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      title="Architecture Blueprints"
      description="Ready-to-deploy multi-service stacks with 1-click configuration"
      icon={Zap}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {PRESET_TEMPLATES.slice(0, 3).map((template) => {
          const Icon = awsIconMap[template.icon];
          const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(template.id);
          const formatLabel =
            template.globalConfig.outputFormat === "terraform"
              ? "Terraform"
              : template.globalConfig.outputFormat === "cdk"
              ? "AWS CDK"
              : "CloudFormation";

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template)}
              className={cn(
                "group flex flex-col justify-between rounded-2xl border border-border/70 bg-card/90 p-3.5 sm:p-4 text-left cursor-pointer transition-all duration-200",
                "hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-sm"
              )}
            >
              <div>
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/15">
                    {Icon && <Icon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold tracking-tight truncate">{template.name}</span>
                      {isPopular && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 mt-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge className="rounded-full text-[10px] h-4 px-2 bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20 font-medium">
                    {formatLabel}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px] h-4 px-1.5 text-muted-foreground">
                    {template.estimatedServices} services
                  </Badge>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </WizardPanel>
  );
}
