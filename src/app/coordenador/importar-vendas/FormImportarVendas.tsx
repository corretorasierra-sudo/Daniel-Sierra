"use client";

import { useActionState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { importarVendas } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function FormImportarVendas() {
  const [estado, action, pending] = useActionState(importarVendas, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="arquivo" className="font-normal text-slate-600">
          Planilha (.xlsx ou .csv) — colunas esperadas: Matrícula, Filiado, Telefone, Data,
          Vendedor, Prospecção (Filiação ou Refiliação). Franquia, Nome e Login são ignoradas.
        </Label>
        <input
          id="arquivo"
          type="file"
          name="arquivo"
          accept=".xlsx,.xls,.csv"
          required
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-fit gap-1.5">
        <UploadCloud className="size-4" />
        {pending ? "Importando..." : "Importar planilha"}
      </Button>

      {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

      {estado?.resumo && (
        <div className="flex flex-col gap-2 rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-900">
          <p className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-4" />
            Importação concluída.
          </p>
          <ul className="ml-1 list-disc pl-4">
            <li>{estado.resumo.totalLidos} linhas lidas</li>
            <li>{estado.resumo.totalInseridos} vendas inseridas</li>
            <li>{estado.resumo.totalDuplicados} duplicadas</li>
            <li>{estado.resumo.totalErros} linhas com dados ausentes</li>
            <li>{estado.resumo.totalPendencias} pendências para corrigir</li>
          </ul>
          {estado.resumo.totalPendencias > 0 && (
            <p>
              Vá em <strong>Pendências</strong> para atribuir o vendedor certo.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
