"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Target,
  Users,
  HeartHandshake,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ícones do lucide-react são componentes (funções) — não podem atravessar a
 * fronteira Server -> Client como prop (mesma classe de bug do Decimal em
 * PosVendaCard). Por isso o link carrega só o *nome* do ícone (string,
 * serializável) e a resolução pro componente acontece aqui dentro, que já é
 * Client Component.
 */
const ICON_MAP = {
  LayoutDashboard,
  BarChart3,
  Target,
  Users,
  HeartHandshake,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  Globe,
} satisfies Record<string, LucideIcon>;

export type IconeNome = keyof typeof ICON_MAP;

export type SidebarLink = { href: string; label: string; icon?: IconeNome; badge?: number };

export function SidebarNav({
  links,
  variant = "dark",
}: {
  links: SidebarLink[];
  variant?: "dark" | "light";
}) {
  const pathname = usePathname();

  // Ativo = link cujo href é o prefixo mais longo que bate com a rota atual.
  // Evita que "/vendedor" (Início) fique marcado como ativo junto com
  // "/vendedor/leads" só porque um é prefixo do outro.
  const hrefAtivo = links
    .filter((l) => pathname === l.href || pathname?.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className={cn("flex gap-1", variant === "dark" ? "flex-col" : "flex-row flex-wrap")}>
      {links.map((link) => {
        const ativo = link.href === hrefAtivo;
        const Icon = link.icon ? ICON_MAP[link.icon] : undefined;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all active:scale-[0.97]",
              variant === "dark"
                ? ativo
                  ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                  : "text-[var(--sidebar-foreground)]/80 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]"
                : ativo
                  ? "bg-lime-100 text-lime-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" />}
            {link.label}
            {!!link.badge && (
              <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {link.badge > 99 ? "99+" : link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
