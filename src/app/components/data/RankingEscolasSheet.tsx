import { useState } from "react";
import { motion } from "motion/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { SelectField } from "../filters/SelectField";
import { SkeletonTable, ErrorState, DemoBanner } from "../feedback";
import { useQuery } from "../../hooks/useQuery";
import { getEscolasRankingMunicipio } from "../../services";
import { mockEscolasRankingMunicipio } from "../../data/mocks";
import { DEPENDENCIAS, DEP_LABEL, fmtInt } from "../../data/options";
import type { RankingRow, IndicadorRow } from "../../data/types";

const medalha = (pos: number) =>
  pos === 1 ? "bg-amber-100 text-amber-700" : pos === 2 ? "bg-zinc-100 text-zinc-600" : pos === 3 ? "bg-orange-100 text-orange-700" : "bg-secondary text-muted-foreground";

// Painel lateral: ranking de ESCOLAS de um único município (drill-down a
// partir do clique numa linha do Ranking de municípios). Reaproveita
// /indicadores — já ordena por qt_mat_total desc e já filtra por
// tp_dependencia, permitindo "isolar" o ranking (ex.: só escolas municipais).
export function RankingEscolasSheet({
  municipio,
  ano,
  onOpenChange,
}: {
  municipio: RankingRow | null;
  ano: number;
  onOpenChange: (open: boolean) => void;
}) {
  const [isolarDependencia, setIsolarDependencia] = useState(""); // "" = todas

  const aberto = municipio !== null;
  const tpDependencia = isolarDependencia ? [Number(isolarDependencia)] : [];

  const key = `ranking-escolas:${ano}:${municipio?.co_municipio ?? ""}:${isolarDependencia}`;

  const { data, loading, error, demo, refetch } = useQuery<IndicadorRow[]>(key, {
    enabled: aberto,
    fetcher: () =>
      getEscolasRankingMunicipio({
        ano,
        sg_uf: municipio?.sg_uf ?? "",
        co_municipio: municipio?.co_municipio ?? "",
        tp_dependencia: tpDependencia,
      }).then((r) => r.dados),
    mock: () => mockEscolasRankingMunicipio(ano, municipio?.sg_uf ?? "", municipio?.co_municipio ?? "", tpDependencia),
    fallback: [],
  });

  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{municipio?.no_municipio ?? ""}</SheetTitle>
          <SheetDescription>
            Escolas de {municipio?.no_municipio} ({municipio?.sg_uf}) ranqueadas por matrículas em {ano}.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 flex flex-col gap-4">
          <SelectField
            label="Isolar ranking por dependência"
            hint="Rankeia só dentro do tipo escolhido (ex.: só escolas municipais)"
            value={isolarDependencia}
            onChange={setIsolarDependencia}
            placeholder="Todas as dependências"
            options={[{ value: "", label: "Todas as dependências" }, ...DEPENDENCIAS.map((d) => ({ value: String(d.value), label: d.nome }))]}
          />

          {demo && <DemoBanner />}

          {loading ? (
            <SkeletonTable rows={6} cols={4} />
          ) : error ? (
            <ErrorState onRetry={refetch} message="Falha ao carregar as escolas do município." />
          ) : data.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma escola encontrada para esse filtro.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">#</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Dependência</TableHead>
                    <TableHead className="text-right">Matrículas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((escola, i) => (
                    <motion.tr
                      key={escola.co_entidade}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3), ease: [0.22, 1, 0.36, 1] }}
                      className="border-b border-border transition-colors hover:bg-secondary/50"
                    >
                      <TableCell>
                        <span className={`grid place-items-center size-7 rounded-full text-xs font-mono font-medium ${medalha(i + 1)}`}>{i + 1}</span>
                      </TableCell>
                      <TableCell className="font-medium text-foreground whitespace-normal">{escola.no_entidade}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{DEP_LABEL[escola.tp_dependencia]}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{fmtInt(escola.qt_mat_total)}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}