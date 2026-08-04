// Cache de requisições em memória com deduplicação de chamadas simultâneas.
// Evita bater no servidor repetidamente para os mesmos parâmetros (TTL de 5 min).

interface Entry {
  ts: number;
  data: unknown;
}

const TTL = 5 * 60 * 1000; // 5 minutos
const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export function makeKey(url: string, params?: Record<string, unknown>): string {
  return `${url}?${params ? JSON.stringify(params) : ""}`;
}

// Resolve a partir do cache; se ausente/expirado, executa o producer (e o cacheia).
export async function cachedResolve<T>(key: string, producer: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.ts < TTL) {
    return hit.data as T;
  }
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = producer()
    .then((data) => {
      store.set(key, { ts: Date.now(), data });
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key); // erros nunca são cacheados
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

// Invalida o cache — usado ao clicar em "tentar novamente".
export function clearCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
