import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import dns from "node:dns";

dotenv.config({ path: ".env" });

// Force IPv4 for DNS resolution
const originalLookup = dns.lookup;
// @ts-ignore
dns.lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  options = { ...(typeof options === "object" ? options : {}), family: 4 };
  // @ts-ignore
  return originalLookup(hostname, options, callback);
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
