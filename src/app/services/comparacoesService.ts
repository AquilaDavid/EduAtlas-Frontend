// Endpoints 2 e 3: Comparações e Evolução Histórica.
// GET /comparacoes?ano_inicial&ano_final&sg_uf&co_municipio&co_entidade&tp_dependencia&tp_localizacao
// GET /comparacoes/evolucao?indicador&ano_inicial&ano_final&sg_uf&co_municipio&co_entidade&tp_dependencia&tp_localizacao

import { cachedGet } from "./apiClient";
import type { FilterState, ComparacaoRow, EvolucaoPonto } from "../data/types";

function periodoParams(f: FilterState) {
  // Nomes de parâmetro têm que bater com FiltroComparacao / ComparacaoResource
  // e EvolucaoResource no backend (sg_uf, co_municipio, co_entidade,
  // tp_dependencia, tp_localizacao) — o backend ignora silenciosamente
  // qualquer parâmetro com nome diferente disso.
  return {
    ano_inicial: Math.min(f.ano_inicial, f.ano_final),
    ano_final: Math.max(f.ano_inicial, f.ano_final),
    sg_uf: f.sg_uf,
    co_municipio: f.co_municipio,
    co_entidade: f.co_entidade, // cascata Município → Escola (ignorado se vazio)
    tp_dependencia: f.tp_dependencia.length ? f.tp_dependencia.join(",") : "",
    tp_localizacao: f.tp_localizacao,
  };
}

export function getComparacoes(f: FilterState): Promise<ComparacaoRow[]> {
  return cachedGet<ComparacaoRow[]>("/comparacoes", periodoParams(f));
}

export function getEvolucao(f: FilterState): Promise<EvolucaoPonto[]> {
  return cachedGet<EvolucaoPonto[]>("/comparacoes/evolucao", {
    indicador: f.indicador,
    ...periodoParams(f),
  });
}
