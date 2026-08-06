// Endpoint 4: Ranking de Municípios.
// GET /ranking?ano&sg_uf&co_municipio&co_entidade&tp_dependencia&tp_localizacao&limite

import { cachedGet } from "./apiClient";
import type {
  FilterState,
  IndicadoresResponse,
  RankingEscolaRow,
  RankingRow,
} from "../data/types";

export function getRanking(f: FilterState): Promise<RankingRow[]> {
  // Nomes de parâmetro têm que bater com o RankingResource no backend
  // (sg_uf, co_municipio, co_entidade, tp_dependencia, tp_localizacao) —
  // o backend ignora silenciosamente qualquer parâmetro com nome diferente.
  return cachedGet<RankingRow[]>("/ranking", {
    ano: f.ano,
    sg_uf: f.sg_uf,
    co_municipio: f.co_municipio, // cascata Estado → Município (ignorado se vazio)
    co_entidade: f.co_entidade, // cascata Município → Escola (ignorado se vazio)
    tp_dependencia: f.tp_dependencia.length ? f.tp_dependencia.join(",") : "",
    tp_localizacao: f.tp_localizacao, // "todas" = geral | "1" = Urbana | "2" = Rural
    limite: f.limite,
  });
}

// Ranking das escolas de um município — usado no detalhamento (painel lateral)
// aberto ao clicar numa linha do ranking. Não há endpoint próprio: reaproveita
// o endpoint 1 (/indicadores) já ordenado por matrículas. tp_dependencia é
// opcional — permite "isolar" o ranking dentro de um único tipo de dependência.
export async function getRankingEscolas(
  sg_uf: string,
  co_municipio: string,
  ano: number,
  limite: number,
  tp_dependencia: number[] = [],
): Promise<RankingEscolaRow[]> {
  if (!co_municipio) return [];
  const resp = await cachedGet<IndicadoresResponse>("/indicadores", {
    ano,
    sg_uf,
    co_municipio,
    tp_dependencia: tp_dependencia.length ? tp_dependencia.join(",") : "",
    ordenar_por: "qt_mat_total",
    ordem: "desc",
    pagina: 1,
    limite,
  });
  return resp.dados.map((r, i) => ({
    posicao: i + 1,
    co_entidade: r.co_entidade,
    no_entidade: r.no_entidade,
    no_municipio: r.no_municipio,
    sg_uf: r.sg_uf,
    tp_dependencia: r.tp_dependencia,
    qt_mat_total: r.qt_mat_total,
  }));
}
