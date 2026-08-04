// Endpoint 1: Dashboard de Indicadores (paginado).
// GET /indicadores?ano&co_entidade&sg_uf&co_uf&co_municipio&tp_dependencia
//     &tp_localizacao&ordenar_por&ordem&pagina&limite

import { cachedGet } from "./apiClient";
import type { FilterState, IndicadoresResponse, ResumoIndicadores } from "../data/types";

export function buildIndicadoresParams(f: FilterState) {
  return {
    ano: f.ano,
    co_entidade: f.co_entidade,
    sg_uf: f.sg_uf,
    co_uf: f.co_uf,
    co_municipio: f.co_municipio,
    tp_dependencia: f.tp_dependencia.length ? f.tp_dependencia.join(",") : "",
    tp_localizacao: f.tp_localizacao,
    ordenar_por: f.ordenar_por,
    ordem: f.ordem,
    pagina: f.pagina,
    limite: f.limite,
  };
}

export function getIndicadores(f: FilterState): Promise<IndicadoresResponse> {
  return cachedGet<IndicadoresResponse>("/indicadores", buildIndicadoresParams(f));
}

// Endpoint 1b: soma agregada de TODA a tabela filtrada (sem paginação).
// GET /indicadores/resumo?ano&co_entidade&sg_uf&co_uf&co_municipio&tp_dependencia&tp_localizacao
export function getResumoIndicadores(f: FilterState): Promise<ResumoIndicadores> {
  return cachedGet<ResumoIndicadores>("/indicadores/resumo", buildIndicadoresParams(f));
}

// Ranking de escolas dentro de UM único município (drill-down a partir do
// Ranking de municípios). Reaproveita /indicadores — já devolve exatamente
// o que precisamos por escola (nome, UF, dependência, matrículas) e já
// aceita co_municipio + tp_dependencia (para "isolar" o ranking por
// dependência) + ordenação por qt_mat_total desc.
export function getEscolasRankingMunicipio(params: {
  ano: number;
  sg_uf: string;
  co_municipio: string;
  tp_dependencia: number[];
  limite?: number;
}): Promise<IndicadoresResponse> {
  return cachedGet<IndicadoresResponse>("/indicadores", {
    ano: params.ano,
    sg_uf: params.sg_uf,
    co_municipio: params.co_municipio,
    tp_dependencia: params.tp_dependencia.length ? params.tp_dependencia.join(",") : "",
    ordenar_por: "qt_mat_total",
    ordem: "desc",
    pagina: 1,
    limite: params.limite ?? 100,
  });
}