// Filtros em cascata: carrega Estados no início e Municípios dinamicamente ao
// selecionar uma UF (endpoints 5 e 6). O município fica desabilitado até haver UF.

import { useQuery } from "./useQuery";
import { getUfs, getMunicipios, getEscolas } from "../services";
import { mockUfs, mockMunicipios, mockEscolas } from "../data/mocks";
import type { Uf, Municipio, Escola } from "../data/types";

const VAZIO_UF: Uf[] = [];
const VAZIO_MUN: Municipio[] = [];
const VAZIO_ESC: Escola[] = [];

export function useUfs() {
  return useQuery<Uf[]>("ufs", {
    fetcher: getUfs,
    mock: mockUfs,
    fallback: VAZIO_UF,
  });
}

export function useMunicipios(sg_uf: string) {
  return useQuery<Municipio[]>(`municipios:${sg_uf}`, {
    fetcher: () => getMunicipios(sg_uf),
    mock: () => mockMunicipios(sg_uf),
    enabled: !!sg_uf, // cascata: só busca quando há UF selecionada
    fallback: VAZIO_MUN,
  });
}

export function useEscolas(sg_uf: string, co_municipio: string) {
  return useQuery<Escola[]>(`escolas:${co_municipio}`, {
    fetcher: () => getEscolas(sg_uf, co_municipio),
    mock: () => mockEscolas(sg_uf, co_municipio),
    enabled: !!co_municipio, // cascata: só busca quando há município selecionado
    fallback: VAZIO_ESC,
  });
}
