import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConfigField as ConfigFieldType } from "@/lib/types";

interface ConfigFieldProps {
  field: ConfigFieldType;
  value: string | number | boolean;
  error?: string;
  onChange: (value: string | number | boolean) => void;
}

export function ConfigField({ field, value, error, onChange }: ConfigFieldProps) {
  if (field.type === "boolean") {
    return (
      <div
        className={`flex items-center justify-between rounded-lg border p-2 sm:p-3 ${error ? "border-red-500" : ""}`}
      >
        <div className="space-y-0.5 flex-1 min-w-0">
          <Label className="text-xs sm:text-sm">{field.label}</Label>
          {field.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
              {field.description}
            </p>
          )}
        </div>
        <Switch
          checked={value as boolean}
          onCheckedChange={(checked) => onChange(checked)}
          className="scale-75 sm:scale-100"
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1 sm:space-y-2">
        <Label className={`text-xs sm:text-sm ${error ? "text-red-500" : ""}`}>
          {field.label}
        </Label>
        <Select value={value as string} onValueChange={(v) => v && onChange(v)}>
          <SelectTrigger className="h-8 sm:h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {field.description && (
          <p className="text-xs text-muted-foreground hidden sm:block">{field.description}</p>
        )}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-1 sm:space-y-2">
        <Label className={`text-xs sm:text-sm ${error ? "text-red-500" : ""}`}>
          {field.label}
        </Label>
        <Input
          type="number"
          value={value as string | number}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? "" : Number(raw));
          }}
          placeholder={field.default?.toString()}
          className={`h-8 sm:h-10 text-sm ${error ? "border-red-500" : ""}`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {field.description && (
          <p className="text-xs text-muted-foreground hidden sm:block">{field.description}</p>
        )}
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div className="space-y-1 sm:space-y-2">
        <Label className={`text-xs sm:text-sm ${error ? "text-red-500" : ""}`}>
          {field.label}
        </Label>
        <Input
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.default?.toString()}
          className={`h-8 sm:h-10 text-sm ${error ? "border-red-500" : ""}`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {field.description && (
          <p className="text-xs text-muted-foreground hidden sm:block">{field.description}</p>
        )}
      </div>
    );
  }

  return null;
}
