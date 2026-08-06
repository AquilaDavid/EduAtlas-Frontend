import { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ComparacaoRow, DependenciaNome } from "../../data/types";
import { DEP_COR } from "../../data/options";
import { fmtInt } from "../../data/options";
import type { ChartType } from "./ChartTypeToggle";
import { useIsMobile } from "../ui/use-mobile";

const DEPS: DependenciaNome[] = ["Federal", "Estadual", "Municipal", "Privada"];
const axisStyle = { fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fill: "var(--muted-foreground)" } as const;

// Por ano, matrículas (ou escolas) por dependência — colunas empilhadas ou linhas.
export function ComparacaoChart({ rows, metrica, tipo }: { rows: ComparacaoRow[]; metrica: "qt_matriculas" | "qt_escolas"; tipo: ChartType }) {
  // No celular: altura menor e eixo Y mais estreito.
  const compacto = useIsMobile();
  const data = useMemo(() => {
    const porAno = new Map<number, Record<string, number | string>>();
    for (const r of rows) {
      const item = porAno.get(r.ano) ?? { ano: String(r.ano) };
      item[r.dependencia] = r[metrica];
      porAno.set(r.ano, item);
    }
    return [...porAno.values()].sort((a, b) => Number(a.ano) - Number(b.ano));
  }, [rows, metrica]);

  const depsPresentes = DEPS.filter((d) => rows.some((r) => r.dependencia === d));
  const shortFmt = (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k` : String(v));

  const eixos = [
    <CartesianGrid key="grid" strokeDasharray="2 4" stroke="var(--border)" vertical={false} />,
    <XAxis key="x" dataKey="ano" tick={axisStyle} axisLine={false} tickLine={false} dy={6} />,
    <YAxis key="y" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={shortFmt} width={compacto ? 40 : 56} />,
    <Tooltip
      key="tt"
      cursor={tipo === "barras" ? { fill: "var(--secondary)", opacity: 0.5 } : { stroke: "var(--border)" }}
      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12, fontFamily: "'Inter', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      labelStyle={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}
      formatter={(v: number) => fmtInt(v)}
    />,
    <Legend key="lg" wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif", paddingTop: 8 }} />,
  ];

  return (
    <ResponsiveContainer width="100%" height={compacto ? 280 : 380}>
      {tipo === "barras" ? (
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
          {eixos}
          {depsPresentes.map((d) => (
            <Bar key={d} dataKey={d} name={d} stackId="dep" fill={DEP_COR[d]} radius={[0, 0, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
          ))}
        </BarChart>
      ) : (
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
          {eixos}
          {depsPresentes.map((d) => (
            <Line key={d} type="monotone" dataKey={d} name={d} stroke={DEP_COR[d]} strokeWidth={2.5} dot={{ r: 3, fill: DEP_COR[d] }} activeDot={{ r: 6 }} isAnimationActive animationDuration={900} animationEasing="ease-out" />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
