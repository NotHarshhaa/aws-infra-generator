import { BENEFITS } from "./landing-data";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";

export function BenefitsSection() {
  return (
    <LandingSection
      eyebrow="Benefits"
      title="Why choose AWS Infra Generator?"
      description="Save time, reduce errors, and keep infrastructure consistent across projects."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {BENEFITS.map((benefit, index) => (
          <div
            key={benefit.title}
            className={index % 2 === 0 ? landingStyles.card : landingStyles.cardAccent}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-500/15 text-xs font-bold text-orange-600 dark:text-orange-400">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">{benefit.title}</h3>
                <p className="mt-1 text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
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
