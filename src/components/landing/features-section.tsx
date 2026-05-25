import { Card, CardContent } from "@/components/ui/card";
import { LANDING_FEATURES } from "./landing-data";

export function FeaturesSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-3" id="features">
      {LANDING_FEATURES.map((feature) => (
        <Card key={feature.title} className="text-center">
          <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
            <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold">{feature.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
