import Image from "next/image";
import { cn } from "@/lib/utils";

export function CartaoDeTodosIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-full bg-white", className)} title="Cartão de Todos">
      <Image
        src="/logo-cartao-de-todos.png"
        alt="Cartão de Todos"
        fill
        sizes="48px"
        className="object-contain p-1"
      />
    </div>
  );
}

export function AmorSaudeIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-full bg-white", className)} title="Amor Saúde">
      <Image
        src="/logo-amor-saude.png"
        alt="Amor Saúde"
        fill
        sizes="48px"
        className="object-contain p-0.5"
      />
    </div>
  );
}

export function CartaoDeTodosGuarabiraIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-full bg-white", className)}
      title="Cartão de Todos Guarabira"
    >
      <Image
        src="/logo-cartao-de-todos-guarabira.jpg"
        alt="Cartão de Todos Guarabira"
        fill
        sizes="48px"
        className="object-contain p-0.5"
      />
    </div>
  );
}
