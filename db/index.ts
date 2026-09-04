import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dns from "node:dns";
import * as schema from "./schema";

declare global {
  var __pgPool: Pool | undefined;
}

// Force IPv4 for DNS resolution
const originalLookup = dns.lookup;
// @ts-ignore
dns.lookup = (hostname: string, options: any, callback: any) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  const opts =
    typeof options === "object" ? { ...options, family: 4 } : { family: 4 };
  return originalLookup(hostname, opts, callback);
};

const connectionString = process.env.DATABASE_URL!;

const pool =
  globalThis.__pgPool ??
  new Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

export const db = drizzle(pool, { schema });
