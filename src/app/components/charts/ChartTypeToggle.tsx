import { BarChart3, LineChart as LineIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export type ChartType = "barras" | "linhas";

// Alternância visual de formato do gráfico (colunas/barras ou linhas).
export function ChartTypeToggle({ value, onChange }: { value: ChartType; onChange: (v: ChartType) => void }) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as ChartType)}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="barras" aria-label="Colunas" className="gap-1.5">
        <BarChart3 size={14} /> Colunas
      </ToggleGroupItem>
      <ToggleGroupItem value="linhas" aria-label="Linhas" className="gap-1.5">
        <LineIcon size={14} /> Linhas
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
