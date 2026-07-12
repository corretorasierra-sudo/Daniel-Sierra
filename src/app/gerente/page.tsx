import { Target, TrendingUp, Users, AlertOctagon, Gauge, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  calcularProgressoMeta,
  calcularProjecaoFechamento,
  calcularRanking,
} from "@/lib/metricas";
import { buscarPendenciasPosVenda } from "@/lib/posVenda";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { RankingBarChart } from "@/components/dashboard/RankingBarChart";
import { PosVendaPendenciasTable } from "@/components/dashboard/PosVendaPendenciasTable";
import { AlertaCard } from "@/components/dashboard/AlertaCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DIAS_LEAD_PARADO = 7;

export default async function GerenteHomePage() {
  const hoje = new Date();

  const metaUnidade = await prisma.meta.findFirst({
    where: {
      vendedorId: null,
      tipo: "MENSAL",
      dataInicio: { lte: hoje },
      dataFim: { gte: hoje },
    },
  });

  const inicioPeriodo =
    metaUnidade?.dataInicio ?? new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimPeriodo =
    metaUnidade?.dataFim ?? new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const [vendedores, vendasNoPeriodo, metasVendedores, leadsParados, pendenciasPosVenda] = await Promise.all([
    prisma.vendedor.findMany({ where: { ativo: true, virtual: false } }),
    prisma.venda.findMany({
      where: {
        status: "ATIVA",
        dataVenda: { gte: inicioPeriodo, lte: fimPeriodo },
        vendedor: { virtual: false },
      },
    }),
    prisma.meta.findMany({
      where: {
        tipo: "MENSAL",
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
        vendedorId: { not: null },
      },
    }),
    prisma.lead.findMany({
      where: {
        etapa: { notIn: ["FECHAMENTO", "PERDIDO"] },
        OR: [
          { dataUltimoContato: null },
          {
            dataUltimoContato: {
              lt: new Date(hoje.getTime() - DIAS_LEAD_PARADO * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      include: { vendedor: true },
      orderBy: { dataUltimoContato: "asc" },
      take: 10,
    }),
    buscarPendenciasPosVenda(),
  ]);

  const totalRealizado = vendasNoPeriodo.length;
  const progressoUnidade = calcularProgressoMeta(metaUnidade?.valorMeta ?? 0, totalRealizado);
  const projecao = calcularProjecaoFechamento(totalRealizado, inicioPeriodo, fimPeriodo, hoje);

  const metaPorVendedor = new Map(metasVendedores.map((m) => [m.vendedorId, m.valorMeta]));
  const vendasPorVendedor = new Map<string, number>();
  for (const venda of vendasNoPeriodo) {
    vendasPorVendedor.set(venda.vendedorId, (vendasPorVendedor.get(venda.vendedorId) ?? 0) + 1);
  }

  const ranking = calcularRanking(
    vendedores.map((v) => ({
      vendedorId: v.id,
      nome: v.nomeCompleto,
      realizado: vendasPorVendedor.get(v.id) ?? 0,
      meta: metaPorVendedor.get(v.id) ?? 0,
    }))
  );

  const semVenda = ranking.filter((r) => r.realizado === 0);
  const abaixoDaMeta = ranking.filter((r) => r.meta > 0 && r.percentual < 50 && r.realizado > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Painel gerencial"
        subtitulo={`Período: ${new Intl.DateTimeFormat("pt-BR").format(inicioPeriodo)} – ${new Intl.DateTimeFormat("pt-BR").format(fimPeriodo)}`}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Meta da unidade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <ProgressRing
              percentual={progressoUnidade.percentual}
              tamanho={132}
              espessura={12}
              label={`${progressoUnidade.realizado}/${progressoUnidade.meta || "—"}`}
            />
            <p className="text-xs text-slate-500">
              {metaUnidade ? "vendas no período" : "meta não definida"}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
          <StatCard
            label="Faltam para a meta"
            valor={metaUnidade ? Math.max(progressoUnidade.meta - progressoUnidade.realizado, 0) : "—"}
            contexto={metaUnidade ? "vendas até bater a meta da unidade" : "meta não definida"}
            icon={Target}
            tom="sucesso"
          />
          <StatCard
            label="Projeção de fechamento"
            valor={projecao.toFixed(1)}
            contexto="baseada no ritmo atual"
            icon={TrendingUp}
            tom="info"
          />
          <StatCard
            label="Vendedores ativos"
            valor={vendedores.length}
            icon={Users}
            tom="neutro"
          />
        </div>
      </section>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-slate-700">Ranking do mês</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RankingBarChart
            dados={ranking.map((r) => ({
              nome: r.nome,
              realizado: r.realizado,
              meta: r.meta,
              percentual: r.percentual,
            }))}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Realizado</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((r) => (
                <TableRow key={r.vendedorId}>
                  <TableCell>{r.posicao}</TableCell>
                  <TableCell className="font-medium text-slate-900">{r.nome}</TableCell>
                  <TableCell>{r.realizado}</TableCell>
                  <TableCell>{r.meta || "—"}</TableCell>
                  <TableCell>{r.meta > 0 ? `${r.percentual.toFixed(0)}%` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AlertaCard titulo="Alertas — sem venda no período" icon={AlertOctagon} tom="risco">
          {semVenda.length === 0 ? (
            <p className="text-sm text-red-700/70">Todo mundo já vendeu algo no período.</p>
          ) : (
            <ul className="list-disc pl-5 text-sm text-red-800">
              {semVenda.map((v) => (
                <li key={v.vendedorId}>{v.nome}</li>
              ))}
            </ul>
          )}
        </AlertaCard>

        <AlertaCard titulo="Alertas — abaixo de 50% da meta" icon={Gauge} tom="alerta">
          {abaixoDaMeta.length === 0 ? (
            <p className="text-sm text-amber-700/70">Ninguém abaixo do esperado.</p>
          ) : (
            <ul className="list-disc pl-5 text-sm text-amber-800">
              {abaixoDaMeta.map((v) => (
                <li key={v.vendedorId}>
                  {v.nome} — {v.percentual.toFixed(0)}%
                </li>
              ))}
            </ul>
          )}
        </AlertaCard>
      </section>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-slate-700">
            <Clock className="size-4 text-slate-400" />
            Leads parados (sem contato há {DIAS_LEAD_PARADO}+ dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leadsParados.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum lead parado no momento.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm text-slate-700">
              {leadsParados.map((lead) => (
                <li key={lead.id}>
                  {lead.nome} — {lead.vendedor?.nomeCompleto ?? "sem vendedor"} — {lead.etapa}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-slate-700">
            Pós-venda pendente por vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PosVendaPendenciasTable itens={pendenciasPosVenda} />
        </CardContent>
      </Card>
    </div>
  );
}
