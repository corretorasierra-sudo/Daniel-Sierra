import { exigirRole } from "@/lib/autorizacao";
import { AppShell } from "@/components/dashboard/AppShell";
import { navLinksParaRole, aplicarBadges } from "@/lib/nav";
import { contarPendenciasPosVendaSite } from "@/lib/notificacoes";

export default async function GerenteLayout({ children }: { children: React.ReactNode }) {
  const session = await exigirRole("ADMIN", "GERENTE");

  const pendenciasSite = await contarPendenciasPosVendaSite();

  const links = aplicarBadges(navLinksParaRole(session.user.role), {
    "/gerente/vendas-site": pendenciasSite,
  });

  return (
    <AppShell
      titulo="Painel gerencial"
      usuarioNome={session.user.name ?? session.user.email ?? ""}
      links={links}
    >
      {children}
    </AppShell>
  );
}
