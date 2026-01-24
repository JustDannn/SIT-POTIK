import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dns from "node:dns";
import * as schema from "./schema";

// Force IPv4 for DNS resolution
const originalLookup = dns.lookup;
// @ts-ignore
dns.lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  options = { ...options, family: 4 };
  return originalLookup(hostname, options, callback);
};

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });
