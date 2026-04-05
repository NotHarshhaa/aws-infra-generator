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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { selectedServices, toggleService, setStep } = useInfraStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  // Remove hover state to reduce re-renders

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

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Category:</Label>
              <div className="flex gap-1">
                <Button
                  variant={!selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {SERVICE_CATEGORIES.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
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
              <Label className="text-sm flex items-center gap-1">
                <Star className="h-3 w-3" />
                Popular only
              </Label>
            </div>
          </div>
          
          {searchQuery && (
            <div className="text-sm text-muted-foreground">
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
                                  "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">
                                    {service.name}
                                  </CardTitle>
                                  {isPopular && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
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
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
                            {service.dependencies.length > 0 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs gap-1"
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                    {service.dependencies.length} dependenc{service.dependencies.length !== 1 ? 'ies' : 'y'}
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
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Auto-included
                              </Badge>
                            )}
                            {service.configFields.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {service.configFields.length} config option{service.configFields.length !== 1 ? 's' : ''}
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

      {/* Enhanced Actions */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedServices.length}</div>
                    <div className="text-xs text-muted-foreground">Selected</div>
                  </div>
                  {stats.requiredDependencies > 0 && (
                    <>
                      <div className="text-muted-foreground">+</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.requiredDependencies}</div>
                        <div className="text-xs text-muted-foreground">Dependencies</div>
                      </div>
                    </>
                  )}
                  <div className="text-muted-foreground">=</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalServices}</div>
                    <div className="text-xs text-muted-foreground">Total Services</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated setup time: ~{stats.totalServices * 2} minutes</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" onClick={onBackToHome}>
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selectedServices.length === 0}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Configure Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {selectedServices.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
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
                            +{stats.requiredDependencies} dependencies
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
    </div>
  );
}
