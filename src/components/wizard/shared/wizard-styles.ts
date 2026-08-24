import { cn } from "@/lib/utils";

export const wizardStyles = {
  shell: cn(
    "relative space-y-4 sm:space-y-6 pb-24 sm:pb-8",
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10",
    "before:bg-[radial-gradient(circle_at_1px_1px,oklch(0.4_0_0/0.05)_1px,transparent_0)]",
    "before:[background-size:24px_24px] dark:before:bg-[radial-gradient(circle_at_1px_1px,oklch(0.9_0_0/0.04)_1px,transparent_0)]"
  ),
  header: cn(
    "relative overflow-hidden rounded-2xl border border-orange-500/20",
    "bg-gradient-to-br from-orange-500/10 via-card/90 to-card/60 backdrop-blur-xl",
    "p-4 sm:p-5 shadow-xs transition-all"
  ),
  headerTitle: "text-lg sm:text-2xl font-bold tracking-tight text-foreground",
  headerDesc: "text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl",
  panel: cn(
    "rounded-2xl border border-border/70 bg-card/85 backdrop-blur-xl",
    "shadow-xs transition-all duration-200 hover:shadow-sm hover:border-border",
    "dark:bg-card/75 dark:border-border/50"
  ),
  panelAccent: cn(
    "rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/8 via-card/90 to-card/70",
    "backdrop-blur-xl shadow-xs transition-all duration-200 hover:shadow-sm hover:border-orange-500/35",
    "dark:from-orange-500/12 dark:to-card/60"
  ),
  panelHeader: "flex items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-3 border-b border-border/40",
  panelTitle: "text-sm sm:text-base font-semibold flex items-center gap-2 text-foreground tracking-tight",
  panelDesc: "text-xs text-muted-foreground mt-0.5",
  panelBody: "p-4 sm:p-5",
  statChip: cn(
    "flex flex-col items-center justify-center rounded-xl border border-border/50",
    "bg-muted/40 px-3 py-2 sm:px-4 sm:py-2.5 min-w-0 transition-colors hover:bg-muted/60"
  ),
  statValue: "text-base sm:text-xl font-bold tabular-nums leading-none tracking-tight text-foreground",
  statLabel: "text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium",
  tag: cn(
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
    "text-[10px] sm:text-xs font-medium"
  ),
  segmented: cn(
    "inline-flex w-full sm:w-auto rounded-full border border-border/70 bg-muted/50 p-1"
  ),
  segmentedBtn: (active: boolean) =>
    cn(
      "flex-1 sm:flex-none rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer",
      active
        ? "bg-orange-500 text-white shadow-xs"
        : "text-muted-foreground hover:text-foreground hover:bg-background/80"
    ),
  actionBar: cn(
    "fixed bottom-0 left-0 right-0 z-40 sm:relative sm:z-auto",
    "border-t border-border/70 bg-background/95 backdrop-blur-2xl",
    "p-3 sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:pt-3"
  ),
  codeBlock: cn(
    "rounded-xl border border-border/80 bg-zinc-950/95 text-zinc-100",
    "font-mono text-[11px] sm:text-xs overflow-hidden shadow-xs"
  ),
  scrollList: "max-h-[50vh] sm:max-h-[520px] overflow-y-auto overflow-x-hidden -mx-1 px-1",
  tabScrollRail: cn(
    "min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x",
    "[scrollbar-width:thin]",
    "[scrollbar-color:var(--border)_transparent]",
    "[&::-webkit-scrollbar]:h-1.5",
    "[&::-webkit-scrollbar-track]:my-0.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted/40",
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80",
    "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50"
  ),
  tabScrollList: cn(
    "inline-flex h-auto w-max max-w-none flex-nowrap items-center justify-start gap-1.5",
    "bg-transparent p-0 shadow-none"
  ),
};
