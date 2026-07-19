/** Dias da semana no mesmo padrão de `Date.getDay()` (0 = domingo). */
export const DIAS_SEMANA = [
  { valor: 0, label: "Domingo" },
  { valor: 1, label: "Segunda-feira" },
  { valor: 2, label: "Terça-feira" },
  { valor: 3, label: "Quarta-feira" },
  { valor: 4, label: "Quinta-feira" },
  { valor: 5, label: "Sexta-feira" },
  { valor: 6, label: "Sábado" },
] as const;

export function labelDiaSemana(diaSemana: number): string {
  return DIAS_SEMANA.find((d) => d.valor === diaSemana)?.label ?? "";
}
