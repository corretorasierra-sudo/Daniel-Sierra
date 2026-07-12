import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.ts";

async function hash(senha: string) {
  return bcrypt.hash(senha, 10);
}

function inicioMes(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function fimMes(data: Date) {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59);
}

function diasAtras(dias: number) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data;
}

async function main() {
  console.log("Seed: limpando dados existentes...");
  await prisma.historicoEtapaLead.deleteMany();
  await prisma.atividade.deleteMany();
  await prisma.acompanhamentoPosVenda.deleteMany();
  await prisma.venda.deleteMany();
  await prisma.pendenciaImportacao.deleteMany();
  await prisma.importacaoVenda.deleteMany();
  await prisma.importacaoLead.deleteMany();
  await prisma.vendedorAliasVenda.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.meta.deleteMany();
  await prisma.vendedor.deleteMany();
  await prisma.user.deleteMany();

  const senhaPadrao = await hash("senha123");

  console.log("Seed: criando usuários...");
  const admin = await prisma.user.create({
    data: {
      nome: "Daniel Sierra",
      email: "corretorasierra@gmail.com",
      senhaHash: senhaPadrao,
      role: "ADMIN",
    },
  });

  const gerente = await prisma.user.create({
    data: {
      nome: "Marcos Andrade",
      email: "gerente@cartaodetodos.local",
      senhaHash: senhaPadrao,
      role: "GERENTE",
    },
  });

  const coordenador = await prisma.user.create({
    data: {
      nome: "Fernanda Lopes",
      email: "coordenacao@cartaodetodos.local",
      senhaHash: senhaPadrao,
      role: "COORDENADOR",
    },
  });

  const vendedor1 = await prisma.vendedor.create({
    data: {
      nomeCompleto: "Joana Pereira da Silva",
      telefone: "83988887777",
      user: {
        create: {
          nome: "Joana Pereira da Silva",
          email: "joana.vendedora@cartaodetodos.local",
          senhaHash: senhaPadrao,
          role: "VENDEDOR",
        },
      },
    },
    include: { user: true },
  });

  const vendedor2 = await prisma.vendedor.create({
    data: {
      nomeCompleto: "Carlos Eduardo Souza",
      telefone: "83988886666",
      user: {
        create: {
          nome: "Carlos Eduardo Souza",
          email: "carlos.vendedor@cartaodetodos.local",
          senhaHash: senhaPadrao,
          role: "VENDEDOR",
        },
      },
    },
    include: { user: true },
  });

  console.log("Seed: criando metas do mês corrente...");
  const hoje = new Date();
  await prisma.meta.create({
    data: {
      vendedorId: null,
      tipo: "MENSAL",
      valorMeta: 40,
      dataInicio: inicioMes(hoje),
      dataFim: fimMes(hoje),
    },
  });
  await prisma.meta.create({
    data: {
      vendedorId: vendedor1.id,
      tipo: "MENSAL",
      valorMeta: 20,
      dataInicio: inicioMes(hoje),
      dataFim: fimMes(hoje),
    },
  });
  await prisma.meta.create({
    data: {
      vendedorId: vendedor2.id,
      tipo: "MENSAL",
      valorMeta: 20,
      dataInicio: inicioMes(hoje),
      dataFim: fimMes(hoje),
    },
  });

  console.log("Seed: criando leads de exemplo...");
  const leadsVendedor1 = [
    { nome: "Ana Beatriz Costa", telefone: "83999990001", etapa: "NOVO" as const },
    { nome: "Roberto Nascimento", telefone: "83999990002", etapa: "NOVO" as const },
    { nome: "Patrícia Gomes", telefone: "83999990003", etapa: "EM_TRATATIVA" as const },
    { nome: "Lucas Farias", telefone: "83999990004", etapa: "EM_TRATATIVA" as const },
    { nome: "Vanessa Ribeiro", telefone: "83999990005", etapa: "EM_TRATATIVA" as const },
  ];

  const leadsVendedor2 = [
    { nome: "Marcelo Tavares", telefone: "83999990006", etapa: "NOVO" as const },
    { nome: "Camila Duarte", telefone: "83999990007", etapa: "EM_TRATATIVA" as const },
    { nome: "Diego Barbosa", telefone: "83999990008", etapa: "FECHAMENTO" as const },
    { nome: "Juliana Martins", telefone: "83999990009", etapa: "PERDIDO" as const },
  ];

  for (const [i, lead] of leadsVendedor1.entries()) {
    await prisma.lead.create({
      data: {
        ...lead,
        cidade: "Guarabira",
        origem: "Indicação",
        vendedorId: vendedor1.id,
        dataEntrada: diasAtras(10 - i),
        dataUltimoContato: lead.etapa === "NOVO" ? null : diasAtras(2 + i),
        proximaAcao: "Ligar novamente",
        proximaAcaoData: diasAtras(-1),
      },
    });
  }

  for (const [i, lead] of leadsVendedor2.entries()) {
    await prisma.lead.create({
      data: {
        ...lead,
        cidade: "Guarabira",
        origem: "Panfletagem",
        vendedorId: vendedor2.id,
        dataEntrada: diasAtras(12 - i),
        dataUltimoContato: lead.etapa === "NOVO" ? null : diasAtras(3 + i),
        proximaAcao: lead.etapa === "FECHAMENTO" ? "Confirmar pagamento" : "Follow-up",
        proximaAcaoData: lead.etapa === "PERDIDO" ? null : diasAtras(-1),
      },
    });
  }

  console.log("Seed: criando vendas + acompanhamento pós-venda...");
  const venda1 = await prisma.venda.create({
    data: {
      clienteNome: "Sebastião Alves Ferreira",
      clienteTelefone: "83999991111",
      vendedorId: vendedor1.id,
      dataVenda: diasAtras(5),
      produto: "Cartão de Todos Família",
      valor: 89.9,
      tipoProspeccao: "FILIACAO",
      codigoExterno: `PB526${vendedor1.id.slice(-6)}`,
    },
  });
  await prisma.acompanhamentoPosVenda.create({
    data: {
      vendaId: venda1.id,
      appBaixado: true,
      consultaMarcada: false,
      orientacoesRecebidas: true,
      indicacaoRecebida: true,
      dataUltimoAcompanhamento: diasAtras(2),
      proximaAcao: "Confirmar consulta marcada",
    },
  });

  const venda2 = await prisma.venda.create({
    data: {
      clienteNome: "Maria do Carmo Xavier",
      clienteTelefone: "83999992222",
      vendedorId: vendedor2.id,
      dataVenda: diasAtras(2),
      produto: "Cartão de Todos Individual",
      valor: 49.9,
      tipoProspeccao: "REFILIACAO",
      codigoExterno: `PB526${vendedor2.id.slice(-6)}`,
    },
  });
  await prisma.acompanhamentoPosVenda.create({
    data: {
      vendaId: venda2.id,
      appBaixado: false,
      consultaMarcada: false,
      orientacoesRecebidas: false,
      indicacaoRecebida: false,
    },
  });

  console.log("Seed concluído.");
  console.log("Login de todos os usuários criados: senha \"senha123\"");
  console.log(
    [admin, gerente, coordenador, vendedor1.user, vendedor2.user]
      .map((u) => `  - ${u.role.padEnd(11)} ${u.email}`)
      .join("\n")
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
