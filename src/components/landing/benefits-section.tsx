import { CheckCircle2 } from "lucide-react";
import { BENEFITS } from "./landing-data";

export function BenefitsSection() {
  return (
    <section className="space-y-4 sm:space-y-6 px-3">
      <h2 className="text-xl sm:text-2xl font-bold text-center">Why Choose AWS Infra Generator?</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              {benefit.title}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
