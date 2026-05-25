import {
  Server,
  HardDrive,
  Database,
  Network,
  ShieldCheck,
  MessageSquare,
  Bell,
  Activity,
  Workflow,
  Package,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  SERVICES_OVERVIEW,
  COMPUTE_SERVICES,
  STORAGE_SERVICES,
  DATABASE_SERVICES,
  NETWORKING_SERVICES,
  MESSAGING_SERVICES,
  DEVOPS_SERVICES,
} from "../landing-data";
import { ServiceCategoryBlock } from "./service-category-block";

export function SupportedServicesSection() {
  return (
    <section className="space-y-6 sm:space-y-8 px-3 py-6 sm:py-12 overflow-x-hidden" id="services">
      <div className="text-center space-y-3 sm:space-y-4">
        <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1">
          Services
        </Badge>
        <h2 className="text-xl sm:text-3xl font-bold">Supported AWS Services</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto text-sm sm:text-lg">
          Generate infrastructure for 32+ AWS services with comprehensive configuration options and best practices
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 sm:gap-4 mb-6 sm:mb-8 sm:mb-12">
          {SERVICES_OVERVIEW.map((service) => (
            <div key={service.name} className="group relative">
              <div className="flex items-center gap-1.5 sm:gap-2 sm:gap-3 p-2 sm:p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md hover:border-primary/30">
                <service.icon className="h-4 w-4 sm:h-6 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm truncate">{service.name}</div>
                  <div className="text-xs text-muted-foreground capitalize hidden sm:block">{service.category}</div>
                </div>
                <div className="flex-shrink-0 hidden sm:block">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 sm:space-y-10">
          <ServiceCategoryBlock
            icon={Server}
            title="Compute Services"
            badge="4 Services"
            services={COMPUTE_SERVICES}
            gridClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          />
          <ServiceCategoryBlock
            icon={HardDrive}
            title="Storage Services"
            badge="2 Services"
            services={STORAGE_SERVICES}
            gridClass="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
          />
          <ServiceCategoryBlock
            icon={Database}
            title="Database Services"
            badge="3 Services"
            services={DATABASE_SERVICES}
          />
          <ServiceCategoryBlock
            icon={Network}
            title="Networking Services"
            badge="5 Services"
            services={NETWORKING_SERVICES}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 pb-2 border-b">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-bold">Security</h3>
                <Badge variant="outline" className="text-xs">1 Service</Badge>
              </div>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-bold text-lg">IAM</div>
                      <div className="text-sm text-muted-foreground">Access management service</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {["Roles & policies", "Fine-grained access", "Multi-factor auth"].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 pb-2 border-b">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-bold">Messaging</h3>
                <Badge variant="outline" className="text-xs">2 Services</Badge>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {MESSAGING_SERVICES.map((service) => (
                  <Card key={service.name} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                        <div>
                          <div className="font-bold text-lg">{service.name}</div>
                          <div className="text-sm text-muted-foreground">{service.desc}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {service.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 pb-2 border-b">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="text-lg sm:text-xl font-bold">Management & Monitoring</h3>
              <Badge variant="outline" className="text-xs">1 Service</Badge>
            </div>
            <Card className="hover:shadow-lg transition-shadow max-w-md">
              <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-bold text-lg">CloudWatch</div>
                    <div className="text-sm text-muted-foreground">Monitoring and observability</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {["Metrics", "Logs", "Alarms", "Dashboards"].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <ServiceCategoryBlock
            icon={Workflow}
            title="DevOps & CI/CD"
            badge="12 Services"
            services={DEVOPS_SERVICES}
          />
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold text-primary">32+ AWS Services Across 8 Categories</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Production-ready templates with best practices, security configurations, and comprehensive documentation
          </p>
        </div>
      </div>
    </section>
  );
}
