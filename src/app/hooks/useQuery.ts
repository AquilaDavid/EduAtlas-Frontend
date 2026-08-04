// Hook genérico de consumo de API com:
// - estados de Carregando / Erro
// - fallback opcional para dados de demonstração (mock)
// - "tentar novamente" (retry) que invalida o cache e refaz a chamada
//
// O cache de GET vive na camada de serviço (apiClient/requestCache); aqui apenas
// orquestramos os estados visuais.

import { useCallback, useEffect, useRef, useState } from "react";
import { clearCache } from "../services";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface QueryOptions<T> {
  fetcher: () => Promise<T>;
  mock?: () => T; // fallback de demonstração
  enabled?: boolean;
  fallback: T; // valor inicial enquanto carrega
}

export interface QueryResult<T> {
  data: T;
  loading: boolean;
  error: boolean;
  demo: boolean; // true quando exibindo dados de demonstração
  refetch: () => void;
}

export function useQuery<T>(key: string, { fetcher, mock, enabled = true, fallback }: QueryOptions<T>): QueryResult<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);
  const [demo, setDemo] = useState(false);
  const [tick, setTick] = useState(0);

  // Mantém as funções mais recentes sem forçar re-execução do efeito.
  const ref = useRef({ fetcher, mock });
  ref.current = { fetcher, mock };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setData(fallback);
      setError(false);
      setDemo(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(false);

    ref.current
      .fetcher()
      .then((res) => {
        if (!alive) return;
        setData(res);
        setDemo(false);
        setLoading(false);
      })
      .catch(async () => {
        if (!alive) return;
        // Backend indisponível → tenta o mock de demonstração.
        if (ref.current.mock) {
          await delay(450); // deixa o skeleton visível
          if (!alive) return;
          setData(ref.current.mock());
          setDemo(true);
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, tick]);

  const refetch = useCallback(() => {
    clearCache();
    setTick((t) => t + 1);
  }, []);

  return { data, loading, error, demo, refetch };
}
