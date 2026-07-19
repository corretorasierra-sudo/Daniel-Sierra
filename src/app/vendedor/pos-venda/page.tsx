import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PosVendaList, type PosVendaResumo } from "./PosVendaList";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function PosVendaPage() {
  const session = await auth();
  const vendedorId = session?.user.vendedorId;

  if (!vendedorId) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Esta conta não está vinculada a um vendedor.
      </p>
    );
  }

  const itens = await prisma.acompanhamentoPosVenda.findMany({
    where: { venda: { vendedorId } },
    include: { venda: true },
    orderBy: { venda: { dataVenda: "desc" } },
  });

  // Decimal (Prisma) não pode ser passado direto a Client Component — converte pra number.
  const resumos: PosVendaResumo[] = itens.map((item) => ({
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

  // Pendentes primeiro, completos por último (sort é estável).
  resumos.sort((a, b) => {
    const completoA = a.appBaixado && a.consultaMarcada && a.orientacoesRecebidas && a.indicacaoRecebida;
    const completoB = b.appBaixado && b.consultaMarcada && b.orientacoesRecebidas && b.indicacaoRecebida;
    if (completoA !== completoB) return completoA ? 1 : -1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Pós-venda"
        subtitulo="Checklist dos clientes que você vendeu: app baixado, consulta marcada, orientações passadas, indicação recebida."
      />
      <PosVendaList itens={resumos} />
    </div>
  );
}
