"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STATUS_META_FILL } from "@/lib/design-tokens";
import type { PontoSerieDiaria } from "@/lib/rankingLateral";

function DotStatus(props: { cx?: number; cy?: number; payload?: PontoSerieDiaria }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={7}
      fill={STATUS_META_FILL[payload.status]}
      stroke="var(--card)"
      strokeWidth={2}
    />
  );
}

/**
 * Gráfico de linha dia a dia (vendas ou atividade), com a bolinha de cada
 * dia colorida pelo mesmo esquema verde/amarelo/vermelho de `calcularStatusMeta`
 * — vermelho automático nos dias sem nenhum registro.
 */
export function GraficoLinhaDiaria({ serie, unidade }: { serie: PontoSerieDiaria[]; unidade: string }) {
  if (serie.length === 0) {
    return (
      <p className="px-1 py-4 text-center text-xs text-muted-foreground">
        Sem dados no período pra mostrar no gráfico.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={serie} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={24}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "var(--border)", fontSize: 12 }}
          formatter={(value) => [`${value} ${unidade}`, ""]}
        />
        <Line
          type="monotone"
          dataKey="valor"
          stroke="var(--foreground)"
          strokeWidth={3}
          dot={<DotStatus />}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
