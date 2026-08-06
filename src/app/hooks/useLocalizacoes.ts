// Filtros em cascata: carrega Estados no início e Municípios dinamicamente ao
// selecionar uma UF (endpoints 5 e 6). O município fica desabilitado até haver UF.

import { useCallback, useMemo } from "react";
import { useQuery } from "./useQuery";
import { getUfs, getMunicipios, getEscolas, getMunicipiosDeUfs, getEscolasDeMunicipios, type Alvo } from "../services";
import { mockUfs, mockMunicipios, mockEscolas, mockMunicipiosDeUfs, mockEscolasDeMunicipios } from "../data/mocks";
import type { Uf, Municipio, Escola, MunicipioUf, EscolaMunicipio, FilterState, Option } from "../data/types";

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

// ── Seleção múltipla para comparação ─────────────────────────────────────────
// Os três níveis são independentes e coexistem. Os estados marcados servem
// para *popular* a lista de municípios (de todos eles somados), e os municípios
// marcados populam a lista de escolas — mas nada obriga o usuário a descer de
// nível: ele pode comparar só estados, só escolas, ou os três misturados.

const VAZIO_MUN_UF: MunicipioUf[] = [];
const VAZIO_ESC_MUN: EscolaMunicipio[] = [];

export function useAlvosComparacao(filters: FilterState) {
  const { comparar_ufs, comparar_municipios, comparar_escolas } = filters;

  const ufs = useUfs();

  const chaveUfs = [...comparar_ufs].sort().join(",");
  const municipios = useQuery<MunicipioUf[]>(`cmp-municipios:${chaveUfs}`, {
    fetcher: () => getMunicipiosDeUfs(comparar_ufs),
    mock: () => mockMunicipiosDeUfs(comparar_ufs),
    enabled: comparar_ufs.length > 0,
    fallback: VAZIO_MUN_UF,
  });

  // Para buscar escolas é preciso saber a UF de cada município marcado — eles
  // podem vir de estados diferentes.
  const paresMunicipio = useMemo(
    () =>
      municipios.data
        .filter((m) => comparar_municipios.includes(m.co_municipio))
        .map((m) => ({ co_municipio: m.co_municipio, sg_uf: m.sg_uf })),
    [municipios.data, comparar_municipios],
  );

  const chaveMun = paresMunicipio.map((m) => m.co_municipio).sort().join(",");
  const escolas = useQuery<EscolaMunicipio[]>(`cmp-escolas:${chaveMun}`, {
    fetcher: () => getEscolasDeMunicipios(paresMunicipio),
    mock: () => mockEscolasDeMunicipios(paresMunicipio),
    enabled: paresMunicipio.length > 0,
    fallback: VAZIO_ESC_MUN,
  });

  const nomeMunicipio = useCallback(
    (co_municipio: string) => municipios.data.find((m) => m.co_municipio === co_municipio),
    [municipios.data],
  );

  // Rótulos sempre qualificados pela origem, já que entidades homônimas de
  // estados diferentes podem estar no mesmo gráfico.
  const opcoesUfs: Option[] = useMemo(
    () => ufs.data.map((u) => ({ value: u.sg_uf, label: `${u.no_uf} (${u.sg_uf})` })),
    [ufs.data],
  );

  const opcoesMunicipios: Option[] = useMemo(
    () => municipios.data.map((m) => ({ value: m.co_municipio, label: `${m.no_municipio} · ${m.sg_uf}` })),
    [municipios.data],
  );

  const opcoesEscolas: Option[] = useMemo(
    () =>
      escolas.data.map((e) => ({
        value: e.co_entidade,
        label: `${e.no_entidade} · ${nomeMunicipio(e.co_municipio)?.no_municipio ?? ""}/${e.sg_uf}`,
      })),
    [escolas.data, nomeMunicipio],
  );

  // Todas as entidades marcadas, nos três níveis, viram séries do gráfico.
  const alvos: Alvo[] = useMemo(() => {
    const lista: Alvo[] = [];

    for (const sg_uf of comparar_ufs) {
      const u = ufs.data.find((x) => x.sg_uf === sg_uf);
      lista.push({
        chave: `uf:${sg_uf}`,
        nome: u?.no_uf ?? sg_uf,
        nivel: "uf",
        patch: { sg_uf, co_uf: u?.co_uf ?? "", co_municipio: "", co_entidade: "" },
      });
    }

    for (const co_municipio of comparar_municipios) {
      const m = nomeMunicipio(co_municipio);
      lista.push({
        chave: `mun:${co_municipio}`,
        nome: m ? `${m.no_municipio} (${m.sg_uf})` : co_municipio,
        nivel: "municipio",
        patch: { sg_uf: m?.sg_uf ?? "", co_uf: "", co_municipio, co_entidade: "" },
      });
    }

    for (const co_entidade of comparar_escolas) {
      const e = escolas.data.find((x) => x.co_entidade === co_entidade);
      const m = e ? nomeMunicipio(e.co_municipio) : undefined;
      lista.push({
        chave: `esc:${co_entidade}`,
        nome: e ? `${e.no_entidade} (${m?.no_municipio ?? ""}/${e.sg_uf})` : co_entidade,
        nivel: "escola",
        patch: {
          sg_uf: e?.sg_uf ?? "",
          co_uf: "",
          co_municipio: e?.co_municipio ?? "",
          co_entidade,
        },
      });
    }

    return lista;
  }, [comparar_ufs, comparar_municipios, comparar_escolas, ufs.data, escolas.data, nomeMunicipio]);

  // Índice estável chave → posição, usado para colorir séries e chips igual.
  const indiceDaChave = useMemo(() => {
    const mapa = new Map<string, number>();
    alvos.forEach((a, i) => mapa.set(a.chave, i));
    return mapa;
  }, [alvos]);

  return {
    alvos,
    indiceDaChave,
    opcoesUfs,
    opcoesMunicipios,
    opcoesEscolas,
    municipiosData: municipios.data,
    escolasData: escolas.data,
    loadingUfs: ufs.loading,
    loadingMunicipios: municipios.loading,
    loadingEscolas: escolas.loading,
  };
}
