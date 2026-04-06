"use client";

import { useState, useCallback, useMemo } from "react";

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
  Zap,
  Globe,
  Package,
  MessageSquare,
  Bell,
  Activity,
  Cloud,
  Search,
  Filter,
  Star,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { AWS_SERVICES, SERVICE_CATEGORIES, getServiceById } from "@/lib/aws-services";
import { useInfraStore } from "@/lib/store";
import { PRESET_TEMPLATES, PresetTemplate } from "@/lib/preset-templates";
import { cn } from "@/lib/utils";

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
  // Add new icons to the map here
  // e.g. NewIcon,
};

interface ServiceSelectorProps {
  onBackToHome: () => void;
}

interface ServiceStats {
  totalServices: number;
  selectedServices: number;
  requiredDependencies: number;
  estimatedComplexity: "Low" | "Medium" | "High";
  estimatedCost: "Low" | "Medium" | "High";
}

export function ServiceSelector({ onBackToHome }: ServiceSelectorProps) {
  const { selectedServices, toggleService, setStep, applyPresetTemplate } = useInfraStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"manual" | "templates">("manual");

  const handlePresetTemplateSelect = (template: PresetTemplate) => {
    applyPresetTemplate(template);
    setStep("configure");
  };

  // Memoize expensive calculations
  const calculateStats = useCallback((): ServiceStats => {
    const allDependencies = new Set<string>();
    selectedServices.forEach(serviceId => {
      const service = getServiceById(serviceId);
      if (service) {
        service.dependencies.forEach(dep => allDependencies.add(dep));
      }
    });
    
    const totalServices = selectedServices.length + allDependencies.size;
    const complexity = totalServices <= 3 ? "Low" : totalServices <= 6 ? "Medium" : "High";
    const cost = totalServices <= 2 ? "Low" : totalServices <= 5 ? "Medium" : "High";
    
    return {
      totalServices,
      selectedServices: selectedServices.length,
      requiredDependencies: allDependencies.size,
      estimatedComplexity: complexity,
      estimatedCost: cost
    };
  }, [selectedServices]);

  const stats = calculateStats();

  // Memoize filtered services to prevent unnecessary recalculations
  const filteredServices = useMemo(() => {
    return AWS_SERVICES.filter(service => {
      const matchesSearch = searchQuery === "" || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || service.category === selectedCategory;
      const matchesPopular = !showPopularOnly || ["vpc", "ec2", "s3", "rds"].includes(service.id);
      
      return matchesSearch && matchesCategory && matchesPopular;
    });
  }, [searchQuery, selectedCategory, showPopularOnly]);

  // Memoize services by category
  const filteredServicesByCategory = useMemo(() => {
    return SERVICE_CATEGORIES.map(category => ({
      category,
      services: filteredServices.filter(s => s.category === category.id)
    })).filter(({ services }) => services.length > 0);
  }, [filteredServices]);

  const handleNext = () => {
    setStep("configure");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">Select AWS Services</h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Choose the AWS services you need for your infrastructure. Dependencies
          will be automatically resolved.
        </p>
      </div>

      {/* Preset Templates Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <CardTitle className="text-sm sm:text-lg">Quick Start Templates</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              Popular
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Get started instantly with pre-configured infrastructure templates. No setup required.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {PRESET_TEMPLATES.slice(0, 3).map((template) => {
              const Icon = iconMap[template.icon];
              const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(template.id);
              
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border hover:border-primary/50 bg-background"
                  onClick={() => handlePresetTemplateSelect(template)}
                >
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <CardTitle className="text-xs sm:text-sm font-medium truncate">
                              {template.name}
                            </CardTitle>
                            {isPopular && (
                              <Star className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          <CardDescription className="text-xs mt-1 line-clamp-2 hidden sm:block">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-2 sm:mb-3">
                      <Badge variant="outline" className="text-xs">
                        {template.estimatedServices} services
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.estimatedCost} cost
                      </Badge>
                      <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                        {template.difficulty}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2 sm:mb-3 hidden sm:flex">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button size="sm" className="w-full text-xs h-7 sm:h-8">
                      <ArrowRight className="mr-1 h-3 w-3" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selection Mode Toggle */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2 p-1 bg-muted rounded-lg w-full max-w-xs sm:max-w-md">
              <Button
                variant={selectionMode === "manual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectionMode("manual")}
                className="text-xs sm:text-sm flex-1 h-8 sm:h-9 px-2"
              >
                <Server className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Manual</span>
                <span className="xs:hidden">Manual</span>
              </Button>
              <Button
                variant={selectionMode === "templates" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectionMode("templates")}
                className="text-xs sm:text-sm flex-1 h-8 sm:h-9 px-2"
              >
                <Zap className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Templates</span>
                <span className="xs:hidden">Templates</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Infrastructure Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.selectedServices}</div>
              <div className="text-xs text-muted-foreground">Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.requiredDependencies}</div>
              <div className="text-xs text-muted-foreground">Dependencies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalServices}</div>
              <div className="text-xs text-muted-foreground">Total Services</div>
            </div>
            <div className="text-center">
              <Badge variant={stats.estimatedComplexity === 'High' ? 'destructive' : stats.estimatedComplexity === 'Medium' ? 'default' : 'secondary'}>
                {stats.estimatedComplexity} Complexity
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Estimated</div>
            </div>
            <div className="text-center">
              <Badge variant={stats.estimatedCost === 'High' ? 'destructive' : stats.estimatedCost === 'Medium' ? 'default' : 'secondary'}>
                {stats.estimatedCost} Cost
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Estimated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Selection or Templates */}
      {selectionMode === "templates" ? (
        /* All Templates View */
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <CardTitle className="text-sm sm:text-lg">All Preset Templates</CardTitle>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Choose from our complete library of pre-configured infrastructure templates.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PRESET_TEMPLATES.map((template) => {
                const Icon = iconMap[template.icon];
                const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(template.id);
                
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border hover:border-primary/50 bg-background"
                    onClick={() => handlePresetTemplateSelect(template)}
                  >
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <CardTitle className="text-sm sm:text-lg truncate">
                                {template.name}
                              </CardTitle>
                              {isPopular && (
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                              )}
                            </div>
                            <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <Badge className={`text-xs ${template.difficulty === "Beginner" ? "bg-green-100 text-green-800 border-green-200" : template.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                          {template.difficulty}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${template.estimatedCost === "Low" ? "text-green-600" : template.estimatedCost === "Medium" ? "text-yellow-600" : "text-red-600"}`}>
                          {template.estimatedCost} Cost
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.estimatedServices} Services
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 hidden sm:flex">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs sm:text-sm font-medium">Included Services:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.services.slice(0, 3).map(service => {
                            const serviceName = service.serviceId.toUpperCase();
                            return (
                              <Badge key={service.serviceId} variant="secondary" className="text-xs">
                                {serviceName}
                              </Badge>
                            );
                          })}
                          {template.services.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button className="w-full text-xs sm:text-sm h-8 sm:h-10">
                        <ArrowRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Use This Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Manual Service Selection View */
        <>
          {/* Search and Filters */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                Search & Filter Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm">Category:</Label>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant={!selectedCategory ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs h-7 px-2 sm:h-8 sm:px-3"
                    >
                      All
                    </Button>
                    {SERVICE_CATEGORIES.map(category => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="text-xs h-7 px-2 sm:h-8 sm:px-3"
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showPopularOnly}
                    onCheckedChange={setShowPopularOnly}
                  />
                  <Label className="text-xs sm:text-sm flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Popular only
                  </Label>
                </div>
              </div>
              
              {searchQuery && (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Found {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""}
                </div>
              )}
            </CardContent>
          </Card>

      {/* Enhanced Service Cards */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto overflow-x-hidden px-1">
        <div className="space-y-6">
          {filteredServicesByCategory.map(({ category, services }) => {
            const CategoryIcon = iconMap[category.icon];

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
                    const Icon = iconMap[service.icon];
                    const isDependency = selectedServices.some((sid) => {
                      const s = getServiceById(sid);
                      return s?.dependencies.includes(service.id) && sid !== service.id;
                    });
                    const isPopular = ["vpc", "ec2", "s3", "rds"].includes(service.id);
                    // Remove hover state for performance

                    return (
                      <Card
                        key={service.id}
                        className={cn(
                          "relative cursor-pointer hover:shadow-md",
                          isSelected &&
                            "border-primary ring-2 ring-primary/20 shadow-md",
                          isDependency && isSelected && "border-primary/50"
                        )}
                        onClick={() => toggleService(service.id)}
                        // Remove mouse events for performance
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
                              onCheckedChange={() => toggleService(service.id)}
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
                                  <Badge
                                    variant="secondary"
                                    className="text-xs gap-1"
                                  >
                                    <AlertTriangle className="h-2 w-2 sm:h-3 sm:w-3" />
                                    {service.dependencies.length} dep
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-medium">Required dependencies:</p>
                                    {service.dependencies.map(dep => {
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
        </>
      )}

      {/* Enhanced Actions - Only show for manual selection */}
      {selectionMode === "manual" && (
        <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{selectedServices.length}</div>
                    <div className="text-xs text-muted-foreground">Selected</div>
                  </div>
                  {stats.requiredDependencies > 0 && (
                    <>
                      <div className="text-muted-foreground text-sm sm:text-base">+</div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.requiredDependencies}</div>
                        <div className="text-xs text-muted-foreground">Deps</div>
                      </div>
                    </>
                  )}
                  <div className="text-muted-foreground text-sm sm:text-base">=</div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.totalServices}</div>
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
                  onClick={handleNext}
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
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Selected services:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedServices.map(serviceId => {
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
      )}
    </div>
  );
}
