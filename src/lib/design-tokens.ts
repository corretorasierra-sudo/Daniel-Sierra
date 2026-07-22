/**
 * Mapeamento de cor semântica -> classes Tailwind, pra não duplicar
 * text-red-800/bg-red-50 etc. espalhado pelas páginas. Usado pelos
 * componentes de src/components/dashboard.
 */

export type Tom = "sucesso" | "alerta" | "risco" | "neutro" | "info";

type TomClasses = {
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  iconText: string;
  dot: string;
};

export const TOM_CLASSES: Record<Tom, TomClasses> = {
  sucesso: {
    bg: "bg-lime-50 dark:bg-lime-500/10",
    border: "border-lime-200 dark:border-lime-500/20",
    text: "text-lime-900 dark:text-lime-300",
    iconBg: "bg-lime-100 dark:bg-lime-500/15",
    iconText: "text-lime-700 dark:text-lime-400",
    dot: "bg-lime-500",
  },
  alerta: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    text: "text-amber-900 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-500/15",
    iconText: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  risco: {
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
    text: "text-red-900 dark:text-red-300",
    iconBg: "bg-red-100 dark:bg-red-500/15",
    iconText: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  neutro: {
    bg: "bg-slate-50 dark:bg-slate-500/10",
    border: "border-slate-200 dark:border-slate-500/20",
    text: "text-slate-900 dark:text-slate-300",
    iconBg: "bg-slate-100 dark:bg-slate-500/15",
    iconText: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
  info: {
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200 dark:border-sky-500/20",
    text: "text-sky-900 dark:text-sky-300",
    iconBg: "bg-sky-100 dark:bg-sky-500/15",
    iconText: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-500",
  },
};

export function tomClasses(tom: Tom): TomClasses {
  return TOM_CLASSES[tom];
}

/**
 * Mesmo esquema verde/amarelo/vermelho de `calcularStatusMeta`, mapeado pra
 * `Tom` (classes Tailwind) e pra cor bruta (fill de SVG/recharts, que aceita
 * `var(--chart-N)` diretamente). Usado em todo indicador de meta do sistema.
 */
export const STATUS_META_TOM = {
  verde: "sucesso",
  amarelo: "alerta",
  vermelho: "risco",
} as const;

export const STATUS_META_FILL = {
  verde: "var(--chart-1)",
  amarelo: "var(--chart-4)",
  vermelho: "#ef4444",
} as const;
