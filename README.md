# CRM Cartão de Todos Guarabira

Camada interna de gestão comercial da franquia — metas, funil de leads, importação de
vendas com matching automático de vendedor, e acompanhamento pós-venda.

Ver `especificacao.md` para a spec completa (regras de negócio, modelo de dados, telas).

## Stack

Next.js 16 (App Router) + TypeScript, Prisma 7 (Postgres), Auth.js v5 (Credentials),
Tailwind CSS v4, SheetJS (`xlsx`) para importação de planilha.

## Setup local

1. Instale as dependências (já feito se você clonou este repo pronto):

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: connection string do Postgres (Neon, Supabase, ou local).
   - `AUTH_SECRET`: gere com `openssl rand -base64 32`.

3. Gere o client do Prisma e crie as tabelas no banco:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Popule o banco com dados de teste (1 Admin, 1 Gerente, 1 Coordenador, 2 Vendedores,
   metas do mês, leads de exemplo e vendas com pós-venda):

   ```bash
   npx prisma db seed
   ```

   Todos os usuários do seed usam a senha `senha123` — os e-mails aparecem no log do
   comando.

5. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000) e faça login com um dos
   usuários do seed. Você é redirecionado automaticamente pra home do seu papel.

## Estrutura

- `prisma/schema.prisma` — modelo de dados.
- `prisma.config.ts` — configuração do Prisma 7 (substitui a antiga seção no
  `package.json`; connection string de Migrate/seed vem daqui, lendo `.env`).
- `src/auth.ts` — Auth.js v5 (Credentials + JWT, injeta `role`/`vendedorId` na sessão).
- `src/proxy.ts` — proteção de rota por papel (equivalente ao antigo `middleware.ts` —
  Next.js 16 renomeou o arquivo pra `proxy.ts`).
- `src/lib/metricas.ts` — cálculos puros de meta/projeção/ranking, reusados pelas
  homes e relatórios.
- `src/lib/matching.ts` — matching de nome de vendedor (planilha → cadastro) usado na
  importação de vendas.
- `src/app/(rotas por papel)` — `admin/`, `coordenador/`, `vendedor/`, `gerente/`,
  `metas/`, cada uma protegida por `src/lib/autorizacao.ts` além do `proxy.ts`.

## Notas de versão (Next 16 / Prisma 7 / Auth.js v5)

Este projeto usa versões bem recentes dessas três libs, com mudanças relevantes em
relação ao que normalmente se encontra em tutoriais:

- Next.js renomeou `middleware.ts` para `proxy.ts` (mesma função).
- Prisma 7 não lê mais `datasource.url` no `schema.prisma` — a connection string do
  Prisma Client vem de um *driver adapter* (`@prisma/adapter-pg`, ver
  `src/lib/prisma.ts`), e a do Migrate/seed vem de `prisma.config.ts`.
- Auth.js v5 usa `NextAuth({...})` num único `auth.ts` na raiz de `src/`, exportando
  `handlers`, `auth`, `signIn`, `signOut`.
