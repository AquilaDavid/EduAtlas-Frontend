import { ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { FilterField } from "./FilterField";
import type { Option } from "../../data/types";

// Dropdown fechado de seleção múltipla — mesma aparência do SelectField,
// mas com checkboxes internos. Continua sem qualquer campo de digitação.
export function MultiSelectField({
  label,
  hint,
  values,
  onChange,
  options,
  placeholder = "Selecione…",
  disabled,
  disabledHint,
  max,
  cor,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  disabledHint?: string;
  max?: number;
  cor?: (valor: string) => string | undefined;
}) {
  const cheio = max != null && values.length >= max;

  const alternar = (valor: string) => {
    if (values.includes(valor)) onChange(values.filter((v) => v !== valor));
    else if (!cheio) onChange([...values, valor]);
  };

  const rotulo = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  return (
    <FilterField label={label} hint={hint}>
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          className="flex w-full items-center justify-between gap-2 h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed data-[state=open]:border-accent"
        >
          <span className={values.length ? "truncate" : "truncate text-muted-foreground"}>
            {disabled && disabledHint
              ? disabledHint
              : values.length === 0
                ? placeholder
                : values.length === 1
                  ? rotulo(values[0])
                  : `${values.length} selecionados`}
          </span>
          <ChevronDown size={15} className="shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
          {options.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground">Nenhuma opção disponível.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-border">
              {options.map((o) => {
                const marcado = values.includes(o.value);
                const bloqueado = !marcado && cheio;
                return (
                  <label
                    key={o.value}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:bg-secondary data-[off=true]:opacity-40 data-[off=true]:cursor-not-allowed"
                    data-off={bloqueado}
                  >
                    <Checkbox checked={marcado} disabled={bloqueado} onCheckedChange={() => alternar(o.value)} />
                    {cor && (
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ background: (marcado && cor(o.value)) || "var(--border)" }}
                      />
                    )}
                    <span className="text-sm text-foreground truncate">{o.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Resumo do que está selecionado, com remoção individual. */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary pl-2 pr-1 py-0.5 text-xs text-foreground max-w-full"
            >
              {cor && <span className="size-2 rounded-full shrink-0" style={{ background: cor(v) ?? "var(--border)" }} />}
              <span className="truncate">{rotulo(v)}</span>
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="grid place-items-center size-4 rounded-full text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
                aria-label={`Remover ${rotulo(v)}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {max != null && cheio && (
        <span className="text-[10px] font-mono text-muted-foreground/70">Máximo de {max} atingido</span>
      )}
    </FilterField>
  );
}
