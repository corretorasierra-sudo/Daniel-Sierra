import { prisma } from "@/lib/prisma";
import { pegarCampo, type LinhaPlanilha } from "@/lib/planilha";
import { FormResolverPendencia } from "./FormResolverPendencia";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AlertaCard } from "@/components/dashboard/AlertaCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MOTIVO_LABEL: Record<string, string> = {
  VENDEDOR_NAO_ENCONTRADO: "Vendedor não encontrado",
  DADOS_AUSENTES: "Dados ausentes (cliente/data)",
  DUPLICADO_AMBIGUO: "Duplicado ambíguo",
  OUTRO: "Outro",
};

export default async function PendenciasPage() {
  const [pendentes, resolvidas, vendedores] = await Promise.all([
    prisma.pendenciaImportacao.findMany({
      where: { status: "PENDENTE" },
      include: { importacao: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pendenciaImportacao.findMany({
      where: { status: "RESOLVIDA" },
      include: { resolvidoPor: true, vendedorCorrigido: true },
      orderBy: { resolvidoEm: "desc" },
      take: 15,
    }),
    prisma.vendedor.findMany({ where: { ativo: true }, orderBy: { nomeCompleto: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Pendências de importação"
        subtitulo="Linhas de venda que não casaram com nenhum vendedor automaticamente. Ao atribuir manualmente, o sistema aprende o alias e casa sozinho da próxima vez."
      />

      <section className="flex flex-col gap-3">
        {pendentes.length === 0 && (
          <p className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma pendência em aberto.
          </p>
        )}
        {pendentes.map((p) => {
          const linha = p.linhaOriginal as LinhaPlanilha;
          const cliente = pegarCampo(linha, "cliente", "nome", "cliente_nome");
          const data = pegarCampo(linha, "data_venda", "data", "data_da_venda");
          const produto = pegarCampo(linha, "produto", "plano");
          return (
            <AlertaCard key={p.id} tom="alerta">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {cliente || "(cliente não identificado)"} — {produto || "produto não informado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nome na planilha: <strong>{p.nomePlanilha || "—"}</strong> · Data: {data || "—"} ·
                    Motivo: {MOTIVO_LABEL[p.motivo] ?? p.motivo} · Arquivo: {p.importacao.arquivoNome}
                  </p>
                </div>
                {p.motivo === "VENDEDOR_NAO_ENCONTRADO" ? (
                  <FormResolverPendencia pendenciaId={p.id} vendedores={vendedores} />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    corrija a planilha original e reimporte
                  </span>
                )}
              </div>
            </AlertaCard>
          );
        })}
      </section>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-foreground/80">Resolvidas recentemente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome na planilha</TableHead>
                <TableHead>Vendedor atribuído</TableHead>
                <TableHead>Resolvido por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resolvidas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nomePlanilha}</TableCell>
                  <TableCell>{p.vendedorCorrigido?.nomeCompleto}</TableCell>
                  <TableCell>{p.resolvidoPor?.nome}</TableCell>
                </TableRow>
              ))}
              {resolvidas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                    Nenhuma pendência resolvida ainda.
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
