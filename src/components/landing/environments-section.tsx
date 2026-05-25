import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EnvironmentsSection() {
  return (
    <section className="text-center space-y-6">
      <h2 className="text-2xl font-bold">Multi-Environment Support</h2>
      <p className="text-muted-foreground">
        Generate infrastructure for any stage of your deployment pipeline
      </p>
      <div className="flex items-center justify-center gap-4">
        <Badge variant="outline" className="text-sm px-4 py-2">
          Development
        </Badge>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className="text-sm px-4 py-2">
          Staging
        </Badge>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <Badge className="text-sm px-4 py-2">Production</Badge>
      </div>
    </section>
  );
}
