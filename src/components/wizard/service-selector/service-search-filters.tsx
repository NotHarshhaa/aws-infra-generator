import { Search, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES } from "@/lib/aws-services";
import { WizardPanel } from "@/components/wizard/shared";
import { awsIconMap } from "@/components/shared/aws-icon-map";
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
    <WizardPanel bodyClassName="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search 30+ AWS services (e.g., VPC, Lambda, RDS, SQS)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pl-10 pr-9 rounded-full text-xs sm:text-sm bg-muted/40 border-border/70 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-orange-500/30 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none py-0.5">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer",
            !selectedCategory
              ? "bg-orange-500 text-white border-orange-500 shadow-xs"
              : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/70 hover:text-foreground"
          )}
        >
          All Categories
        </button>
        {SERVICE_CATEGORIES.map((category) => {
          const Icon = awsIconMap[category.icon];
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer",
                isSelected
                  ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                  : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {Icon && <Icon className={cn("h-3 w-3", isSelected ? "text-white" : "text-orange-500")} />}
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Switch
            checked={showPopularOnly}
            onCheckedChange={onPopularOnlyChange}
            className="scale-75 sm:scale-90"
          />
          <Label className="text-xs flex items-center gap-1.5 cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            Popular foundational services only
          </Label>
        </div>
        {searchQuery && (
          <Badge variant="secondary" className="rounded-full text-[10px] h-5 px-2">
            {filteredCount} matching service{filteredCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </WizardPanel>
  );
}
