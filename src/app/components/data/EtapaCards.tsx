import { motion } from "motion/react";
import type { ResumoIndicadores } from "../../data/types";
import { ETAPAS, fmtInt } from "../../data/options";

// Cards de somatório das matrículas por etapa — usa o resumo agregado do
// backend (todos os registros que casam com o filtro), não a página atual
// da tabela. Antes somava só `rows` (a página exibida), o que dava total
// errado (ex: Infantil aparecendo 0 se nenhuma escola da página tivesse
// matrícula infantil).
export function EtapaCards({ resumo }: { resumo: ResumoIndicadores }) {
  const totais = ETAPAS.map((e) => ({
    label: e.label,
    valor: resumo[e.key] ?? 0,
  }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {totais.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border rounded-md p-4 flex flex-col gap-2"
        >
          <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">{t.label}</span>
          <span className="text-xl font-medium text-foreground tabular-nums">{fmtInt(t.valor)}</span>
        </motion.div>
      ))}
    </div>
  );
}