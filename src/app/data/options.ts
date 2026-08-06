// Opções visuais pré-carregadas — todos os filtros são de seleção fechada.

import type { DependenciaNome, Option } from "./types";

// ── Tempo ──────────────────────────────────────────────────────────────────
export const ANOS: number[] = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// ── Instituição: Dependência Administrativa (tp_dependencia) ─────────────────
export interface Dependencia {
  value: number;
  nome: DependenciaNome;
}

export const DEPENDENCIAS: Dependencia[] = [
  { value: 1, nome: "Federal" },
  { value: 2, nome: "Estadual" },
  { value: 3, nome: "Municipal" },
  { value: 4, nome: "Privada" },
];

export const DEP_LABEL: Record<number, DependenciaNome> = {
  1: "Federal",
  2: "Estadual",
  3: "Municipal",
  4: "Privada",
};

export const DEP_COR: Record<DependenciaNome, string> = {
  Federal: "var(--chart-4)",
  Estadual: "var(--chart-1)",
  Municipal: "var(--chart-2)",
  Privada: "var(--chart-3)",
};

// ── Instituição: Localização (tp_localizacao) ────────────────────────────────
export const LOCALIZACOES: Option[] = [
  { value: "todas", label: "Todas" },
  { value: "1", label: "Urbana" },
  { value: "2", label: "Rural" },
];

export const LOC_LABEL: Record<number, string> = { 1: "Urbana", 2: "Rural" };

// ── Dados: Indicadores (usados na Evolução) ──────────────────────────────────
export const INDICADORES: Option[] = [
  { value: "qt_mat_total", label: "Matrículas — Total" },
  { value: "qt_mat_inf", label: "Educação Infantil" },
  { value: "qt_mat_fund", label: "Ensino Fundamental" },
  { value: "qt_mat_med", label: "Ensino Médio" },
  { value: "qt_mat_prof", label: "Educação Profissional" },
  { value: "qt_mat_eja", label: "EJA" },
  { value: "qt_mat_esp", label: "Educação Especial" },
  { value: "qt_escolas", label: "Número de Escolas" },
];

export function labelIndicador(value: string): string {
  return INDICADORES.find((i) => i.value === value)?.label ?? value;
}

// Etapas de ensino exibidas como cards no Dashboard.
export const ETAPAS: { key: keyof import("./types").IndicadorRow; label: string }[] = [
  { key: "qt_mat_total", label: "Total" },
  { key: "qt_mat_inf", label: "Infantil" },
  { key: "qt_mat_fund", label: "Fundamental" },
  { key: "qt_mat_med", label: "Médio" },
  { key: "qt_mat_prof", label: "Profissional" },
  { key: "qt_mat_eja", label: "EJA" },
  { key: "qt_mat_esp", label: "Especial" },
];

// ── Dados: Ordenação ─────────────────────────────────────────────────────────
export const ORDENAR_POR: Option[] = [
  { value: "qt_mat_total", label: "Matrículas totais" },
  { value: "no_entidade", label: "Nome da escola" },
  { value: "sg_uf", label: "UF" },
];

export const ORDENS: Option[] = [
  { value: "desc", label: "Maior → menor" },
  { value: "asc", label: "Menor → maior" },
];

// ── Dados: Paginação ─────────────────────────────────────────────────────────
export const LIMITES: number[] = [10, 25, 50, 100];

export function fmtInt(v: number): string {
  return Math.round(v).toLocaleString("pt-BR");
}

// ── Comparação entre entidades ───────────────────────────────────────────────
// Paleta das séries — uma cor por entidade comparada.
export const CORES_SERIE: string[] = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
  "#0891b2", "#c2410c", "#7c3aed", "#15803d", "#be123c",
];

export const corSerie = (i: number): string => CORES_SERIE[i % CORES_SERIE.length];

// Limite total de entidades comparadas ao mesmo tempo, somando os três níveis.
export const MAX_ALVOS = 10;

// Traço de cada nível, para distinguir estados/municípios/escolas no gráfico.
export const TRACO_NIVEL: Record<import("./types").NivelEntidade, string | undefined> = {
  uf: undefined,
  municipio: "6 3",
  escola: "2 3",
};

export const ROTULO_NIVEL: Record<import("./types").NivelEntidade, string> = {
  uf: "Estado",
  municipio: "Município",
  escola: "Escola",
};
