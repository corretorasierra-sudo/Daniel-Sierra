import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";

/**
 * Camada de autorização usada dentro de Server Components e Server Actions.
 * O proxy.ts faz a checagem otimista de rota; estas funções fazem a checagem
 * "de verdade" perto dos dados, como recomendado pelo guia de autenticação
 * do Next.js (ver node_modules/next/dist/docs/01-app/02-guides/authentication.md).
 */

export async function exigirSessao() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function exigirRole(...roles: Role[]) {
  const session = await exigirSessao();
  if (!roles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}

/** Vendedor logado (ou Admin agindo em nome de um vendedor específico). */
export async function exigirVendedor() {
  const session = await exigirRole("VENDEDOR", "ADMIN");
  if (session.user.role === "VENDEDOR" && !session.user.vendedorId) {
    redirect("/");
  }
  return session;
}
