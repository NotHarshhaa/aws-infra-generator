"use client";

import {
  Network,
  Server,
  HardDrive,
  Database,
  Shield,
  GitFork,
  Info,
  ArrowRight,
  Home,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { AWS_SERVICES, SERVICE_CATEGORIES, getServiceById } from "@/lib/aws-services";
import { useInfraStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Network,
  Server,
  HardDrive,
  Database,
  Shield,
  GitFork,
};

interface ServiceSelectorProps {
  onBackToHome: () => void;
}

export function ServiceSelector({ onBackToHome }: ServiceSelectorProps) {
  const { selectedServices, toggleService, setStep } = useInfraStore();

  const handleNext = () => {
    setStep("configure");
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Select AWS Services</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the AWS services you need for your infrastructure. Dependencies
          will be automatically resolved.
        </p>
      </div>

      {SERVICE_CATEGORIES.map((category) => {
        const services = AWS_SERVICES.filter((s) => s.category === category.id);
        if (services.length === 0) return null;
        const CategoryIcon = iconMap[category.icon];

        return (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center gap-2">
              {CategoryIcon && (
                <CategoryIcon className="h-5 w-5 text-muted-foreground" />
              )}
              <h3 className="text-lg font-semibold">{category.label}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                const Icon = iconMap[service.icon];
                const isDependency = selectedServices.some((sid) => {
                  const s = getServiceById(sid);
                  return s?.dependencies.includes(service.id) && sid !== service.id;
                });

                return (
                  <Card
                    key={service.id}
                    className={cn(
                      "relative cursor-pointer transition-all hover:shadow-md",
                      isSelected &&
                        "border-primary ring-2 ring-primary/20 shadow-md",
                      isDependency && isSelected && "border-primary/50"
                    )}
                    onClick={() => toggleService(service.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {Icon && <Icon className="h-5 w-5" />}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {service.name}
                            </CardTitle>
                          </div>
                        </div>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleService(service.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {service.dependencies.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="secondary"
                                className="text-xs gap-1"
                              >
                                <Info className="h-3 w-3" />
                                Requires:{" "}
                                {service.dependencies
                                  .map(
                                    (d) =>
                                      getServiceById(d)?.name || d
                                  )
                                  .join(", ")}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                These services will be automatically included
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {isDependency && isSelected && (
                          <Badge variant="outline" className="text-xs">
                            Auto-included
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

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" size="sm" onClick={onBackToHome}>
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {selectedServices.length} service
            {selectedServices.length !== 1 ? "s" : ""} selected
          </p>
          <Button
            onClick={handleNext}
            disabled={selectedServices.length === 0}
            size="lg"
          >
            Configure Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
