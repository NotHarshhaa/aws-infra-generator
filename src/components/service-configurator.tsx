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
import { useEffect } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Network,
  Server,
  HardDrive,
  Database,
  Shield,
  GitFork,
};

interface ServiceConfiguratorProps {
  onBackToHome: () => void;
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

  useEffect(() => {
    initServiceConfig();
  }, [initServiceConfig]);

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
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-infra"
                className="h-9 sm:h-10"
              />
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
                              className="flex items-center justify-between rounded-lg border p-3"
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
                                  updateServiceConfig(
                                    serviceId,
                                    field.name,
                                    checked
                                  )
                                }
                              />
                            </div>
                          );
                        }

                        if (field.type === "select") {
                          return (
                            <div key={field.name} className="space-y-2">
                              <Label>{field.label}</Label>
                              <Select
                                value={String(value)}
                                onValueChange={(v) =>
                                  v && updateServiceConfig(
                                    serviceId,
                                    field.name,
                                    v
                                  )
                                }
                              >
                                <SelectTrigger>
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
                            </div>
                          );
                        }

                        if (field.type === "number") {
                          return (
                            <div key={field.name} className="space-y-2">
                              <Label>{field.label}</Label>
                              <Input
                                type="number"
                                value={value as number}
                                onChange={(e) =>
                                  updateServiceConfig(
                                    serviceId,
                                    field.name,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                              {field.description && (
                                <p className="text-xs text-muted-foreground">
                                  {field.description}
                                </p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div key={field.name} className="space-y-2">
                            <Label>{field.label}</Label>
                            <Input
                              value={String(value)}
                              onChange={(e) =>
                                updateServiceConfig(
                                  serviceId,
                                  field.name,
                                  e.target.value
                                )
                              }
                            />
                            {field.description && (
                              <p className="text-xs text-muted-foreground">
                                {field.description}
                              </p>
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
        <Button onClick={() => setStep("generate")} size="lg" className="w-full sm:w-auto">
          Generate Infrastructure
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
