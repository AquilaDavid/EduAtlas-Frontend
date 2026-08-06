import { useState } from "react";
import { useFilters } from "../hooks/useFilters";
import { useRanking } from "../hooks/useDados";
import { PageShell, Panel } from "../components/PageShell";
import { RankingTable } from "../components/data/RankingTable";
import { RankingEscolasSheet } from "../components/data/RankingEscolasSheet";
import type { RankingRow } from "../data/types";
import { SkeletonTable, ErrorState, DemoBanner } from "../components/feedback";

export function Ranking() {
  // No Ranking a dependência é de seleção única e começa vazia.
  const filtersApi = useFilters({ tp_dependencia: [] });
  const { filters } = filtersApi;
  const { data, loading, error, demo, refetch } = useRanking(filters);
  // Município clicado na tabela — abre o painel com o ranking das escolas.
  const [detalhe, setDetalhe] = useState<RankingRow | null>(null);

  return (
    <PageShell
      titulo="Ranking de Municípios"
      descricao="Municípios ordenados pelo total de matrículas no ano selecionado. Clique em uma linha para ver o ranking das escolas do município."
      filtersApi={filtersApi}
      config={{ ano: true, estado: true, municipio: true, escola: true, dependenciaUnica: true, localizacao: true, limite: true }}
    >
      {demo && <DemoBanner />}

      <Panel className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h2 className="text-base tracking-tight">Top municípios · {filters.ano}</h2>
          <span className="text-xs font-mono text-muted-foreground">
            {filters.sg_uf || "Brasil"} · {filters.limite} posições
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={10} cols={4} />
        ) : error ? (
          <ErrorState onRetry={refetch} message="Falha ao carregar o ranking do backend." />
        ) : data.length > 0 ? (
          <RankingTable rows={data} onSelect={setDetalhe} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">Sem dados para os filtros selecionados.</p>
        )}
      </Panel>

      <RankingEscolasSheet
        municipio={detalhe}
        ano={filters.ano}
        limite={filters.limite}
        onOpenChange={(open) => {
          if (!open) setDetalhe(null);
        }}
      />
    </PageShell>
  );
}
