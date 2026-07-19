import { prisma } from "@/lib/prisma";
import { FormImportarLeads } from "./FormImportarLeads";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatarDataHora(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    data
  );
}

export default async function ImportarLeadsPage() {
  const importacoes = await prisma.importacaoLead.findMany({
    include: { importadoPor: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Importar leads"
        subtitulo="Leads duplicados (mesmo telefone já cadastrado) são ignorados automaticamente."
      />

      <Card className="border-border/80 shadow-sm">
        <CardContent>
          <FormImportarLeads />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-foreground/80">Histórico de importações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Importado por</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lidos</TableHead>
                <TableHead>Inseridos</TableHead>
                <TableHead>Duplicados</TableHead>
                <TableHead>Erros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importacoes.map((imp) => (
                <TableRow key={imp.id}>
                  <TableCell className="font-medium text-foreground">{imp.arquivoNome}</TableCell>
                  <TableCell>{imp.importadoPor.nome}</TableCell>
                  <TableCell>{formatarDataHora(imp.createdAt)}</TableCell>
                  <TableCell>{imp.status}</TableCell>
                  <TableCell>{imp.totalLidos}</TableCell>
                  <TableCell>{imp.totalInseridos}</TableCell>
                  <TableCell>{imp.totalDuplicados}</TableCell>
                  <TableCell>{imp.totalErros}</TableCell>
                </TableRow>
              ))}
              {importacoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                    Nenhuma importação ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
