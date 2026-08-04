import { CalendarRange, MapPin, Building2, BarChart3, GitCompareArrows, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { FilterGroup, FilterField } from "./FilterField";
import { SelectField } from "./SelectField";
import { SeletorEstados, SeletorMunicipios, SeletorEscolas } from "./EntitySelector";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Button } from "../ui/button";
import type { UseFiltersReturn } from "../../hooks/useFilters";
import { useUfs, useMunicipios, useEscolas } from "../../hooks/useLocalizacoes";
import {
  ANOS, DEPENDENCIAS, LOCALIZACOES, INDICADORES, ORDENAR_POR, ORDENS, LIMITES,
} from "../../data/options";
import type { LocalizacaoFiltro, Option, Ordem, LocalComparado } from "../../data/types";

const ALL = "__all__";
const anosOptions: Option[] = ANOS.map((a) => ({ value: String(a), label: String(a) }));

export interface PanelConfig {
  ano?: boolean;
  periodo?: boolean;
  estado?: boolean;
  municipio?: boolean;
  escola?: boolean;
  dependencia?: boolean; // múltipla (checkboxes)
  dependenciaUnica?: boolean; // única (radio) — usada no Ranking
  localizacao?: boolean;
  indicador?: boolean;
  ordenacao?: boolean;
  paginacao?: boolean;
  limite?: boolean;
}

// Estado do comparador "Padrão / Por local" — quando presente, o painel
// mostra a alternância + a lista de locais, e (no modo local) esconde
// Estado/Município/Escola/Dependência, que deixam de fazer sentido como
// filtro único (cada local da lista já tem os seus).
export interface ComparadorConfig {
  ativo: boolean; // true quando o modo atual é "por local"
  labelPadrao: string; // rótulo do botão do modo padrão, ex. "Por dependência"
  onModoChange: (local: boolean) => void;
  locais: LocalComparado[];
  onLocaisChange: (locais: LocalComparado[]) => void;
}

export function FiltersPanel({
  filtersApi,
  config,
  escolaOptions = [],
  comparador,
}: {
  filtersApi: UseFiltersReturn;
  config: PanelConfig;
  escolaOptions?: Option[];
  comparador?: ComparadorConfig;
}) {
  const { filters, set, setUf, setMunicipio, setEscola, toggleDependencia, reset } = filtersApi;

  const ufs = useUfs();
  const municipios = useMunicipios(filters.sg_uf);
  const escolas = useEscolas(filters.sg_uf, filters.co_municipio);

  // As instituições vêm da API (cascata pela cidade); o prop é apenas um fallback.
  const escolasOpts: Option[] = escolas.data.length
    ? escolas.data.map((e) => ({ value: e.co_entidade, label: e.no_entidade }))
    : escolaOptions;

  const modoLocalAtivo = comparador?.ativo ?? false;

  const showTempo = config.ano || config.periodo;
  const showLocal = (config.estado || config.municipio) && !modoLocalAtivo;
  const mostrarEscola = config.escola && !modoLocalAtivo;
  const mostrarDependencia = (config.dependencia || config.dependenciaUnica) && !modoLocalAtivo;
  const mostrarLocalizacao = config.localizacao; // filtro compartilhado — vale mesmo no modo "por local"
  const showInst = mostrarEscola || mostrarDependencia || mostrarLocalizacao;
  const depUnica = filters.tp_dependencia.length === 1 ? String(filters.tp_dependencia[0]) : "";
  const showDados = config.indicador || config.ordenacao || config.paginacao || config.limite;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-foreground">Filtros</h2>
        <Button variant="ghost" size="sm" onClick={reset} className="h-7 gap-1.5 text-xs text-muted-foreground">
          <RotateCcw size={12} /> Limpar
        </Button>
      </div>

      {/* ── Comparar por local (opcional) ── */}
      {comparador && (
        <FilterGroup title="Comparar" icon={<GitCompareArrows size={14} />}>
          <FilterField label="Modo de comparação">
            <ToggleGroup
              type="single"
              value={modoLocalAtivo ? "local" : "padrao"}
              onValueChange={(v) => v && comparador.onModoChange(v === "local")}
              className="w-full justify-stretch gap-2"
            >
              <ToggleGroupItem value="padrao" className="flex-1 border border-border data-[state=on]:border-accent data-[state=on]:bg-accent/10 data-[state=on]:text-accent text-sm">
                {comparador.labelPadrao}
              </ToggleGroupItem>
              <ToggleGroupItem value="local" className="flex-1 border border-border data-[state=on]:border-accent data-[state=on]:bg-accent/10 data-[state=on]:text-accent text-sm">
                Por local
              </ToggleGroupItem>
            </ToggleGroup>
          </FilterField>

          {modoLocalAtivo && (
            <div className="flex flex-col gap-4">
              <FilterField label="Estados" hint="seleção múltipla">
                <SeletorEstados locais={comparador.locais} onChange={comparador.onLocaisChange} />
              </FilterField>

              <FilterField label="Municípios" hint="seleção múltipla — de qualquer estado">
                <SeletorMunicipios locais={comparador.locais} onChange={comparador.onLocaisChange} />
              </FilterField>

              <FilterField label="Escolas" hint="seleção múltipla — de qualquer município">
                <SeletorEscolas locais={comparador.locais} onChange={comparador.onLocaisChange} />
              </FilterField>
            </div>
          )}
        </FilterGroup>
      )}

      {/* ── Tempo ── */}
      {showTempo && (
        <FilterGroup title="Tempo" icon={<CalendarRange size={14} />}>
          {config.ano && (
            <SelectField label="Ano" value={String(filters.ano)} onChange={(v) => set("ano", Number(v))} options={anosOptions} />
          )}
          {config.periodo && (
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Ano inicial" value={String(filters.ano_inicial)} onChange={(v) => set("ano_inicial", Number(v))} options={anosOptions} />
              <SelectField label="Ano final" value={String(filters.ano_final)} onChange={(v) => set("ano_final", Number(v))} options={anosOptions} />
            </div>
          )}
        </FilterGroup>
      )}

      {/* ── Localização (cascata) ── */}
      {showLocal && (
        <FilterGroup title="Localização" icon={<MapPin size={14} />}>
          {config.estado && (
            <SelectField
              label="Estado"
              hint={ufs.loading ? "carregando…" : "sg_uf"}
              value={filters.sg_uf || ALL}
              onChange={(v) => setUf(v === ALL ? null : ufs.data.find((u) => u.sg_uf === v) ?? null)}
              options={[{ value: ALL, label: "Brasil (todas)" }, ...ufs.data.map((u) => ({ value: u.sg_uf, label: `${u.sg_uf} · ${u.no_uf}` }))]}
              disabled={ufs.loading}
            />
          )}
          {config.municipio && (
            <SelectField
              label="Município"
              hint={municipios.loading ? "carregando…" : "co_municipio"}
              value={filters.co_municipio || ALL}
              onChange={(v) => setMunicipio(v === ALL ? "" : v)}
              disabled={!filters.sg_uf || municipios.loading}
              placeholder={filters.sg_uf ? "Todos os municípios" : "Selecione um estado"}
              options={[{ value: ALL, label: "Todos os municípios" }, ...municipios.data.map((m) => ({ value: m.co_municipio, label: m.no_municipio }))]}
            />
          )}
        </FilterGroup>
      )}

      {/* ── Instituição ── */}
      {showInst && (
        <FilterGroup title="Instituição" icon={<Building2 size={14} />}>
          {mostrarEscola && (
            <SelectField
              label="Escola"
              hint={escolas.loading ? "carregando…" : "co_entidade"}
              value={filters.co_entidade || ALL}
              onChange={(v) =>
                v === ALL
                  ? setEscola("")
                  : setEscola(v, escolas.data.find((e) => e.co_entidade === v)?.tp_dependencia)
              }
              disabled={!filters.co_municipio || escolas.loading}
              placeholder={filters.co_municipio ? "Todas as escolas" : "Selecione um município"}
              options={[{ value: ALL, label: "Todas as escolas" }, ...escolasOpts]}
            />
          )}
          {config.dependencia && mostrarDependencia && (
            <FilterField label="Dependência administrativa" hint="tp_dependencia">
              <div className="grid grid-cols-2 gap-2">
                {DEPENDENCIAS.map((d) => {
                  const checked = filters.tp_dependencia.includes(d.value);
                  return (
                    <label
                      key={d.value}
                      className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 cursor-pointer transition-colors hover:bg-secondary data-[on=true]:border-accent"
                      data-on={checked}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleDependencia(d.value)} />
                      <span className="text-sm text-foreground">{d.nome}</span>
                    </label>
                  );
                })}
              </div>
            </FilterField>
          )}
          {config.dependenciaUnica && mostrarDependencia && (
            <FilterField label="Dependência administrativa" hint="tp_dependencia (única)">
              <RadioGroup
                value={depUnica}
                onValueChange={(v) => set("tp_dependencia", v ? [Number(v)] : [])}
                className="grid grid-cols-2 gap-2"
              >
                {DEPENDENCIAS.map((d) => (
                  <label
                    key={d.value}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 cursor-pointer transition-colors hover:bg-secondary data-[on=true]:border-accent"
                    data-on={depUnica === String(d.value)}
                  >
                    <RadioGroupItem value={String(d.value)} id={`dep-${d.value}`} />
                    <span className="text-sm text-foreground">{d.nome}</span>
                  </label>
                ))}
              </RadioGroup>
            </FilterField>
          )}
          {mostrarLocalizacao && (
            <FilterField label="Localização da escola" hint="tp_localizacao">
              <RadioGroup
                value={filters.tp_localizacao}
                onValueChange={(v) => set("tp_localizacao", v as LocalizacaoFiltro)}
                className="grid grid-cols-3 gap-2"
              >
                {LOCALIZACOES.map((l) => (
                  <label
                    key={l.value}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 cursor-pointer transition-colors hover:bg-secondary data-[on=true]:border-accent"
                    data-on={filters.tp_localizacao === l.value}
                  >
                    <RadioGroupItem value={l.value} id={`loc-${l.value}`} />
                    <span className="text-sm text-foreground">{l.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </FilterField>
          )}
        </FilterGroup>
      )}

      {/* ── Dados ── */}
      {showDados && (
        <FilterGroup title="Dados" icon={<BarChart3 size={14} />}>
          {config.indicador && (
            <SelectField label="Indicador" hint="indicador" value={filters.indicador} onChange={(v) => set("indicador", v)} options={INDICADORES} />
          )}
          {config.ordenacao && (
            <>
              <SelectField label="Ordenar por" hint="ordenar_por" value={filters.ordenar_por} onChange={(v) => set("ordenar_por", v)} options={ORDENAR_POR} />
              <FilterField label="Ordem" hint="ordem">
                <ToggleGroup type="single" value={filters.ordem} onValueChange={(v) => v && set("ordem", v as Ordem)} className="w-full justify-stretch gap-2">
                  {ORDENS.map((o) => (
                    <ToggleGroupItem key={o.value} value={o.value} className="flex-1 border border-border data-[state=on]:border-accent data-[state=on]:bg-accent/10 data-[state=on]:text-accent text-sm">
                      {o.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FilterField>
            </>
          )}
          {(config.limite || config.paginacao) && (
            <div className="grid grid-cols-2 gap-3">
              {config.limite && (
                <SelectField label="Limite" hint="limite" value={String(filters.limite)} onChange={(v) => set("limite", Number(v))} options={LIMITES.map((l) => ({ value: String(l), label: String(l) }))} />
              )}
              {config.paginacao && (
                <FilterField label="Página" hint="pagina">
                  <div className="flex items-center rounded-md border border-border bg-card h-9 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => set("pagina", Math.max(1, filters.pagina - 1))}
                      disabled={filters.pagina <= 1}
                      className="grid place-items-center w-9 h-full text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="flex-1 text-center text-sm tabular-nums text-foreground">{filters.pagina}</span>
                    <button
                      type="button"
                      onClick={() => set("pagina", filters.pagina + 1)}
                      className="grid place-items-center w-9 h-full text-muted-foreground hover:bg-secondary transition-colors"
                      aria-label="Próxima página"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </FilterField>
              )}
            </div>
          )}
        </FilterGroup>
      )}
    </div>
  );
}