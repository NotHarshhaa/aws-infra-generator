import type { LucideIcon } from "lucide-react";
import type { ServiceDetailItem } from "../landing-data";
import { landingStyles } from "../shared/landing-styles";
import { ServiceDetailCard } from "./service-detail-card";

interface ServiceCategoryBlockProps {
  icon: LucideIcon;
  title: string;
  badge: string;
  services: ServiceDetailItem[];
  gridClass?: string;
}

export function ServiceCategoryBlock({
  icon: Icon,
  title,
  badge,
  services,
  gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4",
}: ServiceCategoryBlockProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pb-2 border-b border-border/60">
        <div className={landingStyles.iconBox}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <span className={landingStyles.pill}>{badge}</span>
      </div>
      <div className={gridClass}>
        {services.map((service) => (
          <ServiceDetailCard key={service.name} service={service} />
        ))}
      </div>
    </div>
  );
}
