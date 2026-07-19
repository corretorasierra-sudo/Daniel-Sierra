"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type EtapaCorTom = "neutro" | "info" | "alerta" | "sucesso" | "risco";

const ETAPA_COR: Record<string, EtapaCorTom> = {
  NOVO: "info",
  EM_TRATATIVA: "alerta",
  FECHAMENTO: "sucesso",
  PERDIDO: "risco",
};

const TOM_COLUNA: Record<EtapaCorTom, string> = {
  neutro: "border-border bg-muted",
  info: "border-sky-300 bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10",
  alerta: "border-amber-300 bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10",
  sucesso: "border-lime-300 bg-lime-100 dark:border-lime-500/30 dark:bg-lime-500/10",
  risco: "border-red-300 bg-red-100 dark:border-red-500/30 dark:bg-red-500/10",
};

const TOM_TITULO: Record<EtapaCorTom, string> = {
  neutro: "text-foreground",
  info: "text-sky-900 dark:text-sky-300",
  alerta: "text-amber-900 dark:text-amber-300",
  sucesso: "text-lime-900 dark:text-lime-300",
  risco: "text-red-900 dark:text-red-300",
};

const TOM_BADGE: Record<EtapaCorTom, string> = {
  neutro: "bg-muted text-foreground/80",
  info: "bg-sky-200 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  alerta: "bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  sucesso: "bg-lime-200 text-lime-800 dark:bg-lime-500/20 dark:text-lime-300",
  risco: "bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};

export function corEtapa(etapa: string): EtapaCorTom {
  return ETAPA_COR[etapa] ?? "neutro";
}

/** Classes de badge (bg + texto) pra colorir a etapa fora do board, ex: na lista. */
export function badgeClasseEtapa(etapa: string): string {
  return TOM_BADGE[corEtapa(etapa)];
}

/** Coluna do board de funil — cabeçalho colorido por etapa + contagem em badge. */
export function EtapaFunilColuna({
  etapa,
  titulo,
  quantidade,
  children,
  onSoltarLead,
}: {
  etapa: string;
  titulo: string;
  quantidade: number;
  children: React.ReactNode;
  /** Se informado, a coluna vira zona de drop pro drag-and-drop do kanban. */
  onSoltarLead?: (leadId: string) => void;
}) {
  const tom = corEtapa(etapa);
  const [arrastandoSobre, setArrastandoSobre] = useState(false);

  return (
    <section
      onDragOver={
        onSoltarLead
          ? (e) => {
              e.preventDefault();
              setArrastandoSobre(true);
            }
          : undefined
      }
      onDragLeave={onSoltarLead ? () => setArrastandoSobre(false) : undefined}
      onDrop={
        onSoltarLead
          ? (e) => {
              e.preventDefault();
              setArrastandoSobre(false);
              const leadId = e.dataTransfer.getData("text/lead-id");
              if (leadId) onSoltarLead(leadId);
            }
          : undefined
      }
      className={cn(
        "flex h-full flex-col gap-3 rounded-xl border-2 p-3 transition-colors",
        TOM_COLUNA[tom],
        arrastandoSobre && "ring-2 ring-offset-1 ring-foreground/30"
      )}
    >
      <h2 className={cn("flex items-center justify-between text-sm font-bold", TOM_TITULO[tom])}>
        {titulo}
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TOM_BADGE[tom])}>
          {quantidade}
        </span>
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
