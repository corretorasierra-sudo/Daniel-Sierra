import { exigirRole } from "@/lib/autorizacao";
import { buscarPosVendaCanalSite } from "@/lib/vendasSite";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PosVendaList } from "@/app/vendedor/pos-venda/PosVendaList";

export default async function GerenteVendasSitePage() {
  await exigirRole("ADMIN", "GERENTE");

  const itens = await buscarPosVendaCanalSite();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Vendas do site"
        subtitulo="Vendas feitas pelo canal WEB SITE - CARTAO DE TODOS, sem vendedor responsável — o acompanhamento de pós-venda é feito por aqui."
      />
      <PosVendaList itens={itens} />
    </div>
  );
}
