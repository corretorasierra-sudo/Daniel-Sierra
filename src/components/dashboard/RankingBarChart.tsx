"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ItemRankingChart = {
  nome: string;
  realizado: number;
  meta: number;
  percentual: number;
};

/** Ranking de vendedores — realizado vs. meta, barras horizontais. */
export function RankingBarChart({ dados }: { dados: ItemRankingChart[] }) {
  const altura = Math.max(dados.length * 42, 120);

  if (dados.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
        Sem dados pra exibir ainda.
      </p>
    );
  }

  const maiorValor = Math.max(1, ...dados.map((d) => Math.max(d.realizado, d.meta)));

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
        barCategoryGap={10}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis
          type="number"
          domain={[0, maiorValor]}
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="nome"
          width={110}
          tick={{ fontSize: 12, fill: "var(--foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            borderRadius: 8,
            borderColor: "var(--border)",
            fontSize: 12,
          }}
          formatter={(value, _name, props) => {
            const item = props.payload as ItemRankingChart;
            return [`${value} vendas`, `Meta: ${item.meta || "—"} (${item.percentual.toFixed(0)}%)`];
          }}
        />
        <Bar dataKey="realizado" radius={[0, 6, 6, 0]} maxBarSize={20}>
          {dados.map((item, index) => (
            <Cell
              key={index}
              fill={
                item.meta > 0 && item.percentual >= 100
                  ? "#84cc16"
                  : item.meta > 0 && item.percentual < 50
                    ? "#f59e0b"
                    : "#0f3d3d"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
