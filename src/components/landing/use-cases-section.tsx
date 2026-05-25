import { USE_CASES } from "./landing-data";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";

export function UseCasesSection() {
  return (
    <LandingSection
      eyebrow="Audience"
      title="Built for teams like yours"
      description="Whether you are learning, prototyping, or standardizing platform patterns."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {USE_CASES.map((useCase) => (
          <div key={useCase.title} className={landingStyles.card}>
            <div className={landingStyles.iconBox}>
              <useCase.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h3 className="mt-3 text-sm sm:text-base font-semibold">{useCase.title}</h3>
            <p className="mt-1 text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
              {useCase.desc}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
