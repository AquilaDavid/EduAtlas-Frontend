import { cachedGet } from "./apiClient";

import type {
  FilterState,
  ComparacaoRow,
  EvolucaoPonto,
} from "../data/types";

function periodoParams(f: FilterState) {
  return {
    ano_inicial: Math.min(
      f.ano_inicial,
      f.ano_final
    ),

    ano_final: Math.max(
      f.ano_inicial,
      f.ano_final
    ),

    co_uf: f.co_uf || "",
    sg_uf: f.sg_uf || "",

    co_municipio:
      f.co_municipio || "",

    co_entidade:
      f.co_entidade || "",

    tp_dependencia:
      f.tp_dependencia.length
        ? f.tp_dependencia.join(",")
        : "",

    tp_localizacao:
      f.tp_localizacao === "todas"
        ? ""
        : f.tp_localizacao,
  };
}

export function getComparacoes(
  f: FilterState
): Promise<ComparacaoRow[]> {
  return cachedGet<ComparacaoRow[]>(
    "/comparacoes",
    periodoParams(f)
  );
}

export function getEvolucao(
  f: FilterState
): Promise<EvolucaoPonto[]> {
  return cachedGet<EvolucaoPonto[]>(
    "/comparacoes/evolucao",
    {
      indicador: f.indicador,
      ...periodoParams(f),
    }
  );
}