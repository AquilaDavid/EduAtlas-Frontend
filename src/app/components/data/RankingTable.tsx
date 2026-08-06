import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { RankingRow } from "../../data/types";
import { fmtInt } from "../../data/options";

const medalha = (pos: number) => (pos === 1 ? "bg-amber-100 text-amber-700" : pos === 2 ? "bg-zinc-100 text-zinc-600" : pos === 3 ? "bg-orange-100 text-orange-700" : "bg-secondary text-muted-foreground");

// Tabela ordenada de municípios pela posição no total de matrículas. Clicar numa
// linha abre o detalhamento com o ranking das escolas daquele município.
export function RankingTable({ rows, onSelect }: { rows: RankingRow[]; onSelect?: (row: RankingRow) => void }) {
  const clicavel = Boolean(onSelect);
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Município</TableHead>
            <TableHead>UF</TableHead>
            <TableHead className="text-right">Matrículas (total)</TableHead>
            {clicavel && <TableHead className="w-10"><span className="sr-only">Detalhar</span></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.co_municipio}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.4), ease: [0.22, 1, 0.36, 1] }}
              onClick={onSelect ? () => onSelect(r) : undefined}
              onKeyDown={
                onSelect
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(r);
                      }
                    }
                  : undefined
              }
              role={clicavel ? "button" : undefined}
              tabIndex={clicavel ? 0 : undefined}
              className={`border-b border-border transition-colors hover:bg-secondary/50 ${clicavel ? "cursor-pointer outline-none focus-visible:bg-secondary" : ""}`}
            >
              <TableCell>
                <span className={`grid place-items-center size-7 rounded-full text-xs font-mono font-medium ${medalha(r.posicao)}`}>
                  {r.posicao}
                </span>
              </TableCell>
              <TableCell className="font-medium text-foreground">{r.no_municipio}</TableCell>
              <TableCell className="font-mono text-xs">{r.sg_uf}</TableCell>
              <TableCell className="text-right tabular-nums font-medium">{fmtInt(r.qt_mat_total)}</TableCell>
              {clicavel && (
                <TableCell className="w-10 text-muted-foreground">
                  <ChevronRight className="size-4" aria-hidden />
                </TableCell>
              )}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
