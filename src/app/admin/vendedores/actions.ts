"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirRole } from "@/lib/autorizacao";

const criarVendedorSchema = z.object({
  nomeCompleto: z.string().trim().min(3, "Informe o nome completo."),
  telefone: z.string().trim().optional(),
  email: z.email("E-mail inválido."),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export type EstadoFormVendedor = { erro?: string } | undefined;

export async function criarVendedor(
  _estado: EstadoFormVendedor,
  formData: FormData
): Promise<EstadoFormVendedor> {
  await exigirRole("ADMIN");

  const dados = criarVendedorSchema.safeParse({
    nomeCompleto: formData.get("nomeCompleto"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { nomeCompleto, telefone, email, senha } = dados.data;

  const emailExistente = await prisma.user.findUnique({ where: { email } });
  if (emailExistente) {
    return { erro: "Já existe um usuário com esse e-mail." };
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.user.create({
    data: {
      nome: nomeCompleto,
      email,
      senhaHash,
      role: "VENDEDOR",
      vendedor: {
        create: {
          nomeCompleto,
          telefone: telefone || null,
        },
      },
    },
  });

  revalidatePath("/admin/vendedores");
  return undefined;
}

const atualizarVendedorSchema = z.object({
  id: z.string().min(1),
  nomeCompleto: z.string().trim().min(3, "Informe o nome completo."),
  telefone: z.string().trim().optional(),
});

export async function atualizarVendedor(formData: FormData) {
  await exigirRole("ADMIN");

  const dados = atualizarVendedorSchema.parse({
    id: formData.get("id"),
    nomeCompleto: formData.get("nomeCompleto"),
    telefone: formData.get("telefone"),
  });

  await prisma.vendedor.update({
    where: { id: dados.id },
    data: {
      nomeCompleto: dados.nomeCompleto,
      telefone: dados.telefone || null,
      user: { update: { nome: dados.nomeCompleto } },
    },
  });

  revalidatePath("/admin/vendedores");
}

export async function alternarAtivoVendedor(formData: FormData) {
  await exigirRole("ADMIN");

  const id = String(formData.get("id"));
  const vendedor = await prisma.vendedor.findUniqueOrThrow({ where: { id } });
  const novoStatus = !vendedor.ativo;

  await prisma.vendedor.update({
    where: { id },
    data: {
      ativo: novoStatus,
      user: { update: { ativo: novoStatus } },
    },
  });

  revalidatePath("/admin/vendedores");
}
