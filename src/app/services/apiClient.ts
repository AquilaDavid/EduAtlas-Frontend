// Instância única e centralizada do Axios + wrapper de GET com cache.
// Toda a comunicação HTTP do EduAtlas passa por aqui.

import axios from "axios";
import { cachedResolve, makeKey } from "./requestCache";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

// Remove chaves vazias / neutras antes de enviar ao backend.
export function cleanParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === "todas") continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

// GET cacheado — repetições com os mesmos parâmetros não geram nova chamada.
export function cachedGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const clean = params ? cleanParams(params) : undefined;
  const key = makeKey(url, clean);
  return cachedResolve<T>(key, () => apiClient.get<T>(url, { params: clean }).then((r) => r.data));
}
