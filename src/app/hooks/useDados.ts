// Hooks de dados por tela. Cada um monta a chave de cache a partir dos filtros
// relevantes e delega o consumo (com Axios + cache + fallback) ao useQuery.

import { useQuery } from "./useQuery";
import {
  getIndicadores,
  getResumoIndicadores,
  getComparacoes,
  getEvolucao,
  getRanking,
  getRankingEscolas,
  getComparacoesMulti,
  getEvolucaoMulti,
} from "../services";
import {
  mockIndicadores, mockResumoIndicadores, mockComparacoes, mockEvolucao, mockRanking, mockRankingEscolas,
  mockComparacoesMulti, mockEvolucaoMulti,
} from "../data/mocks";
import type {
  FilterState,
  IndicadoresResponse,
  ResumoIndicadores,
  ComparacaoRow,
  EvolucaoPonto,
  RankingRow,
  RankingEscolaRow,
  SerieEntidade,
} from "../data/types";
import type { Alvo } from "../services";

const RESP_VAZIA: IndicadoresResponse = { dados: [], total: 0, pagina: 1, limite: 10 };

export function useIndicadores(f: FilterState) {
  const key = `indicadores:${f.ano}:${f.sg_uf}:${f.co_municipio}:${f.co_entidade}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}:${f.ordenar_por}:${f.ordem}:${f.pagina}:${f.limite}`;
  return useQuery<IndicadoresResponse>(key, {
    fetcher: () => getIndicadores(f),
    mock: () => mockIndicadores(f),
    fallback: RESP_VAZIA,
  });
}

// Resumo agregado (todos os registros do filtro, não só a página atual) —
// usado pelos cards de totais por etapa no Dashboard. Note que a chave de
// cache NÃO inclui pagina/limite/ordenar_por/ordem: o resumo é o mesmo
// independente da página ou ordenação em que o usuário está.
const RESUMO_VAZIO: ResumoIndicadores = {
  qt_mat_total: 0, qt_mat_inf: 0, qt_mat_fund: 0,
  qt_mat_med: 0, qt_mat_prof: 0, qt_mat_eja: 0, qt_mat_esp: 0,
};

export function useResumoIndicadores(f: FilterState) {
  const key = `resumo-indicadores:${f.ano}:${f.sg_uf}:${f.co_municipio}:${f.co_entidade}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}`;
  return useQuery<ResumoIndicadores>(key, {
    fetcher: () => getResumoIndicadores(f),
    mock: () => mockResumoIndicadores(f),
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

// ── Comparação entre entidades (uma requisição cacheada por alvo) ───────────
const LISTA_SERIES: SerieEntidade[] = [];

export function useComparacoesMulti(f: FilterState, alvos: Alvo[], metrica: "qt_matriculas" | "qt_escolas") {
  const chaves = alvos.map((a) => a.chave).join("|");
  const key = `cmp-multi:${chaves}:${metrica}:${f.ano_inicial}:${f.ano_final}:${f.sg_uf}:${f.co_municipio}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}`;
  return useQuery<SerieEntidade[]>(key, {
    fetcher: () => getComparacoesMulti(f, alvos, metrica),
    mock: () => mockComparacoesMulti(f, alvos, metrica),
    enabled: alvos.length > 0,
    fallback: LISTA_SERIES,
  });
}

export function useEvolucaoMulti(f: FilterState, alvos: Alvo[]) {
  const chaves = alvos.map((a) => a.chave).join("|");
  const key = `evo-multi:${chaves}:${f.indicador}:${f.ano_inicial}:${f.ano_final}:${f.sg_uf}:${f.co_municipio}:${f.tp_dependencia.join(",")}:${f.tp_localizacao}`;
  return useQuery<SerieEntidade[]>(key, {
    fetcher: () => getEvolucaoMulti(f, alvos),
    mock: () => mockEvolucaoMulti(f, alvos),
    enabled: alvos.length > 0,
    fallback: LISTA_SERIES,
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

// Ranking das escolas de um município — alimenta o painel aberto ao clicar numa
// linha do ranking. Só dispara quando há um município selecionado.
// tp_dependencia (opcional) isola o ranking dentro de uma única dependência.
export function useRankingEscolas(
  sg_uf: string,
  co_municipio: string,
  ano: number,
  limite: number,
  tp_dependencia: number[] = [],
) {
  const key = `ranking-escolas:${sg_uf}:${co_municipio}:${ano}:${limite}:${tp_dependencia.join(",")}`;
  return useQuery<RankingEscolaRow[]>(key, {
    fetcher: () => getRankingEscolas(sg_uf, co_municipio, ano, limite, tp_dependencia),
    mock: () => mockRankingEscolas(sg_uf, co_municipio, ano, limite, tp_dependencia),
    fallback: [],
    enabled: Boolean(co_municipio),
  });
}