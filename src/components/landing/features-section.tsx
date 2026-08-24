import { LANDING_FEATURES } from "./landing-data";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";

export function FeaturesSection() {
  return (
    <LandingSection
      id="features"
      eyebrow="Capabilities"
      title="Next-Gen AWS Cloud Infrastructure Studio"
      description="From architecture blueprints and live compliance audits to CI/CD generation and FinOps right-sizing."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LANDING_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-3xl border border-border/80 bg-card/85 p-5 shadow-xs transition-all duration-300 hover:border-orange-500/40 hover:bg-card hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform duration-200">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground tracking-tight">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
