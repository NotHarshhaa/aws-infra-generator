import { Star, AlertTriangle, CheckCircle2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
              <div key={category.id} className="space-y-2.5">
                <div className="flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-md py-1.5 z-10">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold tracking-tight">{category.label}</h3>
                  <Badge variant="secondary" className="rounded-full text-[10px] h-4 px-2 font-medium">
                    {services.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-2.5">
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
                          "group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer",
                          "hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-xs",
                          isSelected
                            ? "border-orange-500/60 bg-gradient-to-br from-orange-500/10 via-card to-card shadow-xs ring-1 ring-orange-500/30"
                            : "border-border/70 bg-card/60"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                            isSelected
                              ? "bg-orange-500 text-white shadow-xs"
                              : "bg-muted/60 text-muted-foreground group-hover:bg-orange-500/15 group-hover:text-orange-600"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-semibold tracking-tight truncate">
                              {service.name}
                            </span>
                            {isPopular && (
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                            {service.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {service.dependencies.length > 0 && (
                              <span className={wizardStyles.tag + " border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"}>
                                <AlertTriangle className="h-2.5 w-2.5" />
                                {service.dependencies.length} req
                              </span>
                            )}
                            {isDependency && isSelected && (
                              <span className={wizardStyles.tag + " border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}>
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Auto-included
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className={cn(
                            "h-5 w-5 shrink-0 mt-0.5 rounded-full border flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-orange-500 border-orange-500 text-white shadow-xs"
                              : "border-border bg-background/80 group-hover:border-orange-500/60"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
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
