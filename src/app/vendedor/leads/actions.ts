"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EtapaLead } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { exigirVendedor } from "@/lib/autorizacao";
import { lerPlanilha, pegarCampo } from "@/lib/planilha";

const registrarAtividadeSchema = z.object({
  leadId: z.string().min(1),
  tipo: z.enum([
    "LIGACAO",
    "MENSAGEM",
    "WHATSAPP",
    "RETORNO_AGENDADO",
    "PRESENCIAL",
    "OBSERVACAO",
  ]),
  resultado: z.string().optional(),
  observacao: z.string().optional(),
  proximaAcao: z.string().optional(),
  proximaAcaoData: z.string().optional(),
  novaEtapa: z.enum(["NOVO", "EM_TRATATIVA", "FECHAMENTO", "PERDIDO"]),
});

export async function registrarAtividade(formData: FormData) {
  const session = await exigirVendedor();

  const dados = registrarAtividadeSchema.parse({
    leadId: formData.get("leadId"),
    tipo: formData.get("tipo"),
    resultado: formData.get("resultado") || undefined,
    observacao: formData.get("observacao") || undefined,
    proximaAcao: formData.get("proximaAcao") || undefined,
    proximaAcaoData: formData.get("proximaAcaoData") || undefined,
    novaEtapa: formData.get("novaEtapa"),
  });

  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: dados.leadId } });

  // Vendedor só mexe nos próprios leads. Admin pode mexer em qualquer um.
  if (session.user.role === "VENDEDOR" && lead.vendedorId !== session.user.vendedorId) {
    throw new Error("Você não pode editar um lead de outro vendedor.");
  }

  const vendedorId = session.user.vendedorId ?? lead.vendedorId;
  if (!vendedorId) throw new Error("Lead sem vendedor responsável.");

  const proximaAcaoData = dados.proximaAcaoData ? new Date(dados.proximaAcaoData) : null;

  await prisma.$transaction(async (tx) => {
    await tx.atividade.create({
      data: {
        leadId: lead.id,
        vendedorId,
        tipo: dados.tipo,
        resultado: dados.resultado || null,
        observacao: dados.observacao || null,
        proximaAcao: dados.proximaAcao || null,
        proximaAcaoData,
      },
    });

    const etapaMudou = dados.novaEtapa !== lead.etapa;

    await tx.lead.update({
      where: { id: lead.id },
      data: {
        dataUltimoContato: new Date(),
        proximaAcao: dados.proximaAcao || null,
        proximaAcaoData,
        etapa: dados.novaEtapa,
      },
    });

    if (etapaMudou) {
      await tx.historicoEtapaLead.create({
        data: {
          leadId: lead.id,
          etapaAnterior: lead.etapa,
          etapaNova: dados.novaEtapa,
          userId: session.user.id,
        },
      });
    }
  });

  revalidatePath("/vendedor/leads");
  revalidatePath("/vendedor");
}

const moverEtapaSchema = z.object({
  leadId: z.string().min(1),
  novaEtapa: z.enum(["NOVO", "EM_TRATATIVA", "FECHAMENTO", "PERDIDO"]),
});

/** Muda só a etapa do lead (drag-and-drop no kanban) — não registra atividade, só o histórico de etapa. */
export async function moverEtapaLead(leadId: string, novaEtapa: EtapaLead) {
  const session = await exigirVendedor();
  const dados = moverEtapaSchema.parse({ leadId, novaEtapa });

  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: dados.leadId } });

  if (session.user.role === "VENDEDOR" && lead.vendedorId !== session.user.vendedorId) {
    throw new Error("Você não pode mover um lead de outro vendedor.");
  }

  if (lead.etapa === dados.novaEtapa) return;

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: lead.id },
      data: { etapa: dados.novaEtapa },
    }),
    prisma.historicoEtapaLead.create({
      data: {
        leadId: lead.id,
        etapaAnterior: lead.etapa,
        etapaNova: dados.novaEtapa,
        userId: session.user.id,
      },
    }),
  ]);

  revalidatePath("/vendedor/leads");
  revalidatePath("/vendedor");
}

const criarLeadSchema = z.object({
  nome: z.string().min(1),
  telefone: z.string().min(1),
  cidade: z.string().optional(),
  origem: z.string().optional(),
  observacoes: z.string().optional(),
});

export type EstadoCriarLead = { erro?: string; ok?: boolean } | undefined;

export async function criarLead(
  _estado: EstadoCriarLead,
  formData: FormData
): Promise<EstadoCriarLead> {
  const session = await exigirVendedor();
  const vendedorId = session.user.vendedorId;
  if (!vendedorId) return { erro: "Esta conta não está vinculada a um vendedor." };

  const parsed = criarLeadSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    cidade: formData.get("cidade") || undefined,
    origem: formData.get("origem") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  });
  if (!parsed.success) return { erro: "Preencha nome e telefone." };

  const telefoneNormalizado = parsed.data.telefone.replace(/\D/g, "");
  if (!telefoneNormalizado) return { erro: "Telefone inválido." };

  const jaExiste = await prisma.lead.findUnique({ where: { telefone: telefoneNormalizado } });
  if (jaExiste) return { erro: "Já existe um lead com esse telefone." };

  await prisma.lead.create({
    data: {
      nome: parsed.data.nome,
      telefone: telefoneNormalizado,
      cidade: parsed.data.cidade || null,
      origem: parsed.data.origem || null,
      observacoes: parsed.data.observacoes || null,
      vendedorId,
    },
  });

  revalidatePath("/vendedor/leads");
  revalidatePath("/vendedor");
  return { ok: true };
}

export type ResultadoImportPessoal = {
  erro?: string;
  resumo?: {
    totalLidos: number;
    totalInseridos: number;
    totalDuplicados: number;
    totalErros: number;
  };
};

/** Import de planilha só pros leads do próprio vendedor logado — sem coluna de vendedor nem matching por nome. */
export async function importarLeadsPessoal(
  _estado: ResultadoImportPessoal | undefined,
  formData: FormData
): Promise<ResultadoImportPessoal> {
  const session = await exigirVendedor();
  const vendedorId = session.user.vendedorId;
  if (!vendedorId) return { erro: "Esta conta não está vinculada a um vendedor." };

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Selecione um arquivo .xlsx ou .csv." };
  }

  const linhas = await lerPlanilha(arquivo);
  if (linhas.length === 0) {
    return { erro: "Não encontramos linhas nessa planilha." };
  }

  const importacao = await prisma.importacaoLead.create({
    data: {
      arquivoNome: arquivo.name,
      importadoPorId: session.user.id,
      status: "PROCESSANDO",
      totalLidos: linhas.length,
    },
  });

  let inseridos = 0;
  let duplicados = 0;
  let erros = 0;

  for (const linha of linhas) {
    const nome = pegarCampo(linha, "nome", "cliente", "lead");
    const telefone = pegarCampo(linha, "telefone", "celular", "whatsapp", "fone");
    const cidade = pegarCampo(linha, "cidade");
    const origem = pegarCampo(linha, "origem", "canal");
    const observacoes = pegarCampo(linha, "observacoes", "observação", "obs");

    if (!nome || !telefone) {
      erros += 1;
      continue;
    }

    const telefoneNormalizado = telefone.replace(/\D/g, "");
    if (!telefoneNormalizado) {
      erros += 1;
      continue;
    }

    const jaExiste = await prisma.lead.findUnique({ where: { telefone: telefoneNormalizado } });
    if (jaExiste) {
      duplicados += 1;
      continue;
    }

    await prisma.lead.create({
      data: {
        nome,
        telefone: telefoneNormalizado,
        cidade: cidade || null,
        origem: origem || null,
        observacoes: observacoes || null,
        vendedorId,
        origemImportacaoId: importacao.id,
      },
    });
    inseridos += 1;
  }

  await prisma.importacaoLead.update({
    where: { id: importacao.id },
    data: {
      status: erros > 0 ? "CONCLUIDA_COM_PENDENCIAS" : "CONCLUIDA",
      totalInseridos: inseridos,
      totalDuplicados: duplicados,
      totalErros: erros,
    },
  });

  revalidatePath("/vendedor/leads");
  revalidatePath("/vendedor");

  return {
    resumo: {
      totalLidos: linhas.length,
      totalInseridos: inseridos,
      totalDuplicados: duplicados,
      totalErros: erros,
    },
  };
}
