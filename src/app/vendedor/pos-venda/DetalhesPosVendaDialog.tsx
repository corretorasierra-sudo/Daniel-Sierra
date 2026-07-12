"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { atualizarPosVenda } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm shadow-sm outline-none transition-colors focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20";

export function DetalhesPosVendaDialog({
  item,
}: {
  item: {
    id: string;
    observacoes: string | null;
    pendencias: string | null;
    proximaAcao: string | null;
    venda: { clienteNome: string };
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <NotebookPen className="size-4" />
          Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.venda.clienteNome}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await atualizarPosVenda(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="id" value={item.id} />
          <textarea
            name="observacoes"
            placeholder="Observações"
            rows={2}
            defaultValue={item.observacoes ?? ""}
            className={inputClass}
          />
          <textarea
            name="pendencias"
            placeholder="Pendências"
            rows={2}
            defaultValue={item.pendencias ?? ""}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="proximaAcao"
              placeholder="Próxima ação"
              defaultValue={item.proximaAcao ?? ""}
              className={inputClass}
            />
            <input name="proximaAcaoData" type="date" className={inputClass} />
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
