import { useMemo, useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ReferenceLine,
} from "recharts";
import type { SerieEntidade } from "../../data/types";
import { corSerie, fmtInt, ROTULO_NIVEL, TRACO_NIVEL } from "../../data/options";
import type { ChartType } from "./ChartTypeToggle";
import { useIsMobile } from "../ui/use-mobile";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const axisStyle = { fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fill: "var(--muted-foreground)" } as const;

type Escala = "absoluto" | "log";

// Compara várias entidades no mesmo eixo do tempo — estados, municípios e escolas
// podem aparecer juntos. Cada entidade é uma série colorida; o nível é indicado
// no rótulo e, nas linhas, também pelo tracejado.
//
// Como as entidades podem ter escalas muito diferentes (ex: matrículas de um
// estado vs. de uma escola), calculamos a disparidade entre a maior e a menor
// série:
//   - disparidade > 10x  → oferece o toggle "Valores absolutos / Escala ampliada"
//   - disparidade > 50x  → já abre direto no modo log (senão a série pequena
//                          fica ilegível mesmo antes do usuário mexer em algo)
//
// No modo "Escala ampliada" usamos eixo Y logarítmico: cada multiplicação (2x,
// 10x) ocupa o mesmo espaço visual em qualquer altura do gráfico, então valores
// pequenos (escola) ganham margem visível sem deixar de mostrar o número
// absoluto real (não é porcentagem nem índice — o valor plotado é o mesmo).
export function SeriesChart({ series, tipo }: { series: SerieEntidade[]; tipo: ChartType }) {
  const compacto = useIsMobile();
  // null = usuário ainda não escolheu manualmente; usamos o padrão calculado
  const [escalaManual, setEscalaManual] = useState<Escala | null>(null);
  const rotulo = (s: SerieEntidade) => `${ROTULO_NIVEL[s.nivel]}: ${s.nome}`;

  const disparidade = useMemo(() => {
    const maximos = series.map((s) => Math.max(...s.pontos.map((p) => p.valor), 0)).filter((v) => v > 0);
    if (maximos.length < 2) return 1;
    return Math.max(...maximos) / Math.min(...maximos);
  }, [series]);

  const escalasDispares = disparidade > 10;
  const escalaAtiva: Escala = escalaManual ?? (disparidade > 50 ? "log" : "absoluto");

  // Pivota as séries em linhas por ano: { ano, "uf:PB": 123, "uf:PE": 456 }.
  // Os valores plotados são SEMPRE os absolutos reais — quem muda é a escala
  // do eixo (linear vs. log), não o dado em si.
  const data = useMemo(() => {
    const porAno = new Map<number, Record<string, number | string>>();
    for (const s of series) {
      for (const p of s.pontos) {
        const linha = porAno.get(p.ano) ?? { ano: String(p.ano) };
        // log de 0 é indefinido; valores zerados viram um piso mínimo só pra
        // não quebrar o eixo — o tooltip continua mostrando o valor real.
        linha[s.chave] = escalaAtiva === "log" ? Math.max(p.valor, 1) : p.valor;
        porAno.set(p.ano, linha);
      }
    }
    return [...porAno.entries()].sort((a, b) => a[0] - b[0]).map(([, linha]) => linha);
  }, [series, escalaAtiva]);

  // Domínio do eixo log: começa um pouco abaixo do menor valor real (nunca em
  // zero) e vai um pouco acima do maior, senão as séries tocam a borda.
  const dominioY = useMemo((): [number | string, number | string] => {
    if (escalaAtiva !== "log") return [0, "auto"];
    const valores = series.flatMap((s) => s.pontos.map((p) => Math.max(p.valor, 1)));
    if (!valores.length) return [1, "auto"];
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    return [Math.max(1, Math.floor(min / 2)), Math.ceil(max * 1.3)];
  }, [series, escalaAtiva]);

  const shortFmt = (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k` : String(v));

  const tooltipFmt = (v: number, nome: string) => [fmtInt(v), nome];

  const eixos = [
    <CartesianGrid key="grid" strokeDasharray="2 4" stroke="var(--border)" vertical={false} />,
    <XAxis key="x" dataKey="ano" tick={axisStyle} axisLine={false} tickLine={false} dy={6} />,
    <YAxis
      key="y"
      tick={axisStyle}
      axisLine={false}
      tickLine={false}
      tickFormatter={shortFmt}
      width={compacto ? 40 : 56}
      scale={escalaAtiva === "log" ? "log" : "linear"}
      domain={dominioY}
      allowDataOverflow
    />,
    <Tooltip
      key="tt"
      cursor={tipo === "linhas" ? { stroke: "var(--border)" } : { fill: "var(--secondary)", opacity: 0.5 }}
      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12, fontFamily: "'Inter', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      labelStyle={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}
      formatter={tooltipFmt}
    />,
    <Legend key="lg" verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />,
    ...(escalaAtiva === "absoluto"
      ? [<ReferenceLine key="zero" y={0} stroke="var(--foreground)" strokeWidth={1.5} />]
      : []),
  ];

  return (
    <div>
      {escalasDispares && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {escalaAtiva === "log" ? "Escala ampliada — valores reais, eixo não-linear" : "Exibindo valores absolutos"}
          </span>
          <ToggleGroup
            type="single"
            value={escalaAtiva}
            onValueChange={(v) => v && setEscalaManual(v as Escala)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="absoluto" className="text-xs px-2.5">Valores absolutos</ToggleGroupItem>
            <ToggleGroupItem value="log" className="text-xs px-2.5">Escala ampliada</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      <ResponsiveContainer width="100%" height={compacto ? 300 : 420}>
        {tipo === "barras" ? (
          <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
            {eixos}
            {series.map((s, i) => (
              <Bar
                key={s.chave}
                dataKey={s.chave}
                name={rotulo(s)}
                fill={corSerie(i)}
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
            {eixos}
            {series.map((s, i) => (
              <Line
                key={s.chave}
                type="monotone"
                dataKey={s.chave}
                name={rotulo(s)}
                stroke={corSerie(i)}
                strokeWidth={2.5}
                strokeDasharray={TRACO_NIVEL[s.nivel]}
                dot={{ r: 3, fill: corSerie(i) }}
                activeDot={{ r: 6 }}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}