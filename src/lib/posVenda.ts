import { prisma } from "@/lib/prisma";

export type PendenciaPosVendaResumo = {
  id: string;
  vendedorNome: string;
  clienteNome: string;
  dataVenda: Date;
  appBaixado: boolean;
  consultaMarcada: boolean;
  orientacoesRecebidas: boolean;
  indicacaoRecebida: boolean;
};

/** Acompanhamentos de pós-venda com pelo menos um item do checklist pendente, pra visão de gerente/coordenador. */
export async function buscarPendenciasPosVenda(): Promise<PendenciaPosVendaResumo[]> {
  const itens = await prisma.acompanhamentoPosVenda.findMany({
    where: {
      venda: { vendedor: { virtual: false } },
      OR: [
        { appBaixado: false },
        { consultaMarcada: false },
        { orientacoesRecebidas: false },
        { indicacaoRecebida: false },
      ],
    },
    include: { venda: { include: { vendedor: true } } },
    orderBy: { venda: { dataVenda: "desc" } },
  });

  return itens.map((item) => ({
    id: item.id,
    vendedorNome: item.venda.vendedor.nomeCompleto,
    clienteNome: item.venda.clienteNome,
    dataVenda: item.venda.dataVenda,
    appBaixado: item.appBaixado,
    consultaMarcada: item.consultaMarcada,
    orientacoesRecebidas: item.orientacoesRecebidas,
    indicacaoRecebida: item.indicacaoRecebida,
  }));
}
