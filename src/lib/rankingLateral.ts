/**
 * Dados pro widget de ranking lateral (painel gerente/coordenador): posição
 * de cada vendedor no mês, na semana e no dia — em vendas e em atividade
 * (contatos de lead) —, mais a série diária do mês inteiro pra cada métrica
 * (usada no gráfico individual quando clica no vendedor). Tudo pré-calculado
 * aqui — o componente cliente só ordena e desenha.
 */

import { prisma } from "@/lib/prisma";
import {
  calcularDiasUteis,
  calcularFimSemana,
  calcularInicioSemana,
  calcularMetaAtividade,
  calcularProjecaoFechamento,
  calcularStatusMeta,
  type StatusMeta,
} from "@/lib/metricas";

export type PontoSerieDiaria = {
  data: string; // yyyy-mm-dd
  label: string; // dd/mm
  valor: number;
  status: StatusMeta;
};

export type PeriodoRanking = {
  realizado: number;
  meta: number;
  percentual: number;
  status: StatusMeta;
};

export type MetricaRanking = "vendas" | "atividade";

export type IndicadorRanking = {
  mensal: PeriodoRanking;
  semanal: PeriodoRanking;
  diario: PeriodoRanking;
  serieDiaria: PontoSerieDiaria[];
};

export type ItemRankingLateral = {
  vendedorId: string;
  nome: string;
  fotoUrl: string | null;
  vendas: IndicadorRanking;
  atividade: IndicadorRanking;
};

function formatarChaveDia(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(
    data.getDate()
  ).padStart(2, "0")}`;
}

function formatarLabelDia(data: Date) {
  return `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function montarPeriodo(realizado: number, meta: number, referenciaStatus: number): PeriodoRanking {
  return {
    realizado,
    meta,
    percentual: meta > 0 ? (realizado / meta) * 100 : 0,
    status: calcularStatusMeta(referenciaStatus, meta),
  };
}

/** Soma por dia (yyyy-mm-dd) uma lista de registros com vendedorId + data. */
function agruparPorVendedorEDia<T extends { vendedorId: string }>(
  registros: T[],
  extrairData: (registro: T) => Date
): Map<string, Map<string, number>> {
  const porVendedor = new Map<string, Map<string, number>>();
  for (const registro of registros) {
    let porDia = porVendedor.get(registro.vendedorId);
    if (!porDia) {
      porDia = new Map();
      porVendedor.set(registro.vendedorId, porDia);
    }
    const chave = formatarChaveDia(extrairData(registro));
    porDia.set(chave, (porDia.get(chave) ?? 0) + 1);
  }
  return porVendedor;
}

/** Constrói mensal/semanal/diário + série do mês pra uma métrica, dado o mapa dia->contagem. */
function montarIndicador(
  porDia: Map<string, number>,
  metaMensal: number,
  inicioMes: Date,
  fimMes: Date,
  inicioSemana: Date,
  fimSemana: Date,
  hoje: Date,
  chaveHoje: string,
  diasUteisMes: number,
  diasUteisSemana: number
): IndicadorRanking {
  const metaDiariaImplicita = metaMensal > 0 ? metaMensal / diasUteisMes : 0;
  const metaSemanal = metaDiariaImplicita * diasUteisSemana;
  const metaDiaria = metaDiariaImplicita;

  const serieDiaria: PontoSerieDiaria[] = [];
  let realizadoMes = 0;
  let realizadoSemana = 0;
  const cursor = new Date(inicioMes);
  while (cursor <= hoje) {
    const chave = formatarChaveDia(cursor);
    const valorDoDia = porDia.get(chave) ?? 0;
    realizadoMes += valorDoDia;
    if (cursor >= inicioSemana) realizadoSemana += valorDoDia;
    serieDiaria.push({
      data: chave,
      label: formatarLabelDia(cursor),
      valor: valorDoDia,
      status: calcularStatusMeta(valorDoDia, metaDiaria),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  const realizadoHoje = porDia.get(chaveHoje) ?? 0;

  const projecaoMes = calcularProjecaoFechamento(realizadoMes, inicioMes, fimMes, hoje);
  const projecaoSemana = calcularProjecaoFechamento(realizadoSemana, inicioSemana, fimSemana, hoje);

  return {
    mensal: montarPeriodo(realizadoMes, metaMensal, projecaoMes),
    semanal: montarPeriodo(realizadoSemana, metaSemanal, projecaoSemana),
    diario: montarPeriodo(realizadoHoje, metaDiaria, realizadoHoje),
    serieDiaria,
  };
}

export async function buscarRankingLateral(hoje: Date = new Date()): Promise<ItemRankingLateral[]> {
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
  const inicioSemana = calcularInicioSemana(hoje);
  const fimSemana = calcularFimSemana(inicioSemana);
  const chaveHoje = formatarChaveDia(hoje);
  const diasUteisMes = calcularDiasUteis(inicioMes, fimMes) || 1;
  const diasUteisSemana = calcularDiasUteis(inicioSemana, fimSemana) || 1;

  const [vendedores, vendasDoMes, atividadesDoMes, leadsCriadosDoMes, metasMensais] = await Promise.all([
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
    prisma.atividade.findMany({
      where: {
        dataHora: { gte: inicioMes, lte: fimMes },
        tipo: { not: "OBSERVACAO" },
        vendedor: { virtual: false },
      },
      select: { vendedorId: true, dataHora: true },
    }),
    // Cadastrar um lead novo já conta como atividade — é o primeiro passo de
    // trabalhar um lead frio, não só as ligações/contatos feitos depois.
    prisma.lead.findMany({
      where: {
        dataEntrada: { gte: inicioMes, lte: fimMes },
        vendedorId: { not: null },
        vendedor: { virtual: false },
      },
      select: { vendedorId: true, dataEntrada: true },
    }),
    prisma.meta.findMany({
      where: {
        tipo: "MENSAL",
        vendedorId: { not: null },
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
      },
    }),
  ]);

  const metaMensalPorVendedor = new Map(metasMensais.map((m) => [m.vendedorId as string, m.valorMeta]));
  const vendasPorVendedorDia = agruparPorVendedorEDia(vendasDoMes, (v) => v.dataVenda);
  const atividadesPorVendedorDia = agruparPorVendedorEDia(atividadesDoMes, (a) => a.dataHora);
  const leadsPorVendedorDia = agruparPorVendedorEDia(
    leadsCriadosDoMes as { vendedorId: string; dataEntrada: Date }[],
    (l) => l.dataEntrada
  );
  for (const [vendedorId, porDia] of leadsPorVendedorDia) {
    let acumulado = atividadesPorVendedorDia.get(vendedorId);
    if (!acumulado) {
      acumulado = new Map();
      atividadesPorVendedorDia.set(vendedorId, acumulado);
    }
    for (const [dia, contagem] of porDia) {
      acumulado.set(dia, (acumulado.get(dia) ?? 0) + contagem);
    }
  }

  return vendedores.map((vendedor) => {
    const metaVendasMensal = metaMensalPorVendedor.get(vendedor.id) ?? 0;
    const metaAtividadeMensal = calcularMetaAtividade(metaVendasMensal);

    const vendas = montarIndicador(
      vendasPorVendedorDia.get(vendedor.id) ?? new Map(),
      metaVendasMensal,
      inicioMes,
      fimMes,
      inicioSemana,
      fimSemana,
      hoje,
      chaveHoje,
      diasUteisMes,
      diasUteisSemana
    );

    const atividade = montarIndicador(
      atividadesPorVendedorDia.get(vendedor.id) ?? new Map(),
      metaAtividadeMensal,
      inicioMes,
      fimMes,
      inicioSemana,
      fimSemana,
      hoje,
      chaveHoje,
      diasUteisMes,
      diasUteisSemana
    );

    return {
      vendedorId: vendedor.id,
      nome: vendedor.nomeCompleto,
      fotoUrl: vendedor.user?.fotoUrl ?? null,
      vendas,
      atividade,
    };
  });
}
