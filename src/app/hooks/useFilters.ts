// Estado centralizado dos filtros, com a regra de cascata Estado → Município → Escola.

import { useCallback, useState } from "react";
import type { FilterState, Uf } from "../data/types";

export const defaultFilters: FilterState = {
  ano: 2024,
  ano_inicial: 2015,
  ano_final: 2024,
  sg_uf: "",
  co_uf: "",
  co_municipio: "",
  co_entidade: "",
  tp_dependencia: [1, 2, 3, 4],
  tp_localizacao: "todas",
  comparar_ufs: [],
  comparar_municipios: [],
  comparar_escolas: [],
  indicador: "qt_mat_total",
  ordenar_por: "qt_mat_total",
  ordem: "desc",
  pagina: 1,
  limite: 10,
};

export function useFilters(initial?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, ...initial });

  const set = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value } as FilterState;
      if (key !== "pagina") next.pagina = 1; // qualquer filtro reinicia a paginação
      return next;
    });
  }, []);

  // Cascata: ao trocar de Estado, zera Município e Escola.
  const setUf = useCallback((uf: Uf | null) => {
    setFilters((prev) => ({
      ...prev,
      sg_uf: uf?.sg_uf ?? "",
      co_uf: uf?.co_uf ?? "",
      co_municipio: "",
      co_entidade: "",
      pagina: 1,
    }));
  }, []);

  const setMunicipio = useCallback((co_municipio: string) => {
    setFilters((prev) => ({ ...prev, co_municipio, co_entidade: "", pagina: 1 }));
  }, []);

  // Ao selecionar uma escola, marca apenas a dependência dela; ao limpar, volta a todas.
  const setEscola = useCallback((co_entidade: string, tp_dependencia?: number) => {
    setFilters((prev) => ({
      ...prev,
      co_entidade,
      tp_dependencia: co_entidade && tp_dependencia ? [tp_dependencia] : [1, 2, 3, 4],
      pagina: 1,
    }));
  }, []);

  const toggleDependencia = useCallback((id: number) => {
    setFilters((prev) => {
      const has = prev.tp_dependencia.includes(id);
      const tp_dependencia = has
        ? prev.tp_dependencia.filter((d) => d !== id)
        : [...prev.tp_dependencia, id].sort((a, b) => a - b);
      return { ...prev, tp_dependencia, pagina: 1 };
    });
  }, []);

  // Comparação entre entidades — os três níveis são independentes e múltiplos.
  // Um único setter recebe o patch já podado pelo painel (que conhece a origem
  // de cada município/escola), evitando seleções órfãs sem apagar as válidas.
  const setComparacao = useCallback(
    (patch: Partial<Pick<FilterState, "comparar_ufs" | "comparar_municipios" | "comparar_escolas">>) => {
      setFilters((prev) => ({ ...prev, ...patch, pagina: 1 }));
    },
    [],
  );

  const limparComparacao = useCallback(() => {
    setFilters((prev) => ({ ...prev, comparar_ufs: [], comparar_municipios: [], comparar_escolas: [], pagina: 1 }));
  }, []);

  const reset = useCallback(() => setFilters({ ...defaultFilters, ...initial }), [initial]);

  return { filters, set, setUf, setMunicipio, setEscola, toggleDependencia, setComparacao, limparComparacao, reset };
}

export type UseFiltersReturn = ReturnType<typeof useFilters>;
