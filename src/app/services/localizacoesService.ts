// Serviço de localizações — Estados e Municípios (filtros em cascata).
// Endpoints 5 e 6: GET /localizacoes/ufs e GET /localizacoes/municipios/{sg_uf}

import { cachedGet } from "./apiClient";
import type { Uf, Municipio } from "../data/types";

// O backend responde { "dados": [...] } nesses dois endpoints (ver
// ServicoLocalizacao.listar_ufs/listar_municipios), diferente dos demais
// endpoints que devolvem a lista "crua" — por isso o unwrap aqui.
interface LocalizacaoResponse<T> {
  dados: T[];
}

export async function getUfs(): Promise<Uf[]> {
  const resp = await cachedGet<LocalizacaoResponse<Uf>>("/localizacoes/ufs");
  return resp.dados;
}

export async function getMunicipios(sg_uf: string): Promise<Municipio[]> {
  const resp = await cachedGet<LocalizacaoResponse<Municipio>>(`/localizacoes/municipios/${sg_uf}`);
  return resp.dados;
}
