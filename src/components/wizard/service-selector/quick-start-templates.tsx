import { Zap, Star, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRESET_TEMPLATES, PresetTemplate } from "@/lib/preset-templates";
import { awsIconMap } from "@/components/shared/aws-icon-map";

interface QuickStartTemplatesProps {
  onSelectTemplate: (template: PresetTemplate) => void;
}

export function QuickStartTemplates({ onSelectTemplate }: QuickStartTemplatesProps) {
  return (
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
            const Icon = awsIconMap[template.icon];
            const isPopular = ["simple-web-app", "serverless-api", "static-website"].includes(template.id);

            return (
              <Card
                key={template.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border hover:border-primary/50 bg-background"
                onClick={() => onSelectTemplate(template)}
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
                    <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      {template.globalConfig.outputFormat === "terraform" ? "Terraform" : "CloudFormation"}
                    </Badge>
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
  );
}
