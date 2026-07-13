import { redirect } from "next/navigation";
import { auth } from "@/auth";

const DESTINO_POR_ROLE: Record<string, string> = {
  ADMIN: "/gerente",
  GERENTE: "/gerente",
  COORDENADOR: "/coordenador",
  VENDEDOR: "/vendedor",
};

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  redirect(DESTINO_POR_ROLE[session.user.role] ?? "/login");
}
