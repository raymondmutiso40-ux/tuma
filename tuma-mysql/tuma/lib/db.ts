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
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export function getPool(): mysql.Pool {
  if (!global.__tumaPool) {
    global.__tumaPool = createPool();
  }
  return global.__tumaPool;
}
