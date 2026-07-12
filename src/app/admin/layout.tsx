import { exigirRole } from "@/lib/autorizacao";
import { AppShell } from "@/components/dashboard/AppShell";
import { navLinksParaRole, aplicarBadges } from "@/lib/nav";
import {
  contarPendenciasImportacao,
  contarPendenciasPosVendaGeral,
  contarPendenciasPosVendaSite,
} from "@/lib/notificacoes";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await exigirRole("ADMIN");

  const [pendenciasImportacao, pendenciasPosVenda, pendenciasSite] = await Promise.all([
    contarPendenciasImportacao(),
    contarPendenciasPosVendaGeral(),
    contarPendenciasPosVendaSite(),
  ]);

  const links = aplicarBadges(navLinksParaRole(session.user.role), {
    "/coordenador/pendencias": pendenciasImportacao,
    "/coordenador/pos-venda": pendenciasPosVenda,
    "/coordenador/vendas-site": pendenciasSite,
  });

  return (
    <AppShell
      titulo="Admin"
      usuarioNome={session.user.name ?? session.user.email ?? ""}
      links={links}
    >
      {children}
    </AppShell>
  );
}
