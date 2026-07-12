"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { alternarChecklistPosVenda, type CampoChecklistPosVenda } from "./actions";
import { DetalhesPosVendaDialog } from "./DetalhesPosVendaDialog";

const PROSPECCAO_LABEL: Record<"FILIACAO" | "REFILIACAO", string> = {
  FILIACAO: "Filiação",
  REFILIACAO: "Refiliação",
};

export type PosVendaResumo = {
  id: string;
  appBaixado: boolean;
  consultaMarcada: boolean;
  orientacoesRecebidas: boolean;
  indicacaoRecebida: boolean;
  observacoes: string | null;
  pendencias: string | null;
  proximaAcao: string | null;
  venda: {
    clienteNome: string;
    clienteTelefone: string | null;
    dataVenda: Date;
    produto: string | null;
    codigoExterno: string | null;
    tipoProspeccao: "FILIACAO" | "REFILIACAO";
  };
};

function ChecklistCheckbox({
  id,
  campo,
  valorInicial,
}: {
  id: string;
  campo: CampoChecklistPosVenda;
  valorInicial: boolean;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={valor}
      className="size-4 accent-lime-600"
      onChange={(e) => {
        const novoValor = e.target.checked;
        setValor(novoValor);
        startTransition(() => {
          alternarChecklistPosVenda(id, campo, novoValor);
        });
      }}
    />
  );
}

export function PosVendaList({ itens }: { itens: PosVendaResumo[] }) {
  if (itens.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
        Nenhum acompanhamento cadastrado.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Prospecção</TableHead>
            <TableHead>Data da venda</TableHead>
            <TableHead>App</TableHead>
            <TableHead>Consulta</TableHead>
            <TableHead>Orientações</TableHead>
            <TableHead>Indicação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens.map((item) => {
            const completo =
              item.appBaixado &&
              item.consultaMarcada &&
              item.orientacoesRecebidas &&
              item.indicacaoRecebida;
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-slate-900">
                  {item.venda.clienteNome}
                </TableCell>
                <TableCell>{item.venda.clienteTelefone ?? "—"}</TableCell>
                <TableCell>{item.venda.codigoExterno ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                    {PROSPECCAO_LABEL[item.venda.tipoProspeccao]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("pt-BR").format(item.venda.dataVenda)}
                </TableCell>
                <TableCell>
                  <ChecklistCheckbox id={item.id} campo="appBaixado" valorInicial={item.appBaixado} />
                </TableCell>
                <TableCell>
                  <ChecklistCheckbox
                    id={item.id}
                    campo="consultaMarcada"
                    valorInicial={item.consultaMarcada}
                  />
                </TableCell>
                <TableCell>
                  <ChecklistCheckbox
                    id={item.id}
                    campo="orientacoesRecebidas"
                    valorInicial={item.orientacoesRecebidas}
                  />
                </TableCell>
                <TableCell>
                  <ChecklistCheckbox
                    id={item.id}
                    campo="indicacaoRecebida"
                    valorInicial={item.indicacaoRecebida}
                  />
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      completo
                        ? "border-lime-200 bg-lime-50 text-lime-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {completo ? "completo" : "pendente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DetalhesPosVendaDialog item={item} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
