import { motion } from "motion/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { RankingRow } from "../../data/types";
import { fmtInt } from "../../data/options";

const medalha = (pos: number) => (pos === 1 ? "bg-amber-100 text-amber-700" : pos === 2 ? "bg-zinc-100 text-zinc-600" : pos === 3 ? "bg-orange-100 text-orange-700" : "bg-secondary text-muted-foreground");

// Tabela ordenada de municípios pela posição no total de matrículas.
// Clicar num município abre o drill-down de escolas daquele município
// (ver RankingEscolasSheet), via onSelecionarMunicipio.
export function RankingTable({ rows, onSelecionarMunicipio }: { rows: RankingRow[]; onSelecionarMunicipio?: (row: RankingRow) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Município</TableHead>
            <TableHead>UF</TableHead>
            <TableHead className="text-right">Matrículas (total)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.co_municipio}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.4), ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelecionarMunicipio?.(r)}
              className="border-b border-border transition-colors hover:bg-secondary/50 cursor-pointer"
              title="Ver ranking de escolas deste município"
            >
              <TableCell>
                <span className={`grid place-items-center size-7 rounded-full text-xs font-mono font-medium ${medalha(r.posicao)}`}>
                  {r.posicao}
                </span>
              </TableCell>
              <TableCell className="font-medium text-foreground underline decoration-dotted underline-offset-4 whitespace-normal">{r.no_municipio}</TableCell>
              <TableCell className="font-mono text-xs">{r.sg_uf}</TableCell>
              <TableCell className="text-right tabular-nums font-medium">{fmtInt(r.qt_mat_total)}</TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}