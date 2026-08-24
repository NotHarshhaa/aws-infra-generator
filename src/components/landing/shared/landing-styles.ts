import { cn } from "@/lib/utils";
import { wizardStyles } from "@/components/wizard/shared/wizard-styles";

export const landingStyles = {
  ...wizardStyles,
  page: cn(
    "relative space-y-12 sm:space-y-20 pb-12",
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:transform-gpu",
    "before:bg-[radial-gradient(circle_at_1px_1px,oklch(0.4_0_0/0.04)_1px,transparent_0)]",
    "before:[background-size:28px_28px] dark:before:bg-[radial-gradient(circle_at_1px_1px,oklch(0.9_0_0/0.03)_1px,transparent_0)]"
  ),
  section: "relative scroll-mt-24 px-2 sm:px-0",
  sectionHeader: "text-center space-y-2.5 sm:space-y-3.5 mb-8 sm:mb-12 max-w-3xl mx-auto",
  eyebrow: cn(
    "inline-flex items-center gap-2 rounded-full border border-orange-500/25",
    "bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider",
    "text-orange-600 dark:text-orange-400 shadow-xs"
  ),
  sectionTitle: "text-2xl sm:text-4xl font-bold tracking-tight text-foreground",
  sectionDesc: "text-sm sm:text-base text-muted-foreground leading-relaxed",
  iconBox: cn(
    "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl",
    "border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-xs"
  ),
  card: cn(
    wizardStyles.panel,
    "h-full p-4 sm:p-5 transition-all duration-200 hover:border-orange-500/35 hover:shadow-md"
  ),
  cardAccent: cn(
    wizardStyles.panelAccent,
    "h-full p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:border-orange-500/45"
  ),
  pill: cn(
    "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40",
    "px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70"
  ),
  pillActive: cn(
    "inline-flex items-center gap-1.5 rounded-full border border-orange-500/30",
    "bg-orange-500 px-3 py-1.5 text-xs font-medium text-white shadow-xs"
  ),
  filterRail: wizardStyles.tabScrollRail,
  filterList: wizardStyles.tabScrollList,
  ctaPrimary: cn(
    "rounded-full h-10 sm:h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-xs hover:shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
  ),
  heroGlow: cn(
    "pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full transform-gpu",
    "bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-transparent blur-2xl dark:from-orange-500/10 dark:via-amber-500/5"
  ),
};
