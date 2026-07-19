import type { Role } from "@prisma/client";
import type { SidebarLink } from "@/components/dashboard/SidebarNav";

/**
 * Menu lateral por papel — fonte única. Antes cada layout.tsx (admin, gerente,
 * coordenador, metas, vendedor) definia sua própria lista de links, então
 * navegar entre rotas de um mesmo usuário trocava o conteúdo do menu (ex: sair
 * de /gerente pra /metas fazia "Relatórios" sumir, porque eram layouts com
 * listas diferentes). Com uma função só por role, o menu fica idêntico em
 * qualquer página que o usuário acesse — só o item ativo muda.
 */
export function navLinksParaRole(role: Role): SidebarLink[] {
  switch (role) {
    case "ADMIN":
      return [
        { href: "/gerente", label: "Painel gerencial", icon: "LayoutDashboard" },
        { href: "/gerente/relatorios", label: "Relatórios", icon: "BarChart3" },
        { href: "/admin/vendedores", label: "Vendedores", icon: "Users" },
        { href: "/metas", label: "Metas", icon: "Target" },
        { href: "/promocoes", label: "Promoção do dia", icon: "Megaphone" },
        { href: "/coordenador/importar-leads", label: "Importar leads", icon: "FileSpreadsheet" },
        { href: "/coordenador/importar-vendas", label: "Importar vendas", icon: "UploadCloud" },
        { href: "/coordenador/pendencias", label: "Pendências", icon: "AlertTriangle" },
        { href: "/coordenador/pos-venda", label: "Pós-venda", icon: "HeartHandshake" },
        { href: "/coordenador/vendas-site", label: "Vendas do site", icon: "Globe" },
      ];
    case "GERENTE":
      return [
        { href: "/gerente", label: "Início", icon: "LayoutDashboard" },
        { href: "/gerente/relatorios", label: "Relatórios", icon: "BarChart3" },
        { href: "/metas", label: "Metas", icon: "Target" },
        { href: "/promocoes", label: "Promoção do dia", icon: "Megaphone" },
        { href: "/coordenador/importar-vendas", label: "Importar vendas", icon: "UploadCloud" },
        { href: "/gerente/vendas-site", label: "Vendas do site", icon: "Globe" },
      ];
    case "COORDENADOR":
      return [
        { href: "/coordenador", label: "Início", icon: "LayoutDashboard" },
        { href: "/promocoes", label: "Promoção do dia", icon: "Megaphone" },
        { href: "/coordenador/importar-leads", label: "Importar leads", icon: "FileSpreadsheet" },
        { href: "/coordenador/importar-vendas", label: "Importar vendas", icon: "UploadCloud" },
        { href: "/coordenador/pendencias", label: "Pendências", icon: "AlertTriangle" },
        { href: "/coordenador/pos-venda", label: "Pós-venda", icon: "HeartHandshake" },
        { href: "/coordenador/vendas-site", label: "Vendas do site", icon: "Globe" },
      ];
    case "VENDEDOR":
      return [
        { href: "/vendedor", label: "Início", icon: "LayoutDashboard" },
        { href: "/vendedor/leads", label: "Leads", icon: "Users" },
        { href: "/vendedor/pos-venda", label: "Pós-venda", icon: "HeartHandshake" },
      ];
  }
}

/** Encaixa contagens de pendência (por href) nos links do menu, pra virar badge de notificação. */
export function aplicarBadges(links: SidebarLink[], badges: Record<string, number>): SidebarLink[] {
  return links.map((link) => {
    const badge = badges[link.href];
    return badge ? { ...link, badge } : link;
  });
}
