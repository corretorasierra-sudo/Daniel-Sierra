import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";

// Next.js 16 renomeou `middleware.ts` para `proxy.ts` (mesma função, arquivo
// na raiz de `src/`). Ver node_modules/next/dist/docs/.../file-conventions/proxy.md
//
// Protege rotas por papel:
//   /admin/**       -> ADMIN
//   /gerente/**     -> GERENTE + ADMIN
//   /coordenador/** -> COORDENADOR + ADMIN + GERENTE
//   /vendedor/**    -> VENDEDOR + ADMIN
//
// Esta é uma checagem otimista (lê só o JWT do cookie). Toda Server Action e
// leitura de dados sensível também deve validar a sessão de novo — ver
// src/lib/autorizacao.ts.

const REGRAS_POR_PREFIXO: { prefixo: string; permitido: Role[] }[] = [
  { prefixo: "/admin", permitido: ["ADMIN"] },
  { prefixo: "/gerente", permitido: ["ADMIN", "GERENTE"] },
  { prefixo: "/coordenador", permitido: ["ADMIN", "COORDENADOR", "GERENTE"] },
  { prefixo: "/vendedor", permitido: ["ADMIN", "VENDEDOR"] },
  { prefixo: "/metas", permitido: ["ADMIN", "GERENTE"] },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const regra = REGRAS_POR_PREFIXO.find((r) => pathname.startsWith(r.prefixo));
  if (!regra) return NextResponse.next();

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!regra.permitido.includes(session.user.role)) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/gerente/:path*",
    "/coordenador/:path*",
    "/vendedor/:path*",
    "/metas/:path*",
  ],
};
