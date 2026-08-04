import type { ReactNode } from "react";
import { Label } from "../ui/label";

// Rótulo padrão de um campo de filtro (label mono + controle visual).
export function FilterField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </Label>
        {hint && <span className="text-[10px] font-mono text-muted-foreground/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// Agrupamento visual de filtros (Tempo, Localização, Instituição, Dados).
export function FilterGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className="text-accent">{icon}</span>
        <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-foreground">{title}</h3>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
