import { ArrowRight } from "lucide-react";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";
import { cn } from "@/lib/utils";

const ENVIRONMENTS = [
  { name: "Development", tone: "muted" as const },
  { name: "Staging", tone: "muted" as const },
  { name: "Production", tone: "active" as const },
];

export function EnvironmentsSection() {
  return (
    <LandingSection
      eyebrow="Environments"
      title="Multi-environment support"
      description="Generate consistent infrastructure for every stage of your deployment pipeline."
    >
      <div className="max-w-3xl mx-auto">
        <div className={cn(landingStyles.panel, "p-4 sm:p-6")}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            {ENVIRONMENTS.map((env, index) => (
              <div key={env.name} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={cn(
                    env.tone === "active" ? landingStyles.pillActive : landingStyles.pill,
                    "min-w-[120px] justify-center px-4 py-2"
                  )}
                >
                  {env.name}
                </span>
                {index < ENVIRONMENTS.length - 1 && (
                  <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] sm:text-sm text-muted-foreground">
            Same services, same standards — tuned per environment with project name, region, and output format controls.
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
