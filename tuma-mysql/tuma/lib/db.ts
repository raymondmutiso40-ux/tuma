import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __tumaPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase's pooled connection (port 6543, "Transaction" mode) requires
    // SSL. Vercel runs each request on a serverless function instance, not
    // one long-lived server, so keep max small — warm instances reuse this
    // pool via `global.__tumaPool` below.
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.DB_CONNECTION_LIMIT || 3),
  });
}

export function getPool(): Pool {
  if (!global.__tumaPool) {
    global.__tumaPool = createPool();
  }
  return global.__tumaPool;
}
