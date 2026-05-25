import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ServiceDetailItem } from "../landing-data";

interface ServiceDetailCardProps {
  service: ServiceDetailItem;
}

export function ServiceDetailCard({ service }: ServiceDetailCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <service.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary flex-shrink-0" />
          <div>
            <div className="font-bold text-lg">{service.name}</div>
            <div className="text-sm text-muted-foreground">{service.desc}</div>
          </div>
        </div>
        <div className="space-y-1">
          {service.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              {feature}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
