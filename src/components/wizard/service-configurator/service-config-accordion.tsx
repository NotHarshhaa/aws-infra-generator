import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServiceById } from "@/lib/aws-services";
import { awsIconMap } from "@/components/shared/aws-icon-map";
import { WizardPanel } from "@/components/wizard/shared";
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
    <WizardPanel title="Service Configuration" description="Fine-tune each service">
      <Accordion defaultValue={selectedServices} className="w-full -mx-1">
        {selectedServices.map((serviceId) => {
          const service = getServiceById(serviceId);
          if (!service) return null;
          const Icon = awsIconMap[service.icon];
          const config = serviceConfig[serviceId]?.config || {};

          return (
            <AccordionItem
              key={serviceId}
              value={serviceId}
              className="border-border/60 px-1"
            >
              <AccordionTrigger className="hover:no-underline py-2 sm:py-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/15 text-orange-600">
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-[10px] text-muted-foreground font-normal">
                      {service.configFields.length} options
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                  {service.configFields.map((field) => {
                    const value =
                      config[field.name] !== undefined ? config[field.name] : field.default;

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
    </WizardPanel>
  );
}
