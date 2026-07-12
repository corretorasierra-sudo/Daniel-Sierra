import { defineConfig, env } from "prisma/config";
import path from "node:path";

// Prisma 7 config file — substitui as antigas seções de config no package.json.
// Em Prisma 7 a connection string de Migrate/Studio não fica mais em
// `datasource.url` no schema.prisma, e sim aqui.
// https://pris.ly/prisma-config
//
// Este arquivo é executado diretamente pela Prisma CLI antes de qualquer
// carregamento automático de `.env`, então carregamos manualmente aqui.
try {
  process.loadEnvFile(path.join(import.meta.dirname, ".env"));
} catch {
  // .env ausente é aceitável (ex.: variáveis já vêm do ambiente/deploy)
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "node --experimental-strip-types --experimental-transform-types prisma/seed.ts",
  },
});
