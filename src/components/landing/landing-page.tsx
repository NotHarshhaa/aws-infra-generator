import { LandingHero } from "./landing-hero";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { EnvironmentsSection } from "./environments-section";
import { UseCasesSection } from "./use-cases-section";
import { BenefitsSection } from "./benefits-section";
import { TechnicalDetailsSection } from "./technical-details-section";
import { SupportedServicesSection } from "./supported-services/supported-services-section";
import { CreatorSection } from "./creator-section";
import { LandingFooter } from "./landing-footer";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <>
      <LandingHero onGetStarted={onGetStarted} />
      <FeaturesSection />
      <HowItWorksSection />
      <EnvironmentsSection />
      <UseCasesSection />
      <BenefitsSection />
      <TechnicalDetailsSection />
      <SupportedServicesSection />
      <CreatorSection />
      <LandingFooter />
    </>
  );
}
