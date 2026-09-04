import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dns from "node:dns";
import * as schema from "./schema";

// Prefer IPv4 for dual-stack environments without breaking IPv6-only hosts
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Please ensure DATABASE_URL is defined in your environment or .env file."
  );
}

// Disable SSL only for local development on localhost/127.0.0.1
const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

declare global {
  // eslint-disable-next-line no-var
  var __potik_db_pool: Pool | undefined;
}

// Use a global pool instance in development to prevent connection exhaustion during hot-reloads
export const pool =
  globalThis.__potik_db_pool ??
  new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__potik_db_pool = pool;
}

export const db = drizzle(pool, { schema });

