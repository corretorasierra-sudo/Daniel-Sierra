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
    bg: "bg-lime-50",
    border: "border-lime-200",
    text: "text-lime-900",
    iconBg: "bg-lime-100",
    iconText: "text-lime-700",
    dot: "bg-lime-500",
  },
  alerta: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    dot: "bg-amber-500",
  },
  risco: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    iconBg: "bg-red-100",
    iconText: "text-red-700",
    dot: "bg-red-500",
  },
  neutro: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-900",
    iconBg: "bg-slate-100",
    iconText: "text-slate-600",
    dot: "bg-slate-400",
  },
  info: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-900",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    dot: "bg-sky-500",
  },
};

export function tomClasses(tom: Tom): TomClasses {
  return TOM_CLASSES[tom];
}
