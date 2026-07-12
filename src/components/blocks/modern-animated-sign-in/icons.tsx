import Image from "next/image";
import { cn } from "@/lib/utils";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path
        d="M23.47 8.52A10.6 10.6 0 0 0 16.02 5.3c-5.86 0-10.63 4.76-10.63 10.62 0 1.87.49 3.7 1.42 5.31L5.3 26.7l5.62-1.47a10.6 10.6 0 0 0 5.09 1.3h.01c5.86 0 10.63-4.76 10.63-10.62 0-2.84-1.1-5.5-3.18-7.4Zm-7.45 16.34h-.01a8.8 8.8 0 0 1-4.5-1.23l-.32-.19-3.34.87.89-3.26-.21-.34a8.83 8.83 0 0 1-1.35-4.7c0-4.87 3.97-8.84 8.85-8.84a8.8 8.8 0 0 1 6.25 2.6 8.8 8.8 0 0 1 2.59 6.25c0 4.88-3.97 8.84-8.85 8.84Zm4.85-6.62c-.27-.13-1.58-.78-1.82-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.71.34-.24.27-.93.91-.93 2.22s.96 2.58 1.1 2.76c.13.18 1.9 2.9 4.6 4.07.64.28 1.14.44 1.53.57.64.2 1.23.17 1.69.11.52-.08 1.58-.65 1.8-1.27.22-.63.22-1.16.16-1.27-.07-.11-.25-.18-.51-.31Z"
        fill="#fff"
      />
    </svg>
  );
}

export function CartaoDeTodosIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-[var(--sidebar-primary)] font-bold text-[var(--sidebar-primary-foreground)]",
        className
      )}
    >
      CT
    </div>
  );
}

export function AmorSaudeIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-full bg-white", className)} title="Amor Saúde">
      <Image
        src="/amor-saude-mascote.png"
        alt="Amor Saúde"
        fill
        sizes="48px"
        className="object-contain p-0.5"
      />
    </div>
  );
}
