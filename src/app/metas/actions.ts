"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirRole } from "@/lib/autorizacao";

const criarMetaSchema = z.object({
  vendedorId: z.string().optional(),
  tipo: z.enum(["MENSAL", "SEMANAL", "DIARIA"]),
  valorMeta: z.coerce.number().int().positive("A meta precisa ser maior que zero."),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
});

const metaMensalSemanalSchema = z.object({
  valorMensal: z.coerce.number().int().positive("A meta mensal precisa ser maior que zero."),
  valorSemanal: z.coerce.number().int().positive("A meta semanal precisa ser maior que zero."),
});

/** Início (segunda) e fim (domingo) da semana corrente. */
function limitesSemanaAtual(hoje: Date) {
  const diaSemana = hoje.getDay(); // 0 = domingo
  const diffParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + diffParaSegunda);
  const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6, 23, 59, 59);
  return { inicio, fim };
}

/** Início (dia 1) e fim (último dia) do mês corrente. */
function limitesMesAtual(hoje: Date) {
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
  return { inicio, fim };
}

/** Atualiza a meta corrente (vendedorId + tipo) se já existir uma cobrindo o período, senão cria. */
async function upsertMetaPeriodo(
  vendedorId: string | null,
  tipo: "MENSAL" | "SEMANAL",
  valorMeta: number,
  periodo: { inicio: Date; fim: Date }
) {
  const existente = await prisma.meta.findFirst({
    where: {
      vendedorId,
      tipo,
      dataInicio: { lte: periodo.fim },
      dataFim: { gte: periodo.inicio },
    },
  });

  if (existente) {
    await prisma.meta.update({
      where: { id: existente.id },
      data: { valorMeta, dataInicio: periodo.inicio, dataFim: periodo.fim },
    });
  } else {
    await prisma.meta.create({
      data: { vendedorId, tipo, valorMeta, dataInicio: periodo.inicio, dataFim: periodo.fim },
    });
  }
}

/** Aplica a mesma meta mensal + semanal a todos os vendedores ativos (não virtuais) de uma vez. */
export async function definirMetaVendedores(formData: FormData) {
  await exigirRole("ADMIN", "GERENTE");

  const dados = metaMensalSemanalSchema.parse({
    valorMensal: formData.get("valorMensal"),
    valorSemanal: formData.get("valorSemanal"),
  });

  const hoje = new Date();
  const mes = limitesMesAtual(hoje);
  const semana = limitesSemanaAtual(hoje);

  const vendedores = await prisma.vendedor.findMany({
    where: { ativo: true, virtual: false },
    select: { id: true },
  });

  await Promise.all(
    vendedores.map((v) =>
      Promise.all([
        upsertMetaPeriodo(v.id, "MENSAL", dados.valorMensal, mes),
        upsertMetaPeriodo(v.id, "SEMANAL", dados.valorSemanal, semana),
      ])
    )
  );

  revalidatePath("/metas");
  revalidatePath("/vendedor");
  revalidatePath("/gerente");
}

/** Define a meta mensal + semanal da unidade (franquia) inteira. */
export async function definirMetaFranquia(formData: FormData) {
  await exigirRole("ADMIN", "GERENTE");

  const dados = metaMensalSemanalSchema.parse({
    valorMensal: formData.get("valorMensal"),
    valorSemanal: formData.get("valorSemanal"),
  });

  const hoje = new Date();
  const mes = limitesMesAtual(hoje);
  const semana = limitesSemanaAtual(hoje);

  await Promise.all([
    upsertMetaPeriodo(null, "MENSAL", dados.valorMensal, mes),
    upsertMetaPeriodo(null, "SEMANAL", dados.valorSemanal, semana),
  ]);

  revalidatePath("/metas");
  revalidatePath("/gerente");
}

export async function criarMeta(formData: FormData) {
  await exigirRole("ADMIN", "GERENTE");

  const vendedorIdBruto = formData.get("vendedorId");
  const dados = criarMetaSchema.parse({
    vendedorId: vendedorIdBruto === "unidade" ? undefined : vendedorIdBruto,
    tipo: formData.get("tipo"),
    valorMeta: formData.get("valorMeta"),
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim"),
  });

  await prisma.meta.create({
    data: {
      vendedorId: dados.vendedorId ?? null,
      tipo: dados.tipo,
      valorMeta: dados.valorMeta,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
    },
  });

  revalidatePath("/metas");
}

export async function excluirMeta(formData: FormData) {
  await exigirRole("ADMIN", "GERENTE");
  const id = String(formData.get("id"));
  await prisma.meta.delete({ where: { id } });
  revalidatePath("/metas");
}
