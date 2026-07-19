-- CreateTable
CREATE TABLE "promocoes_dia" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "atualizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promocoes_dia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promocoes_dia_diaSemana_key" ON "promocoes_dia"("diaSemana");

-- AddForeignKey
ALTER TABLE "promocoes_dia" ADD CONSTRAINT "promocoes_dia_atualizadoPorId_fkey" FOREIGN KEY ("atualizadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
