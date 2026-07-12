"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirRole } from "@/lib/autorizacao";
import { lerPlanilha, pegarCampo } from "@/lib/planilha";
import { buscarVendedorPorNome } from "@/lib/matching";

export type ResultadoImportacaoLeads = {
  erro?: string;
  resumo?: {
    totalLidos: number;
    totalInseridos: number;
    totalDuplicados: number;
    totalErros: number;
    naoAtribuidos: number;
  };
};

export async function importarLeads(
  _estado: ResultadoImportacaoLeads | undefined,
  formData: FormData
): Promise<ResultadoImportacaoLeads> {
  const session = await exigirRole("ADMIN", "COORDENADOR");

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Selecione um arquivo .xlsx ou .csv." };
  }

  const linhas = await lerPlanilha(arquivo);
  if (linhas.length === 0) {
    return { erro: "Não encontramos linhas nessa planilha." };
  }

  const vendedores = await prisma.vendedor.findMany({
    where: { ativo: true },
    select: { id: true, nomeCompleto: true },
  });
  const aliasRows = await prisma.vendedorAliasVenda.findMany();
  const aliases = new Map(aliasRows.map((a) => [a.nomePlanilha, a.vendedorId]));

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
  let naoAtribuidos = 0;

  for (const linha of linhas) {
    const nome = pegarCampo(linha, "nome", "cliente", "lead");
    const telefone = pegarCampo(linha, "telefone", "celular", "whatsapp", "fone");
    const cidade = pegarCampo(linha, "cidade");
    const origem = pegarCampo(linha, "origem", "canal");
    const observacoes = pegarCampo(linha, "observacoes", "observação", "obs");
    const indicadoPor = pegarCampo(linha, "indicado_por", "indicacao", "indicação");
    const nomeVendedor = pegarCampo(linha, "vendedor", "responsavel", "responsável");

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

    let vendedorId: string | null = null;
    if (nomeVendedor) {
      const match = buscarVendedorPorNome(nomeVendedor, vendedores, aliases);
      if (match.encontrado) {
        vendedorId = match.vendedorId;
      } else {
        naoAtribuidos += 1;
      }
    } else {
      naoAtribuidos += 1;
    }

    await prisma.lead.create({
      data: {
        nome,
        telefone: telefoneNormalizado,
        cidade: cidade || null,
        origem: origem || null,
        observacoes: observacoes || null,
        indicadoPor: indicadoPor || null,
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

  revalidatePath("/coordenador/importar-leads");

  return {
    resumo: {
      totalLidos: linhas.length,
      totalInseridos: inseridos,
      totalDuplicados: duplicados,
      totalErros: erros,
      naoAtribuidos,
    },
  };
}
