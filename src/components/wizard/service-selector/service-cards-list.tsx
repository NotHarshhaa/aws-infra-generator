import { Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getServiceById } from "@/lib/aws-services";
import { awsIconMap } from "@/components/shared/aws-icon-map";
import { wizardStyles, WizardPanel } from "@/components/wizard/shared";
import { cn } from "@/lib/utils";
import type { AWSService } from "@/lib/types";
import type { SERVICE_CATEGORIES } from "@/lib/aws-services";

type CategoryMeta = (typeof SERVICE_CATEGORIES)[number];

interface ServiceCardsListProps {
  categories: { category: CategoryMeta; services: AWSService[] }[];
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
}

export function ServiceCardsList({
  categories,
  selectedServices,
  onToggleService,
}: ServiceCardsListProps) {
  return (
    <WizardPanel title="Service Catalog" description="Tap to select · deps auto-included">
      <div className={wizardStyles.scrollList}>
        <div className="space-y-4">
          {categories.map(({ category, services }) => {
            const CategoryIcon = awsIconMap[category.icon];

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm py-1 z-10">
                  {CategoryIcon && (
                    <CategoryIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                  )}
                  <h3 className="text-xs sm:text-sm font-semibold">{category.label}</h3>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {services.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5 sm:gap-2">
                  {services.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    const Icon = awsIconMap[service.icon];
                    const isDependency = selectedServices.some((sid) => {
                      const s = getServiceById(sid);
                      return s?.dependencies.includes(service.id) && sid !== service.id;
                    });
                    const isPopular = ["vpc", "ec2", "s3", "rds"].includes(service.id);

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => onToggleService(service.id)}
                        className={cn(
                          "group flex w-full items-start gap-2 rounded-lg border p-2 sm:p-2.5 text-left transition-all",
                          "hover:border-orange-500/40 hover:bg-orange-500/5",
                          isSelected
                            ? "border-orange-500/50 bg-orange-500/10 ring-1 ring-orange-500/20"
                            : "border-border/70 bg-muted/20"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-md",
                            isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-muted text-muted-foreground group-hover:bg-orange-500/15 group-hover:text-orange-600"
                          )}
                        >
                          {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs sm:text-sm font-semibold truncate">
                              {service.name}
                            </span>
                            {isPopular && (
                              <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {service.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {service.dependencies.length > 0 && (
                              <span className={wizardStyles.tag + " border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"}>
                                <AlertTriangle className="h-2.5 w-2.5" />
                                {service.dependencies.length} dep
                              </span>
                            )}
                            {isDependency && isSelected && (
                              <span className={wizardStyles.tag + " border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}>
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Auto
                              </span>
                            )}
                          </div>
                        </div>

                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleService(service.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 shrink-0 mt-0.5"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WizardPanel>
  );
}
