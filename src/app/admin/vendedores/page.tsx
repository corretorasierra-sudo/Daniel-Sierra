import { prisma } from "@/lib/prisma";
import { FormNovoVendedor } from "./FormNovoVendedor";
import { alternarAtivoVendedor, atualizarVendedor } from "./actions";
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

export default async function VendedoresPage() {
  const vendedores = await prisma.vendedor.findMany({
    include: { user: true },
    orderBy: { nomeCompleto: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Vendedores"
        subtitulo="Cadastro dos vendedores da unidade — nome usado para casar com as planilhas de venda e leads."
      />

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-slate-700">Novo vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <FormNovoVendedor />
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendedores.map((vendedor) => (
                <TableRow key={vendedor.id}>
                  <TableCell>
                    <form action={atualizarVendedor} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={vendedor.id} />
                      <input
                        name="nomeCompleto"
                        defaultValue={vendedor.nomeCompleto}
                        className="rounded border border-transparent px-1 py-0.5 text-sm font-medium text-slate-900 hover:border-slate-300 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                      />
                      <input type="hidden" name="telefone" value={vendedor.telefone ?? ""} />
                      <button
                        type="submit"
                        className="cursor-pointer text-xs text-slate-500 underline transition-all hover:text-slate-800 active:scale-95"
                      >
                        salvar
                      </button>
                    </form>
                  </TableCell>
                  <TableCell className="text-slate-600">{vendedor.telefone ?? "—"}</TableCell>
                  <TableCell className="text-slate-600">{vendedor.user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        vendedor.ativo
                          ? "border-lime-200 bg-lime-50 text-lime-700"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }
                    >
                      {vendedor.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <form action={alternarAtivoVendedor}>
                      <input type="hidden" name="id" value={vendedor.id} />
                      <button
                        type="submit"
                        className="cursor-pointer text-xs text-slate-500 underline transition-all hover:text-slate-800 active:scale-95"
                      >
                        {vendedor.ativo ? "desativar" : "reativar"}
                      </button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {vendedores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-slate-400">
                    Nenhum vendedor cadastrado ainda.
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
