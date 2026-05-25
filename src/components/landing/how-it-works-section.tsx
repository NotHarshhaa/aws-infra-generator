import { Zap, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HOW_IT_WORKS_STEPS } from "./landing-data";

export function HowItWorksSection() {
  return (
    <section className="space-y-6 sm:space-y-8 px-3 py-6 sm:py-12">
      <div className="text-center space-y-3 sm:space-y-4">
        <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1">
          Process
        </Badge>
        <h2 className="text-xl sm:text-3xl font-bold">How It Works</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto text-sm sm:text-lg">
          Generate production-ready AWS infrastructure in three simple steps
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {HOW_IT_WORKS_STEPS.map((item, index) => (
            <div key={item.step} className="relative">
              {index < 2 && (
                <div className="hidden lg:block absolute top-8 left-full w-8 h-0.5 bg-border -translate-y-1/2" />
              )}

              <Card className="relative overflow-hidden border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm sm:text-lg shadow-lg">
                      {item.step}
                    </div>
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-foreground transition-colors" />
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-base sm:text-lg font-bold">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {item.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent rounded-full border">
            <Zap className="h-5 w-5" />
            <span className="text-base font-semibold">Ready in Minutes, Not Hours</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            Skip the manual IaC writing and avoid common configuration mistakes. Our templates follow AWS best practices and include proper security configurations.
          </p>
        </div>
      </div>
    </section>
  );
}
