/**
 * PM2 process config for running the app on a VPS.
 *
 * Deliberately contains no credentials. This file previously set DB_HOST,
 * DB_PORT, DB_USER, DB_PASSWORD and DB_NAME — MySQL-era names that no code
 * reads — while the variable the app actually needs, DATABASE_URL, was never
 * set at all. Anything started from it came up with no database, no Google
 * credentials and no M-Pesa keys.
 *
 * Configuration lives in `.env.local` next to this file. Next.js loads that
 * automatically under `next start`, so PM2 does not need to pass anything
 * through, and secrets stay out of source control. See `.env.example` for the
 * full list.
 *
 *   cp .env.example .env.local && nano .env.local
 *   npm run build
 *   pm2 start ecosystem.config.js && pm2 save
 */
module.exports = {
  apps: [
    {
      name: "tuma",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3100",
      // Must stay __dirname: it is how Next finds .env.local.
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
