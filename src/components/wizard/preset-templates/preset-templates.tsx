"use client";

import { useState } from "react";
import {
  Globe,
  Zap,
  Package,
  Database,
  GitBranch,
  Server,
  Clock,
  Star,
  ArrowRight,
  Search,
  Filter,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useInfraStore } from "@/lib/store";
import { PRESET_TEMPLATES, getTemplateById, PresetTemplate } from "@/lib/preset-templates";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Zap,
  Package,
  Database,
  GitBranch,
  Server,
  Shield,
  TrendingUp,
};

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800 border-green-200",
  Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Advanced: "bg-red-100 text-red-800 border-red-200",
};

const costColors = {
  Low: "text-green-600",
  Medium: "text-yellow-600",
  High: "text-red-600",
};

interface PresetTemplatesProps {
  onTemplateSelect?: () => void;
}

export function PresetTemplates({ onTemplateSelect }: PresetTemplatesProps) {
  const { applyPresetTemplate, setStep } = useInfraStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  // Filter templates
  const filteredTemplates = PRESET_TEMPLATES.filter(template => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || template.difficulty === selectedDifficulty;
    const matchesPopular = !showPopularOnly || ["simple-web-app", "serverless-api", "static-website"].includes(template.id);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesPopular;
  });

  const handleTemplateSelect = (template: PresetTemplate) => {
    applyPresetTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect();
    } else {
      setStep("configure");
    }
  };

  const categories = [
    { id: "web", label: "Web Applications", icon: Globe },
    { id: "api", label: "API Services", icon: Zap },
    { id: "database", label: "Data & Analytics", icon: Database },
    { id: "microservices", label: "Microservices", icon: Package },
    { id: "serverless", label: "Serverless", icon: Zap },
    { id: "ml", label: "Machine Learning", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold">Preset Templates</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start with pre-configured infrastructure templates. All services and settings are pre-configured for common use cases.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name or description..."
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
                {categories.map(category => (
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
              <Label className="text-sm">Difficulty:</Label>
              <div className="flex gap-1">
                <Button
                  variant={!selectedDifficulty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(null)}
                >
                  All
                </Button>
                {["Beginner", "Intermediate", "Advanced"].map(difficulty => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty)}
                  >
                    {difficulty}
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
              Found {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const Icon = iconMap[template.icon];
          const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(template.id);
          
          return (
            <Card
              key={template.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {isPopular && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Metadata */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={difficultyColors[template.difficulty]}>
                    {template.difficulty}
                  </Badge>
                  <Badge variant="outline" className={costColors[template.estimatedCost]}>
                    {template.estimatedCost} Cost
                  </Badge>
                  <Badge variant="secondary">
                    {template.estimatedServices} Services
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Services Preview */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Included Services:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.services.slice(0, 4).map(service => {
                      const serviceName = service.serviceId.toUpperCase();
                      return (
                        <Badge key={service.serviceId} variant="secondary" className="text-xs">
                          {serviceName}
                        </Badge>
                      );
                    })}
                    {template.services.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.services.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action */}
                <Button className="w-full">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">No templates found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setSelectedDifficulty(null);
                  setShowPopularOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
