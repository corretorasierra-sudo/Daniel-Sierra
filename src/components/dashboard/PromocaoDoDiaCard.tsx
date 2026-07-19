import { Megaphone } from "lucide-react";

/** Card de destaque com a promoção do dia — só aparece quando há uma
 *  promoção cadastrada pra hoje (ver /promocoes). */
export function PromocaoDoDiaCard({ texto }: { texto: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-lime-200 bg-lime-50 p-4 dark:border-lime-500/30 dark:bg-lime-500/10">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-400">
        <Megaphone className="size-4" />
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-medium tracking-wide text-lime-700 uppercase dark:text-lime-400">
          Promoção de hoje
        </p>
        <p className="text-sm whitespace-pre-line text-lime-900 dark:text-lime-300">{texto}</p>
      </div>
    </div>
  );
}
