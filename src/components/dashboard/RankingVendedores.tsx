import { cn } from "@/lib/utils";

export type ItemRankingFoto = {
  vendedorId: string;
  nome: string;
  fotoUrl: string | null;
  vendas: number;
};

const MEDALHA = ["🥇", "🥈", "🥉"];

function iniciaisDe(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

/** Ranking mensal com foto de cada vendedor, ordenado por quantidade de vendas. */
export function RankingVendedores({
  itens,
  vendedorAtualId,
}: {
  itens: ItemRankingFoto[];
  vendedorAtualId?: string;
}) {
  if (itens.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
        Sem vendas no mês ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {itens.map((item, index) => (
        <li
          key={item.vendedorId}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-3 py-2",
            item.vendedorId === vendedorAtualId
              ? "border-lime-300 bg-lime-50/60"
              : "border-slate-100 bg-slate-50/40"
          )}
        >
          <span className="w-5 shrink-0 text-center text-sm">
            {MEDALHA[index] ?? index + 1}
          </span>
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {item.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.fotoUrl} alt={item.nome} className="size-full object-cover" />
            ) : (
              iniciaisDe(item.nome) || "?"
            )}
          </div>
          <span className="flex-1 truncate text-sm font-medium text-slate-800">{item.nome}</span>
          <span className="text-sm font-semibold text-slate-900">{item.vendas}</span>
        </li>
      ))}
    </ul>
  );
}
