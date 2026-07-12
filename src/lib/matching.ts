/**
 * Matching de nome de vendedor vindo de planilha contra o cadastro de
 * Vendedor. Usado na importação de vendas: primeiro tenta achar um alias já
 * aprendido (VendedorAliasVenda), depois exato normalizado, depois
 * aproximado (Levenshtein) com um limiar conservador — abaixo do limiar vai
 * pra pendência em vez de arriscar casar errado.
 */

export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (marcas diacríticas combinantes)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distância de Levenshtein clássica (edições mínimas entre duas strings). */
function distanciaLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const linhaAnterior = new Array(n + 1);
  const linhaAtual = new Array(n + 1);

  for (let j = 0; j <= n; j++) linhaAnterior[j] = j;

  for (let i = 1; i <= m; i++) {
    linhaAtual[0] = i;
    for (let j = 1; j <= n; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      linhaAtual[j] = Math.min(
        linhaAtual[j - 1] + 1, // inserção
        linhaAnterior[j] + 1, // remoção
        linhaAnterior[j - 1] + custo // substituição
      );
    }
    for (let j = 0; j <= n; j++) linhaAnterior[j] = linhaAtual[j];
  }
  return linhaAnterior[n];
}

/** Similaridade normalizada entre 0 (nada a ver) e 1 (idêntico). */
export function similaridade(a: string, b: string): number {
  const na = normalizarNome(a);
  const nb = normalizarNome(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  const dist = distanciaLevenshtein(na, nb);
  return 1 - dist / maxLen;
}

export type CandidatoVendedor = { id: string; nomeCompleto: string };

export type ResultadoMatch =
  | { encontrado: true; vendedorId: string; via: "alias" | "exato" | "aproximado" }
  | { encontrado: false };

const LIMIAR_APROXIMADO = 0.85;

export function buscarVendedorPorNome(
  nomePlanilha: string,
  vendedores: CandidatoVendedor[],
  aliases: Map<string, string> // nomePlanilha normalizado -> vendedorId
): ResultadoMatch {
  const nomeNormalizado = normalizarNome(nomePlanilha);
  if (!nomeNormalizado) return { encontrado: false };

  const aliasId = aliases.get(nomeNormalizado);
  if (aliasId) {
    return { encontrado: true, vendedorId: aliasId, via: "alias" };
  }

  const exato = vendedores.find(
    (v) => normalizarNome(v.nomeCompleto) === nomeNormalizado
  );
  if (exato) {
    return { encontrado: true, vendedorId: exato.id, via: "exato" };
  }

  let melhor: { id: string; score: number } | null = null;
  for (const v of vendedores) {
    const score = similaridade(nomePlanilha, v.nomeCompleto);
    if (score >= LIMIAR_APROXIMADO && (!melhor || score > melhor.score)) {
      melhor = { id: v.id, score };
    }
  }
  if (melhor) {
    return { encontrado: true, vendedorId: melhor.id, via: "aproximado" };
  }

  return { encontrado: false };
}
