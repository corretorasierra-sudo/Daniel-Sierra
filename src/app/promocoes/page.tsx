import { prisma } from "@/lib/prisma";
import { DIAS_SEMANA } from "@/lib/promocoes";
import { salvarPromocoesDaSemana } from "./actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const textareaClass =
  "w-full resize-none rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm shadow-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20";

export default async function PromocoesPage() {
  const promocoes = await prisma.promocaoDia.findMany();
  const textoPorDia = new Map(promocoes.map((p) => [p.diaSemana, p.texto]));
  const hoje = new Date().getDay();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Promoção do dia"
        subtitulo="Preencha a promoção de cada dia da semana. Ela se repete toda semana e aparece no painel do vendedor no dia correspondente. Deixe em branco pra não ter promoção naquele dia."
      />

      <Card className="border-border/80 shadow-sm">
        <CardContent>
          <form action={salvarPromocoesDaSemana} className="flex flex-col gap-4">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia.valor} className="flex flex-col gap-1.5">
                <Label htmlFor={`dia-${dia.valor}`}>
                  {dia.label}
                  {dia.valor === hoje && (
                    <span className="ml-2 text-xs font-normal text-lime-600 dark:text-lime-400">
                      (hoje)
                    </span>
                  )}
                </Label>
                <textarea
                  id={`dia-${dia.valor}`}
                  name={`dia-${dia.valor}`}
                  rows={2}
                  placeholder="Sem promoção neste dia"
                  defaultValue={textoPorDia.get(dia.valor) ?? ""}
                  className={textareaClass}
                />
              </div>
            ))}
            <Button type="submit" className="w-fit">
              Salvar promoções da semana
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
