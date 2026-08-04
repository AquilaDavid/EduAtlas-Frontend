// Serviço de Escolas — instituições de um município (filtro em cascata).
// Reaproveita o endpoint 1 (/indicadores) restrito à cidade para listar as
// escolas disponíveis, retornando apenas {co_entidade, no_entidade}.

import { cachedGet } from "./apiClient";
import type { Escola, IndicadoresResponse } from "../data/types";

export async function getEscolas(sg_uf: string, co_municipio: string): Promise<Escola[]> {
  if (!co_municipio) return [];
  const resp = await cachedGet<IndicadoresResponse>("/indicadores", {
    sg_uf,
    co_municipio,
    ordenar_por: "no_entidade",
    ordem: "desc",
    pagina: 1,
    limite: 1000,
  });
  // Dedup por co_entidade, preservando a ordem alfabética retornada pela API.
  const vistos = new Set<string>();
  const escolas: Escola[] = [];
  for (const r of resp.dados) {
    if (vistos.has(r.co_entidade)) continue;
    vistos.add(r.co_entidade);
    escolas.push({ co_entidade: r.co_entidade, no_entidade: r.no_entidade, tp_dependencia: r.tp_dependencia });
  }
  return escolas;
}
