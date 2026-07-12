import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FormImportarVendas } from "./FormImportarVendas";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default async function ImportarVendasPage() {
  const importacoes = await prisma.importacaoVenda.findMany({
    include: { importadoPor: true, _count: { select: { pendencias: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const pendenciasAbertas = await prisma.pendenciaImportacao.count({
    where: { status: "PENDENTE" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Importar vendas"
        subtitulo="Vendedor é casado automaticamente pelo nome. Nunca cadastre venda manualmente aqui — só importação."
        action={
          pendenciasAbertas > 0 ? (
            <Link href="/coordenador/pendencias">
              <Badge className="gap-1.5 bg-amber-100 px-3 py-1.5 text-amber-800 hover:bg-amber-200">
                <AlertTriangle className="size-3.5" />
                {pendenciasAbertas} pendência(s) aberta(s)
              </Badge>
            </Link>
          ) : undefined
        }
      />

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent>
          <FormImportarVendas />
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-slate-700">Histórico de importações</CardTitle>
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
                <TableHead>Pendências</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importacoes.map((imp) => (
                <TableRow key={imp.id}>
                  <TableCell className="font-medium text-slate-900">{imp.arquivoNome}</TableCell>
                  <TableCell>{imp.importadoPor.nome}</TableCell>
                  <TableCell>{formatarDataHora(imp.createdAt)}</TableCell>
                  <TableCell>{imp.status}</TableCell>
                  <TableCell>{imp.totalLidos}</TableCell>
                  <TableCell>{imp.totalInseridos}</TableCell>
                  <TableCell>{imp.totalDuplicados}</TableCell>
                  <TableCell>{imp._count.pendencias}</TableCell>
                </TableRow>
              ))}
              {importacoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-slate-400">
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
