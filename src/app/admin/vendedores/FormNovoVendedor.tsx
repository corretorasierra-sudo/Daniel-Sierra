"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { criarVendedor } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function FormNovoVendedor() {
  const [estado, action, pending] = useActionState(criarVendedor, undefined);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nomeCompleto">Nome completo</Label>
        <Input id="nomeCompleto" name="nomeCompleto" required className="h-9" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input id="telefone" name="telefone" className="h-9" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail (login)</Label>
        <Input id="email" name="email" type="email" required className="h-9" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha">Senha inicial</Label>
        <Input id="senha" name="senha" type="text" required minLength={6} className="h-9" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="h-9 w-full gap-1.5">
          <UserPlus className="size-4" />
          {pending ? "Salvando..." : "Cadastrar vendedor"}
        </Button>
      </div>
      {estado?.erro && (
        <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{estado.erro}</p>
      )}
    </form>
  );
}
