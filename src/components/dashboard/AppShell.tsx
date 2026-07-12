import { LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { SidebarNav, type SidebarLink } from "./SidebarNav";

/**
 * Casca de página consistente: sidebar lateral (verde-petróleo escuro) +
 * área de conteúdo com max-width/padding padronizados. Substitui o antigo
 * header horizontal (Nav.tsx). Usado por todos os layout.tsx de papel.
 */
export function AppShell({
  titulo,
  usuarioNome,
  links,
  children,
}: {
  titulo: string;
  usuarioNome: string;
  links: SidebarLink[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto bg-[var(--sidebar)] px-4 py-6 lg:flex">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 px-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-sm font-bold text-[var(--sidebar-primary-foreground)]">
              CT
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[var(--sidebar-foreground)]">
                Cartão de Todos
              </span>
              <span className="text-xs text-[var(--sidebar-foreground)]/60">{titulo}</span>
            </div>
          </div>

          <SidebarNav links={links} />
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--sidebar-border)] pt-4">
          <span className="truncate px-2 text-xs text-[var(--sidebar-foreground)]/70">
            {usuarioNome}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sidebar-foreground)]/80 transition-all hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)] active:scale-[0.97]"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div>
            <p className="text-sm font-semibold text-slate-900">Cartão de Todos</p>
            <p className="text-xs text-slate-500">{titulo}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.97]"
            >
              Sair
            </button>
          </form>
        </header>

        <div className="flex flex-wrap gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          <SidebarNav links={links} variant="light" />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
