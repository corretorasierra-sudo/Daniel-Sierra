import { exigirRole } from "@/lib/autorizacao";
import { AppShell } from "@/components/dashboard/AppShell";
import { navLinksParaRole } from "@/lib/nav";

export default async function PromocoesLayout({ children }: { children: React.ReactNode }) {
  const session = await exigirRole("ADMIN", "GERENTE", "COORDENADOR");

  return (
    <AppShell
      titulo="Promoção do dia"
      usuarioNome={session.user.name ?? session.user.email ?? ""}
      links={navLinksParaRole(session.user.role)}
    >
      {children}
    </AppShell>
  );
}
