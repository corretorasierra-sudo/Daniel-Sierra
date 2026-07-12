import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { tomClasses, type Tom } from "@/lib/design-tokens";

/** Padroniza os cards de alerta (sem venda, abaixo da meta, leads parados). */
export function AlertaCard({
  titulo,
  icon: Icon,
  tom = "alerta",
  children,
  className,
}: {
  titulo?: string;
  icon?: LucideIcon;
  tom?: Tom;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = tomClasses(tom);

  return (
    <div className={cn("rounded-xl border p-4", classes.bg, classes.border, className)}>
      {titulo && (
        <h2 className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", classes.text)}>
          {Icon && (
            <span className={cn("flex size-6 items-center justify-center rounded-md", classes.iconBg)}>
              <Icon className={cn("size-3.5", classes.iconText)} />
            </span>
          )}
          {titulo}
        </h2>
      )}
      {children}
    </div>
  );
}
