import { useState } from "react";
import { useFilters } from "../hooks/useFilters";
import { useEvolucao } from "../hooks/useDados";
import { PageShell, Panel } from "../components/PageShell";
import { EvolucaoChart } from "../components/charts/EvolucaoChart";
import { ChartTypeToggle, type ChartType } from "../components/charts/ChartTypeToggle";
import { SkeletonChart, ErrorState, DemoBanner } from "../components/feedback";
import { labelIndicador } from "../data/options";

export function Evolucao() {
  const filtersApi = useFilters();
  const { filters } = filtersApi;
  const { data, loading, error, demo, refetch } = useEvolucao(filters);
  const nome = labelIndicador(filters.indicador);
  const [tipo, setTipo] = useState<ChartType>("linhas");

  return (
    <PageShell
      titulo="Evolução Temporal"
      descricao="Série contínua do indicador selecionado ao longo do período escolhido."
      filtersApi={filtersApi}
      config={{ indicador: true, periodo: true, estado: true, municipio: true, escola: true, dependencia: true, localizacao: true }}
    >
      {demo && <DemoBanner />}

      <Panel className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base tracking-tight">{nome}</h2>
            <span className="text-xs font-mono text-muted-foreground">
              {filters.ano_inicial} — {filters.ano_final}
            </span>
          </div>
          <ChartTypeToggle value={tipo} onChange={setTipo} />
        </div>

        {loading ? (
          <SkeletonChart height={380} />
        ) : error ? (
          <ErrorState onRetry={refetch} message="Falha ao carregar a evolução do backend." />
        ) : data.length > 0 ? (
          <EvolucaoChart pontos={data} nome={nome} tipo={tipo} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">Sem dados para os filtros selecionados.</p>
        )}
      </Panel>
    </PageShell>
  );
}
