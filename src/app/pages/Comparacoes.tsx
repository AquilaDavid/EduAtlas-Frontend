import { useState } from "react";
import { useFilters } from "../hooks/useFilters";
import { useComparacoes, useComparacoesMulti } from "../hooks/useDados";
import { useAlvosComparacao } from "../hooks/useLocalizacoes";
import { PageShell, Panel } from "../components/PageShell";
import { ComparacaoChart } from "../components/charts/ComparacaoChart";
import { SeriesChart } from "../components/charts/SeriesChart";
import { ChartTypeToggle, type ChartType } from "../components/charts/ChartTypeToggle";
import { SkeletonChart, ErrorState, DemoBanner } from "../components/feedback";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";

type Metrica = "qt_matriculas" | "qt_escolas";

export function Comparacoes() {
  const filtersApi = useFilters();
  const { filters } = filtersApi;
  const [metrica, setMetrica] = useState<Metrica>("qt_matriculas");
  const [tipo, setTipo] = useState<ChartType>("barras");

  // Sem entidades marcadas, mostra o empilhado por dependência. Marcando
  // estados, municípios e/ou escolas, cada entidade vira uma série no gráfico.
  const { alvos } = useAlvosComparacao(filters);
  const comparando = alvos.length > 0;
  const porDependencia = useComparacoes(filters);
  const porEntidade = useComparacoesMulti(filters, alvos, metrica);
  const q = comparando ? porEntidade : porDependencia;

  const metricaLabel = metrica === "qt_matriculas" ? "Matrículas" : "Escolas";

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
      titulo="Comparações"
      descricao="Sem entidades marcadas, mostra o total por dependência administrativa. Use o grupo Comparar para confrontar vários estados, municípios e escolas ao mesmo tempo."
      filtersApi={filtersApi}
      config={{
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
              {comparando ? `${metricaLabel} — entidades comparadas` : `${metricaLabel} por dependência`}
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {filters.ano_inicial} — {filters.ano_final}
              {comparando && ` · ${resumo}`}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ToggleGroup type="single" value={metrica} onValueChange={(v) => v && setMetrica(v as Metrica)} variant="outline" size="sm">
              <ToggleGroupItem value="qt_matriculas">Matrículas</ToggleGroupItem>
              <ToggleGroupItem value="qt_escolas">Escolas</ToggleGroupItem>
            </ToggleGroup>
            <ChartTypeToggle value={tipo} onChange={setTipo} />
          </div>
        </div>

        {q.loading ? (
          <SkeletonChart height={comparando ? 420 : 380} />
        ) : q.error ? (
          <ErrorState onRetry={q.refetch} message="Falha ao carregar as comparações do backend." />
        ) : comparando ? (
          <SeriesChart series={porEntidade.data} tipo={tipo} />
        ) : porDependencia.data.length > 0 ? (
          <ComparacaoChart rows={porDependencia.data} metrica={metrica} tipo={tipo} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">Sem dados para os filtros selecionados.</p>
        )}
      </Panel>
    </PageShell>
  );
}
