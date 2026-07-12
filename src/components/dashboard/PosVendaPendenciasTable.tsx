import { CheckCircle2, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PendenciaPosVendaResumo } from "@/lib/posVenda";

function Marca({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="size-4 text-lime-600" />
  ) : (
    <XCircle className="size-4 text-red-400" />
  );
}

/** Lista de pós-venda pendente por vendedor — usada nos painéis de gerente e coordenador. */
export function PosVendaPendenciasTable({ itens }: { itens: PendenciaPosVendaResumo[] }) {
  if (itens.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
        Nenhuma pendência de pós-venda no momento.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vendedor</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Data da venda</TableHead>
          <TableHead>App</TableHead>
          <TableHead>Consulta</TableHead>
          <TableHead>Orientações</TableHead>
          <TableHead>Indicação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium text-slate-900">{item.vendedorNome}</TableCell>
            <TableCell>{item.clienteNome}</TableCell>
            <TableCell>{new Intl.DateTimeFormat("pt-BR").format(item.dataVenda)}</TableCell>
            <TableCell>
              <Marca ok={item.appBaixado} />
            </TableCell>
            <TableCell>
              <Marca ok={item.consultaMarcada} />
            </TableCell>
            <TableCell>
              <Marca ok={item.orientacoesRecebidas} />
            </TableCell>
            <TableCell>
              <Marca ok={item.indicacaoRecebida} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
