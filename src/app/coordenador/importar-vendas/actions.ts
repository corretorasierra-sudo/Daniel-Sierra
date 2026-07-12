"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirRole } from "@/lib/autorizacao";
import { lerPlanilha, pegarCampo } from "@/lib/planilha";
import { buscarVendedorPorNome } from "@/lib/matching";
import { gerarChaveDedupe } from "@/lib/dedupeVenda";
import { parseData, parseValor, parseProspeccao } from "@/lib/parseImportacao";

export type ResultadoImportacaoVendas = {
  erro?: string;
  resumo?: {
    totalLidos: number;
    totalInseridos: number;
    totalDuplicados: number;
    totalErros: number;
    totalPendencias: number;
  };
};

export async function importarVendas(
  _estado: ResultadoImportacaoVendas | undefined,
  formData: FormData
): Promise<ResultadoImportacaoVendas> {
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
    select: { id: true, nomeCompleto: true },
  });
  const aliasRows = await prisma.vendedorAliasVenda.findMany();
  const aliases = new Map(aliasRows.map((a) => [a.nomePlanilha, a.vendedorId]));

  const importacao = await prisma.importacaoVenda.create({
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
  let pendencias = 0;

  for (const linha of linhas) {
    const clienteNome = pegarCampo(linha, "filiado");
    const clienteTelefone = pegarCampo(linha, "telefone", "celular", "fone");
    const nomeVendedor = pegarCampo(linha, "vendedor", "consultor", "responsavel", "responsável");
    const dataVendaBruta = pegarCampo(linha, "data", "data_venda", "data_da_venda");
    const produto = pegarCampo(linha, "produto", "plano");
    const valorBruto = pegarCampo(linha, "valor", "valor_venda");
    const codigoExterno = pegarCampo(linha, "matricula", "codigo_externo", "codigo", "id_venda");
    const prospeccaoBruta = pegarCampo(linha, "prospeccao");

    const dataVenda = parseData(dataVendaBruta);
    const tipoProspeccao = parseProspeccao(prospeccaoBruta);

    if (!clienteNome || !nomeVendedor || !dataVenda || !tipoProspeccao) {
      await prisma.pendenciaImportacao.create({
        data: {
          importacaoId: importacao.id,
          linhaOriginal: linha,
          motivo: "DADOS_AUSENTES",
          nomePlanilha: nomeVendedor || null,
        },
      });
      erros += 1;
      pendencias += 1;
      continue;
    }

    const match = buscarVendedorPorNome(nomeVendedor, vendedores, aliases);
    if (!match.encontrado) {
      await prisma.pendenciaImportacao.create({
        data: {
          importacaoId: importacao.id,
          linhaOriginal: linha,
          motivo: "VENDEDOR_NAO_ENCONTRADO",
          nomePlanilha: nomeVendedor,
        },
      });
      pendencias += 1;
      continue;
    }

    const valor = parseValor(valorBruto);
    const chaveDedupe = gerarChaveDedupe({
      clienteNome,
      clienteTelefone,
      vendedorId: match.vendedorId,
      dataVenda,
      produto,
    });

    const existente = codigoExterno
      ? await prisma.venda.findUnique({ where: { codigoExterno } })
      : await prisma.venda.findUnique({ where: { chaveDedupe } });

    if (existente) {
      duplicados += 1;
      continue;
    }

    const venda = await prisma.venda.create({
      data: {
        clienteNome,
        clienteTelefone: clienteTelefone || null,
        vendedorId: match.vendedorId,
        dataVenda,
        produto: produto || null,
        valor: valor ?? undefined,
        tipoProspeccao,
        codigoExterno: codigoExterno || null,
        chaveDedupe: codigoExterno ? null : chaveDedupe,
        origemImportacaoId: importacao.id,
      },
    });

    await prisma.acompanhamentoPosVenda.create({
      data: { vendaId: venda.id },
    });

    inseridos += 1;
  }

  await prisma.importacaoVenda.update({
    where: { id: importacao.id },
    data: {
      status: pendencias > 0 ? "CONCLUIDA_COM_PENDENCIAS" : "CONCLUIDA",
      totalInseridos: inseridos,
      totalDuplicados: duplicados,
      totalErros: erros,
    },
  });

  revalidatePath("/coordenador/importar-vendas");
  revalidatePath("/coordenador/pendencias");
  revalidatePath("/vendedor");
  revalidatePath("/gerente");

  return {
    resumo: {
      totalLidos: linhas.length,
      totalInseridos: inseridos,
      totalDuplicados: duplicados,
      totalErros: erros,
      totalPendencias: pendencias,
    },
  };
}
