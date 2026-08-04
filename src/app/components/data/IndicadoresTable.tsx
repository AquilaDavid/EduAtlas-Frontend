import { motion } from "motion/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import type { IndicadorRow } from "../../data/types";
import { DEP_LABEL, LOC_LABEL, fmtInt } from "../../data/options";

// Lista paginada de escolas com matrículas por etapa de ensino.
//
// Responsivo por prioridade de colunas: no celular só aparece o essencial
// (Escola, UF, Total) — as demais colunas revelam progressivamente em
// telas maiores, em vez de forçar 11 colunas espremidas ou um scroll
// horizontal enorme desde o primeiro momento.
export function IndicadoresTable({ rows }: { rows: IndicadorRow[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Escola</TableHead>
            <TableHead>UF</TableHead>
            <TableHead className="hidden sm:table-cell">Dependência</TableHead>
            <TableHead className="hidden md:table-cell">Local.</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right hidden xl:table-cell">Infantil</TableHead>
            <TableHead className="text-right hidden xl:table-cell">Fund.</TableHead>
            <TableHead className="text-right hidden xl:table-cell">Médio</TableHead>
            <TableHead className="text-right hidden xl:table-cell">Prof.</TableHead>
            <TableHead className="text-right hidden xl:table-cell">EJA</TableHead>
            <TableHead className="text-right hidden xl:table-cell">Especial</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.co_entidade}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.3), ease: [0.22, 1, 0.36, 1] }}
              className="border-b border-border transition-colors hover:bg-secondary/50"
            >
              <TableCell className="font-medium text-foreground whitespace-normal">{r.no_entidade}</TableCell>
              <TableCell className="font-mono text-xs">{r.sg_uf}</TableCell>
              <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="font-normal">{DEP_LABEL[r.tp_dependencia]}</Badge></TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{LOC_LABEL[r.tp_localizacao] ?? "—"}</TableCell>
              <TableCell className="text-right tabular-nums font-medium">{fmtInt(r.qt_mat_total)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground hidden xl:table-cell">{fmtInt(r.qt_mat_inf)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground hidden xl:table-cell">{fmtInt(r.qt_mat_fund)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground hidden xl:table-cell">{fmtInt(r.qt_mat_med)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground hidden xl:table-cell">{fmtInt(r.qt_mat_prof)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground hidden xl:table-cell">{fmtInt(r.qt_mat_eja)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground hidden xl:table-cell">{fmtInt(r.qt_mat_esp)}</TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}