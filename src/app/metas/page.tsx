import { prisma } from "@/lib/prisma";
import { exigirRole } from "@/lib/autorizacao";
import { criarMeta, excluirMeta, definirMetaVendedores, definirMetaFranquia } from "./actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
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

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

const selectClass =
  "rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm shadow-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20";

export default async function MetasPage() {
  await exigirRole("ADMIN", "GERENTE");

  const [vendedores, metas] = await Promise.all([
    prisma.vendedor.findMany({
      where: { ativo: true, virtual: false },
      orderBy: { nomeCompleto: "asc" },
    }),
    prisma.meta.findMany({
      include: { vendedor: true },
      orderBy: { dataInicio: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Metas"
        subtitulo="Meta da unidade (sem vendedor selecionado) ou meta individual por vendedor."
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/80">Meta dos vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={definirMetaVendedores} className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Aplica a mesma meta a todos os {vendedores.length} vendedores ativos, no mês e
                na semana atuais. Se já existir uma meta pro período, ela é atualizada.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="valorMensalVendedores">Meta mensal</Label>
                  <Input
                    id="valorMensalVendedores"
                    name="valorMensal"
                    type="number"
                    min={1}
                    required
                    className="h-9"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="valorSemanalVendedores">Meta semanal</Label>
                  <Input
                    id="valorSemanalVendedores"
                    name="valorSemanal"
                    type="number"
                    min={1}
                    required
                    className="h-9"
                  />
                </div>
              </div>
              <Button type="submit" className="h-9 w-fit">
                Aplicar a todos os vendedores
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/80">Meta da franquia</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={definirMetaFranquia} className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Meta da unidade inteira, no mês e na semana atuais. O realizado é sempre a soma
                das vendas de todos os vendedores no período.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="valorMensalFranquia">Meta mensal</Label>
                  <Input
                    id="valorMensalFranquia"
                    name="valorMensal"
                    type="number"
                    min={1}
                    required
                    className="h-9"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="valorSemanalFranquia">Meta semanal</Label>
                  <Input
                    id="valorSemanalFranquia"
                    name="valorSemanal"
                    type="number"
                    min={1}
                    required
                    className="h-9"
                  />
                </div>
              </div>
              <Button type="submit" className="h-9 w-fit">
                Salvar meta da franquia
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-foreground/80">Nova meta (individual ou personalizada)</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={criarMeta} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendedorId">Vendedor</Label>
              <select id="vendedorId" name="vendedorId" className={selectClass} defaultValue="unidade">
                <option value="unidade">Meta da unidade</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo">Tipo</Label>
              <select id="tipo" name="tipo" className={selectClass} defaultValue="MENSAL">
                <option value="MENSAL">Mensal</option>
                <option value="SEMANAL">Semanal</option>
                <option value="DIARIA">Diária</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valorMeta">Qtd. de vendas</Label>
              <Input id="valorMeta" name="valorMeta" type="number" min={1} required className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataInicio">Início</Label>
              <Input id="dataInicio" name="dataInicio" type="date" required className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataFim">Fim</Label>
              <Input id="dataFim" name="dataFim" type="date" required className="h-9" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="h-9 w-full">
                Criar meta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alvo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Período</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell className="font-medium text-foreground">
                    {meta.vendedor?.nomeCompleto ?? "Unidade"}
                  </TableCell>
                  <TableCell>{meta.tipo}</TableCell>
                  <TableCell>{meta.valorMeta}</TableCell>
                  <TableCell>
                    {formatarData(meta.dataInicio)} – {formatarData(meta.dataFim)}
                  </TableCell>
                  <TableCell>
                    <form action={excluirMeta}>
                      <input type="hidden" name="id" value={meta.id} />
                      <button
                        type="submit"
                        className="cursor-pointer text-xs text-red-500 underline transition-all hover:text-red-700 active:scale-95"
                      >
                        excluir
                      </button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {metas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    Nenhuma meta cadastrada ainda.
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
