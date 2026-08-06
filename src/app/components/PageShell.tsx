import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { FiltersPanel, type PanelConfig } from "./filters/FiltersPanel";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import type { UseFiltersReturn } from "../hooks/useFilters";
import type { Option } from "../data/types";

// Estrutura padrão das telas: cabeçalho + painel de filtros + conteúdo.
// A partir de lg o painel fica fixo na lateral; abaixo disso vira uma gaveta
// aberta pelo botão "Filtros", para não empurrar o conteúdo no celular.
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
  const [gaveta, setGaveta] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
      <aside className="hidden lg:block lg:sticky lg:top-24 self-start bg-card border border-border rounded-lg p-6">
        <FiltersPanel filtersApi={filtersApi} config={config} escolaOptions={escolaOptions} />
      </aside>

      <Sheet open={gaveta} onOpenChange={setGaveta}>
        <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-6">
          <SheetHeader className="p-0 mb-4">
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>Ajuste o recorte dos dados exibidos.</SheetDescription>
          </SheetHeader>
          <FiltersPanel filtersApi={filtersApi} config={config} escolaOptions={escolaOptions} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col gap-5 sm:gap-6 min-w-0">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-1"
        >
          <h1 className="tracking-tight">{titulo}</h1>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </motion.header>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="lg:hidden self-start gap-2"
          onClick={() => setGaveta(true)}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtros
        </Button>

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
