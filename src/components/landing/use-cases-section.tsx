import { Card, CardContent } from "@/components/ui/card";
import { USE_CASES } from "./landing-data";

export function UseCasesSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Perfect For</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {USE_CASES.map((useCase) => (
          <Card key={useCase.title} className="text-center">
            <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
              <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <useCase.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold">{useCase.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{useCase.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
