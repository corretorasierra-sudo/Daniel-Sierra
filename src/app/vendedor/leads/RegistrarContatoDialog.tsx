"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { PhoneCall } from "lucide-react";
import { registrarAtividade } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TIPOS_CONTATO = [
  { value: "LIGACAO", label: "Ligação" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "MENSAGEM", label: "Mensagem" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "RETORNO_AGENDADO", label: "Retorno agendado" },
] as const;

const ETAPAS = [
  { value: "NOVO", label: "Novo lead" },
  { value: "EM_TRATATIVA", label: "Em tratativa" },
  { value: "SEM_RESPOSTA", label: "Sem resposta" },
  { value: "PERDIDO", label: "Perdido" },
  { value: "FECHAMENTO", label: "Concluído" },
] as const;

const selectClasse =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input";

/** Botão + diálogo pra registrar um contato (ligação, WhatsApp...) num lead — conta como atividade do dia. */
export function RegistrarContatoDialog({
  leadId,
  etapaAtual,
  nomeLead,
}: {
  leadId: string;
  etapaAtual: string;
  nomeLead: string;
}) {
  const [open, setOpen] = useState(false);
  const [estado, action, pending] = useActionState(registrarAtividade, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [estado]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          title={`Registrar contato com ${nomeLead}`}
        >
          <PhoneCall className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar contato — {nomeLead}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={action} className="flex flex-col gap-3">
          <input type="hidden" name="leadId" value={leadId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">Tipo de contato</Label>
            <select id="tipo" name="tipo" required defaultValue="LIGACAO" className={selectClasse}>
              {TIPOS_CONTATO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resultado">Resultado</Label>
            <Input id="resultado" name="resultado" placeholder="Atendeu, disse que vai pensar..." />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proximaAcao">Próxima ação</Label>
            <Input id="proximaAcao" name="proximaAcao" placeholder="Ligar de novo, mandar proposta..." />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proximaAcaoData">Data da próxima ação</Label>
            <Input id="proximaAcaoData" name="proximaAcaoData" type="date" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="novaEtapa">Etapa do lead</Label>
            <select
              id="novaEtapa"
              name="novaEtapa"
              required
              defaultValue={etapaAtual}
              className={selectClasse}
            >
              {ETAPAS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
