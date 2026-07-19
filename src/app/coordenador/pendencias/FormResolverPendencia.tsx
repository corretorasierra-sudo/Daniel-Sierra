"use client";

import { useActionState } from "react";
import { resolverPendencia } from "./actions";
import { Button } from "@/components/ui/button";

export function FormResolverPendencia({
  pendenciaId,
  vendedores,
}: {
  pendenciaId: string;
  vendedores: { id: string; nomeCompleto: string }[];
}) {
  const [estado, action, pending] = useActionState(resolverPendencia, undefined);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={pendenciaId} />
      <select
        name="vendedorId"
        required
        className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm shadow-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
        defaultValue=""
      >
        <option value="" disabled>
          Selecione o vendedor
        </option>
        {vendedores.map((v) => (
          <option key={v.id} value={v.id}>
            {v.nomeCompleto}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Atribuir e salvar"}
      </Button>
      {estado?.erro && <span className="text-xs text-red-600">{estado.erro}</span>}
    </form>
  );
}
