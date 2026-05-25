import {
  Star,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { getServiceById } from "@/lib/aws-services";
import { awsIconMap } from "@/components/shared/aws-icon-map";
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
    <div className="space-y-6 max-h-[600px] overflow-y-auto overflow-x-hidden px-1">
      <div className="space-y-6">
        {categories.map(({ category, services }) => {
          const CategoryIcon = awsIconMap[category.icon];

          return (
            <div key={category.id} className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                {CategoryIcon && (
                  <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                )}
                <h3 className="text-base sm:text-lg font-semibold">
                  {category.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {services.length}
                  </Badge>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                {services.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  const Icon = awsIconMap[service.icon];
                  const isDependency = selectedServices.some((sid) => {
                    const s = getServiceById(sid);
                    return s?.dependencies.includes(service.id) && sid !== service.id;
                  });
                  const isPopular = ["vpc", "ec2", "s3", "rds"].includes(service.id);

                  return (
                    <Card
                      key={service.id}
                      className={cn(
                        "relative cursor-pointer hover:shadow-md",
                        isSelected && "border-primary ring-2 ring-primary/20 shadow-md",
                        isDependency && isSelected && "border-primary/50"
                      )}
                      onClick={() => onToggleService(service.id)}
                    >
                      <CardHeader className="pb-1 sm:pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={cn(
                                "flex h-6 w-6 sm:h-10 sm:w-10 items-center justify-center rounded-lg",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {Icon && <Icon className="h-3 w-3 sm:h-5 sm:w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <CardTitle className="text-sm sm:text-base truncate">
                                  {service.name}
                                </CardTitle>
                                {isPopular && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Star className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Popular service</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </div>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleService(service.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 sm:h-5 sm:w-5"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 sm:line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                          {service.dependencies.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <AlertTriangle className="h-2 w-2 sm:h-3 sm:w-3" />
                                  {service.dependencies.length} dep
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">Required dependencies:</p>
                                  {service.dependencies.map((dep) => {
                                    const depService = getServiceById(dep);
                                    return (
                                      <div key={dep} className="text-xs">
                                        • {depService?.name || dep}
                                      </div>
                                    );
                                  })}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    These will be automatically included
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {isDependency && isSelected && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                          {service.configFields.length > 0 && (
                            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                              {service.configFields.length} config
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Separator className="mt-4" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
