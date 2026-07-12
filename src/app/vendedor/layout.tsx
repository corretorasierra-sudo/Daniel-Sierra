import { exigirVendedor } from "@/lib/autorizacao";
import { AppShell } from "@/components/dashboard/AppShell";
import { navLinksParaRole, aplicarBadges } from "@/lib/nav";
import { contarPendenciasPosVendaVendedor } from "@/lib/notificacoes";

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const session = await exigirVendedor();

  const pendenciasPosVenda = session.user.vendedorId
    ? await contarPendenciasPosVendaVendedor(session.user.vendedorId)
    : 0;

  const links = aplicarBadges(navLinksParaRole(session.user.role), {
    "/vendedor/pos-venda": pendenciasPosVenda,
  });

  return (
    <AppShell
      titulo="Painel do vendedor"
      usuarioNome={session.user.name ?? session.user.email ?? ""}
      links={links}
    >
      {children}
    </AppShell>
  );
}
