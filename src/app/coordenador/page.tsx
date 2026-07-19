import { Target, TrendingUp, Users, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  calcularProgressoMeta,
  calcularProjecaoFechamento,
  calcularRanking,
} from "@/lib/metricas";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { RankingBarChart } from "@/components/dashboard/RankingBarChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default async function CoordenadorHomePage() {
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

  const [vendedores, vendasNoPeriodo, metasVendedores, vendasRecentes] = await Promise.all([
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
    prisma.venda.findMany({
      where: { status: "ATIVA" },
      include: { vendedor: true },
      orderBy: { dataVenda: "desc" },
      take: 10,
    }),
  ]);

  const totalRealizado = vendasNoPeriodo.length;
  const faturamentoPeriodo = vendasNoPeriodo.reduce((soma, v) => soma + Number(v.valor ?? 0), 0);
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Visão geral de vendas"
        subtitulo={`Período: ${formatarData(inicioPeriodo)} – ${formatarData(fimPeriodo)}`}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="border-border/80 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Meta da unidade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <ProgressRing
              percentual={progressoUnidade.percentual}
              tamanho={132}
              espessura={12}
              label={`${progressoUnidade.realizado}/${progressoUnidade.meta || "—"}`}
            />
            <p className="text-xs text-muted-foreground">
              {metaUnidade ? "vendas no período" : "meta não definida"}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
          <StatCard
            label="Faturamento no período"
            valor={formatarMoeda(faturamentoPeriodo)}
            contexto={`${totalRealizado} venda(s)`}
            icon={Wallet}
            tom="sucesso"
          />
          <StatCard
            label="Projeção de fechamento"
            valor={projecao.toFixed(1)}
            contexto="vendas, baseado no ritmo atual"
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

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-foreground/80">
            <Target className="size-4 text-muted-foreground" />
            Ranking do mês
          </CardTitle>
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
                  <TableCell className="font-medium text-foreground">{r.nome}</TableCell>
                  <TableCell>{r.realizado}</TableCell>
                  <TableCell>{r.meta || "—"}</TableCell>
                  <TableCell>{r.meta > 0 ? `${r.percentual.toFixed(0)}%` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-foreground/80">Últimas vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendasRecentes.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="font-medium text-foreground">{venda.clienteNome}</TableCell>
                  <TableCell>{venda.vendedor.nomeCompleto}</TableCell>
                  <TableCell>{venda.produto ?? "—"}</TableCell>
                  <TableCell>{venda.valor ? formatarMoeda(Number(venda.valor)) : "—"}</TableCell>
                  <TableCell>{formatarData(venda.dataVenda)}</TableCell>
                </TableRow>
              ))}
              {vendasRecentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    Nenhuma venda registrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
