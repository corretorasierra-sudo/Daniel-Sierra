-- Marca vendedores que na verdade são canais de venda (ex: site institucional)
-- cadastrados só pra vincular vendas importadas — não contam em ranking nem
-- em meta da unidade, e o pós-venda deles é gerido só por gestor/coordenador.

-- AlterTable
ALTER TABLE "vendedores" ADD COLUMN     "virtual" BOOLEAN NOT NULL DEFAULT false;
