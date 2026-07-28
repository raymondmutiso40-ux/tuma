import mysql from "mysql2/promise";

// A single shared connection pool for the whole app. mysql2 handles
// connection reuse/queueing internally, so this is safe to import
// from multiple API routes and server components.

declare global {
  // eslint-disable-next-line no-var
  var __tumaPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    // Vercel runs each request on a serverless function instance, not one
    // long-lived server, so keep the per-instance pool small. Warm
    // instances reuse this pool via `global.__tumaPool` below.
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 3),
    queueLimit: 0,
    // TiDB Serverless (and most hosted MySQL) requires TLS. Set DB_SSL=true
    // in your environment variables to enable it; leave unset for a local
    // MySQL instance that doesn't use TLS.
    ssl:
      process.env.DB_SSL === "true"
        ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
        : undefined,
  });
}

export function getPool(): mysql.Pool {
  if (!global.__tumaPool) {
    global.__tumaPool = createPool();
  }
  return global.__tumaPool;
}
