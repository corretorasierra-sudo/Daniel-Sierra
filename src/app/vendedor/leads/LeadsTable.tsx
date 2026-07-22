"use client";

import { useState, useTransition } from "react";
import { moverEtapaLead, atualizarObservacaoLead, atualizarCampoLead, criarLead } from "./actions";
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

type EtapaValor = (typeof ETAPAS)[number]["value"];

// Trigger do select: composta sobre o fundo da própria página, então uma tinta
// translúcida funciona nos dois temas.
const ETAPA_TRIGGER_CLASSE: Record<EtapaValor, string> = {
  NOVO: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  EM_TRATATIVA:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  SEM_RESPOSTA: "border-border bg-muted text-foreground/80",
  PERDIDO: "border-red-300 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  FECHAMENTO:
    "border-lime-300 bg-lime-50 text-lime-900 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300",
};

// Opções do dropdown: o navegador renderiza esse popup fora da página (sem o
// fundo escuro por trás), então uma tinta translúcida vira um bege quase
// ilegível — aqui usamos "bg-card" (sólido, já muda sozinho com o tema).
const ETAPA_OPTION_CLASSE: Record<EtapaValor, string> = {
  NOVO: "bg-card text-sky-700 dark:text-sky-300",
  EM_TRATATIVA: "bg-card text-amber-700 dark:text-amber-300",
  SEM_RESPOSTA: "bg-card text-foreground/80",
  PERDIDO: "bg-card text-red-700 dark:text-red-300",
  FECHAMENTO: "bg-card text-lime-700 dark:text-lime-300",
};

const inputCelulaClasse =
  "w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none transition-colors hover:border-border focus:border-lime-500 focus:bg-card focus:ring-2 focus:ring-lime-500/20 disabled:opacity-60";

const LINHAS_EM_BRANCO = 50;

export type LeadResumo = {
  id: string;
  nome: string;
  telefone: string;
  cidade: string | null;
  etapa: string;
  observacoes: string | null;
  dataEntrada: Date;
};

type Rascunho = {
  nome: string;
  telefone: string;
  cidade: string;
  observacoes: string;
  salvando: boolean;
  erro?: string;
};

function rascunhoVazio(): Rascunho {
  return { nome: "", telefone: "", cidade: "", observacoes: "", salvando: false };
}

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function LeadsTable({ leads }: { leads: LeadResumo[] }) {
  const [leadsState, setLeadsState] = useState(leads);
  const [leadsAnterior, setLeadsAnterior] = useState(leads);
  const [rascunhos, setRascunhos] = useState<Rascunho[]>(() =>
    Array.from({ length: LINHAS_EM_BRANCO }, rascunhoVazio)
  );
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  // Recebe leads atualizados depois de revalidatePath (etapa/observação mudada,
  // ou lead novo criado pela linha em branco). Ajuste durante o render, sem
  // efeito, seguindo a recomendação do React pra sincronizar com uma prop.
  if (leads !== leadsAnterior) {
    setLeadsAnterior(leads);
    setLeadsState(leads);
  }

  function mudarEtapa(leadId: string, novaEtapa: string) {
    setLeadsState((atual) =>
      atual.map((lead) => (lead.id === leadId ? { ...lead, etapa: novaEtapa } : lead))
    );
    startTransition(() => {
      moverEtapaLead(leadId, novaEtapa as EtapaValor);
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

  function chaveErro(leadId: string, campo: string) {
    return `${leadId}:${campo}`;
  }

  function mudarCampoLead(leadId: string, campo: "nome" | "telefone" | "cidade", valor: string) {
    setLeadsState((atual) =>
      atual.map((lead) => (lead.id === leadId ? { ...lead, [campo]: valor } : lead))
    );
  }

  async function salvarCampoLead(leadId: string, campo: "nome" | "telefone" | "cidade", valor: string) {
    const resultado = await atualizarCampoLead(leadId, campo, valor);
    const chave = chaveErro(leadId, campo);
    setErrosCampo((atual) => {
      const proximo = { ...atual };
      if (resultado?.erro) {
        proximo[chave] = resultado.erro;
      } else {
        delete proximo[chave];
      }
      return proximo;
    });
  }

  function mudarRascunho(index: number, campo: keyof Omit<Rascunho, "salvando" | "erro">, valor: string) {
    setRascunhos((atual) =>
      atual.map((r, i) => (i === index ? { ...r, [campo]: valor, erro: undefined } : r))
    );
  }

  async function salvarRascunhoSeCompleto(index: number) {
    const rascunho = rascunhos[index];
    if (!rascunho || rascunho.salvando) return;
    if (!rascunho.nome.trim() || !rascunho.telefone.trim()) return;

    setRascunhos((atual) => atual.map((r, i) => (i === index ? { ...r, salvando: true } : r)));

    const formData = new FormData();
    formData.set("nome", rascunho.nome.trim());
    formData.set("telefone", rascunho.telefone.trim());
    if (rascunho.cidade.trim()) formData.set("cidade", rascunho.cidade.trim());
    if (rascunho.observacoes.trim()) formData.set("observacoes", rascunho.observacoes.trim());

    const resultado = await criarLead(undefined, formData);

    setRascunhos((atual) =>
      atual.map((r, i) =>
        i === index
          ? resultado?.erro
            ? { ...r, salvando: false, erro: resultado.erro }
            : rascunhoVazio()
          : r
      )
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
              <TableCell>
                <input
                  defaultValue={lead.nome}
                  onChange={(e) => mudarCampoLead(lead.id, "nome", e.target.value)}
                  onBlur={(e) => salvarCampoLead(lead.id, "nome", e.target.value)}
                  className={`${inputCelulaClasse} font-medium text-foreground`}
                />
                {errosCampo[chaveErro(lead.id, "nome")] && (
                  <p className="mt-0.5 text-xs text-red-500">{errosCampo[chaveErro(lead.id, "nome")]}</p>
                )}
              </TableCell>
              <TableCell>
                <input
                  defaultValue={lead.telefone}
                  onChange={(e) => mudarCampoLead(lead.id, "telefone", e.target.value)}
                  onBlur={(e) => salvarCampoLead(lead.id, "telefone", e.target.value)}
                  className={inputCelulaClasse}
                />
                {errosCampo[chaveErro(lead.id, "telefone")] && (
                  <p className="mt-0.5 text-xs text-red-500">{errosCampo[chaveErro(lead.id, "telefone")]}</p>
                )}
              </TableCell>
              <TableCell>
                <input
                  defaultValue={lead.cidade ?? ""}
                  placeholder="Cidade"
                  onChange={(e) => mudarCampoLead(lead.id, "cidade", e.target.value)}
                  onBlur={(e) => salvarCampoLead(lead.id, "cidade", e.target.value)}
                  className={inputCelulaClasse}
                />
              </TableCell>
              <TableCell className="whitespace-normal">
                <select
                  value={lead.etapa}
                  onChange={(e) => mudarEtapa(lead.id, e.target.value)}
                  className={`w-full rounded-lg border px-2 py-1.5 text-sm shadow-sm outline-none transition-colors focus:ring-2 focus:ring-lime-500/20 ${ETAPA_TRIGGER_CLASSE[lead.etapa as EtapaValor] ?? "border-border bg-card"}`}
                >
                  {ETAPAS.map((e) => (
                    <option key={e.value} value={e.value} className={ETAPA_OPTION_CLASSE[e.value]}>
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
                  className={inputCelulaClasse}
                />
              </TableCell>
            </TableRow>
          ))}

          {rascunhos.map((rascunho, index) => (
            <TableRow
              key={`rascunho-${index}`}
              onBlur={(e) => {
                // Só salva quando o foco sai da linha inteira — senão o lead
                // era criado (e a linha limpa) ao tabular de Telefone pra
                // Cidade, antes da cidade ser digitada.
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  salvarRascunhoSeCompleto(index);
                }
              }}
            >
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell>
                <input
                  value={rascunho.nome}
                  placeholder="Nome"
                  disabled={rascunho.salvando}
                  onChange={(e) => mudarRascunho(index, "nome", e.target.value)}
                  className={inputCelulaClasse}
                />
              </TableCell>
              <TableCell>
                <input
                  value={rascunho.telefone}
                  placeholder="Número"
                  disabled={rascunho.salvando}
                  onChange={(e) => mudarRascunho(index, "telefone", e.target.value)}
                  className={inputCelulaClasse}
                />
              </TableCell>
              <TableCell>
                <input
                  value={rascunho.cidade}
                  placeholder="Cidade"
                  disabled={rascunho.salvando}
                  onChange={(e) => mudarRascunho(index, "cidade", e.target.value)}
                  className={inputCelulaClasse}
                />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {rascunho.salvando ? "Salvando..." : "Novo lead"}
              </TableCell>
              <TableCell>
                <input
                  value={rascunho.observacoes}
                  placeholder="Observação..."
                  disabled={rascunho.salvando}
                  onChange={(e) => mudarRascunho(index, "observacoes", e.target.value)}
                  className={inputCelulaClasse}
                />
                {rascunho.erro && <p className="mt-0.5 text-xs text-red-500">{rascunho.erro}</p>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
