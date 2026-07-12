import { prisma } from "@/lib/prisma";

const CHECKLIST_PENDENTE = {
  OR: [
    { appBaixado: false },
    { consultaMarcada: false },
    { orientacoesRecebidas: false },
    { indicacaoRecebida: false },
  ],
};

/** Pendências de importação (vendedor não encontrado/dados ausentes) aguardando correção. */
export async function contarPendenciasImportacao(): Promise<number> {
  return prisma.pendenciaImportacao.count({ where: { status: "PENDENTE" } });
}

/** Acompanhamentos de pós-venda incompletos dos vendedores de verdade (não o canal site). */
export async function contarPendenciasPosVendaGeral(): Promise<number> {
  return prisma.acompanhamentoPosVenda.count({
    where: { venda: { vendedor: { virtual: false } }, ...CHECKLIST_PENDENTE },
  });
}

/** Acompanhamentos de pós-venda incompletos do canal virtual (ex: site). */
export async function contarPendenciasPosVendaSite(): Promise<number> {
  return prisma.acompanhamentoPosVenda.count({
    where: { venda: { vendedor: { virtual: true } }, ...CHECKLIST_PENDENTE },
  });
}

/** Acompanhamentos de pós-venda incompletos de um vendedor específico. */
export async function contarPendenciasPosVendaVendedor(vendedorId: string): Promise<number> {
  return prisma.acompanhamentoPosVenda.count({
    where: { venda: { vendedorId }, ...CHECKLIST_PENDENTE },
  });
}
