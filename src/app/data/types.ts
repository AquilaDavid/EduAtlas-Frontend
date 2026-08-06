// Tipos centrais do EduAtlas — modelam as respostas dos 6 endpoints do backend.

export type Ordem = "asc" | "desc";
export type LocalizacaoFiltro = "todas" | "1" | "2"; // 1 = Urbana, 2 = Rural

// ── Localização ──────────────────────────────────────────────────────────────
export interface Uf {
  co_uf: string;
  sg_uf: string;
  no_uf: string;
}

export interface Municipio {
  co_municipio: string;
  no_municipio: string;
}

// Instituição de ensino de um município (filtro em cascata a partir da cidade).
export interface Escola {
  co_entidade: string;
  no_entidade: string;
  tp_dependencia: number; // 1..4 — usado para automarcar a dependência ao selecionar
}

// ── Indicadores (Dashboard, paginado) ────────────────────────────────────────
export interface IndicadorRow {
  co_entidade: string;
  no_entidade: string;
  sg_uf: string;
  no_municipio: string;
  tp_dependencia: number; // 1..4
  tp_localizacao: number; // 1 Urbana | 2 Rural
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

// Resumo agregado dos indicadores — soma TODOS os registros que casam com o
// filtro (sem paginação). Usado pelos cards de totais por etapa (EtapaCards),
// que antes somavam só a página atual e davam totais errados.
export interface ResumoIndicadores {
  qt_mat_total: number;
  qt_mat_inf: number;
  qt_mat_fund: number;
  qt_mat_med: number;
  qt_mat_prof: number;
  qt_mat_eja: number;
  qt_mat_esp: number;
}

// ── Comparações (barras empilhadas por dependência) ──────────────────────────
export type DependenciaNome = "Federal" | "Estadual" | "Municipal" | "Privada";

export interface ComparacaoRow {
  ano: number;
  dependencia: DependenciaNome;
  qt_matriculas: number;
  qt_escolas: number;
}

// ── Evolução histórica (linha) ───────────────────────────────────────────────
export interface EvolucaoPonto {
  ano: number;
  valor: number;
}

// ── Comparação entre entidades ───────────────────────────────────────────────
// Os três níveis são independentes: o usuário pode selecionar vários estados,
// vários municípios (de estados diferentes) e várias escolas (de municípios
// diferentes) ao mesmo tempo. Cada entidade marcada vira uma série no gráfico.
export type NivelEntidade = "uf" | "municipio" | "escola";

// Município já resolvido com a UF de origem — necessário na cascata múltipla,
// pois vários estados podem estar selecionados ao mesmo tempo.
export interface MunicipioUf extends Municipio {
  sg_uf: string;
}

export interface EscolaMunicipio extends Escola {
  sg_uf: string;
  co_municipio: string;
}

// Série nomeada de uma entidade ao longo dos anos, usada nos gráficos multi.
export interface SerieEntidade {
  chave: string;
  nome: string;
  nivel: NivelEntidade;
  pontos: EvolucaoPonto[];
}

// ── Ranking de municípios ────────────────────────────────────────────────────
export interface RankingRow {
  posicao: number;
  co_municipio: string;
  no_municipio: string;
  sg_uf: string;
  qt_mat_total: number;
}

// Ranking de escolas — usado no detalhamento de um município.
export interface RankingEscolaRow {
  posicao: number;
  co_entidade: string;
  no_entidade: string;
  no_municipio: string;
  sg_uf: string;
  tp_dependencia: number;
  qt_mat_total: number;
}

// ── Estado global de filtros (cobre todas as telas) ──────────────────────────
export interface FilterState {
  // Tempo
  ano: number;
  ano_inicial: number;
  ano_final: number;
  // Localização
  sg_uf: string; // "" = todas
  co_uf: string; // derivado da UF selecionada
  co_municipio: string; // "" = todos
  // Instituição
  co_entidade: string; // "" = todas
  tp_dependencia: number[]; // 1..4
  tp_localizacao: LocalizacaoFiltro;
  // Comparação entre entidades — os três níveis coexistem e são multisseleção
  comparar_ufs: string[]; // sg_uf[]
  comparar_municipios: string[]; // co_municipio[] (podem ser de UFs diferentes)
  comparar_escolas: string[]; // co_entidade[] (podem ser de municípios/UFs diferentes)
  // Dados
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