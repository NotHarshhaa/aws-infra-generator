"use client";

import {
  Network,
  Server,
  HardDrive,
  Database,
  Shield,
  GitFork,
  ArrowLeft,
  ArrowRight,
  Home,
  Zap,
  Globe,
  Package,
  MessageSquare,
  Bell,
  Activity,
  Cloud,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { getServiceById, AWS_REGIONS } from "@/lib/aws-services";
import { useInfraStore } from "@/lib/store";
import { useEffect, useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Network,
  Server,
  HardDrive,
  Database,
  Shield,
  GitFork,
  Zap,
  Globe,
  Package,
  MessageSquare,
  Bell,
  Activity,
  Cloud,
};

interface ServiceConfiguratorProps {
  onBackToHome: () => void;
}

interface FieldError {
  [serviceId: string]: {
    [fieldName: string]: string | undefined;
  };
}

export function ServiceConfigurator({ onBackToHome }: ServiceConfiguratorProps) {
  const {
    selectedServices,
    serviceConfig,
    updateServiceConfig,
    initServiceConfig,
    projectName,
    setProjectName,
    environment,
    setEnvironment,
    region,
    setRegion,
    outputFormat,
    setOutputFormat,
    setStep,
  } = useInfraStore();

  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    initServiceConfig();
  }, [initServiceConfig]);

  const validateField = (serviceId: string, fieldName: string, value: any): string | null => {
    const service = getServiceById(serviceId);
    if (!service) return null;
    
    const field = service.configFields.find(f => f.name === fieldName);
    if (!field) return null;

    // Required field validation
    if (field.required && (value === undefined || value === null || value === "")) {
      return `${field.label} is required`;
    }

    // Number validation
    if (field.type === "number" && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      if (fieldName.includes("port") && (numValue < 1 || numValue > 65535)) {
        return `${field.label} must be between 1 and 65535`;
      }
      if (fieldName.includes("size") && numValue < 0) {
        return `${field.label} must be positive`;
      }
    }

    // Text validation
    if (field.type === "text" && typeof value === "string") {
      if (fieldName.includes("name") && value.length > 255) {
        return `${field.label} must be less than 255 characters`;
      }
      if (fieldName.includes("email") && value && !value.includes("@")) {
        return `${field.label} must be a valid email`;
      }
    }

    return null;
  };

  const handleFieldChange = (serviceId: string, fieldName: string, value: any) => {
    // Clear previous error for this field
    setFieldErrors(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [fieldName]: undefined
      }
    }));

    // Update the field value
    updateServiceConfig(serviceId, fieldName, value);

    // Validate the field
    const error = validateField(serviceId, fieldName, value);
    if (error) {
      setFieldErrors(prev => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          [fieldName]: error
        }
      }));
    }
  };

  const validateAllFields = (): boolean => {
    const errors: FieldError = {};
    let hasErrors = false;

    selectedServices.forEach(serviceId => {
      const service = getServiceById(serviceId);
      if (!service) return;

      const config = serviceConfig[serviceId]?.config || {};
      errors[serviceId] = {};

      service.configFields.forEach(field => {
        const error = validateField(serviceId, field.name, config[field.name]);
        if (error) {
          errors[serviceId][field.name] = error;
          hasErrors = true;
        }
      });
    });

    setFieldErrors(errors);
    return !hasErrors;
  };

  const handleGenerate = () => {
    if (!validateAllFields()) {
      return;
    }
    setIsGenerating(true);
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      setStep("generate");
    }, 1000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">Configure Infrastructure</h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Set project-level options and fine-tune each service configuration.
        </p>
      </div>

      {/* Global Configuration */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg">Project Settings</CardTitle>
          <CardDescription className="text-sm">
            General settings for your infrastructure project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="projectName" className="text-sm">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  // Basic project name validation
                  if (e.target.value.length > 0 && !/^[a-zA-Z0-9-_]+$/.test(e.target.value)) {
                    setFieldErrors(prev => ({
                      ...prev,
                      project: {
                        ...prev.project,
                        projectName: "Project name can only contain letters, numbers, hyphens, and underscores"
                      }
                    }));
                  } else {
                    setFieldErrors(prev => ({
                      ...prev,
                      project: {
                        ...prev.project,
                        projectName: undefined
                      }
                    }));
                  }
                }}
                placeholder="my-infra"
                className={`h-9 sm:h-10 ${fieldErrors.project?.projectName ? "border-red-500" : ""}`}
              />
              {fieldErrors.project?.projectName && (
                <p className="text-xs text-red-500">{fieldErrors.project.projectName}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="region" className="text-sm">AWS Region</Label>
              <Select value={region} onValueChange={(v) => v && setRegion(v)}>
                <SelectTrigger id="region" className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AWS_REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="environment" className="text-sm">Environment</Label>
              <Select
                value={environment}
                onValueChange={(v) =>
                  v && setEnvironment(v as "development" | "staging" | "production")
                }
              >
                <SelectTrigger id="environment" className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="format" className="text-sm">Output Format</Label>
              <Select
                value={outputFormat}
                onValueChange={(v) =>
                  v && setOutputFormat(v as "terraform" | "cloudformation")
                }
              >
                <SelectTrigger id="format" className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terraform">Terraform</SelectItem>
                  <SelectItem value="cloudformation">
                    CloudFormation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg">Configuration Summary</CardTitle>
          <CardDescription className="text-sm">
            Overview of your infrastructure configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{selectedServices.length}</div>
              <div className="text-sm text-muted-foreground">Services Selected</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{environment}</div>
              <div className="text-sm text-muted-foreground">Environment</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{region.split('-')[1]?.toUpperCase() || region}</div>
              <div className="text-sm text-muted-foreground">AWS Region</div>
            </div>
          </div>
          {Object.keys(fieldErrors).some(serviceId => 
            Object.values(fieldErrors[serviceId]).some(error => error)
          ) && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">
                ⚠️ Please fix validation errors before generating infrastructure
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Service Configuration */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg">Service Configuration</CardTitle>
          <CardDescription className="text-sm">
            Configure each selected AWS service
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion
            defaultValue={selectedServices}
            className="w-full"
          >
            {selectedServices.map((serviceId) => {
              const service = getServiceById(serviceId);
              if (!service) return null;
              const Icon = iconMap[service.icon];
              const config = serviceConfig[serviceId]?.config || {};

              return (
                <AccordionItem
                  key={serviceId}
                  value={serviceId}
                  className="px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {Icon && <Icon className="h-4 w-4" />}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {service.configFields.length} configurable options
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                      {service.configFields.map((field) => {
                        const value =
                          config[field.name] !== undefined
                            ? config[field.name]
                            : field.default;

                        if (field.type === "boolean") {
                          return (
                            <div
                              key={field.name}
                              className={`flex items-center justify-between rounded-lg border p-3 ${fieldErrors[serviceId]?.[field.name] ? "border-red-500" : ""}`}
                            >
                              <div className="space-y-0.5">
                                <Label className="text-sm">{field.label}</Label>
                                {field.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {field.description}
                                  </p>
                                )}
                              </div>
                              <Switch
                                checked={value as boolean}
                                onCheckedChange={(checked) =>
                                  handleFieldChange(serviceId, field.name, checked)
                                }
                              />
                            </div>
                          );
                        }

                        if (field.type === "select") {
                          return (
                            <div key={field.name} className="space-y-2">
                              <Label className={fieldErrors[serviceId]?.[field.name] ? "text-red-500" : ""}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              <Select
                                value={String(value)}
                                onValueChange={(v) =>
                                  v && handleFieldChange(serviceId, field.name, v)
                                }
                              >
                                <SelectTrigger className={fieldErrors[serviceId]?.[field.name] ? "border-red-500" : ""}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {field.description && (
                                <p className="text-xs text-muted-foreground">
                                  {field.description}
                                </p>
                              )}
                              {fieldErrors[serviceId]?.[field.name] && (
                                <p className="text-xs text-red-500">{fieldErrors[serviceId][field.name]}</p>
                              )}
                            </div>
                          );
                        }

                        if (field.type === "number") {
                          return (
                            <div key={field.name} className="space-y-2">
                              <Label className={fieldErrors[serviceId]?.[field.name] ? "text-red-500" : ""}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              <Input
                                type="number"
                                value={value as number}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  if (inputValue === "") {
                                    handleFieldChange(serviceId, field.name, 0);
                                  } else {
                                    const numValue = parseFloat(inputValue);
                                    if (!isNaN(numValue)) {
                                      handleFieldChange(serviceId, field.name, numValue);
                                    }
                                  }
                                }}
                                className={fieldErrors[serviceId]?.[field.name] ? "border-red-500" : ""}
                              />
                              {field.description && (
                                <p className="text-xs text-muted-foreground">
                                  {field.description}
                                </p>
                              )}
                              {fieldErrors[serviceId]?.[field.name] && (
                                <p className="text-xs text-red-500">{fieldErrors[serviceId][field.name]}</p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div key={field.name} className="space-y-2">
                            <Label className={fieldErrors[serviceId]?.[field.name] ? "text-red-500" : ""}>
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                              value={String(value)}
                              onChange={(e) =>
                                handleFieldChange(serviceId, field.name, e.target.value)
                              }
                              className={fieldErrors[serviceId]?.[field.name] ? "border-red-500" : ""}
                              placeholder=""
                            />
                            {field.description && (
                              <p className="text-xs text-muted-foreground">
                                {field.description}
                              </p>
                            )}
                            {fieldErrors[serviceId]?.[field.name] && (
                              <p className="text-xs text-red-500">{fieldErrors[serviceId][field.name]}</p>
                            )}
                          </div>
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

      <Separator />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={onBackToHome}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          <Button variant="outline" onClick={() => setStep("services")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
        </div>
        <Button 
          onClick={handleGenerate} 
          size="lg" 
          className="w-full sm:w-auto"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              Generate Infrastructure
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
