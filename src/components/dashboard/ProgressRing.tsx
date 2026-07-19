"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { cn } from "@/lib/utils";

/**
 * Anel circular de progresso — usado pra % de meta batida (unidade e
 * individual). SVG via Recharts RadialBarChart, sem eixos/legendas extras.
 */
export function ProgressRing({
  percentual,
  tamanho = 160,
  espessura = 14,
  label,
  sublabel,
  cor = "var(--primary)",
  trilhoCor = "var(--muted)",
  className,
}: {
  percentual: number;
  tamanho?: number;
  espessura?: number;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  cor?: string;
  trilhoCor?: string;
  className?: string;
}) {
  const percentualExibido = Math.max(0, Math.min(percentual, 100));
  const data = [{ valor: percentualExibido }];

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: tamanho, height: tamanho }}
    >
      <RadialBarChart
        width={tamanho}
        height={tamanho}
        cx="50%"
        cy="50%"
        innerRadius={tamanho / 2 - espessura}
        outerRadius={tamanho / 2}
        barSize={espessura}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar
          dataKey="valor"
          cornerRadius={espessura / 2}
          background={{ fill: trilhoCor }}
          fill={cor}
          isAnimationActive={false}
        />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-foreground">
          {percentual.toFixed(0)}%
        </span>
        {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
        {sublabel && <span className="text-[11px] text-muted-foreground/70">{sublabel}</span>}
      </div>
    </div>
  );
}
