import { Megaphone } from "lucide-react";
import { fraseDoDia } from "@/lib/frasesMotivacionais";

function GrupoFrase({ frase }: { frase: string }) {
  return (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="flex items-center gap-2 px-6 text-sm font-medium whitespace-nowrap text-lime-900 dark:text-lime-200"
        >
          <Megaphone className="size-4 shrink-0 text-lime-600 dark:text-lime-400" />
          {frase}
        </span>
      ))}
    </div>
  );
}

/**
 * Faixa correndo com a frase motivacional do dia — mesma frase o dia
 * inteiro pra todo o time (ver `fraseDoDia`), muda sozinha no dia seguinte.
 * Conteúdo duplicado + translateX(-50%) em loop pra rodar sem emenda.
 */
export function FraseMotivacionalMarquee() {
  const frase = fraseDoDia();

  return (
    <div className="relative overflow-hidden rounded-xl border border-lime-200 bg-lime-50 py-2.5 dark:border-lime-500/20 dark:bg-lime-500/10">
      <div className="flex w-max animate-marquee">
        <GrupoFrase frase={frase} />
        <GrupoFrase frase={frase} />
      </div>
    </div>
  );
}
