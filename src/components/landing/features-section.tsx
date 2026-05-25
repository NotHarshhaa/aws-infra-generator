import { LANDING_FEATURES } from "./landing-data";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";

export function FeaturesSection() {
  return (
    <LandingSection
      id="features"
      eyebrow="Capabilities"
      title="Everything you need to ship infra"
      description="From service selection to export — one workflow, no manual boilerplate."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {LANDING_FEATURES.map((feature) => (
          <div key={feature.title} className={landingStyles.card}>
            <div className={landingStyles.iconBox}>
              <feature.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h3 className="mt-3 text-sm sm:text-base font-semibold">{feature.title}</h3>
            <p className="mt-1 text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
