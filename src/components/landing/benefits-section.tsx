import { BENEFITS } from "./landing-data";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";

export function BenefitsSection() {
  return (
    <LandingSection
      eyebrow="Enterprise Value"
      title="Engineered for Modern Platform & Cloud Teams"
      description="Accelerate delivery, enforce governance, and optimize infrastructure cost without operational friction."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {BENEFITS.map((benefit, index) => (
          <div
            key={benefit.title}
            className="rounded-3xl border border-border/80 bg-card/85 p-5 sm:p-6 shadow-xs transition-all duration-300 hover:border-orange-500/40 hover:shadow-md"
          >
            <div className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-xs font-bold text-orange-600 dark:text-orange-400 font-mono">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">{benefit.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
