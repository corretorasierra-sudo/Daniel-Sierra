import { exigirRole } from "@/lib/autorizacao";
import { buscarPendenciasPosVenda } from "@/lib/posVenda";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PosVendaPendenciasTable } from "@/components/dashboard/PosVendaPendenciasTable";

export default async function CoordenadorPosVendaPage() {
  await exigirRole("ADMIN", "COORDENADOR");

  const pendencias = await buscarPendenciasPosVenda();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Pós-venda"
        subtitulo="Pendências de acompanhamento (app, consulta, orientações, indicação) por vendedor."
      />
      <PosVendaPendenciasTable itens={pendencias} />
    </div>
  );
}
