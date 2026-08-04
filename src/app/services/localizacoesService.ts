import { cachedGet } from "./apiClient";

import type {
  Uf,
  Municipio,
} from "../data/types";

interface ListaResponse<T> {
  dados: T[];
}

export async function getUfs(): Promise<Uf[]> {
  const response = await cachedGet<ListaResponse<Uf>>(
    "/localizacoes/ufs"
  );

  return response.dados;
}

export async function getMunicipios(
  sg_uf: string
): Promise<Municipio[]> {
  const response = await cachedGet<ListaResponse<Municipio>>(
    `/localizacoes/municipios/${sg_uf}`
  );

  return response.dados;
}

// getEscolas vive em ./escolasService.ts — reaproveita o endpoint /indicadores
// (o backend não expõe /localizacoes/escolas/:uf/:municipio).