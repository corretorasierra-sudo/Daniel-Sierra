-- Adiciona o tipo de prospecção (filiação/refiliação) vindo da planilha de
-- vendas — vendas existentes assumem FILIACAO por padrão.

-- CreateEnum
CREATE TYPE "TipoProspeccao" AS ENUM ('FILIACAO', 'REFILIACAO');

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "tipoProspeccao" "TipoProspeccao" NOT NULL DEFAULT 'FILIACAO';
