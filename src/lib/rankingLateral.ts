/**
 * Dados pro widget de ranking lateral (painel gerente/coordenador): posição
 * de cada vendedor no mês, na semana e no dia, mais a série diária de vendas
 * do mês inteiro (usada no gráfico individual quando clica no vendedor).
 * Tudo pré-calculado aqui — o componente cliente só ordena e desenha.
 */

import { prisma } from "@/lib/prisma";
import {
  calcularDiasUteis,
  calcularFimSemana,
  calcularInicioSemana,
  calcularProjecaoFechamento,
  calcularStatusMeta,
  type StatusMeta,
} from "@/lib/metricas";

export type PontoSerieDiaria = {
  data: string; // yyyy-mm-dd
  label: string; // dd/mm
  vendas: number;
  status: StatusMeta;
};

export type PeriodoRanking = {
  realizado: number;
  meta: number;
  percentual: number;
  status: StatusMeta;
};

export type ItemRankingLateral = {
  vendedorId: string;
  nome: string;
  fotoUrl: string | null;
  mensal: PeriodoRanking;
  semanal: PeriodoRanking;
  diario: PeriodoRanking;
  serieDiaria: PontoSerieDiaria[];
};

function formatarChaveDia(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(
    data.getDate()
  ).padStart(2, "0")}`;
}

function formatarLabelDia(data: Date) {
  return `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function montarPeriodo(realizado: number, meta: number, statusPorProjecao: number): PeriodoRanking {
  return {
    realizado,
    meta,
    percentual: meta > 0 ? (realizado / meta) * 100 : 0,
    status: calcularStatusMeta(statusPorProjecao, meta),
  };
}

export async function buscarRankingLateral(hoje: Date = new Date()): Promise<ItemRankingLateral[]> {
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
  const inicioSemana = calcularInicioSemana(hoje);
  const fimSemana = calcularFimSemana(inicioSemana);
  const chaveHoje = formatarChaveDia(hoje);

  const [vendedores, vendasDoMes, metasMensais, metasSemanais, metasDiarias] = await Promise.all([
    prisma.vendedor.findMany({
      where: { ativo: true, virtual: false },
      include: { user: { select: { fotoUrl: true } } },
    }),
    prisma.venda.findMany({
      where: {
        status: "ATIVA",
        dataVenda: { gte: inicioMes, lte: fimMes },
        vendedor: { virtual: false },
      },
      select: { vendedorId: true, dataVenda: true },
    }),
    prisma.meta.findMany({
      where: {
        tipo: "MENSAL",
        vendedorId: { not: null },
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
      },
    }),
    prisma.meta.findMany({
      where: {
        tipo: "SEMANAL",
        vendedorId: { not: null },
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
      },
    }),
    prisma.meta.findMany({
      where: {
        tipo: "DIARIA",
        vendedorId: { not: null },
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
      },
    }),
  ]);

  const metaMensalPorVendedor = new Map(metasMensais.map((m) => [m.vendedorId as string, m.valorMeta]));
  const metaSemanalPorVendedor = new Map(metasSemanais.map((m) => [m.vendedorId as string, m.valorMeta]));
  const metaDiariaPorVendedor = new Map(metasDiarias.map((m) => [m.vendedorId as string, m.valorMeta]));

  const diasUteisMes = calcularDiasUteis(inicioMes, fimMes) || 1;
  const diasUteisSemana = calcularDiasUteis(inicioSemana, fimSemana) || 1;

  const vendasPorVendedorDia = new Map<string, Map<string, number>>();
  for (const venda of vendasDoMes) {
    let porDia = vendasPorVendedorDia.get(venda.vendedorId);
    if (!porDia) {
      porDia = new Map();
      vendasPorVendedorDia.set(venda.vendedorId, porDia);
    }
    const chave = formatarChaveDia(venda.dataVenda);
    porDia.set(chave, (porDia.get(chave) ?? 0) + 1);
  }

  return vendedores.map((vendedor) => {
    const porDia = vendasPorVendedorDia.get(vendedor.id) ?? new Map<string, number>();

    const metaMensal = metaMensalPorVendedor.get(vendedor.id) ?? 0;
    // sem meta semanal/diária cadastrada explicitamente: deriva proporcionalmente da meta mensal
    const metaDiariaImplicita = metaMensal > 0 ? metaMensal / diasUteisMes : 0;
    const metaSemanal = metaSemanalPorVendedor.get(vendedor.id) ?? metaDiariaImplicita * diasUteisSemana;
    const metaDiaria = metaDiariaPorVendedor.get(vendedor.id) ?? metaDiariaImplicita;

    const serieDiaria: PontoSerieDiaria[] = [];
    let realizadoMes = 0;
    let realizadoSemana = 0;
    const cursor = new Date(inicioMes);
    while (cursor <= hoje) {
      const chave = formatarChaveDia(cursor);
      const vendasDoDia = porDia.get(chave) ?? 0;
      realizadoMes += vendasDoDia;
      if (cursor >= inicioSemana) realizadoSemana += vendasDoDia;
      serieDiaria.push({
        data: chave,
        label: formatarLabelDia(cursor),
        vendas: vendasDoDia,
        status: calcularStatusMeta(vendasDoDia, metaDiaria),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    const realizadoHoje = porDia.get(chaveHoje) ?? 0;

    const projecaoMes = calcularProjecaoFechamento(realizadoMes, inicioMes, fimMes, hoje);
    const projecaoSemana = calcularProjecaoFechamento(realizadoSemana, inicioSemana, fimSemana, hoje);

    return {
      vendedorId: vendedor.id,
      nome: vendedor.nomeCompleto,
      fotoUrl: vendedor.user?.fotoUrl ?? null,
      mensal: montarPeriodo(realizadoMes, metaMensal, projecaoMes),
      semanal: montarPeriodo(realizadoSemana, metaSemanal, projecaoSemana),
      diario: montarPeriodo(realizadoHoje, metaDiaria, realizadoHoje),
      serieDiaria,
    };
  });
}
