import { CheckCircle2 } from "lucide-react";
import type { ServiceDetailItem } from "../landing-data";
import { landingStyles } from "../shared/landing-styles";

interface ServiceDetailCardProps {
  service: ServiceDetailItem;
}

export function ServiceDetailCard({ service }: ServiceDetailCardProps) {
  return (
    <div className={landingStyles.card}>
      <div className="flex items-start gap-3">
        <div className={landingStyles.iconBox}>
          <service.icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm sm:text-base">{service.name}</div>
          <div className="text-[11px] sm:text-sm text-muted-foreground">{service.desc}</div>
        </div>
      </div>
      <ul className="mt-3 space-y-1">
        {service.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 shrink-0 text-orange-500" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
