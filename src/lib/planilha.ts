import * as XLSX from "xlsx";

/**
 * Leitura de planilha (.xlsx/.csv) enviada por upload, usada tanto na
 * importação de leads quanto na de vendas. Devolve um array de objetos com
 * as chaves normalizadas (minúsculas, sem acento) pra facilitar o mapeamento
 * de colunas independente de como o Coordenador nomeou o cabeçalho.
 */

export type LinhaPlanilha = Record<string, string>;

function normalizarChave(chave: string): string {
  return chave
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function normalizarValor(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) return valor.toISOString();
  return String(valor).trim();
}

export async function lerPlanilha(arquivo: File): Promise<LinhaPlanilha[]> {
  const buffer = await arquivo.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const primeiraAba = workbook.SheetNames[0];
  if (!primeiraAba) return [];

  const sheet = workbook.Sheets[primeiraAba];
  const linhasBrutas = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return linhasBrutas.map((linha) => {
    const linhaNormalizada: LinhaPlanilha = {};
    for (const [chave, valor] of Object.entries(linha)) {
      linhaNormalizada[normalizarChave(chave)] = normalizarValor(valor);
    }
    return linhaNormalizada;
  });
}

/** Busca o primeiro valor não vazio entre possíveis nomes de coluna. */
export function pegarCampo(linha: LinhaPlanilha, ...possiveisChaves: string[]): string {
  for (const chave of possiveisChaves) {
    const valor = linha[chave];
    if (valor) return valor;
  }
  return "";
}
