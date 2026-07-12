"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function atualizarMinhaFoto(fotoUrl: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { erro: "Não autenticado." };
  }

  if (!fotoUrl.startsWith("data:image/")) {
    return { erro: "Foto inválida." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { fotoUrl },
  });

  revalidatePath("/vendedor");
}
