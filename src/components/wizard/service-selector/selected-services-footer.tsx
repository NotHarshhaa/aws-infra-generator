import { ArrowRight, Home, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getServiceById } from "@/lib/aws-services";
import { WizardActionBar, WizardPanel, WizardStatRow } from "@/components/wizard/shared";
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
    <>
      {selectedServices.length > 0 && (
        <WizardPanel title="Selection" bodyClassName="space-y-2">
          <WizardStatRow
            columns={3}
            stats={[
              { label: "Selected", value: selectedServices.length, valueClassName: "text-orange-600" },
              { label: "Deps", value: stats.requiredDependencies, valueClassName: "text-blue-600" },
              { label: "Total", value: stats.totalServices, valueClassName: "text-emerald-600" },
            ]}
          />
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            ~{stats.totalServices * 2} min setup
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {selectedServices.slice(0, 8).map((serviceId) => {
              const service = getServiceById(serviceId);
              return (
                <Badge key={serviceId} variant="secondary" className="text-[10px] h-5 px-1.5">
                  {service?.name || serviceId}
                </Badge>
              );
            })}
            {selectedServices.length > 8 && (
              <Badge variant="outline" className="text-[10px] h-5">
                +{selectedServices.length - 8}
              </Badge>
            )}
            {stats.requiredDependencies > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-[10px] h-5">
                    +{stats.requiredDependencies} deps
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Dependencies auto-included</TooltipContent>
              </Tooltip>
            )}
          </div>
        </WizardPanel>
      )}

      <WizardActionBar>
        <Button variant="outline" size="sm" onClick={onBackToHome} className="h-8 flex-1 sm:flex-none sm:h-9 text-xs">
          <Home className="mr-1.5 h-3.5 w-3.5" />
          Home
        </Button>
        <Button
          onClick={onNext}
          disabled={selectedServices.length === 0}
          size="sm"
          className="h-8 flex-1 sm:flex-none sm:h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white"
        >
          Configure
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </WizardActionBar>
    </>
  );
}
