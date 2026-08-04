export type Ordem = "asc" | "desc";

export type LocalizacaoFiltro = "todas" | "1" | "2";

export type Dependencia = 1 | 2 | 3 | 4;

export type Indicador =
  | "qt_mat_total"
  | "qt_mat_bas"
  | "qt_mat_inf"
  | "qt_mat_fund"
  | "qt_mat_med"
  | "qt_mat_prof"
  | "qt_mat_eja"
  | "qt_mat_esp"
  | "qt_escolas";

// ─────────────────────────────────────────────
// Localização
// ─────────────────────────────────────────────

export interface Uf {
  co_uf: string;
  sg_uf: string;
  no_uf: string;
}

export interface Municipio {
  co_municipio: string;
  no_municipio: string;
}

export interface Escola {
  co_entidade: string;
  no_entidade: string;
  tp_dependencia: Dependencia;
}

// ─────────────────────────────────────────────
// Indicadores
// ─────────────────────────────────────────────

export interface IndicadorRow {
  co_entidade: string;
  no_entidade: string;

  co_uf?: string;
  sg_uf: string;
  no_uf?: string;

  co_municipio: string;
  no_municipio: string;

  tp_dependencia: Dependencia;
  tp_localizacao: 1 | 2;

  qt_mat_total: number;
  qt_mat_bas: number;
  qt_mat_inf: number;
  qt_mat_fund: number;
  qt_mat_med: number;
  qt_mat_prof: number;
  qt_mat_eja: number;
  qt_mat_esp: number;
}

export interface IndicadoresResponse {
  dados: IndicadorRow[];
  total: number;
  pagina: number;
  limite: number;
}

// Soma agregada de TODA a tabela filtrada (sem paginação) — usado nos
// cards do Dashboard, ao contrário de IndicadorRow que é por escola.
export interface ResumoIndicadores {
  qt_mat_total: number;
  qt_mat_inf: number;
  qt_mat_fund: number;
  qt_mat_med: number;
  qt_mat_prof: number;
  qt_mat_eja: number;
  qt_mat_esp: number;
}

// ─────────────────────────────────────────────
// Comparações
// ─────────────────────────────────────────────

export type DependenciaNome =
  | "Federal"
  | "Estadual"
  | "Municipal"
  | "Privada";

export interface ComparacaoRow {
  ano: number;
  dependencia: DependenciaNome;
  qt_matriculas: number;
  qt_escolas: number;
}

// ─────────────────────────────────────────────
// Evolução
// ─────────────────────────────────────────────

export interface EvolucaoPonto {
  ano: number;
  valor: number;
}

// ─────────────────────────────────────────────
// Ranking
// ─────────────────────────────────────────────

export interface RankingRow {
  posicao: number;
  co_municipio: string;
  no_municipio: string;
  sg_uf: string;
  qt_mat_total: number;
}

// ─────────────────────────────────────────────
// Filtros
// ─────────────────────────────────────────────

export interface FilterState {
  ano: number;

  ano_inicial: number;
  ano_final: number;

  sg_uf: string;
  co_uf: string;

  co_municipio: string;
  co_entidade: string;

  tp_dependencia: number[];

  tp_localizacao: LocalizacaoFiltro;

  indicador: string;

  ordenar_por: string;
  ordem: Ordem;

  pagina: number;
  limite: number;
}

export interface Option<T = string> {
  value: T;
  label: string;
}