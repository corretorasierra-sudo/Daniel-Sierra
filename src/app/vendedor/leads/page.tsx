import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LeadsTable } from "./LeadsTable";
import { NovoLeadDialog } from "./NovoLeadDialog";
import { ImportarLeadsDialog } from "./ImportarLeadsDialog";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function LeadsPage() {
  const session = await auth();
  const vendedorId = session?.user.vendedorId;

  if (!vendedorId) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Esta conta não está vinculada a um vendedor.
      </p>
    );
  }

  const leads = await prisma.lead.findMany({
    where: { vendedorId },
    orderBy: [{ dataEntrada: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Meus leads"
        subtitulo="Atualize o status e as observações direto na planilha."
        action={
          <div className="flex gap-2">
            <ImportarLeadsDialog />
            <NovoLeadDialog />
          </div>
        }
      />

      <LeadsTable leads={leads} />
    </div>
  );
}
