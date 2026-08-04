import { useState } from "react";
import { useFilters } from "../hooks/useFilters";
import { useComparacoes } from "../hooks/useDados";
import { PageShell, Panel } from "../components/PageShell";
import { ComparacaoChart } from "../components/charts/ComparacaoChart";
import { ChartTypeToggle, type ChartType } from "../components/charts/ChartTypeToggle";
import { SkeletonChart, ErrorState, DemoBanner } from "../components/feedback";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";

type Metrica = "qt_matriculas" | "qt_escolas";

export function Comparacoes() {
  const filtersApi = useFilters();
  const { data, loading, error, demo, refetch } = useComparacoes(filtersApi.filters);
  const [metrica, setMetrica] = useState<Metrica>("qt_matriculas");
  const [tipo, setTipo] = useState<ChartType>("barras");

  return (
    <PageShell
      titulo="Comparações por Dependência"
      descricao="Matrículas e escolas empilhadas por dependência administrativa ao longo do período."
      filtersApi={filtersApi}
      config={{ periodo: true, estado: true, municipio: true, escola: true, dependencia: true, localizacao: true }}
    >
      {demo && <DemoBanner />}

      <Panel className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base tracking-tight">
            {metrica === "qt_matriculas" ? "Matrículas" : "Escolas"} por dependência
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <ToggleGroup
              type="single"
              value={metrica}
              onValueChange={(v) => v && setMetrica(v as Metrica)}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="qt_matriculas">Matrículas</ToggleGroupItem>
              <ToggleGroupItem value="qt_escolas">Escolas</ToggleGroupItem>
            </ToggleGroup>
            <ChartTypeToggle value={tipo} onChange={setTipo} />
          </div>
        </div>

        {loading ? (
          <SkeletonChart height={380} />
        ) : error ? (
          <ErrorState onRetry={refetch} message="Falha ao carregar as comparações do backend." />
        ) : data.length > 0 ? (
          <ComparacaoChart rows={data} metrica={metrica} tipo={tipo} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">Sem dados para os filtros selecionados.</p>
        )}
      </Panel>
    </PageShell>
  );
}
