import { normalizarNome } from "@/lib/matching";

/**
 * Chave usada pra deduplicar vendas quando a planilha não traz um
 * `codigoExterno`. Combina cliente + telefone + vendedor + data + produto —
 * o mesmo critério documentado no plano de dados.
 */
export function gerarChaveDedupe(params: {
  clienteNome: string;
  clienteTelefone?: string | null;
  vendedorId: string;
  dataVenda: Date;
  produto?: string | null;
}): string {
  const data = params.dataVenda.toISOString().slice(0, 10);
  return [
    normalizarNome(params.clienteNome),
    (params.clienteTelefone ?? "").replace(/\D/g, ""),
    params.vendedorId,
    data,
    normalizarNome(params.produto ?? ""),
  ].join("|");
}
