import { prisma } from "@/lib/prisma";
import { calcularRanking } from "@/lib/metricas";
import type { EtapaLead, TipoAtividade } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RankingBarChart } from "@/components/dashboard/RankingBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ETAPA_LABEL: Record<EtapaLead, string> = {
  NOVO: "Novo",
  EM_TRATATIVA: "Em tratativa",
  FECHAMENTO: "Fechamento",
  PERDIDO: "Perdido",
};

const TIPO_LABEL: Record<TipoAtividade, string> = {
  LIGACAO: "Ligação",
  MENSAGEM: "Mensagem",
  WHATSAPP: "WhatsApp",
  RETORNO_AGENDADO: "Retorno agendado",
  PRESENCIAL: "Presencial",
  OBSERVACAO: "Observação",
};

function formatarData(data: Date) {
  return data.toISOString().slice(0, 10);
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string }>;
}) {
  const params = await searchParams;
  const hoje = new Date();
  const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicio = params.inicio ? new Date(params.inicio) : inicioPadrao;
  const fim = params.fim ? new Date(params.fim) : hoje;
  const fimAjustado = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate(), 23, 59, 59);

  const [vendedores, vendas, leadsPorEtapa, atividadesPorTipoEVendedor, leadsFechadosPorVendedor, leadsTotaisPorVendedor] =
    await Promise.all([
      prisma.vendedor.findMany({
        where: { ativo: true, virtual: false },
        orderBy: { nomeCompleto: "asc" },
      }),
      prisma.venda.findMany({
        where: {
          status: "ATIVA",
          dataVenda: { gte: inicio, lte: fimAjustado },
          vendedor: { virtual: false },
        },
        include: { vendedor: true },
      }),
      prisma.lead.groupBy({ by: ["etapa"], _count: { _all: true } }),
      prisma.atividade.groupBy({
        by: ["vendedorId", "tipo"],
        where: { dataHora: { gte: inicio, lte: fimAjustado } },
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ["vendedorId"],
        where: { etapa: "FECHAMENTO" },
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ["vendedorId"],
        _count: { _all: true },
      }),
    ]);

  const vendasPorVendedor = new Map<string, number>();
  for (const v of vendas) {
    vendasPorVendedor.set(v.vendedorId, (vendasPorVendedor.get(v.vendedorId) ?? 0) + 1);
  }

  const fechadosPorVendedor = new Map(
    leadsFechadosPorVendedor
      .filter((l) => l.vendedorId)
      .map((l) => [l.vendedorId as string, l._count._all])
  );
  const totalLeadsPorVendedor = new Map(
    leadsTotaisPorVendedor
      .filter((l) => l.vendedorId)
      .map((l) => [l.vendedorId as string, l._count._all])
  );

  const ranking = calcularRanking(
    vendedores.map((v) => ({
      vendedorId: v.id,
      nome: v.nomeCompleto,
      realizado: vendasPorVendedor.get(v.id) ?? 0,
      meta: 0,
    }))
  );

  const atividadesPorVendedor = new Map<string, Map<TipoAtividade, number>>();
  for (const a of atividadesPorTipoEVendedor) {
    const mapaVendedor = atividadesPorVendedor.get(a.vendedorId) ?? new Map();
    mapaVendedor.set(a.tipo, a._count._all);
    atividadesPorVendedor.set(a.vendedorId, mapaVendedor);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Relatórios" subtitulo="Vendas, leads e produtividade por período." />

      <Card className="border-border/80 shadow-sm">
        <CardContent>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inicio">De</Label>
              <Input id="inicio" type="date" name="inicio" defaultValue={formatarData(inicio)} className="h-9 w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fim">Até</Label>
              <Input id="fim" type="date" name="fim" defaultValue={formatarData(fim)} className="h-9 w-40" />
            </div>
            <Button type="submit" className="h-9">
              Filtrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-foreground/80">
            Vendas por vendedor no período (ranking)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RankingBarChart
            dados={ranking.map((r) => ({
              nome: r.nome,
              realizado: r.realizado,
              meta: r.meta,
              percentual: r.percentual,
            }))}
          />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-foreground/80">Leads por etapa (total geral)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {leadsPorEtapa.map((g) => (
              <div key={g.etapa} className="rounded-lg border border-border bg-muted/60 p-3 text-center">
                <p className="text-lg font-semibold text-foreground">{g._count._all}</p>
                <p className="text-xs text-muted-foreground">{ETAPA_LABEL[g.etapa]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-foreground/80">
            Produtividade e conversão por vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                {Object.values(TIPO_LABEL).map((label) => (
                  <TableHead key={label}>{label}</TableHead>
                ))}
                <TableHead>Conversão (fechamento/leads)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendedores.map((v) => {
                const atividades = atividadesPorVendedor.get(v.id);
                const fechados = fechadosPorVendedor.get(v.id) ?? 0;
                const totalLeads = totalLeadsPorVendedor.get(v.id) ?? 0;
                const conversao = totalLeads > 0 ? (fechados / totalLeads) * 100 : 0;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-foreground">{v.nomeCompleto}</TableCell>
                    {(Object.keys(TIPO_LABEL) as TipoAtividade[]).map((tipo) => (
                      <TableCell key={tipo}>{atividades?.get(tipo) ?? 0}</TableCell>
                    ))}
                    <TableCell>
                      {totalLeads > 0 ? `${conversao.toFixed(0)}% (${fechados}/${totalLeads})` : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
