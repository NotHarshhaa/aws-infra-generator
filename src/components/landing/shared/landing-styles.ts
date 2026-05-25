import { cn } from "@/lib/utils";
import { wizardStyles } from "@/components/wizard/shared/wizard-styles";

export const landingStyles = {
  ...wizardStyles,
  page: cn(
    "relative space-y-10 sm:space-y-16 pb-8",
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10",
    "before:bg-[radial-gradient(circle_at_1px_1px,oklch(0.5_0_0/0.08)_1px,transparent_0)]",
    "before:[background-size:20px_20px] dark:before:bg-[radial-gradient(circle_at_1px_1px,oklch(0.8_0_0/0.06)_1px,transparent_0)]"
  ),
  section: "relative scroll-mt-20 px-1 sm:px-0",
  sectionHeader: "text-center space-y-2 sm:space-y-3 mb-5 sm:mb-8 max-w-3xl mx-auto",
  eyebrow: cn(
    "inline-flex items-center gap-1.5 rounded-full border border-orange-500/25",
    "bg-orange-500/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide",
    "text-orange-600 dark:text-orange-400"
  ),
  sectionTitle: "text-xl sm:text-3xl font-bold tracking-tight",
  sectionDesc: "text-xs sm:text-base text-muted-foreground leading-relaxed",
  iconBox: cn(
    "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg",
    "border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"
  ),
  card: cn(
    wizardStyles.panel,
    "h-full p-3 sm:p-4 transition-all hover:border-orange-500/25 hover:shadow-md"
  ),
  cardAccent: cn(
    wizardStyles.panelAccent,
    "h-full p-3 sm:p-4 transition-all hover:shadow-md"
  ),
  pill: cn(
    "inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40",
    "px-2.5 py-1.5 text-[11px] sm:text-xs font-medium"
  ),
  pillActive: cn(
    "inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30",
    "bg-orange-500 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-white shadow-sm"
  ),
  filterRail: wizardStyles.tabScrollRail,
  filterList: wizardStyles.tabScrollList,
  ctaPrimary: cn(
    "h-9 sm:h-10 bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
  ),
  heroGlow: cn(
    "pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full",
    "bg-orange-500/15 blur-3xl dark:bg-orange-500/10"
  ),
};
