export interface ServiceSelectorProps {
  onBackToHome: () => void;
}

export interface ServiceStats {
  totalServices: number;
  selectedServices: number;
  requiredDependencies: number;
  estimatedComplexity: "Low" | "Medium" | "High";
  estimatedCost: "Low" | "Medium" | "High";
}
