import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from "recharts";
import type { EvolucaoPonto } from "../../data/types";
import { fmtInt } from "../../data/options";
import type { ChartType } from "./ChartTypeToggle";
import { useIsMobile } from "../ui/use-mobile";

const axisStyle = { fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fill: "var(--muted-foreground)" } as const;

// Evolução temporal do indicador — linha contínua (área) ou colunas.
export function EvolucaoChart({ pontos, nome, tipo }: { pontos: EvolucaoPonto[]; nome: string; tipo: ChartType }) {
  // No celular: altura menor e eixo Y mais estreito.
  const compacto = useIsMobile();
  const data = pontos.map((p) => ({ ano: String(p.ano), valor: p.valor }));
  const shortFmt = (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k` : String(v));

  const eixos = [
    <CartesianGrid key="grid" strokeDasharray="2 4" stroke="var(--border)" vertical={false} />,
    <XAxis key="x" dataKey="ano" tick={axisStyle} axisLine={false} tickLine={false} dy={6} />,
    <YAxis key="y" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={shortFmt} width={compacto ? 40 : 56} />,
    <Tooltip
      key="tt"
      cursor={tipo === "linhas" ? { stroke: "var(--border)" } : { fill: "var(--secondary)", opacity: 0.5 }}
      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12, fontFamily: "'Inter', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      labelStyle={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}
      formatter={(v: number) => [fmtInt(v), nome]}
    />,
  ];

  return (
    <ResponsiveContainer width="100%" height={compacto ? 280 : 380}>
      {tipo === "linhas" ? (
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
          <defs>
            <linearGradient id="evo-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {eixos}
          <Area key="area" type="monotone" dataKey="valor" name={nome} stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#evo-fill)" dot={{ r: 3, fill: "var(--chart-1)" }} activeDot={{ r: 6 }} isAnimationActive animationDuration={900} animationEasing="ease-out" />
        </AreaChart>
      ) : (
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
          {eixos}
          <Bar key="bar" dataKey="valor" name={nome} fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
