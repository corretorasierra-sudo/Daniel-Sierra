"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "theme";

function aplicarTema(escuro: boolean) {
  document.documentElement.classList.toggle("dark", escuro);
  localStorage.setItem(STORAGE_KEY, escuro ? "dark" : "light");
}

export function ThemeToggle({ variant = "dark" }: { variant?: "dark" | "light" }) {
  // Sincroniza com a classe já aplicada pelo script anti-flash no <head>,
  // evitando mismatch de hidratação (servidor não sabe a preferência salva).
  const [escuro, setEscuro] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- servidor não sabe a preferência salva em localStorage, só dá pra ler no cliente após montar.
    setEscuro(document.documentElement.classList.contains("dark"));
  }, []);

  if (escuro === null) {
    return <div className="size-8" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => {
        aplicarTema(!escuro);
        setEscuro(!escuro);
      }}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      title={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      className={cn(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all active:scale-[0.97]",
        variant === "dark"
          ? "text-[var(--sidebar-foreground)]/80 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {escuro ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
