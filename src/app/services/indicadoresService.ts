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

// Endpoint 2: Resumo agregado — soma TODOS os registros que casam com o
// filtro (sem paginação), usado pelos cards de totais por etapa (EtapaCards).
// Reaproveita os mesmos filtros geográficos/de dependência do dashboard, mas
// nunca envia pagina/limite/ordenacao, já que o backend soma tudo sem LIMIT.
// ATENÇÃO: confirme o path real da rota em indicador_routes.py — pode ser
// "/indicadores/resumo" ou outro nome.
export function getResumoIndicadores(f: FilterState): Promise<ResumoIndicadores> {
  const { pagina, limite, ordenar_por, ordem, ...paramsResumo } = buildIndicadoresParams(f);
  return cachedGet<ResumoIndicadores>("/indicadores/resumo", paramsResumo);
}