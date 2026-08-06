import { motion } from "motion/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import type { IndicadorRow } from "../../data/types";
import { DEP_LABEL, LOC_LABEL, fmtInt } from "../../data/options";

// Lista paginada de escolas com matrículas por etapa de ensino.
export function IndicadoresTable({ rows }: { rows: IndicadorRow[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[220px]">Escola</TableHead>
            <TableHead>UF</TableHead>
            <TableHead>Dependência</TableHead>
            <TableHead>Local.</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Infantil</TableHead>
            <TableHead className="text-right">Fund.</TableHead>
            <TableHead className="text-right">Médio</TableHead>
            <TableHead className="text-right">Prof.</TableHead>
            <TableHead className="text-right">EJA</TableHead>
            <TableHead className="text-right">Especial</TableHead>
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
              <TableCell className="font-medium text-foreground">{r.no_entidade}</TableCell>
              <TableCell className="font-mono text-xs">{r.sg_uf}</TableCell>
              <TableCell><Badge variant="secondary" className="font-normal">{DEP_LABEL[r.tp_dependencia]}</Badge></TableCell>
              <TableCell className="text-muted-foreground text-xs">{LOC_LABEL[r.tp_localizacao] ?? "—"}</TableCell>
              <TableCell className="text-right tabular-nums font-medium">{fmtInt(r.qt_mat_total)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{fmtInt(r.qt_mat_inf)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{fmtInt(r.qt_mat_fund)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{fmtInt(r.qt_mat_med)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{fmtInt(r.qt_mat_prof)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{fmtInt(r.qt_mat_eja)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{fmtInt(r.qt_mat_esp)}</TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
