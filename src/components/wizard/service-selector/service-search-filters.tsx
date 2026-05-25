import { Search, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SERVICE_CATEGORIES } from "@/lib/aws-services";

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
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          Search & Filter Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 sm:h-10 text-sm"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs sm:text-sm">Category:</Label>
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(null)}
                className="text-xs h-7 px-2 sm:h-8 sm:px-3"
              >
                All
              </Button>
              {SERVICE_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className="text-xs h-7 px-2 sm:h-8 sm:px-3"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={showPopularOnly} onCheckedChange={onPopularOnlyChange} />
            <Label className="text-xs sm:text-sm flex items-center gap-1">
              <Star className="h-3 w-3" />
              Popular only
            </Label>
          </div>
        </div>

        {searchQuery && (
          <div className="text-xs sm:text-sm text-muted-foreground">
            Found {filteredCount} service{filteredCount !== 1 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
