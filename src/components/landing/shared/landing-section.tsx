import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { landingStyles } from "./landing-styles";

interface LandingSectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}

export function LandingSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  headerClassName,
}: LandingSectionProps) {
  return (
    <section id={id} className={cn(landingStyles.section, className)}>
      <div className={cn(landingStyles.sectionHeader, headerClassName)}>
        {eyebrow && <span className={landingStyles.eyebrow}>{eyebrow}</span>}
        <h2 className={landingStyles.sectionTitle}>{title}</h2>
        {description && <p className={landingStyles.sectionDesc}>{description}</p>}
      </div>
      {children}
    </section>
  );
}
