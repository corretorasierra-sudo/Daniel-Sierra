import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { tomClasses, type Tom } from "@/lib/design-tokens";

export function StatCard({
  label,
  valor,
  contexto,
  icon: Icon,
  tom = "neutro",
  className,
}: {
  label: string;
  valor: React.ReactNode;
  contexto?: React.ReactNode;
  icon?: LucideIcon;
  tom?: Tom;
  className?: string;
}) {
  const classes = tomClasses(tom);

  return (
    <Card className={cn("border-border shadow-sm", className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="text-2xl font-semibold text-foreground">{valor}</p>
          {contexto && <p className="text-sm text-muted-foreground">{contexto}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              classes.iconBg
            )}
          >
            <Icon className={cn("size-5", classes.iconText)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
