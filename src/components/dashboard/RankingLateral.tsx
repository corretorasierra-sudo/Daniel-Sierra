"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { tomClasses, type Tom } from "@/lib/design-tokens";
import type { StatusMeta } from "@/lib/metricas";
import type { ItemRankingLateral, PontoSerieDiaria } from "@/lib/rankingLateral";

type Periodo = "diario" | "semanal" | "mensal";

const PERIODO_LABEL: Record<Periodo, string> = {
  diario: "Dia",
  semanal: "Semana",
  mensal: "Mês",
};

/** Mesmo esquema de cores (verde/amarelo/vermelho) usado em todo indicador do sistema. */
const STATUS_TOM: Record<StatusMeta, Tom> = {
  verde: "sucesso",
  amarelo: "alerta",
  vermelho: "risco",
};

const STATUS_FILL: Record<StatusMeta, string> = {
  verde: "var(--chart-1)",
  amarelo: "var(--chart-4)",
  vermelho: "#ef4444",
};

function iniciaisDe(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function DotStatus(props: { cx?: number; cy?: number; payload?: PontoSerieDiaria }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle cx={cx} cy={cy} r={7} fill={STATUS_FILL[payload.status]} stroke="var(--card)" strokeWidth={2} />
  );
}

function GraficoVendedor({ serie, periodoLabel }: { serie: PontoSerieDiaria[]; periodoLabel: string }) {
  if (serie.length === 0) {
    return (
      <p className="px-1 py-4 text-center text-xs text-muted-foreground">
        Sem vendas no período pra mostrar no gráfico.
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
          labelFormatter={(label) => `${label} — ${periodoLabel}`}
          formatter={(value) => [`${value} venda(s)`, ""]}
        />
        <Line
          type="monotone"
          dataKey="vendas"
          stroke="var(--foreground)"
          strokeWidth={3}
          dot={<DotStatus />}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Ranking lateral de vendedores com toggle diário/semanal/mensal. Clicar num
 * vendedor abre o gráfico de linha só dele (vendas por dia), com a bolinha
 * vermelha nos dias sem venda. Verde/amarelo/vermelho seguem sempre a mesma
 * régua de probabilidade de bater a meta (ver `calcularStatusMeta`).
 */
export function RankingLateral({ itens }: { itens: ItemRankingLateral[] }) {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const ordenados = useMemo(() => {
    return [...itens].sort((a, b) => {
      const diff = b[periodo].percentual - a[periodo].percentual;
      if (diff !== 0) return diff;
      return b[periodo].realizado - a[periodo].realizado;
    });
  }, [itens, periodo]);

  if (itens.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Sem vendedores pra exibir ranking ainda.
      </p>
    );
  }

  const serieDoPeriodo = (item: ItemRankingLateral) =>
    periodo === "mensal" ? item.serieDiaria : item.serieDiaria.slice(-7);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(["diario", "semanal", "mensal"] as Periodo[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriodo(p)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              periodo === p
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {PERIODO_LABEL[p]}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-1.5">
        {ordenados.map((item, index) => {
          const dados = item[periodo];
          const aberto = selecionadoId === item.vendedorId;

          return (
            <li key={item.vendedorId}>
              <button
                type="button"
                onClick={() => setSelecionadoId(aberto ? null : item.vendedorId)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                  aberto
                    ? "border-lime-300 bg-lime-50/60 dark:border-lime-500/30 dark:bg-lime-500/10"
                    : "border-border bg-muted/40 hover:bg-muted"
                )}
              >
                <span className="w-4 shrink-0 text-center text-xs text-muted-foreground">{index + 1}</span>
                <span
                  className={cn("size-2.5 shrink-0 rounded-full", tomClasses(STATUS_TOM[dados.status]).dot)}
                  title={`Status: ${dados.status}`}
                />
                <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  {item.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.fotoUrl} alt={item.nome} className="size-full object-cover" />
                  ) : (
                    iniciaisDe(item.nome) || "?"
                  )}
                </div>
                <span className="flex-1 truncate text-sm font-medium text-foreground/90">{item.nome}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {dados.realizado}
                  {dados.meta > 0 ? `/${Math.round(dados.meta)}` : ""}
                </span>
              </button>

              {aberto && (
                <div className="mt-1.5 rounded-lg border border-border bg-card px-2 py-3">
                  <p className="mb-1 px-1 text-xs font-medium text-muted-foreground">
                    {item.nome} — vendas por dia
                  </p>
                  <GraficoVendedor serie={serieDoPeriodo(item)} periodoLabel={PERIODO_LABEL[periodo]} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
