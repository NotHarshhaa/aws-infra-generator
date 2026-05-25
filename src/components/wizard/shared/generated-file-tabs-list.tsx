"use client";

import { FileCode2 } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { wizardStyles } from "./wizard-styles";

export const generatedFileTabTriggerClass = cn(
  "group/trigger flex-none shrink-0 inline-flex items-center justify-center gap-1.5",
  "rounded-lg px-2.5 py-2 sm:px-3.5 sm:py-2.5",
  "font-mono text-[11px] sm:text-xs font-medium whitespace-nowrap",
  "text-muted-foreground transition-colors",
  "hover:bg-muted/60 hover:text-foreground",
  "data-active:bg-orange-500 data-active:text-white data-active:shadow-sm data-active:shadow-orange-500/20",
  "dark:data-active:bg-orange-500 dark:data-active:text-white dark:data-active:border-transparent",
  "after:hidden focus-visible:ring-orange-500/30"
);

interface GeneratedFileTabsListProps {
  files: { name: string }[];
  renderBadge?: (fileName: string) => React.ReactNode;
}

export function GeneratedFileTabsList({
  files,
  renderBadge,
}: GeneratedFileTabsListProps) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-muted/30 p-1 sm:p-1.5">
      <div className={wizardStyles.tabScrollRail}>
        <TabsList variant="default" className={wizardStyles.tabScrollList}>
          {files.map((file) => (
            <TabsTrigger
              key={file.name}
              value={file.name}
              className={generatedFileTabTriggerClass}
            >
              <FileCode2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 opacity-70 group-data-active/trigger:opacity-100" />
              <span>{file.name}</span>
              {renderBadge?.(file.name)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </div>
  );
}
