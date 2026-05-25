import { ArrowRight, Home, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getServiceById } from "@/lib/aws-services";
import type { ServiceStats } from "./types";

interface SelectedServicesFooterProps {
  selectedServices: string[];
  stats: ServiceStats;
  onBackToHome: () => void;
  onNext: () => void;
}

export function SelectedServicesFooter({
  selectedServices,
  stats,
  onBackToHome,
  onNext,
}: SelectedServicesFooterProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {selectedServices.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Selected</div>
                </div>
                {stats.requiredDependencies > 0 && (
                  <>
                    <div className="text-muted-foreground text-sm sm:text-base">+</div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {stats.requiredDependencies}
                      </div>
                      <div className="text-xs text-muted-foreground">Deps</div>
                    </div>
                  </>
                )}
                <div className="text-muted-foreground text-sm sm:text-base">=</div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.totalServices}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>~{stats.totalServices * 2} min setup</span>
              </div>
            </div>

            <div className="flex gap-2 sm:flex-row sm:gap-2">
              <Button variant="outline" size="sm" onClick={onBackToHome} className="flex-1 h-8 sm:h-9">
                <Home className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
              <Button
                onClick={onNext}
                disabled={selectedServices.length === 0}
                size="sm"
                className="flex-1 h-8 sm:h-9"
              >
                Configure
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-xs sm:text-sm text-muted-foreground">Selected services:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedServices.map((serviceId) => {
                    const service = getServiceById(serviceId);
                    return (
                      <Badge key={serviceId} variant="secondary" className="text-xs">
                        {service?.name || serviceId}
                      </Badge>
                    );
                  })}
                  {stats.requiredDependencies > 0 && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs">
                          +{stats.requiredDependencies} deps
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dependencies will be automatically included</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
