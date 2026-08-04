import type { ReactNode } from "react";
import { motion } from "motion/react";
import { FiltersPanel, type PanelConfig } from "./filters/FiltersPanel";
import type { UseFiltersReturn } from "../hooks/useFilters";
import type { Option } from "../data/types";

// Estrutura padrão das telas: cabeçalho + painel de filtros (sticky) + conteúdo.
export function PageShell({
  titulo,
  descricao,
  filtersApi,
  config,
  escolaOptions,
  children,
}: {
  titulo: string;
  descricao: string;
  filtersApi: UseFiltersReturn;
  config: PanelConfig;
  escolaOptions?: Option[];
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 sm:gap-8">
      <aside className="lg:sticky lg:top-24 self-start bg-card border border-border rounded-lg p-4 sm:p-6">
        <FiltersPanel filtersApi={filtersApi} config={config} escolaOptions={escolaOptions} />
      </aside>

      <div className="flex flex-col gap-5 sm:gap-6 min-w-0">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-1"
        >
          <h1 className="tracking-tight text-xl sm:text-2xl">{titulo}</h1>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </motion.header>
        {children}
      </div>
    </div>
  );
}

// Painel de conteúdo com surgimento progressivo (fade-in).
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-card border border-border rounded-lg p-4 sm:p-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}