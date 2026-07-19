"use client";

import { ChevronDown, Phone, MapPin } from "lucide-react";
import { registrarAtividade } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { badgeClasseEtapa } from "@/components/dashboard/EtapaFunilBoard";
import { cn } from "@/lib/utils";

const ETAPAS = [
  { value: "NOVO", label: "Novo" },
  { value: "EM_TRATATIVA", label: "Em tratativa" },
  { value: "FECHAMENTO", label: "Fechamento" },
  { value: "PERDIDO", label: "Perdido" },
] as const;

const TIPOS_ATIVIDADE = [
  { value: "LIGACAO", label: "Ligação" },
  { value: "MENSAGEM", label: "Mensagem" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "RETORNO_AGENDADO", label: "Retorno agendado" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "OBSERVACAO", label: "Observação" },
] as const;

const inputClass =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm shadow-sm outline-none transition-colors focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20";

export type LeadResumo = {
  id: string;
  nome: string;
  telefone: string;
  cidade: string | null;
  etapa: string;
  observacoes: string | null;
  proximaAcao: string | null;
  proximaAcaoData: Date | null;
  dataUltimoContato: Date | null;
};

export function LeadCard({
  lead,
  mostrarEtapa = false,
  etapaLabel,
  arrastavel = false,
}: {
  lead: LeadResumo;
  mostrarEtapa?: boolean;
  etapaLabel?: string;
  /** Habilita o "pegar" pelo cabeçalho do card pra mover no kanban via drag-and-drop. */
  arrastavel?: boolean;
}) {
  return (
    <details className="group rounded-xl border border-border bg-card shadow-sm transition-shadow open:shadow-md">
      <summary
        draggable={arrastavel}
        onDragStart={
          arrastavel
            ? (e) => {
                e.dataTransfer.setData("text/lead-id", lead.id);
                e.dataTransfer.effectAllowed = "move";
              }
            : undefined
        }
        className={cn("list-none px-4 py-3", arrastavel ? "cursor-grab active:cursor-grabbing" : "cursor-pointer")}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{lead.nome}</p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="size-3" />
                {lead.telefone}
              </span>
              {lead.cidade && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {lead.cidade}
                </span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {mostrarEtapa && etapaLabel && (
              <Badge variant="outline" className={cn("border-0", badgeClasseEtapa(lead.etapa))}>
                {etapaLabel}
              </Badge>
            )}
            {lead.proximaAcao && (
              <Badge
                variant="outline"
                className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
              >
                {lead.proximaAcao}
              </Badge>
            )}
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </div>
      </summary>

      <form
        action={registrarAtividade}
        className="flex flex-col gap-2 border-t border-border px-4 py-3"
      >
        <input type="hidden" name="leadId" value={lead.id} />

        <div className="grid grid-cols-2 gap-2">
          <select name="tipo" required defaultValue="LIGACAO" className={inputClass}>
            {TIPOS_ATIVIDADE.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select name="novaEtapa" required defaultValue={lead.etapa} className={inputClass}>
            {ETAPAS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <input name="resultado" placeholder="Resultado do contato" className={inputClass} />
        <textarea name="observacao" placeholder="Observação" rows={2} className={inputClass} />

        <div className="grid grid-cols-2 gap-2">
          <input name="proximaAcao" placeholder="Próxima ação" className={inputClass} />
          <input name="proximaAcaoData" type="date" className={inputClass} />
        </div>

        <Button type="submit" size="sm" className="mt-1 w-fit">
          Registrar contato
        </Button>
      </form>
    </details>
  );
}
