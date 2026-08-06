import { useState } from "react";
import { useFilters } from "../hooks/useFilters";
import { useEvolucao, useEvolucaoMulti } from "../hooks/useDados";
import { useAlvosComparacao } from "../hooks/useLocalizacoes";
import { PageShell, Panel } from "../components/PageShell";
import { EvolucaoChart } from "../components/charts/EvolucaoChart";
import { SeriesChart } from "../components/charts/SeriesChart";
import { ChartTypeToggle, type ChartType } from "../components/charts/ChartTypeToggle";
import { SkeletonChart, ErrorState, DemoBanner } from "../components/feedback";
import { labelIndicador } from "../data/options";


export function Evolucao() {
  const filtersApi = useFilters();
  const { filters } = filtersApi;
  const nome = labelIndicador(filters.indicador);
  const [tipo, setTipo] = useState<ChartType>("linhas");

  // Sem entidades marcadas, mostra a série única dos filtros. Marcando estados,
  // municípios e/ou escolas, cada entidade vira uma série própria.
  const { alvos } = useAlvosComparacao(filters);
  const comparando = alvos.length > 0;
  const unico = useEvolucao(filters);
  const multi = useEvolucaoMulti(filters, alvos);
  const q = comparando ? multi : unico;


  // Ex.: "2 estados · 3 municípios · 1 escola"
  const resumo = [
    filters.comparar_ufs.length && `${filters.comparar_ufs.length} estado(s)`,
    filters.comparar_municipios.length && `${filters.comparar_municipios.length} município(s)`,
    filters.comparar_escolas.length && `${filters.comparar_escolas.length} escola(s)`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageShell
      titulo="Evolução Temporal"
      descricao="Evolução do indicador ao longo do período. Use o grupo Comparar para acompanhar vários estados, municípios e escolas simultaneamente."
      filtersApi={filtersApi}
      config={{
        indicador: true,
        periodo: true,
        dependencia: true,
        localizacao: true,
        comparacao: true,
      }}
    >
      {q.demo && <DemoBanner />}

      <Panel className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base tracking-tight">
              {nome}
              {comparando && " — entidades comparadas"}
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {filters.ano_inicial} — {filters.ano_final}
              {comparando && ` · ${resumo}`}
            </span>
          </div>
          <ChartTypeToggle value={tipo} onChange={setTipo} />
        </div>

        {q.loading ? (
          <SkeletonChart height={comparando ? 420 : 380} />
        ) : q.error ? (
          <ErrorState onRetry={q.refetch} message="Falha ao carregar a evolução do backend." />
        ) : comparando ? (
          <SeriesChart series={multi.data} tipo={tipo} />
        ) : unico.data.length > 0 ? (
          <EvolucaoChart pontos={unico.data} nome={nome} tipo={tipo} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">Sem dados para os filtros selecionados.</p>
        )}
      </Panel>
    </PageShell>
  );
}
