-- Simplifica o funil de leads pra 4 etapas (kanban) e troca a "quantidade de
-- indicações" do pós-venda por um simples sim/não, pra bater com o novo
-- checklist em lista. As linhas de UPDATE abaixo rodam ANTES das mudanças de
-- schema, pra nenhum dado existente ficar órfão.

-- Dados que estavam nas etapas removidas viram "em tratativa".
UPDATE "leads" SET "etapa" = 'EM_TRATATIVA'
  WHERE "etapa" IN ('CONTATO_REALIZADO', 'INTERESSADO', 'SEM_RESPOSTA');
UPDATE "historico_etapa_lead" SET "etapaAnterior" = 'EM_TRATATIVA'
  WHERE "etapaAnterior" IN ('CONTATO_REALIZADO', 'INTERESSADO', 'SEM_RESPOSTA');
UPDATE "historico_etapa_lead" SET "etapaNova" = 'EM_TRATATIVA'
  WHERE "etapaNova" IN ('CONTATO_REALIZADO', 'INTERESSADO', 'SEM_RESPOSTA');

-- AlterEnum
BEGIN;
CREATE TYPE "EtapaLead_new" AS ENUM ('NOVO', 'EM_TRATATIVA', 'FECHAMENTO', 'PERDIDO');
ALTER TABLE "public"."leads" ALTER COLUMN "etapa" DROP DEFAULT;
ALTER TABLE "leads" ALTER COLUMN "etapa" TYPE "EtapaLead_new" USING ("etapa"::text::"EtapaLead_new");
ALTER TABLE "historico_etapa_lead" ALTER COLUMN "etapaAnterior" TYPE "EtapaLead_new" USING ("etapaAnterior"::text::"EtapaLead_new");
ALTER TABLE "historico_etapa_lead" ALTER COLUMN "etapaNova" TYPE "EtapaLead_new" USING ("etapaNova"::text::"EtapaLead_new");
ALTER TYPE "EtapaLead" RENAME TO "EtapaLead_old";
ALTER TYPE "EtapaLead_new" RENAME TO "EtapaLead";
DROP TYPE "public"."EtapaLead_old";
ALTER TABLE "leads" ALTER COLUMN "etapa" SET DEFAULT 'NOVO';
COMMIT;

-- AlterTable: indicacoesRecebidas (quantidade) -> indicacaoRecebida (sim/não)
ALTER TABLE "acompanhamento_pos_venda" ADD COLUMN "indicacaoRecebida" BOOLEAN NOT NULL DEFAULT false;
UPDATE "acompanhamento_pos_venda" SET "indicacaoRecebida" = true WHERE "indicacoesRecebidas" > 0;
ALTER TABLE "acompanhamento_pos_venda" DROP COLUMN "indicacoesRecebidas";
