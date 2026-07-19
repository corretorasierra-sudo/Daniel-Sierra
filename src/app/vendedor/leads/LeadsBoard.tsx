"use client";

import { useEffect, useState, useTransition } from "react";
import { LeadCard, type LeadResumo } from "./LeadCard";
import { moverEtapaLead } from "./actions";
import { EtapaFunilColuna } from "@/components/dashboard/EtapaFunilBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ETAPA_ORDEM = ["NOVO", "EM_TRATATIVA", "FECHAMENTO", "PERDIDO"] as const;

const ETAPA_LABEL: Record<(typeof ETAPA_ORDEM)[number], string> = {
  NOVO: "Novo lead",
  EM_TRATATIVA: "Em tratativa",
  FECHAMENTO: "Fechamento",
  PERDIDO: "Perdido",
};

export function LeadsBoard({ leads }: { leads: LeadResumo[] }) {
  const [leadsState, setLeadsState] = useState(leads);
  const [, startTransition] = useTransition();

  // Recebe leads atualizados depois de revalidatePath (ex: mudança de etapa
  // pelo formulário do card, ou confirmação do servidor após um drop).
  useEffect(() => {
    setLeadsState(leads);
  }, [leads]);

  function moverLead(leadId: string, novaEtapa: (typeof ETAPA_ORDEM)[number]) {
    setLeadsState((atual) =>
      atual.map((lead) => (lead.id === leadId ? { ...lead, etapa: novaEtapa } : lead))
    );
    startTransition(() => {
      moverEtapaLead(leadId, novaEtapa);
    });
  }

  const leadsPorEtapa = new Map<string, LeadResumo[]>();
  for (const etapa of ETAPA_ORDEM) leadsPorEtapa.set(etapa, []);
  for (const lead of leadsState) {
    leadsPorEtapa.get(lead.etapa)?.push(lead);
  }

  return (
    <Tabs defaultValue="kanban" className="gap-4">
      <TabsList>
        <TabsTrigger value="kanban">Kanban</TabsTrigger>
        <TabsTrigger value="lista">Lista</TabsTrigger>
      </TabsList>

      <TabsContent value="kanban">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {ETAPA_ORDEM.map((etapa) => {
            const leadsDaEtapa = leadsPorEtapa.get(etapa) ?? [];
            return (
              <div key={etapa} className="w-72 shrink-0 sm:w-80">
                <EtapaFunilColuna
                  etapa={etapa}
                  titulo={ETAPA_LABEL[etapa]}
                  quantidade={leadsDaEtapa.length}
                  onSoltarLead={(leadId) => moverLead(leadId, etapa)}
                >
                  {leadsDaEtapa.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} arrastavel />
                  ))}
                  {leadsDaEtapa.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border/60 bg-card/50 px-3 py-4 text-center text-xs text-muted-foreground">
                      nenhum lead
                    </p>
                  )}
                </EtapaFunilColuna>
              </div>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="lista">
        <div className="flex flex-col gap-2">
          {leadsState.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum lead cadastrado ainda.
            </p>
          )}
          {leadsState.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              mostrarEtapa
              etapaLabel={ETAPA_LABEL[lead.etapa as (typeof ETAPA_ORDEM)[number]] ?? lead.etapa}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
