import { CheckCircle2, Zap } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "./landing-data";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";
import { cn } from "@/lib/utils";

export function HowItWorksSection() {
  return (
    <LandingSection
      eyebrow="Process"
      title="How it works"
      description="Generate production-ready AWS infrastructure in three guided steps."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {HOW_IT_WORKS_STEPS.map((item, index) => (
            <div key={item.step} className="relative">
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%+0.25rem)] w-4 h-px bg-border" />
              )}

              <div className={landingStyles.cardAccent}>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white shadow-sm shadow-orange-500/20">
                    {item.step}
                  </span>
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>

                <h3 className="mt-3 text-sm sm:text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>

                <ul className="mt-3 space-y-1.5">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[11px] sm:text-xs">
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-orange-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className={cn(landingStyles.pill, "mx-auto w-fit px-4 py-2")}>
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">Ready in minutes, not hours</span>
          </div>
          <p className="mt-2 text-[11px] sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            Skip manual IaC writing and avoid common misconfigurations. Templates follow AWS best practices with security defaults.
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
