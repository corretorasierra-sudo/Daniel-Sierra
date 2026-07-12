"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/autorizacao";

const atualizarSchema = z.object({
  id: z.string().min(1),
  observacoes: z.string().optional(),
  pendencias: z.string().optional(),
  proximaAcao: z.string().optional(),
  proximaAcaoData: z.string().optional(),
});

/**
 * Vendas do canal "site" (vendedor.virtual) só podem ser editadas por
 * gestor/coordenador; vendas de um vendedor de verdade só pelo próprio
 * vendedor ou por admin — nunca pelos dois grupos ao mesmo tempo.
 */
async function garantirAcessoPosVenda(id: string) {
  const session = await exigirSessao();
  const acompanhamento = await prisma.acompanhamentoPosVenda.findUniqueOrThrow({
    where: { id },
    include: { venda: { include: { vendedor: true } } },
  });

  const role = session.user.role;
  const ehGestorOuCoordenador = role === "ADMIN" || role === "GERENTE" || role === "COORDENADOR";

  if (acompanhamento.venda.vendedor.virtual) {
    if (!ehGestorOuCoordenador) {
      throw new Error("Só gestor ou coordenador podem editar vendas do canal site.");
    }
  } else if (role === "VENDEDOR") {
    if (acompanhamento.venda.vendedorId !== session.user.vendedorId) {
      throw new Error("Você não pode editar o pós-venda de outro vendedor.");
    }
  } else if (role !== "ADMIN") {
    throw new Error("Sem permissão pra editar esse pós-venda.");
  }

  return { session, acompanhamento };
}

/** Detalhes de texto (observações, pendências, próxima ação) — não mexe no checklist. */
export async function atualizarPosVenda(formData: FormData) {
  const dados = atualizarSchema.parse({
    id: formData.get("id"),
    observacoes: formData.get("observacoes") || undefined,
    pendencias: formData.get("pendencias") || undefined,
    proximaAcao: formData.get("proximaAcao") || undefined,
    proximaAcaoData: formData.get("proximaAcaoData") || undefined,
  });

  await garantirAcessoPosVenda(dados.id);

  await prisma.acompanhamentoPosVenda.update({
    where: { id: dados.id },
    data: {
      observacoes: dados.observacoes || null,
      pendencias: dados.pendencias || null,
      proximaAcao: dados.proximaAcao || null,
      proximaAcaoData: dados.proximaAcaoData ? new Date(dados.proximaAcaoData) : null,
      dataUltimoAcompanhamento: new Date(),
    },
  });

  revalidatePath("/vendedor/pos-venda");
  revalidatePath("/vendedor");
  revalidatePath("/gerente/vendas-site");
  revalidatePath("/coordenador/vendas-site");
}

const CAMPOS_CHECKLIST = [
  "appBaixado",
  "consultaMarcada",
  "orientacoesRecebidas",
  "indicacaoRecebida",
] as const;
export type CampoChecklistPosVenda = (typeof CAMPOS_CHECKLIST)[number];

/** Marca/desmarca um item do checklist (sim = marcado, vazio = não) sem tocar nos demais campos. */
export async function alternarChecklistPosVenda(
  id: string,
  campo: CampoChecklistPosVenda,
  valor: boolean
) {
  await garantirAcessoPosVenda(id);

  await prisma.acompanhamentoPosVenda.update({
    where: { id },
    data: {
      appBaixado: campo === "appBaixado" ? valor : undefined,
      consultaMarcada: campo === "consultaMarcada" ? valor : undefined,
      orientacoesRecebidas: campo === "orientacoesRecebidas" ? valor : undefined,
      indicacaoRecebida: campo === "indicacaoRecebida" ? valor : undefined,
      dataUltimoAcompanhamento: new Date(),
    },
  });

  revalidatePath("/vendedor/pos-venda");
  revalidatePath("/vendedor");
  revalidatePath("/gerente");
  revalidatePath("/gerente/vendas-site");
  revalidatePath("/coordenador/pos-venda");
  revalidatePath("/coordenador/vendas-site");
}
