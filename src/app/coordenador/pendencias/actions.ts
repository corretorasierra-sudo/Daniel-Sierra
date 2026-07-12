"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirRole } from "@/lib/autorizacao";
import { pegarCampo, type LinhaPlanilha } from "@/lib/planilha";
import { normalizarNome } from "@/lib/matching";
import { gerarChaveDedupe } from "@/lib/dedupeVenda";
import { parseData, parseValor } from "@/lib/parseImportacao";

const resolverSchema = z.object({
  id: z.string().min(1),
  vendedorId: z.string().min(1, "Selecione um vendedor."),
});

export type EstadoResolverPendencia = { erro?: string } | undefined;

export async function resolverPendencia(
  _estado: EstadoResolverPendencia,
  formData: FormData
): Promise<EstadoResolverPendencia> {
  const session = await exigirRole("ADMIN", "COORDENADOR");

  const dados = resolverSchema.safeParse({
    id: formData.get("id"),
    vendedorId: formData.get("vendedorId"),
  });
  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const pendencia = await prisma.pendenciaImportacao.findUnique({
    where: { id: dados.data.id },
  });
  if (!pendencia || pendencia.status === "RESOLVIDA") {
    return { erro: "Pendência não encontrada ou já resolvida." };
  }

  const linha = pendencia.linhaOriginal as LinhaPlanilha;
  const clienteNome = pegarCampo(linha, "cliente", "nome", "cliente_nome");
  const clienteTelefone = pegarCampo(linha, "telefone", "celular", "fone");
  const dataVendaBruta = pegarCampo(linha, "data_venda", "data", "data_da_venda");
  const produto = pegarCampo(linha, "produto", "plano");
  const valorBruto = pegarCampo(linha, "valor", "valor_venda");
  const codigoExterno = pegarCampo(linha, "codigo_externo", "codigo", "id_venda", "matricula");

  const dataVenda = parseData(dataVendaBruta);
  if (!clienteNome || !dataVenda) {
    return {
      erro: "Essa linha está sem cliente ou data de venda válida — corrija na planilha e reimporte.",
    };
  }

  const vendedorId = dados.data.vendedorId;
  const valor = parseValor(valorBruto);
  const chaveDedupe = gerarChaveDedupe({
    clienteNome,
    clienteTelefone,
    vendedorId,
    dataVenda,
    produto,
  });

  const existente = codigoExterno
    ? await prisma.venda.findUnique({ where: { codigoExterno } })
    : await prisma.venda.findUnique({ where: { chaveDedupe } });

  await prisma.$transaction(async (tx) => {
    if (!existente) {
      const venda = await tx.venda.create({
        data: {
          clienteNome,
          clienteTelefone: clienteTelefone || null,
          vendedorId,
          dataVenda,
          produto: produto || null,
          valor: valor ?? undefined,
          codigoExterno: codigoExterno || null,
          chaveDedupe: codigoExterno ? null : chaveDedupe,
          origemImportacaoId: pendencia.importacaoId,
        },
      });
      await tx.acompanhamentoPosVenda.create({ data: { vendaId: venda.id } });
    }

    await tx.pendenciaImportacao.update({
      where: { id: pendencia.id },
      data: {
        status: "RESOLVIDA",
        resolvidoPorId: session.user.id,
        vendedorCorrigidoId: vendedorId,
        resolvidoEm: new Date(),
      },
    });

    // Aprende o alias pra próximas importações casarem esse nome sozinhas.
    if (pendencia.nomePlanilha) {
      const nomeNormalizado = normalizarNome(pendencia.nomePlanilha);
      await tx.vendedorAliasVenda.upsert({
        where: { nomePlanilha: nomeNormalizado },
        create: { nomePlanilha: nomeNormalizado, vendedorId },
        update: { vendedorId },
      });
    }
  });

  revalidatePath("/coordenador/pendencias");
  revalidatePath("/coordenador/importar-vendas");
  revalidatePath("/vendedor");
  revalidatePath("/gerente");

  return undefined;
}
