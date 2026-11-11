"use client";

import { Info, RotateCcw, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConfigField as ConfigFieldType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConfigFieldProps {
  field: ConfigFieldType;
  value: string | number | boolean;
  error?: string;
  onChange: (value: string | number | boolean) => void;
}

export function ConfigField({ field, value, error, onChange }: ConfigFieldProps) {
  const isModified = value !== undefined && value !== field.default;

  const renderLabel = () => (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-1.5 min-w-0">
        <Label
          className={cn(
            "text-xs font-medium cursor-pointer truncate",
            error ? "text-red-500" : "text-foreground"
          )}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {field.description && (
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground hover:text-foreground cursor-help transition-colors">
              <Info className="h-3 w-3 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {field.description}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isModified && (
          <>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
            >
              modified
            </Badge>
            <button
              type="button"
              onClick={() => onChange(field.default)}
              title={`Reset to default (${field.default})`}
              className="text-muted-foreground hover:text-orange-500 p-0.5 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (field.type === "boolean") {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-colors",
          error
            ? "border-red-500 bg-red-500/5"
            : isModified
            ? "border-orange-500/40 bg-orange-500/5"
            : "border-border/70 bg-muted/10 hover:bg-muted/20"
        )}
      >
        <div className="space-y-0.5 flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-medium">{field.label}</Label>
            {field.description && (
              <Tooltip>
                <TooltipTrigger className="text-muted-foreground hover:text-foreground cursor-help transition-colors">
                  <Info className="h-3 w-3 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {field.description}
                </TooltipContent>
              </Tooltip>
            )}
            {isModified && (
              <button
                type="button"
                onClick={() => onChange(field.default)}
                title={`Reset to default (${field.default})`}
                className="text-muted-foreground hover:text-orange-500 p-0.5 rounded transition-colors cursor-pointer ml-1"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
          {field.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">{field.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            {value ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
            className="scale-90"
          />
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1">
        {renderLabel()}
        <Select value={String(value)} onValueChange={(v) => v && onChange(v)}>
          <SelectTrigger
            className={cn(
              "h-8 sm:h-9 text-xs sm:text-sm bg-muted/20 border-border/70",
              error && "border-red-500 focus-visible:ring-red-500/20",
              isModified && !error && "border-orange-500/40"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-[10px] text-red-500">{error}</p>}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-1">
        {renderLabel()}
        <Input
          type="number"
          value={value as string | number}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? "" : Number(raw));
          }}
          placeholder={field.default?.toString()}
          className={cn(
            "h-8 sm:h-9 text-xs sm:text-sm bg-muted/20 border-border/70 font-mono",
            error && "border-red-500 focus-visible:ring-red-500/20",
            isModified && !error && "border-orange-500/40"
          )}
        />
        {error && <p className="text-[10px] text-red-500">{error}</p>}
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div className="space-y-1">
        {renderLabel()}
        <Input
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.default?.toString()}
          className={cn(
            "h-8 sm:h-9 text-xs sm:text-sm bg-muted/20 border-border/70 font-mono",
            error && "border-red-500 focus-visible:ring-red-500/20",
            isModified && !error && "border-orange-500/40"
          )}
        />
        {error && <p className="text-[10px] text-red-500">{error}</p>}
      </div>
    );
  }

  return null;
}
