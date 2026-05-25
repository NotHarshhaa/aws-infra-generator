import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES } from "@/lib/aws-services";
import { WizardPanel } from "@/components/wizard/shared";
import { cn } from "@/lib/utils";

interface ServiceSearchFiltersProps {
  searchQuery: string;
  selectedCategory: string | null;
  showPopularOnly: boolean;
  filteredCount: number;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
  onPopularOnlyChange: (value: boolean) => void;
}

export function ServiceSearchFilters({
  searchQuery,
  selectedCategory,
  showPopularOnly,
  filteredCount,
  onSearchChange,
  onCategoryChange,
  onPopularOnlyChange,
}: ServiceSearchFiltersProps) {
  return (
    <WizardPanel bodyClassName="space-y-2.5">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 sm:h-9 pl-8 text-xs sm:text-sm bg-muted/30 border-border/70"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-[10px] sm:text-xs font-medium border transition-colors",
            !selectedCategory
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-muted/40 text-muted-foreground border-border/60 hover:border-orange-500/30"
          )}
        >
          All
        </button>
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "shrink-0 rounded-md px-2 py-1 text-[10px] sm:text-xs font-medium border transition-colors",
              selectedCategory === category.id
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-muted/40 text-muted-foreground border-border/60 hover:border-orange-500/30"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={showPopularOnly}
            onCheckedChange={onPopularOnlyChange}
            className="scale-75 sm:scale-90"
          />
          <Label className="text-[11px] sm:text-xs flex items-center gap-1 cursor-pointer">
            <Star className="h-3 w-3 text-amber-500" />
            Popular only
          </Label>
        </div>
        {searchQuery && (
          <Badge variant="secondary" className="text-[10px] h-5">
            {filteredCount} found
          </Badge>
        )}
      </div>
    </WizardPanel>
  );
}
