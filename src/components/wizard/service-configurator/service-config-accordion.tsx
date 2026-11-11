"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronsUpDown,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getServiceById, SERVICE_CATEGORIES } from "@/lib/aws-services";
import { awsIconMap } from "@/components/shared/aws-icon-map";
import { WizardPanel } from "@/components/wizard/shared";
import { ConfigField } from "./config-field";
import type { FieldError } from "./types";
import { cn } from "@/lib/utils";

interface ServiceConfigAccordionProps {
  selectedServices: string[];
  serviceConfig: Record<string, { config?: Record<string, unknown> }>;
  fieldErrors: FieldError;
  onFieldChange: (serviceId: string, fieldName: string, value: string | number | boolean) => void;
  onResetService?: (serviceId: string) => void;
  onResetAll?: () => void;
}

export function ServiceConfigAccordion({
  selectedServices,
  serviceConfig,
  fieldErrors,
  onFieldChange,
  onResetService,
  onResetAll,
}: ServiceConfigAccordionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [openItems, setOpenItems] = useState<string[]>(selectedServices);

  // Filter services by search and category
  const filteredServices = useMemo(() => {
    return selectedServices.filter((serviceId) => {
      const service = getServiceById(serviceId);
      if (!service) return false;

      const matchesCategory =
        categoryFilter === "all" || service.category === categoryFilter;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const matchesName = service.name.toLowerCase().includes(query);
      const matchesFields = service.configFields.some(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.label.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query)
      );

      return matchesName || matchesFields;
    });
  }, [selectedServices, categoryFilter, searchQuery]);

  const handleToggleAll = () => {
    if (openItems.length > 0) {
      setOpenItems([]);
    } else {
      setOpenItems(selectedServices);
    }
  };

  // Helper to count modified fields for a service
  const getModifiedCount = (serviceId: string) => {
    const service = getServiceById(serviceId);
    if (!service) return 0;
    const config = serviceConfig[serviceId]?.config || {};
    return service.configFields.filter((f) => {
      const current = config[f.name];
      return current !== undefined && current !== f.default;
    }).length;
  };

  // Helper to get prominent preview values
  const getPreviewPills = (serviceId: string) => {
    const config = serviceConfig[serviceId]?.config || {};
    const pills: string[] = [];

    if (serviceId === "ec2" && config.instance_type) {
      pills.push(String(config.instance_type));
      if (config.instance_count) pills.push(`${config.instance_count}x`);
    } else if (serviceId === "vpc" && config.cidr_block) {
      pills.push(String(config.cidr_block));
    } else if (serviceId === "rds" && config.instance_class) {
      pills.push(String(config.instance_class));
      if (config.engine) pills.push(String(config.engine));
    } else if (serviceId === "s3" && config.bucket_name) {
      pills.push(String(config.bucket_name));
    } else if (serviceId === "dynamodb" && config.table_name) {
      pills.push(String(config.table_name));
    } else if (serviceId === "lambda" && config.memory_size) {
      pills.push(`${config.memory_size}MB`);
    }

    return pills;
  };

  return (
    <WizardPanel
      title="Service Configuration"
      description="Fine-tune resources, scale settings & service-level parameters"
      icon={Sliders}
      action={
        <div className="flex items-center gap-2">
          {onResetAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetAll}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 cursor-pointer"
              title="Reset all services to defaults"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAll}
            className="h-7 text-xs gap-1 px-2 cursor-pointer"
          >
            <ChevronsUpDown className="h-3 w-3" />
            {openItems.length > 0 ? "Collapse All" : "Expand All"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parameters or services..."
              className="h-8 pl-8 text-xs bg-muted/20 border-border/70"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer",
                categoryFilter === "all"
                  ? "bg-orange-500 text-white font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              )}
            >
              All ({selectedServices.length})
            </button>
            {SERVICE_CATEGORIES.map((cat) => {
              const count = selectedServices.filter(
                (sid) => getServiceById(sid)?.category === cat.id
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer",
                    categoryFilter === cat.id
                      ? "bg-orange-500 text-white font-semibold"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion List */}
        {filteredServices.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-border/70 p-4">
            <p className="text-xs text-muted-foreground">
              No services match your search &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          <Accordion
            value={openItems}
            onValueChange={setOpenItems}
            className="w-full space-y-2 -mx-1"
          >
            {filteredServices.map((serviceId) => {
              const service = getServiceById(serviceId);
              if (!service) return null;
              const Icon = awsIconMap[service.icon];
              const config = serviceConfig[serviceId]?.config || {};
              const modifiedCount = getModifiedCount(serviceId);
              const previewPills = getPreviewPills(serviceId);
              const hasErrors =
                fieldErrors[serviceId] &&
                Object.values(fieldErrors[serviceId]).some(Boolean);

              return (
                <AccordionItem
                  key={serviceId}
                  value={serviceId}
                  className={cn(
                    "rounded-xl border px-3 transition-colors",
                    hasErrors
                      ? "border-red-500/50 bg-red-500/5"
                      : modifiedCount > 0
                      ? "border-orange-500/30 bg-orange-500/5"
                      : "border-border/70 bg-card hover:border-border"
                  )}
                >
                  <AccordionTrigger className="hover:no-underline py-2.5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between w-full pr-3 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs",
                            modifiedCount > 0
                              ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                        </div>
                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm truncate">
                              {service.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-4 capitalize text-muted-foreground"
                            >
                              {service.category}
                            </Badge>
                            {previewPills.map((pill, idx) => (
                              <span
                                key={idx}
                                className="hidden md:inline-flex text-[10px] font-mono px-1.5 py-0 rounded bg-muted/60 text-muted-foreground"
                              >
                                {pill}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-normal line-clamp-1">
                            {service.configFields.length} options available
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasErrors ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0 h-4 gap-1"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Error
                          </Badge>
                        ) : modifiedCount > 0 ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 font-medium"
                          >
                            {modifiedCount} customized
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-xs">
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {service.description}
                      </p>
                      {onResetService && modifiedCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => onResetService(serviceId)}
                          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-orange-500 gap-1 shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset {service.name}
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pb-3">
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
                            onChange={(v) =>
                              onFieldChange(serviceId, field.name, v)
                            }
                          />
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </WizardPanel>
  );
}
