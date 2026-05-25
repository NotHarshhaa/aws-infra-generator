import { cn } from "@/lib/utils";

export const wizardStyles = {
  shell: cn(
    "relative space-y-3 sm:space-y-5 pb-20 sm:pb-6",
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10",
    "before:bg-[radial-gradient(circle_at_1px_1px,oklch(0.5_0_0/0.08)_1px,transparent_0)]",
    "before:[background-size:20px_20px] dark:before:bg-[radial-gradient(circle_at_1px_1px,oklch(0.8_0_0/0.06)_1px,transparent_0)]"
  ),
  header: cn(
    "relative overflow-hidden rounded-xl border border-orange-500/20",
    "bg-gradient-to-br from-orange-500/10 via-background to-background",
    "px-3 py-3 sm:px-5 sm:py-4"
  ),
  headerTitle: "text-base sm:text-xl font-bold tracking-tight",
  headerDesc: "text-[11px] sm:text-sm text-muted-foreground mt-0.5 leading-snug",
  panel: cn(
    "rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm",
    "shadow-sm transition-shadow hover:shadow-md",
    "dark:bg-card/60 dark:border-border/60"
  ),
  panelAccent: cn(
    "rounded-xl border border-orange-500/25 bg-gradient-to-br from-orange-500/5 to-card/80",
    "backdrop-blur-sm shadow-sm dark:from-orange-500/10 dark:to-card/60"
  ),
  panelHeader: "flex items-center justify-between gap-2 px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3",
  panelTitle: "text-sm sm:text-base font-semibold flex items-center gap-2",
  panelDesc: "text-[11px] sm:text-xs text-muted-foreground",
  panelBody: "px-3 pb-3 sm:px-4 sm:pb-4",
  statChip: cn(
    "flex flex-col items-center justify-center rounded-lg border border-border/60",
    "bg-muted/30 px-2 py-1.5 sm:px-3 sm:py-2 min-w-0"
  ),
  statValue: "text-base sm:text-xl font-bold tabular-nums leading-none",
  statLabel: "text-[10px] sm:text-xs text-muted-foreground mt-0.5",
  tag: cn(
    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5",
    "text-[10px] sm:text-xs font-medium"
  ),
  segmented: cn(
    "inline-flex w-full sm:w-auto rounded-lg border border-border/80 bg-muted/40 p-0.5"
  ),
  segmentedBtn: (active: boolean) =>
    cn(
      "flex-1 sm:flex-none rounded-md px-2.5 py-1.5 text-[11px] sm:text-sm font-medium transition-all",
      active
        ? "bg-orange-500 text-white shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
    ),
  actionBar: cn(
    "fixed bottom-0 left-0 right-0 z-40 sm:relative sm:z-auto",
    "border-t border-border/80 bg-background/95 backdrop-blur-xl",
    "px-3 py-2.5 sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:pt-2"
  ),
  codeBlock: cn(
    "rounded-lg border border-border/80 bg-zinc-950/95 text-zinc-100",
    "font-mono text-[11px] sm:text-xs overflow-hidden"
  ),
  scrollList: "max-h-[50vh] sm:max-h-[520px] overflow-y-auto overflow-x-hidden -mx-1 px-1",
  tabScrollRail: cn(
    "min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x",
    "[scrollbar-width:thin]",
    "[scrollbar-color:var(--border)_transparent]",
    "[&::-webkit-scrollbar]:h-2",
    "[&::-webkit-scrollbar-track]:my-0.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted/50",
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/90",
    "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50"
  ),
  tabScrollList: cn(
    "inline-flex h-auto w-max max-w-none flex-nowrap items-center justify-start gap-1",
    "bg-transparent p-0 shadow-none"
  ),
};
