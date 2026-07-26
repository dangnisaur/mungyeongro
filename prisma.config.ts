import { defineConfig } from "prisma/config";

// DATABASE_URL이 없으면(데모 모드) placeholder를 사용한다.
// 실제 DB 작업(db push/seed)은 .env에 Supabase URL을 채운 뒤 실행할 것.
const url =
  process.env.DATABASE_URL ?? "postgresql://demo:demo@localhost:5432/demo";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
