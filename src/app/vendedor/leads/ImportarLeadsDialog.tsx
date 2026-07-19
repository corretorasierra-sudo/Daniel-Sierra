"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { importarLeadsPessoal } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ImportarLeadsDialog() {
  const [open, setOpen] = useState(false);
  const [estado, action, pending] = useActionState(importarLeadsPessoal, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <UploadCloud className="size-4" />
          Importar planilha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar planilha de leads</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="arquivo" className="font-normal text-muted-foreground">
              Planilha (.xlsx ou .csv) — colunas esperadas: nome, telefone, cidade, origem,
              observacoes. Todos os leads entram atribuídos a você.
            </Label>
            <input
              id="arquivo"
              type="file"
              name="arquivo"
              accept=".xlsx,.xls,.csv"
              required
              className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground/80 hover:file:bg-muted"
            />
          </div>
          <Button type="submit" disabled={pending} className="w-fit gap-1.5">
            <UploadCloud className="size-4" />
            {pending ? "Importando..." : "Importar"}
          </Button>

          {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

          {estado?.resumo && (
            <div className="flex flex-col gap-2 rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-900 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300">
              <p className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-4" />
                Importação concluída.
              </p>
              <ul className="ml-1 list-disc pl-4">
                <li>{estado.resumo.totalLidos} linhas lidas</li>
                <li>{estado.resumo.totalInseridos} leads inseridos</li>
                <li>{estado.resumo.totalDuplicados} duplicados (telefone já existente)</li>
                <li>{estado.resumo.totalErros} linhas com erro (nome/telefone ausente)</li>
              </ul>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
