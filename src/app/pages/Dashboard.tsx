import { useMemo } from "react";
import { useFilters } from "../hooks/useFilters";
import { useIndicadores, useResumoIndicadores } from "../hooks/useDados";
import { PageShell, Panel } from "../components/PageShell";
import { EtapaCards } from "../components/data/EtapaCards";
import { IndicadoresTable } from "../components/data/IndicadoresTable";
import { SkeletonCards, SkeletonTable, ErrorState, DemoBanner } from "../components/feedback";
import type { Option } from "../data/types";

export function Dashboard() {
  const filtersApi = useFilters();
  const { filters } = filtersApi;
  const { data, loading, error, demo, refetch } = useIndicadores(filters);
  const { data: resumo, loading: loadingResumo } = useResumoIndicadores(filters);

  // Escolas disponíveis derivam das linhas carregadas (seleção fechada, sem digitar).
  const escolaOptions: Option[] = useMemo(
    () => data.dados.map((r) => ({ value: r.co_entidade, label: r.no_entidade })),
    [data.dados],
  );

  const totalPaginas = Math.max(1, Math.ceil(data.total / filters.limite));

  return (
    <PageShell
      titulo="Dashboard de Indicadores"
      descricao="Matrículas por etapa de ensino, listadas de forma paginada por escola."
      filtersApi={filtersApi}
      escolaOptions={escolaOptions}
      config={{ ano: true, estado: true, municipio: true, escola: true, dependencia: true, localizacao: true, ordenacao: true, limite: true, paginacao: true }}
    >
      {demo && <DemoBanner />}

      {loading ? (
        <>
          <SkeletonCards count={7} />
          <Panel><SkeletonTable rows={8} cols={7} /></Panel>
        </>
      ) : error ? (
        <ErrorState onRetry={refetch} message="Falha ao carregar os indicadores do backend." />
      ) : (
        <>
          {loadingResumo ? <SkeletonCards count={7} /> : <EtapaCards resumo={resumo} />}
          <Panel className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h2 className="text-base tracking-tight">Escolas</h2>
              <span className="text-xs font-mono text-muted-foreground">
                {data.total.toLocaleString("pt-BR")} escolas · página {filters.pagina}/{totalPaginas}
              </span>
            </div>
            {data.dados.length > 0 ? (
              <IndicadoresTable rows={data.dados} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Nenhuma escola encontrada para os filtros.</p>
            )}
          </Panel>
        </>
      )}
    </PageShell>
  );
}