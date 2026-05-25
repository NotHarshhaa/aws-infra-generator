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
import {
  SERVICES_OVERVIEW,
  COMPUTE_SERVICES,
  STORAGE_SERVICES,
  DATABASE_SERVICES,
  NETWORKING_SERVICES,
  MESSAGING_SERVICES,
  DEVOPS_SERVICES,
} from "../landing-data";
import { LandingSection } from "../shared/landing-section";
import { landingStyles } from "../shared/landing-styles";
import { cn } from "@/lib/utils";
import { ServiceCategoryBlock } from "./service-category-block";

export function SupportedServicesSection() {
  return (
    <LandingSection
      id="services"
      eyebrow="Services"
      title="Supported AWS services"
      description="Generate infrastructure for 32+ services with configuration options and best-practice defaults."
    >
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {SERVICES_OVERVIEW.map((service) => (
            <div
              key={service.name}
              className={cn(
                landingStyles.card,
                "p-2.5 sm:p-3 flex items-center gap-2 hover:border-orange-500/30"
              )}
            >
              <service.icon className="h-4 w-4 shrink-0 text-orange-500" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[11px] sm:text-xs truncate">{service.name}</div>
                <div className="text-[10px] text-muted-foreground capitalize hidden sm:block truncate">
                  {service.category}
                </div>
              </div>
              <span className="hidden sm:block h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
            </div>
          ))}
        </div>

        <div className="space-y-6 sm:space-y-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border/60">
                <div className={landingStyles.iconBox}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold">Security</h3>
                <span className={landingStyles.pill}>1 Service</span>
              </div>
              <div className={landingStyles.card}>
                <div className="flex items-start gap-3">
                  <div className={landingStyles.iconBox}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">IAM</div>
                    <div className="text-[11px] sm:text-sm text-muted-foreground">
                      Access management service
                    </div>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {["Roles & policies", "Fine-grained access", "Multi-factor auth"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-orange-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border/60">
                <div className={landingStyles.iconBox}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold">Messaging</h3>
                <span className={landingStyles.pill}>2 Services</span>
              </div>
              <div className="space-y-3">
                {MESSAGING_SERVICES.map((service) => (
                  <div key={service.name} className={landingStyles.card}>
                    <div className="flex items-start gap-3">
                      <div className={landingStyles.iconBox}>
                        <service.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold">{service.name}</div>
                        <div className="text-[11px] sm:text-sm text-muted-foreground">{service.desc}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {service.features.map((feature) => (
                        <span key={feature} className={landingStyles.pill}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border/60">
              <div className={landingStyles.iconBox}>
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold">Management & Monitoring</h3>
              <span className={landingStyles.pill}>1 Service</span>
            </div>
            <div className={cn(landingStyles.card, "max-w-md")}>
              <div className="flex items-start gap-3">
                <div className={landingStyles.iconBox}>
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">CloudWatch</div>
                  <div className="text-[11px] sm:text-sm text-muted-foreground">
                    Monitoring and observability
                  </div>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {["Metrics", "Logs", "Alarms", "Dashboards"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ServiceCategoryBlock
            icon={Workflow}
            title="DevOps & CI/CD"
            badge="12 Services"
            services={DEVOPS_SERVICES}
          />
        </div>

        <div className="text-center">
          <div className={cn(landingStyles.pillActive, "mx-auto w-fit px-4 py-2")}>
            <Package className="h-4 w-4" />
            32+ AWS services across 8 categories
          </div>
          <p className="mt-2 text-[11px] sm:text-sm text-muted-foreground">
            Production-ready templates with security configurations and documentation
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
