import { cachedGet } from "./apiClient";

import type {
  FilterState,
  RankingRow,
} from "../data/types";

export function getRanking(
  f: FilterState
): Promise<RankingRow[]> {

  return cachedGet<RankingRow[]>(
    "/ranking",
    {
      ano: f.ano,

      co_uf:
        f.co_uf || "",

      sg_uf:
        f.sg_uf || "",

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

      limite: f.limite,
    }
  );
}