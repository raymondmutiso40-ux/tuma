# tuma. — parcel pre-booking system

A fullstack Next.js 14 app for "book online, print a ticket, skip the counter
queue" for Kenyan bus/courier parcel desks (Easycoach, Modern Coast, Guardian
Angel). Backed by a real MySQL database — no Python anywhere in this project,
frontend or backend.

## Stack

- **Frontend + backend:** Next.js 14 (App Router), TypeScript, Tailwind — one
  codebase, API routes double as the backend
- **Database:** MySQL, via the `mysql2` driver (raw SQL, no ORM)
- **QR codes:** generated server-side with the `qrcode` npm package
- **Process manager (production):** PM2
- **Reverse proxy (production):** Nginx

## What's real vs simulated

**Real:** the full booking flow, all data persisted to MySQL, QR generation,
the `/verify/[ref]` counter-scan page.

**Simulated (clearly isolated so you can swap it in):**
- `/api/mpesa/stk` fakes a ~1.5s delay and marks the booking "paid" — it does
  not call Safaricom's Daraja API yet. Replace the body of this route with a
  real STK Push request + a callback route to receive Safaricom's
  confirmation.

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # fill in your local MySQL credentials
```

Create the database and load the schema:

```bash
mysql -u root -p -e "CREATE DATABASE tuma_db;"
mysql -u root -p tuma_db < schema.sql
```

Run it:

```bash
npm run dev
```

Open `http://localhost:3000`.

## 2. Deploying to Hostinger

This app needs a persistent Node.js process (it has live API routes and
server-rendered pages), so it needs a **Hostinger VPS or Cloud Hosting plan
with Node.js support** — not the basic shared hosting tier, which only serves
static files/PHP.

### Step 1 — Set up MySQL
In hPanel: **Databases → MySQL Databases** → create `tuma_db` and a user with
a strong password, grant it all privileges on that database. Note the host
(usually `localhost` if the app and DB are on the same VPS).

Import the schema — either through phpMyAdmin's "Import" tab with
`schema.sql`, or via SSH:
```bash
mysql -u tuma_user -p tuma_db < schema.sql
```

### Step 2 — Get the code onto the server
```bash
# on the VPS, via SSH
git clone <your-repo-url> tuma   # or scp the zip and unzip it
cd tuma
npm install
cp .env.example .env.local
nano .env.local   # fill in the real DB_HOST / DB_USER / DB_PASSWORD / DB_NAME
npm run build
```

### Step 3 — Run it with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed instructions so it survives reboots
```
This runs the app on port 3100 (edit `ecosystem.config.js` if you want a
different port, and update the DB credentials there too, or better, load them
from `.env.local` via `dotenv` — see note below).

### Step 4 — Point a domain/subdomain at it with Nginx
In hPanel, create a subdomain (e.g. `tuma.yourdomain.co.ke`) pointing at the
VPS. Then add an Nginx server block:

```nginx
server {
    listen 80;
    server_name tuma.yourdomain.co.ke;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;n
    }
}
```

Then get a free SSL certificate (Hostinger's hPanel has a one-click Let's
Encrypt option, or run `certbot --nginx -d tuma.yourdomain.co.ke` on the VPS).

### Note on secrets in `ecosystem.config.js`
The example file has plaintext DB credentials for simplicity. For anything
beyond a first pilot, remove them from the file and instead run:
```bash
pm2 start ecosystem.config.js --env production
```
with the real values exported in your shell environment, or load them with
the `dotenv` package inside `lib/db.ts` — either keeps secrets out of
whatever repo you push this to.

## 3. Project structure

```
app/
  page.tsx                    landing page
  book/page.tsx                booking wizard (client component)
  ticket/[ref]/page.tsx         generated ticket + QR (server component)
  verify/[ref]/page.tsx         counter-staff verification view
  api/bookings/route.ts          POST create a booking
  api/bookings/[ref]/route.ts    GET one booking, PATCH to verify
  api/mpesa/stk/route.ts         simulated M-Pesa STK push
lib/
  types.ts     Booking type, carrier list, destinations
  db.ts         MySQL connection pool (mysql2)
  store.ts      booking CRUD functions, all backed by MySQL
components/
  DepartureBoard.tsx  hero animation
  Ticket.tsx           shared ticket visual
  PrintButton.tsx      client-side window.print() trigger
schema.sql      run this once to create the bookings table
ecosystem.config.js  PM2 process config for the VPS
.env.example    copy to .env.local and fill in your DB credentials
```

## 4. Next steps toward a real pilot

1. Replace the simulated `/api/mpesa/stk` with a real Safaricom Daraja STK
   Push call, plus a callback route to receive payment confirmation.
2. Add an admin view per carrier so their staff can see all bookings routed
   to them, not just look up one ref at a time.
3. Move DB credentials out of `ecosystem.config.js` and into environment
   variables not committed to source control.
4. Add automated backups for the MySQL database (Hostinger hPanel has a
   scheduled backup option under Databases).
