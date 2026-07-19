"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirRole } from "@/lib/autorizacao";
import { DIAS_SEMANA } from "@/lib/promocoes";

/** Salva a promoção de cada dia da semana de uma vez. Dia com texto em
 *  branco apaga a promoção (volta a não ter promoção naquele dia). */
export async function salvarPromocoesDaSemana(formData: FormData) {
  const session = await exigirRole("ADMIN", "GERENTE", "COORDENADOR");

  await Promise.all(
    DIAS_SEMANA.map(async ({ valor: diaSemana }) => {
      const texto = String(formData.get(`dia-${diaSemana}`) ?? "").trim();

      if (!texto) {
        await prisma.promocaoDia.deleteMany({ where: { diaSemana } });
        return;
      }

      await prisma.promocaoDia.upsert({
        where: { diaSemana },
        create: { diaSemana, texto, atualizadoPorId: session.user.id },
        update: { texto, atualizadoPorId: session.user.id },
      });
    })
  );

  revalidatePath("/promocoes");
  revalidatePath("/vendedor");
}
