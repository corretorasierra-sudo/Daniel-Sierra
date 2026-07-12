-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GERENTE', 'COORDENADOR', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "EtapaLead" AS ENUM ('NOVO', 'CONTATO_REALIZADO', 'EM_TRATATIVA', 'INTERESSADO', 'FECHAMENTO', 'PERDIDO', 'SEM_RESPOSTA');

-- CreateEnum
CREATE TYPE "TipoAtividade" AS ENUM ('LIGACAO', 'MENSAGEM', 'WHATSAPP', 'RETORNO_AGENDADO', 'PRESENCIAL', 'OBSERVACAO');

-- CreateEnum
CREATE TYPE "TipoMeta" AS ENUM ('MENSAL', 'SEMANAL', 'DIARIA');

-- CreateEnum
CREATE TYPE "StatusImportacao" AS ENUM ('PROCESSANDO', 'CONCLUIDA', 'CONCLUIDA_COM_PENDENCIAS', 'ERRO');

-- CreateEnum
CREATE TYPE "StatusVenda" AS ENUM ('ATIVA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusPendencia" AS ENUM ('PENDENTE', 'RESOLVIDA');

-- CreateEnum
CREATE TYPE "MotivoPendencia" AS ENUM ('VENDEDOR_NAO_ENCONTRADO', 'DADOS_AUSENTES', 'DUPLICADO_AMBIGUO', 'OUTRO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "fotoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendedores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "coordenadorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL,
    "vendedorId" TEXT,
    "tipo" "TipoMeta" NOT NULL,
    "valorMeta" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "clienteTelefone" TEXT,
    "vendedorId" TEXT NOT NULL,
    "dataVenda" TIMESTAMP(3) NOT NULL,
    "produto" TEXT,
    "valor" DECIMAL(12,2),
    "status" "StatusVenda" NOT NULL DEFAULT 'ATIVA',
    "codigoExterno" TEXT,
    "chaveDedupe" TEXT,
    "origemImportacaoId" TEXT,
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "importacoes_venda" (
    "id" TEXT NOT NULL,
    "arquivoNome" TEXT NOT NULL,
    "importadoPorId" TEXT NOT NULL,
    "status" "StatusImportacao" NOT NULL DEFAULT 'PROCESSANDO',
    "totalLidos" INTEGER NOT NULL DEFAULT 0,
    "totalInseridos" INTEGER NOT NULL DEFAULT 0,
    "totalDuplicados" INTEGER NOT NULL DEFAULT 0,
    "totalErros" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "importacoes_venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendencias_importacao" (
    "id" TEXT NOT NULL,
    "importacaoId" TEXT NOT NULL,
    "linhaOriginal" JSONB NOT NULL,
    "motivo" "MotivoPendencia" NOT NULL,
    "nomePlanilha" TEXT,
    "status" "StatusPendencia" NOT NULL DEFAULT 'PENDENTE',
    "resolvidoPorId" TEXT,
    "vendedorCorrigidoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvidoEm" TIMESTAMP(3),

    CONSTRAINT "pendencias_importacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendedor_alias_venda" (
    "id" TEXT NOT NULL,
    "nomePlanilha" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendedor_alias_venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cidade" TEXT,
    "origem" TEXT,
    "vendedorId" TEXT,
    "etapa" "EtapaLead" NOT NULL DEFAULT 'NOVO',
    "observacoes" TEXT,
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataUltimoContato" TIMESTAMP(3),
    "proximaAcao" TEXT,
    "proximaAcaoData" TIMESTAMP(3),
    "indicadoPor" TEXT,
    "origemImportacaoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_etapa_lead" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "etapaAnterior" "EtapaLead",
    "etapaNova" "EtapaLead" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "historico_etapa_lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "tipo" "TipoAtividade" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultado" TEXT,
    "observacao" TEXT,
    "proximaAcao" TEXT,
    "proximaAcaoData" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "importacoes_lead" (
    "id" TEXT NOT NULL,
    "arquivoNome" TEXT NOT NULL,
    "importadoPorId" TEXT NOT NULL,
    "status" "StatusImportacao" NOT NULL DEFAULT 'PROCESSANDO',
    "totalLidos" INTEGER NOT NULL DEFAULT 0,
    "totalInseridos" INTEGER NOT NULL DEFAULT 0,
    "totalDuplicados" INTEGER NOT NULL DEFAULT 0,
    "totalErros" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "importacoes_lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acompanhamento_pos_venda" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "appBaixado" BOOLEAN NOT NULL DEFAULT false,
    "consultaMarcada" BOOLEAN NOT NULL DEFAULT false,
    "orientacoesRecebidas" BOOLEAN NOT NULL DEFAULT false,
    "indicacoesRecebidas" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "pendencias" TEXT,
    "dataUltimoAcompanhamento" TIMESTAMP(3),
    "proximaAcao" TEXT,
    "proximaAcaoData" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acompanhamento_pos_venda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendedores_userId_key" ON "vendedores"("userId");

-- CreateIndex
CREATE INDEX "vendedores_nomeCompleto_idx" ON "vendedores"("nomeCompleto");

-- CreateIndex
CREATE INDEX "metas_vendedorId_dataInicio_dataFim_idx" ON "metas"("vendedorId", "dataInicio", "dataFim");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_codigoExterno_key" ON "vendas"("codigoExterno");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_chaveDedupe_key" ON "vendas"("chaveDedupe");

-- CreateIndex
CREATE INDEX "vendas_vendedorId_dataVenda_idx" ON "vendas"("vendedorId", "dataVenda");

-- CreateIndex
CREATE UNIQUE INDEX "vendedor_alias_venda_nomePlanilha_key" ON "vendedor_alias_venda"("nomePlanilha");

-- CreateIndex
CREATE UNIQUE INDEX "leads_telefone_key" ON "leads"("telefone");

-- CreateIndex
CREATE INDEX "leads_vendedorId_etapa_idx" ON "leads"("vendedorId", "etapa");

-- CreateIndex
CREATE INDEX "atividades_leadId_idx" ON "atividades"("leadId");

-- CreateIndex
CREATE INDEX "atividades_vendedorId_dataHora_idx" ON "atividades"("vendedorId", "dataHora");

-- CreateIndex
CREATE UNIQUE INDEX "acompanhamento_pos_venda_vendaId_key" ON "acompanhamento_pos_venda"("vendaId");

-- AddForeignKey
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_origemImportacaoId_fkey" FOREIGN KEY ("origemImportacaoId") REFERENCES "importacoes_venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "importacoes_venda" ADD CONSTRAINT "importacoes_venda_importadoPorId_fkey" FOREIGN KEY ("importadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendencias_importacao" ADD CONSTRAINT "pendencias_importacao_importacaoId_fkey" FOREIGN KEY ("importacaoId") REFERENCES "importacoes_venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendencias_importacao" ADD CONSTRAINT "pendencias_importacao_resolvidoPorId_fkey" FOREIGN KEY ("resolvidoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendencias_importacao" ADD CONSTRAINT "pendencias_importacao_vendedorCorrigidoId_fkey" FOREIGN KEY ("vendedorCorrigidoId") REFERENCES "vendedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendedor_alias_venda" ADD CONSTRAINT "vendedor_alias_venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_origemImportacaoId_fkey" FOREIGN KEY ("origemImportacaoId") REFERENCES "importacoes_lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_etapa_lead" ADD CONSTRAINT "historico_etapa_lead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_etapa_lead" ADD CONSTRAINT "historico_etapa_lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "importacoes_lead" ADD CONSTRAINT "importacoes_lead_importadoPorId_fkey" FOREIGN KEY ("importadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acompanhamento_pos_venda" ADD CONSTRAINT "acompanhamento_pos_venda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
