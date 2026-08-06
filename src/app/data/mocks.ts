// Dados de demonstração — usados como fallback quando o backend (localhost:5000)
// está indisponível. Determinísticos: os mesmos filtros geram sempre o mesmo retorno.

import type {
  Uf,
  Municipio,
  Escola,
  FilterState,
  IndicadorRow,
  IndicadoresResponse,
  ResumoIndicadores,
  ComparacaoRow,
  EvolucaoPonto,
  RankingRow,
  RankingEscolaRow,
  DependenciaNome,
  SerieEntidade,
  MunicipioUf,
  EscolaMunicipio,
} from "./types";
import { DEP_LABEL } from "./options";
import { filtrosDoAlvo, type Alvo } from "../services/multiService";

// ── PRNG determinístico ──────────────────────────────────────────────────────
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seeded(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Estados ──────────────────────────────────────────────────────────────────
export const UFS_MOCK: Uf[] = [
  ["12", "AC", "Acre"], ["27", "AL", "Alagoas"], ["16", "AP", "Amapá"], ["13", "AM", "Amazonas"],
  ["29", "BA", "Bahia"], ["23", "CE", "Ceará"], ["53", "DF", "Distrito Federal"], ["32", "ES", "Espírito Santo"],
  ["52", "GO", "Goiás"], ["21", "MA", "Maranhão"], ["51", "MT", "Mato Grosso"], ["50", "MS", "Mato Grosso do Sul"],
  ["31", "MG", "Minas Gerais"], ["15", "PA", "Pará"], ["25", "PB", "Paraíba"], ["41", "PR", "Paraná"],
  ["26", "PE", "Pernambuco"], ["22", "PI", "Piauí"], ["33", "RJ", "Rio de Janeiro"], ["24", "RN", "Rio Grande do Norte"],
  ["43", "RS", "Rio Grande do Sul"], ["11", "RO", "Rondônia"], ["14", "RR", "Roraima"], ["42", "SC", "Santa Catarina"],
  ["35", "SP", "São Paulo"], ["28", "SE", "Sergipe"], ["17", "TO", "Tocantins"],
].map(([co_uf, sg_uf, no_uf]) => ({ co_uf, sg_uf, no_uf }));

export function mockUfs(): Uf[] {
  return UFS_MOCK;
}

// Capitais para tornar o primeiro município reconhecível.
const CAPITAIS: Record<string, string> = {
  AC: "Rio Branco", AL: "Maceió", AP: "Macapá", AM: "Manaus", BA: "Salvador", CE: "Fortaleza",
  DF: "Brasília", ES: "Vitória", GO: "Goiânia", MA: "São Luís", MT: "Cuiabá", MS: "Campo Grande",
  MG: "Belo Horizonte", PA: "Belém", PB: "João Pessoa", PR: "Curitiba", PE: "Recife", PI: "Teresina",
  RJ: "Rio de Janeiro", RN: "Natal", RS: "Porto Alegre", RO: "Porto Velho", RR: "Boa Vista",
  SC: "Florianópolis", SP: "São Paulo", SE: "Aracaju", TO: "Palmas",
};
const SUFIXOS = ["Nova", "Santa Rita", "do Norte", "do Sul", "Alta", "Verde", "das Flores", "Central", "do Vale", "Grande"];

export function mockMunicipios(sg_uf: string): Municipio[] {
  const uf = UFS_MOCK.find((u) => u.sg_uf === sg_uf);
  if (!uf) return [];
  const rand = seeded(hash(`mun-${sg_uf}`));
  const qtd = 8 + Math.floor(rand() * 8);
  const municipios: Municipio[] = [{ co_municipio: `${uf.co_uf}00001`, no_municipio: CAPITAIS[sg_uf] ?? `${sg_uf} Capital` }];
  for (let i = 2; i <= qtd; i++) {
    const nome = `${["São", "Santo", "Bela", "Porto", "Vila", "Campo"][Math.floor(rand() * 6)]} ${SUFIXOS[Math.floor(rand() * SUFIXOS.length)]}`;
    municipios.push({ co_municipio: `${uf.co_uf}${String(i).padStart(5, "0")}`, no_municipio: nome });
  }
  return municipios;
}

// ── Escolas de um município (cascata) ────────────────────────────────────────
const ESCOLA_PREFIXOS = ["EMEF", "EEEF", "Colégio", "Instituto", "Escola Municipal", "IF Campus"];
const ESCOLA_NOMES = ["Paulo Freire", "Cecília Meireles", "Machado de Assis", "Anísio Teixeira", "Darcy Ribeiro", "Rui Barbosa", "Castro Alves", "Monteiro Lobato", "Tarsila do Amaral", "Cora Coralina"];

export function mockEscolas(sg_uf: string, co_municipio: string): Escola[] {
  if (!co_municipio) return [];
  const rand = seeded(hash(`esc-${sg_uf}-${co_municipio}`));
  const qtd = 6 + Math.floor(rand() * 12);
  const escolas: Escola[] = [];
  for (let i = 0; i < qtd; i++) {
    escolas.push({
      co_entidade: `${co_municipio}${String(100 + i).padStart(4, "0")}`,
      no_entidade: `${ESCOLA_PREFIXOS[i % ESCOLA_PREFIXOS.length]} ${ESCOLA_NOMES[Math.floor(rand() * ESCOLA_NOMES.length)]}`,
      tp_dependencia: 1 + Math.floor(rand() * 4),
    });
  }
  return escolas.sort((a, b) => a.no_entidade.localeCompare(b.no_entidade, "pt-BR"));
}

function gerarLinha(f: FilterState, i: number): IndicadorRow {
  const rand = seeded(hash(`ind-${f.ano}-${f.sg_uf}-${f.co_municipio}-${f.tp_localizacao}-${i}`));
  const dep = f.tp_dependencia.length ? f.tp_dependencia[i % f.tp_dependencia.length] : ((i % 4) + 1);
  const base = 120 + rand() * 2400;
  const inf = Math.round(base * (0.1 + rand() * 0.15));
  const fund = Math.round(base * (0.35 + rand() * 0.2));
  const med = Math.round(base * (0.15 + rand() * 0.15));
  const prof = Math.round(base * rand() * 0.08);
  const eja = Math.round(base * rand() * 0.07);
  const esp = Math.round(base * rand() * 0.05);
  const bas = inf + fund + med;
  const total = bas + prof + eja + esp;
  const uf = UFS_MOCK.find((u) => u.sg_uf === f.sg_uf) ?? UFS_MOCK[24];
  return {
    co_entidade: `${uf.co_uf}${String(10000 + i).padStart(6, "0")}`,
    no_entidade: `${ESCOLA_PREFIXOS[i % ESCOLA_PREFIXOS.length]} ${ESCOLA_NOMES[i % ESCOLA_NOMES.length]}`,
    sg_uf: uf.sg_uf,
    no_municipio: CAPITAIS[uf.sg_uf] ?? uf.no_uf,
    tp_dependencia: dep,
    tp_localizacao: f.tp_localizacao === "todas" ? ((i % 2) + 1) : Number(f.tp_localizacao),
    qt_mat_total: total, qt_mat_bas: bas, qt_mat_inf: inf, qt_mat_fund: fund,
    qt_mat_med: med, qt_mat_prof: prof, qt_mat_eja: eja, qt_mat_esp: esp,
  };
}

export function mockIndicadores(f: FilterState): IndicadoresResponse {
  const total = 137; // total simulado de escolas para o recorte
  const start = (f.pagina - 1) * f.limite;
  const dados: IndicadorRow[] = [];
  for (let i = start; i < Math.min(start + f.limite, total); i++) dados.push(gerarLinha(f, i));

  const dir = f.ordem === "asc" ? 1 : -1;
  dados.sort((a, b) => {
    const key = f.ordenar_por as keyof IndicadorRow;
    const av = a[key], bv = b[key];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv), "pt-BR") * dir;
  });
  return { dados, total, pagina: f.pagina, limite: f.limite };
}

// Resumo agregado — soma TODAS as `total` linhas simuladas (não só a página
// atual), pra espelhar o comportamento real do backend (SUM sem LIMIT).
// Reaproveita o mesmo gerador (`gerarLinha`) usado por `mockIndicadores`, então
// os números batem exatamente com o que apareceria se você somasse manualmente
// todas as páginas.
export function mockResumoIndicadores(f: FilterState): ResumoIndicadores {
  const total = 137; // mesmo total simulado de mockIndicadores
  const acc: ResumoIndicadores = {
    qt_mat_total: 0, qt_mat_inf: 0, qt_mat_fund: 0,
    qt_mat_med: 0, qt_mat_prof: 0, qt_mat_eja: 0, qt_mat_esp: 0,
  };
  for (let i = 0; i < total; i++) {
    const linha = gerarLinha(f, i);
    acc.qt_mat_total += linha.qt_mat_total;
    acc.qt_mat_inf += linha.qt_mat_inf;
    acc.qt_mat_fund += linha.qt_mat_fund;
    acc.qt_mat_med += linha.qt_mat_med;
    acc.qt_mat_prof += linha.qt_mat_prof;
    acc.qt_mat_eja += linha.qt_mat_eja;
    acc.qt_mat_esp += linha.qt_mat_esp;
  }
  return acc;
}

// ── Comparações (por ano × dependência) ──────────────────────────────────────
export function mockComparacoes(f: FilterState): ComparacaoRow[] {
  const de = Math.min(f.ano_inicial, f.ano_final);
  const ate = Math.max(f.ano_inicial, f.ano_final);
  const deps: DependenciaNome[] = (f.tp_dependencia.length ? f.tp_dependencia : [1, 2, 3, 4]).map((d) => DEP_LABEL[d]);
  const rows: ComparacaoRow[] = [];
  for (let ano = de; ano <= ate; ano++) {
    for (const dependencia of deps) {
      const rand = seeded(hash(`cmp-${f.sg_uf}-${f.co_municipio}-${f.co_entidade}-${ano}-${dependencia}-${f.tp_localizacao}`));
      const escala = dependencia === "Municipal" ? 1.7 : dependencia === "Estadual" ? 1.3 : dependencia === "Privada" ? 0.9 : 0.4;
      const crescimento = 1 + (ano - de) * 0.03;
      rows.push({
        ano,
        dependencia,
        qt_matriculas: Math.round((18000 + rand() * 42000) * escala * crescimento),
        qt_escolas: Math.round((120 + rand() * 700) * escala * crescimento),
      });
    }
  }
  return rows;
}

// ── Evolução histórica ───────────────────────────────────────────────────────
export function mockEvolucao(f: FilterState): EvolucaoPonto[] {
  const de = Math.min(f.ano_inicial, f.ano_final);
  const ate = Math.max(f.ano_inicial, f.ano_final);
  const rand = seeded(hash(`evo-${f.indicador}-${f.sg_uf}-${f.co_municipio}-${f.co_entidade}-${f.tp_dependencia.join(",")}-${f.tp_localizacao}`));
  const escola = f.indicador === "qt_escolas";
  let atual = escola ? 400 + rand() * 1800 : 24000 + rand() * 60000;
  const pontos: EvolucaoPonto[] = [];
  for (let ano = de; ano <= ate; ano++) {
    atual = Math.max(0, atual * (1 + (rand() - 0.35) * 0.08));
    pontos.push({ ano, valor: Math.round(atual) });
  }
  return pontos;
}

// ── Ranking de municípios ────────────────────────────────────────────────────
export function mockRanking(f: FilterState): RankingRow[] {
  const uf = UFS_MOCK.find((u) => u.sg_uf === f.sg_uf);
  const base = uf ? mockMunicipios(uf.sg_uf) : UFS_MOCK.map((u) => ({ co_municipio: `${u.co_uf}00001`, no_municipio: CAPITAIS[u.sg_uf] ?? u.no_uf, sg_uf: u.sg_uf }));
  const rand = seeded(hash(`rank-${f.ano}-${f.sg_uf}-${f.co_municipio}-${f.co_entidade}-${f.tp_dependencia.join(",")}-${f.tp_localizacao}`));
  const linhas = base.map((m) => ({
    co_municipio: m.co_municipio,
    no_municipio: m.no_municipio,
    sg_uf: uf?.sg_uf ?? ("sg_uf" in m ? (m as { sg_uf: string }).sg_uf : ""),
    qt_mat_total: Math.round(20000 + rand() * 900000),
  }));
  linhas.sort((a, b) => b.qt_mat_total - a.qt_mat_total);
  return linhas.slice(0, f.limite).map((l, i) => ({ ...l, posicao: i + 1 }));
}

// Ranking das escolas de um município (detalhamento do ranking).
export function mockRankingEscolas(
  sg_uf: string,
  co_municipio: string,
  ano: number,
  limite: number,
  tp_dependencia: number[] = [],
): RankingEscolaRow[] {
  const rand = seeded(hash(`rank-esc-${sg_uf}-${co_municipio}-${ano}`));
  const municipio = mockMunicipios(sg_uf).find((m) => m.co_municipio === co_municipio);
  const linhas = mockEscolas(sg_uf, co_municipio)
    .filter((e) => !tp_dependencia.length || tp_dependencia.includes(e.tp_dependencia))
    .map((e) => ({
      co_entidade: e.co_entidade,
      no_entidade: e.no_entidade,
      no_municipio: municipio?.no_municipio ?? "",
      sg_uf,
      tp_dependencia: e.tp_dependencia,
      qt_mat_total: Math.round(80 + rand() * 2400),
    }));
  linhas.sort((a, b) => b.qt_mat_total - a.qt_mat_total);
  return linhas.slice(0, limite).map((l, i) => ({ ...l, posicao: i + 1 }));
}

// ── Comparação entre entidades (cascata múltipla + uma série por entidade) ───
export function mockMunicipiosDeUfs(ufs: string[]): MunicipioUf[] {
  return ufs.flatMap((sg_uf) => mockMunicipios(sg_uf).map((m) => ({ ...m, sg_uf })));
}

export function mockEscolasDeMunicipios(
  municipios: { co_municipio: string; sg_uf: string }[],
): EscolaMunicipio[] {
  return municipios.flatMap((m) =>
    mockEscolas(m.sg_uf, m.co_municipio).map((e) => ({ ...e, sg_uf: m.sg_uf, co_municipio: m.co_municipio })),
  );
}

function totalPorAnoMock(rows: ComparacaoRow[], metrica: "qt_matriculas" | "qt_escolas"): EvolucaoPonto[] {
  const porAno = new Map<number, number>();
  for (const r of rows) porAno.set(r.ano, (porAno.get(r.ano) ?? 0) + r[metrica]);
  return [...porAno.entries()].map(([ano, valor]) => ({ ano, valor })).sort((a, b) => a.ano - b.ano);
}

export function mockComparacoesMulti(
  f: FilterState,
  alvos: Alvo[],
  metrica: "qt_matriculas" | "qt_escolas",
): SerieEntidade[] {
  return alvos.map((a) => ({
    chave: a.chave,
    nome: a.nome,
    nivel: a.nivel,
    pontos: totalPorAnoMock(mockComparacoes(filtrosDoAlvo(f, a)), metrica),
  }));
}

export function mockEvolucaoMulti(f: FilterState, alvos: Alvo[]): SerieEntidade[] {
  return alvos.map((a) => ({
    chave: a.chave,
    nome: a.nome,
    nivel: a.nivel,
    pontos: mockEvolucao(filtrosDoAlvo(f, a)),
  }));
}