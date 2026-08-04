// Hooks de dados por tela. Cada um monta a chave de cache a partir dos filtros
// relevantes e delega o consumo (com Axios + cache + fallback) ao useQuery.

import { useQuery } from "./useQuery";
import {
  getIndicadores,
  getResumoIndicadores,
  getComparacoes,
  getEvolucao,
  getRanking,
} from "../services";
import { mockIndicadores, mockResumo, mockComparacoes, mockEvolucao, mockRanking } from "../data/mocks";
import type {
  FilterState,
  IndicadoresResponse,
  ResumoIndicadores,
  ComparacaoRow,
  EvolucaoPonto,
  RankingRow,
} from "../data/types";

const RESP_VAZIA: IndicadoresResponse = { dados: [], total: 0, pagina: 1, limite: 10 };

export function useIndicadores(f: FilterState) {
  const key = `indicadores:${f.ano}:${f.sg_uf}:${f.co_municipio}:${f.co_entidade}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}:${f.ordenar_por}:${f.ordem}:${f.pagina}:${f.limite}`;
  return useQuery<IndicadoresResponse>(key, {
    fetcher: () => getIndicadores(f),
    mock: () => mockIndicadores(f),
    fallback: RESP_VAZIA,
  });
}

const RESUMO_VAZIO: ResumoIndicadores = {
  qt_mat_total: 0, qt_mat_inf: 0, qt_mat_fund: 0,
  qt_mat_med: 0, qt_mat_prof: 0, qt_mat_eja: 0, qt_mat_esp: 0,
};

// Soma de TODA a tabela filtrada (sem paginação) — para os cards do topo
// do Dashboard, que não podem depender da página atual da listagem.
export function useResumoIndicadores(f: FilterState) {
  const key = `indicadores-resumo:${f.ano}:${f.sg_uf}:${f.co_municipio}:${f.co_entidade}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}`;
  return useQuery<ResumoIndicadores>(key, {
    fetcher: () => getResumoIndicadores(f),
    mock: () => mockResumo(f),
    fallback: RESUMO_VAZIO,
  });
}

const LISTA_CMP: ComparacaoRow[] = [];
export function useComparacoes(f: FilterState) {
  const key = `comparacoes:${f.ano_inicial}:${f.ano_final}:${f.sg_uf}:${f.co_municipio}:${f.co_entidade}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}`;
  return useQuery<ComparacaoRow[]>(key, {
    fetcher: () => getComparacoes(f),
    mock: () => mockComparacoes(f),
    fallback: LISTA_CMP,
  });
}

const LISTA_EVO: EvolucaoPonto[] = [];
export function useEvolucao(f: FilterState) {
  const key = `evolucao:${f.indicador}:${f.ano_inicial}:${f.ano_final}:${f.sg_uf}:${f.co_municipio}:${f.co_entidade}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}`;
  return useQuery<EvolucaoPonto[]>(key, {
    fetcher: () => getEvolucao(f),
    mock: () => mockEvolucao(f),
    fallback: LISTA_EVO,
  });
}

const LISTA_RANK: RankingRow[] = [];
export function useRanking(f: FilterState) {
  const key = `ranking:${f.ano}:${f.sg_uf}:${f.co_municipio}:${f.co_entidade}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}:${f.limite}`;
  return useQuery<RankingRow[]>(key, {
    fetcher: () => getRanking(f),
    mock: () => mockRanking(f),
    fallback: LISTA_RANK,
  });
}