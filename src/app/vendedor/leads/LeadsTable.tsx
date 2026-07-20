"use client";

import { useEffect, useState, useTransition } from "react";
import { moverEtapaLead, atualizarObservacaoLead } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ETAPAS = [
  { value: "NOVO", label: "Novo lead" },
  { value: "EM_TRATATIVA", label: "Em tratativa" },
  { value: "SEM_RESPOSTA", label: "Sem resposta" },
  { value: "PERDIDO", label: "Perdido" },
  { value: "FECHAMENTO", label: "Concluído" },
] as const;

const ETAPA_SELECT_CLASSE: Record<(typeof ETAPAS)[number]["value"], string> = {
  NOVO: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  EM_TRATATIVA:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  SEM_RESPOSTA:
    "border-border bg-muted text-foreground/80",
  PERDIDO: "border-red-300 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  FECHAMENTO:
    "border-lime-300 bg-lime-50 text-lime-900 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300",
};

export type LeadResumo = {
  id: string;
  nome: string;
  telefone: string;
  cidade: string | null;
  etapa: string;
  observacoes: string | null;
  dataEntrada: Date;
};

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function LeadsTable({ leads }: { leads: LeadResumo[] }) {
  const [leadsState, setLeadsState] = useState(leads);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLeadsState(leads);
  }, [leads]);

  function mudarEtapa(leadId: string, novaEtapa: string) {
    setLeadsState((atual) =>
      atual.map((lead) => (lead.id === leadId ? { ...lead, etapa: novaEtapa } : lead))
    );
    startTransition(() => {
      moverEtapaLead(leadId, novaEtapa as (typeof ETAPAS)[number]["value"]);
    });
  }

  function mudarObservacao(leadId: string, observacoes: string) {
    setLeadsState((atual) =>
      atual.map((lead) => (lead.id === leadId ? { ...lead, observacoes } : lead))
    );
  }

  function salvarObservacao(leadId: string, observacoes: string) {
    startTransition(() => {
      atualizarObservacaoLead(leadId, observacoes);
    });
  }

  if (leadsState.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
        Nenhum lead cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Data</TableHead>
            <TableHead className="w-[18%]">Nome</TableHead>
            <TableHead className="w-36">Número</TableHead>
            <TableHead className="w-[14%]">Cidade</TableHead>
            <TableHead className="w-44">Status</TableHead>
            <TableHead>Observação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadsState.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="text-muted-foreground">
                {formatarData(lead.dataEntrada)}
              </TableCell>
              <TableCell className="truncate font-medium text-foreground" title={lead.nome}>
                {lead.nome}
              </TableCell>
              <TableCell className="text-muted-foreground">{lead.telefone}</TableCell>
              <TableCell className="truncate text-muted-foreground" title={lead.cidade ?? ""}>
                {lead.cidade ?? "—"}
              </TableCell>
              <TableCell className="whitespace-normal">
                <select
                  value={lead.etapa}
                  onChange={(e) => mudarEtapa(lead.id, e.target.value)}
                  className={`w-full rounded-lg border px-2 py-1.5 text-sm shadow-sm outline-none transition-colors focus:ring-2 focus:ring-lime-500/20 ${ETAPA_SELECT_CLASSE[lead.etapa as (typeof ETAPAS)[number]["value"]] ?? "border-border bg-card"}`}
                >
                  {ETAPAS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="whitespace-normal">
                <input
                  defaultValue={lead.observacoes ?? ""}
                  placeholder="Observação..."
                  onChange={(e) => mudarObservacao(lead.id, e.target.value)}
                  onBlur={(e) => salvarObservacao(lead.id, e.target.value)}
                  className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none transition-colors hover:border-border focus:border-lime-500 focus:bg-card focus:ring-2 focus:ring-lime-500/20"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
