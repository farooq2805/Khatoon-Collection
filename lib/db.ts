import { Pool } from "pg";

// Postgres connection shared with the store API (same database, separate
// "storefront" schema so the API's Prisma migrations never touch our tables).
const globalForPg = globalThis as unknown as { kcPool?: Pool };

export function db(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!globalForPg.kcPool) {
    globalForPg.kcPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  }
  return globalForPg.kcPool;
}

let schemaReady: Promise<void> | null = null;

/** Creates the storefront tables on first use (idempotent). */
export function ensureStorefrontSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = db()
      .query(
        `CREATE SCHEMA IF NOT EXISTS storefront;
         CREATE TABLE IF NOT EXISTS storefront.checkout_prospects (
           id            BIGSERIAL PRIMARY KEY,
           token         UUID NOT NULL UNIQUE,
           full_name     TEXT,
           phone         TEXT,
           email         TEXT,
           address_line1 TEXT,
           address_line2 TEXT,
           city          TEXT,
           state         TEXT,
           pincode       TEXT,
           cart_items    JSONB NOT NULL DEFAULT '[]',
           cart_total    NUMERIC(12,2),
           status        TEXT NOT NULL DEFAULT 'pending',
           created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
           updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS checkout_prospects_created_idx ON storefront.checkout_prospects (created_at DESC);`
      )
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}
