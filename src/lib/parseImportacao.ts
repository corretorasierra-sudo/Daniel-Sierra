/** Parsers tolerantes usados na importação de vendas (planilha e resolução de pendências). */

export function parseData(valor: string): Date | null {
  if (!valor) return null;

  // dd/mm/aaaa (ou dd-mm-aaaa), com hora opcional — testado primeiro porque
  // o Date() nativo interpreta esse formato como mm/dd (padrão americano) e
  // erra silenciosamente o mês em datas tipo "02/05/2026 12:07" (2 de maio,
  // não 5 de fevereiro).
  const match = valor
    .trim()
    .match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (match) {
    const [, dStr, mStr, aStr, hStr, minStr, sStr] = match;
    const d = Number.parseInt(dStr, 10);
    const m = Number.parseInt(mStr, 10);
    const a = Number.parseInt(aStr, 10);
    if (d && m) {
      const data = new Date(
        a < 100 ? 2000 + a : a,
        m - 1,
        d,
        hStr ? Number.parseInt(hStr, 10) : 0,
        minStr ? Number.parseInt(minStr, 10) : 0,
        sStr ? Number.parseInt(sStr, 10) : 0
      );
      if (!Number.isNaN(data.getTime())) return data;
    }
  }

  const direto = new Date(valor);
  if (!Number.isNaN(direto.getTime())) return direto;

  return null;
}

/** Normaliza a coluna "Prospecção" da planilha (Filiação/Refiliação, com ou sem acento). */
export function parseProspeccao(valor: string): "FILIACAO" | "REFILIACAO" | null {
  if (!valor) return null;
  const normalizado = valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim();
  if (normalizado.startsWith("REFIL")) return "REFILIACAO";
  if (normalizado.startsWith("FILI")) return "FILIACAO";
  return null;
}

export function parseValor(valor: string): number | null {
  if (!valor) return null;
  const limpo = valor
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const numero = Number.parseFloat(limpo);
  return Number.isNaN(numero) ? null : numero;
}
