"use client";

import { useMemo } from "react";
import { Zap, Star, ArrowRight, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRESET_TEMPLATES, PresetTemplate } from "@/lib/preset-templates";
import { SERVICE_CATEGORIES } from "@/lib/aws-services";
import { awsIconMap } from "@/components/shared/aws-icon-map";

interface TemplatesViewProps {
  collapsedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onSelectTemplate: (template: PresetTemplate) => void;
}

export function TemplatesView({
  collapsedCategories,
  onToggleCategory,
  onSelectTemplate,
}: TemplatesViewProps) {
  const templatesByCategory = useMemo(() => {
    return PRESET_TEMPLATES.reduce(
      (acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
      },
      {} as Record<string, PresetTemplate[]>
    );
  }, []);

  return (
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
      <CardContent className="space-y-4 sm:space-y-6">
        {Object.entries(templatesByCategory).map(([category, templates]) => {
          const categoryInfo = SERVICE_CATEGORIES.find((cat) => cat.id === category);
          const CategoryIcon = categoryInfo ? awsIconMap[categoryInfo.icon] : Package;
          const isCollapsed = collapsedCategories.has(category);

          return (
            <Card key={category} className="border border-border/50">
              <CardHeader
                className="pb-2 sm:pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onToggleCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {CategoryIcon && <CategoryIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-sm sm:text-base capitalize">
                        {category} Templates
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {templates.length} template{templates.length !== 1 ? "s" : ""} available
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {templates.length}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                      {isCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isCollapsed && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {templates.map((template) => {
                      const Icon = awsIconMap[template.icon];
                      const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(
                        template.id
                      );

                      return (
                        <Card
                          key={template.id}
                          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border hover:border-primary/50 bg-background"
                          onClick={() => onSelectTemplate(template)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <CardTitle className="text-xs sm:text-sm font-medium truncate">
                                    {template.name}
                                  </CardTitle>
                                  {isPopular && (
                                    <Star className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0 space-y-2">
                            <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                {template.globalConfig.outputFormat === "terraform"
                                  ? "Terraform"
                                  : "CloudFormation"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {template.estimatedServices}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {template.difficulty.slice(0, 3)}
                              </Badge>
                            </div>
                            <Button size="sm" className="w-full text-xs h-7 sm:h-8">
                              <ArrowRight className="mr-1 h-3 w-3" />
                              Use
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
