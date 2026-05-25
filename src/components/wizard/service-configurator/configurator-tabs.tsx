"use client";

import type { LucideIcon } from "lucide-react";
import { Network, DollarSign, Projector, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { wizardStyles } from "@/components/wizard/shared/wizard-styles";

const CONFIG_TABS: {
  value: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "configuration", label: "Config", icon: Network },
  { value: "cost", label: "Cost", icon: DollarSign },
  { value: "diagram", label: "Diagram", icon: Projector },
  { value: "plan", label: "Plan", icon: Eye },
];

const tabTriggerClass = cn(
  "flex-none shrink-0 inline-flex items-center justify-center gap-1.5",
  "rounded-lg px-3 py-2 sm:px-4 sm:py-2.5",
  "text-xs sm:text-sm font-medium whitespace-nowrap",
  "text-muted-foreground transition-colors",
  "hover:bg-muted/60 hover:text-foreground",
  "data-active:bg-orange-500 data-active:text-white data-active:shadow-sm data-active:shadow-orange-500/20",
  "dark:data-active:bg-orange-500 dark:data-active:text-white dark:data-active:border-transparent",
  "after:hidden focus-visible:ring-orange-500/30"
);

interface ConfiguratorTabsProps {
  configuration: React.ReactNode;
  cost: React.ReactNode;
  diagram: React.ReactNode;
  plan: React.ReactNode;
}

export function ConfiguratorTabs({
  configuration,
  cost,
  diagram,
  plan,
}: ConfiguratorTabsProps) {
  return (
    <Tabs defaultValue="configuration" className="w-full min-w-0 gap-3">
      <div className="min-w-0 rounded-xl border border-border/80 bg-muted/30 p-1 sm:p-1.5">
        <div className={wizardStyles.tabScrollRail}>
          <TabsList variant="default" className={wizardStyles.tabScrollList}>
          {CONFIG_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={tabTriggerClass}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
          </TabsList>
        </div>
      </div>

      <TabsContent value="configuration" className="mt-0 outline-none">
        {configuration}
      </TabsContent>
      <TabsContent value="cost" className="mt-0 outline-none">
        {cost}
      </TabsContent>
      <TabsContent value="diagram" className="mt-0 outline-none">
        {diagram}
      </TabsContent>
      <TabsContent value="plan" className="mt-0 outline-none">
        {plan}
      </TabsContent>
    </Tabs>
  );
}
