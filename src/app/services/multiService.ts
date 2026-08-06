// Comparação entre múltiplas entidades — estados, municípios e escolas podem ser
// selecionados simultaneamente, inclusive de UFs/municípios diferentes.
//
// Contrato com a API: os endpoints 2 e 3 recebem uma entidade por vez
// (uf / municipio / escola). Por isso cada entidade selecionada vira uma
// requisição isolada, disparada em paralelo e memorizada pelo cachedGet — então
// acrescentar uma entidade à comparação só custa a requisição nova.
// Se o backend passar a aceitar listas (ex.: `uf=PB,PE`) e devolver as linhas
// já rotuladas pela entidade, basta trocar o corpo de getComparacoesMulti /
// getEvolucaoMulti: o resto da aplicação continua consumindo SerieEntidade[].

import { getComparacoes, getEvolucao } from "./comparacoesService";
import { getMunicipios } from "./localizacoesService";
import { getEscolas } from "./escolasService";
import type {
  ComparacaoRow,
  EscolaMunicipio,
  EvolucaoPonto,
  FilterState,
  MunicipioUf,
  NivelEntidade,
  SerieEntidade,
} from "../data/types";

// Uma entidade comparada carrega o recorte de filtros que a isola na API.
export interface Alvo {
  chave: string; // única no conjunto: "uf:PB", "mun:2506103", "esc:25000001"
  nome: string; // rótulo da série no gráfico
  nivel: NivelEntidade;
  patch: Partial<FilterState>; // sg_uf / co_municipio / co_entidade da entidade
}

export function filtrosDoAlvo(f: FilterState, alvo: Alvo): FilterState {
  return { ...f, ...alvo.patch };
}

// ── Opções: municípios e escolas de várias origens ao mesmo tempo ────────────

// Municípios de todos os estados marcados (uma chamada cacheada por UF).
export async function getMunicipiosDeUfs(ufs: string[]): Promise<MunicipioUf[]> {
  if (!ufs.length) return [];
  const listas = await Promise.all(
    ufs.map(async (sg_uf) => (await getMunicipios(sg_uf)).map((m) => ({ ...m, sg_uf }))),
  );
  return listas.flat();
}

// Escolas de todos os municípios marcados (uma chamada cacheada por cidade),
// mesmo que pertençam a estados diferentes.
export async function getEscolasDeMunicipios(
  municipios: { co_municipio: string; sg_uf: string }[],
): Promise<EscolaMunicipio[]> {
  if (!municipios.length) return [];
  const listas = await Promise.all(
    municipios.map(async (m) =>
      (await getEscolas(m.sg_uf, m.co_municipio)).map((e) => ({
        ...e,
        sg_uf: m.sg_uf,
        co_municipio: m.co_municipio,
      })),
    ),
  );
  return listas.flat();
}

// ── Séries comparadas ────────────────────────────────────────────────────────

// Achata as linhas por dependência em um total por ano.
function totalPorAno(rows: ComparacaoRow[], metrica: "qt_matriculas" | "qt_escolas"): EvolucaoPonto[] {
  const porAno = new Map<number, number>();
  for (const r of rows) porAno.set(r.ano, (porAno.get(r.ano) ?? 0) + r[metrica]);
  return [...porAno.entries()]
    .map(([ano, valor]) => ({ ano, valor }))
    .sort((a, b) => a.ano - b.ano);
}

export async function getComparacoesMulti(
  f: FilterState,
  alvos: Alvo[],
  metrica: "qt_matriculas" | "qt_escolas",
): Promise<SerieEntidade[]> {
  return Promise.all(
    alvos.map(async (a) => ({
      chave: a.chave,
      nome: a.nome,
      nivel: a.nivel,
      pontos: totalPorAno(await getComparacoes(filtrosDoAlvo(f, a)), metrica),
    })),
  );
}

export async function getEvolucaoMulti(f: FilterState, alvos: Alvo[]): Promise<SerieEntidade[]> {
  return Promise.all(
    alvos.map(async (a) => ({
      chave: a.chave,
      nome: a.nome,
      nivel: a.nivel,
      pontos: await getEvolucao(filtrosDoAlvo(f, a)),
    })),
  );
}
