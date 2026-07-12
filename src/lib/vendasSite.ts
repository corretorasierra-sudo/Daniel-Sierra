import { prisma } from "@/lib/prisma";
import type { PosVendaResumo } from "@/app/vendedor/pos-venda/PosVendaList";

/**
 * Vendas atribuídas a um vendedor "virtual" (canal, ex: site institucional) —
 * não são de um vendedor de verdade, então ficam de fora do ranking e da meta
 * da unidade, e só gestor/coordenador acompanham o pós-venda delas.
 */
export async function buscarPosVendaCanalSite(): Promise<PosVendaResumo[]> {
  const itens = await prisma.acompanhamentoPosVenda.findMany({
    where: { venda: { vendedor: { virtual: true } } },
    include: { venda: true },
    orderBy: { venda: { dataVenda: "desc" } },
  });

  return itens.map((item) => ({
    id: item.id,
    appBaixado: item.appBaixado,
    consultaMarcada: item.consultaMarcada,
    orientacoesRecebidas: item.orientacoesRecebidas,
    indicacaoRecebida: item.indicacaoRecebida,
    observacoes: item.observacoes,
    pendencias: item.pendencias,
    proximaAcao: item.proximaAcao,
    venda: {
      clienteNome: item.venda.clienteNome,
      clienteTelefone: item.venda.clienteTelefone,
      dataVenda: item.venda.dataVenda,
      produto: item.venda.produto,
      codigoExterno: item.venda.codigoExterno,
      tipoProspeccao: item.venda.tipoProspeccao,
    },
  }));
}
