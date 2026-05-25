import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ServiceDetailItem } from "../landing-data";
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
      <div className="flex items-center gap-2 sm:gap-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {badge}
        </Badge>
      </div>
      <div className={gridClass}>
        {services.map((service) => (
          <ServiceDetailCard key={service.name} service={service} />
        ))}
      </div>
    </div>
  );
}
