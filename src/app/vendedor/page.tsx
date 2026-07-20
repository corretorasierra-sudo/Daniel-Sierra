import Link from "next/link";
import { CalendarClock, HeartHandshake, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcularProgressoMeta, calcularMediaNecessariaPorDia } from "@/lib/metricas";
import type { EtapaLead } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { AvatarUpload } from "@/components/dashboard/AvatarUpload";
import { RankingVendedores } from "@/components/dashboard/RankingVendedores";
import { PromocaoDoDiaCard } from "@/components/dashboard/PromocaoDoDiaCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { atualizarMinhaFoto } from "./actions";

const ETAPA_LABEL: Record<EtapaLead, string> = {
  NOVO: "Novo lead",
  EM_TRATATIVA: "Em tratativa",
  SEM_RESPOSTA: "Sem resposta",
  PERDIDO: "Perdido",
  FECHAMENTO: "Concluído",
};

export default async function VendedorHomePage() {
  const session = await auth();
  const vendedorId = session?.user.vendedorId;

  if (!vendedorId) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Esta conta não está vinculada a um vendedor.
      </p>
    );
  }

  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(inicioHoje);
  fimHoje.setDate(fimHoje.getDate() + 1);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const [
    vendedor,
    metaMensal,
    vendasNoPeriodo,
    leadsPorEtapa,
    atividadesHoje,
    leadsRetornoHoje,
    posVendaPendente,
    vendedoresAtivos,
    vendasDoMesPorVendedor,
    promocaoHoje,
  ] = await Promise.all([
    prisma.vendedor.findUnique({ where: { id: vendedorId }, include: { user: true } }),
    prisma.meta.findFirst({
      where: {
        vendedorId,
        tipo: "MENSAL",
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
      },
    }),
    prisma.venda.count({
      where: { vendedorId, status: "ATIVA" },
    }),
    prisma.lead.groupBy({
      by: ["etapa"],
      where: { vendedorId },
      _count: { _all: true },
    }),
    prisma.atividade.findMany({
      where: {
        vendedorId,
        proximaAcaoData: { gte: inicioHoje, lt: fimHoje },
      },
      include: { lead: true },
      orderBy: { proximaAcaoData: "asc" },
    }),
    prisma.lead.findMany({
      where: {
        vendedorId,
        proximaAcaoData: { gte: inicioHoje, lt: fimHoje },
      },
      orderBy: { proximaAcaoData: "asc" },
    }),
    prisma.acompanhamentoPosVenda.count({
      where: {
        venda: { vendedorId },
        OR: [
          { appBaixado: false },
          { consultaMarcada: false },
          { orientacoesRecebidas: false },
        ],
      },
    }),
    prisma.vendedor.findMany({
      where: { ativo: true, virtual: false },
      include: { user: { select: { fotoUrl: true } } },
    }),
    prisma.venda.groupBy({
      by: ["vendedorId"],
      where: { status: "ATIVA", dataVenda: { gte: inicioMes, lte: fimMes } },
      _count: { _all: true },
    }),
    prisma.promocaoDia.findUnique({ where: { diaSemana: hoje.getDay() } }),
  ]);

  const meta = metaMensal?.valorMeta ?? 0;
  const progresso = calcularProgressoMeta(meta, vendasNoPeriodo);
  const mediaNecessaria = metaMensal
    ? calcularMediaNecessariaPorDia(meta, vendasNoPeriodo, metaMensal.dataFim, hoje)
    : 0;

  const contagemPorEtapa = new Map(leadsPorEtapa.map((g) => [g.etapa, g._count._all]));

  const vendasPorVendedorId = new Map(
    vendasDoMesPorVendedor.map((v) => [v.vendedorId, v._count._all])
  );
  const rankingMensal = vendedoresAtivos
    .map((v) => ({
      vendedorId: v.id,
      nome: v.nomeCompleto,
      fotoUrl: v.user?.fotoUrl ?? null,
      vendas: vendasPorVendedorId.get(v.id) ?? 0,
    }))
    .sort((a, b) => b.vendas - a.vendas);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo={`Olá, ${vendedor?.nomeCompleto.split(" ")[0] ?? ""}`}
        subtitulo="Seu resumo do dia."
        action={
          <AvatarUpload
            fotoUrl={vendedor?.user.fotoUrl ?? null}
            nome={vendedor?.nomeCompleto ?? ""}
            onUpload={atualizarMinhaFoto}
          />
        }
      />

      {promocaoHoje && <PromocaoDoDiaCard texto={promocaoHoje.texto} />}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/80 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Meta do mês</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <ProgressRing
              percentual={progresso.percentual}
              tamanho={168}
              espessura={16}
              label={`${progresso.realizado}/${progresso.meta || "—"}`}
              sublabel="vendas"
            />
            <p className="text-xs text-muted-foreground">
              {metaMensal ? "meta mensal" : "nenhuma meta definida"}
            </p>
            {metaMensal && mediaNecessaria > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Faltam {progresso.restante} vendas — {mediaNecessaria.toFixed(2)}/dia útil pra bater.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/80">Ranking do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingVendedores itens={rankingMensal} vendedorAtualId={vendedorId} />
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Retornos de hoje"
          valor={atividadesHoje.length + leadsRetornoHoje.length}
          icon={CalendarClock}
          tom="info"
          contexto={
            <Link href="/vendedor/leads" className="inline-flex items-center gap-1 text-lime-700 hover:underline dark:text-lime-400">
              ver leads <ArrowRight className="size-3" />
            </Link>
          }
        />
        <StatCard
          label="Pós-venda pendente"
          valor={posVendaPendente}
          icon={HeartHandshake}
          tom={posVendaPendente > 0 ? "alerta" : "sucesso"}
          contexto={
            <Link href="/vendedor/pos-venda" className="inline-flex items-center gap-1 text-lime-700 hover:underline dark:text-lime-400">
              ver checklist <ArrowRight className="size-3" />
            </Link>
          }
        />
      </section>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-foreground/80">Leads por etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.keys(ETAPA_LABEL) as EtapaLead[]).map((etapa) => (
              <div key={etapa} className="rounded-lg border border-border bg-muted/60 p-3 text-center">
                <p className="text-lg font-semibold text-foreground">
                  {contagemPorEtapa.get(etapa) ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">{ETAPA_LABEL[etapa]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(atividadesHoje.length > 0 || leadsRetornoHoje.length > 0) && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/80">Agenda de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {atividadesHoje.map((a) => (
                <li key={a.id} className="text-sm text-foreground/80">
                  <Link href="/vendedor/leads" className="underline">
                    {a.lead.nome}
                  </Link>{" "}
                  — {a.proximaAcao ?? "retorno agendado"}
                </li>
              ))}
              {leadsRetornoHoje.map((l) => (
                <li key={l.id} className="text-sm text-foreground/80">
                  <Link href="/vendedor/leads" className="underline">
                    {l.nome}
                  </Link>{" "}
                  — {l.proximaAcao ?? "próxima ação"}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
