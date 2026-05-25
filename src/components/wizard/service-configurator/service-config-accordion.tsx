import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServiceById } from "@/lib/aws-services";
import { awsIconMap } from "@/components/shared/aws-icon-map";
import { ConfigField } from "./config-field";
import type { FieldError } from "./types";

interface ServiceConfigAccordionProps {
  selectedServices: string[];
  serviceConfig: Record<string, { config?: Record<string, unknown> }>;
  fieldErrors: FieldError;
  onFieldChange: (serviceId: string, fieldName: string, value: string | number | boolean) => void;
}

export function ServiceConfigAccordion({
  selectedServices,
  serviceConfig,
  fieldErrors,
  onFieldChange,
}: ServiceConfigAccordionProps) {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-6">
        <CardTitle className="text-sm sm:text-lg">Service Configuration</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Configure each selected AWS service
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion defaultValue={selectedServices} className="w-full">
          {selectedServices.map((serviceId) => {
            const service = getServiceById(serviceId);
            if (!service) return null;
            const Icon = awsIconMap[service.icon];
            const config = serviceConfig[serviceId]?.config || {};

            return (
              <AccordionItem key={serviceId} value={serviceId} className="px-3 sm:px-6">
                <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm sm:font-semibold">{service.name}</p>
                      <p className="text-xs text-muted-foreground font-normal hidden sm:block">
                        {service.configFields.length} configurable options
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-4 px-1 sm:px-0">
                    {service.configFields.map((field) => {
                      const value =
                        config[field.name] !== undefined
                          ? config[field.name]
                          : field.default;

                      return (
                        <ConfigField
                          key={field.name}
                          field={field}
                          value={value as string | number | boolean}
                          error={fieldErrors[serviceId]?.[field.name]}
                          onChange={(v) => onFieldChange(serviceId, field.name, v)}
                        />
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
