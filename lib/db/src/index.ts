import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: any;

try {
  if (!process.env.DATABASE_URL) {
    console.warn("[AI Studio] DATABASE_URL not set — using mock database");
    const noOp = {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      create: async (d: any) => d?.data ?? {},
      update: async (d: any) => d?.data ?? {},
      delete: async () => ({}),
    };
    db = new Proxy(
      {},
      {
        get: (_, prop) =>
          prop === "query" ? new Proxy({}, { get: () => noOp }) : async () => [],
      },
    );
  } else {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
} catch {
  console.warn("[AI Studio] Database not connected — using mock");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  db = new Proxy(
    {},
    {
      get: (_, prop) =>
        prop === "query" ? new Proxy({}, { get: () => noOp }) : async () => [],
    },
  );
}

export { pool, db };

export * from "./schema";
