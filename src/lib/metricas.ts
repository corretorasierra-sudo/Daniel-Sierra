/**
 * Funções puras de cálculo de metas/produtividade. Nada aqui toca no banco —
 * recebem os números já buscados e devolvem os indicadores derivados.
 * Reutilizadas pelas homes (vendedor/gerente) e pelos relatórios, pra não
 * duplicar regra de negócio na UI.
 */

export type ProgressoMeta = {
  meta: number;
  realizado: number;
  percentual: number; // 0-100+ (pode passar de 100)
  restante: number; // quantas vendas faltam pra bater a meta (0 se já bateu)
};

export function calcularProgressoMeta(meta: number, realizado: number): ProgressoMeta {
  const percentual = meta > 0 ? (realizado / meta) * 100 : 0;
  const restante = Math.max(meta - realizado, 0);
  return { meta, realizado, percentual, restante };
}

/**
 * Conta dias úteis (segunda a sábado — domingo é o único dia de folga padrão
 * do comércio local) num intervalo, inclusive nas duas pontas.
 */
export function calcularDiasUteis(dataInicio: Date, dataFim: Date): number {
  if (dataFim < dataInicio) return 0;
  let contador = 0;
  const cursor = new Date(dataInicio);
  cursor.setHours(0, 0, 0, 0);
  const fim = new Date(dataFim);
  fim.setHours(0, 0, 0, 0);

  while (cursor <= fim) {
    const diaDaSemana = cursor.getDay(); // 0 = domingo
    if (diaDaSemana !== 0) contador += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return contador;
}

export function calcularDiasUteisRestantes(dataFim: Date, hoje: Date = new Date()): number {
  return calcularDiasUteis(hoje, dataFim);
}

/**
 * Quantas vendas por dia útil restante são necessárias para bater a meta,
 * dado o que já foi vendido até agora.
 */
export function calcularMediaNecessariaPorDia(
  meta: number,
  realizado: number,
  dataFim: Date,
  hoje: Date = new Date()
): number {
  const restante = Math.max(meta - realizado, 0);
  if (restante === 0) return 0;
  const diasUteisRestantes = calcularDiasUteisRestantes(dataFim, hoje);
  if (diasUteisRestantes <= 0) return restante; // prazo estourado, tudo pendente
  return restante / diasUteisRestantes;
}

/**
 * Projeta o total de vendas ao final do período, com base no ritmo médio de
 * vendas por dia útil já percorrido no período.
 */
export function calcularProjecaoFechamento(
  realizado: number,
  dataInicio: Date,
  dataFim: Date,
  hoje: Date = new Date()
): number {
  const diasUteisPercorridos = calcularDiasUteis(
    dataInicio,
    hoje < dataFim ? hoje : dataFim
  );
  if (diasUteisPercorridos <= 0) return realizado;

  const ritmoDiario = realizado / diasUteisPercorridos;
  const diasUteisTotais = calcularDiasUteis(dataInicio, dataFim);
  return Math.round(ritmoDiario * diasUteisTotais * 100) / 100;
}

export type ItemRanking = {
  vendedorId: string;
  nome: string;
  realizado: number;
  meta: number;
};

export type ItemRankingCalculado = ItemRanking & {
  percentual: number;
  posicao: number;
};

/** Ordena vendedores por % de meta batida (desc), depois por realizado (desc). */
export function calcularRanking(itens: ItemRanking[]): ItemRankingCalculado[] {
  const ordenado = [...itens].sort((a, b) => {
    const percA = a.meta > 0 ? a.realizado / a.meta : a.realizado > 0 ? Infinity : 0;
    const percB = b.meta > 0 ? b.realizado / b.meta : b.realizado > 0 ? Infinity : 0;
    if (percB !== percA) return percB - percA;
    return b.realizado - a.realizado;
  });

  return ordenado.map((item, index) => ({
    ...item,
    percentual: item.meta > 0 ? (item.realizado / item.meta) * 100 : 0,
    posicao: index + 1,
  }));
}
