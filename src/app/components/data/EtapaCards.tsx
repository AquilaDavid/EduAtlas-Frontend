import { motion } from "motion/react";
import type { ResumoIndicadores } from "../../data/types";
import { ETAPAS, fmtInt } from "../../data/options";

// Cards de somatório das matrículas por etapa. Recebe o RESUMO agregado
// (soma de toda a tabela filtrada, calculada no banco via
// /indicadores/resumo) — não soma apenas as linhas da página atual.
export function EtapaCards({ resumo }: { resumo: ResumoIndicadores }) {
  const totais = ETAPAS.map((e) => ({
    label: e.label,
    valor: resumo[e.key as keyof ResumoIndicadores],
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3">
      {totais.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border rounded-md p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 min-w-0"
        >
          <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">{t.label}</span>
          <span className="text-lg sm:text-xl font-medium text-foreground tabular-nums">{fmtInt(t.valor)}</span>
        </motion.div>
      ))}
    </div>
  );
}