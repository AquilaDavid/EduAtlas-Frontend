// Ponto de entrada único da camada de serviços (API).
export { apiClient, cachedGet, cleanParams, API_BASE_URL } from "./apiClient";
export { clearCache } from "./requestCache";
export * from "./localizacoesService";
export * from "./escolasService";
export * from "./indicadoresService";
export * from "./comparacoesService";
export * from "./rankingService";
