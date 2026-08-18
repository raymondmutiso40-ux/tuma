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
  page.tsx                     landing page
  book/page.tsx                 booking flow, 5 steps (client component)
  track/page.tsx                public "where's my parcel" lookup
  ticket/[ref]/page.tsx          generated ticket + QR (server component)
  verify/[ref]/page.tsx          counter-staff verification view
  admin/page.tsx                 operations dashboard (auth required)
  admin/login/page.tsx           Google sign-in for staff
  terms, privacy                 prototype legal pages
  error.tsx, not-found.tsx       friendly failure + 404 screens
  api/bookings/route.ts           POST create a booking
  api/bookings/[ref]/route.ts     GET one booking, PATCH to verify
  api/admin/bookings/route.ts     GET all / PATCH status (admin only)
  api/mpesa/stk/route.ts          M-Pesa STK push
lib/
  types.ts      Booking type, carrier list, destinations
  db.ts          connection pool
  store.ts       booking CRUD functions
  status.ts      status → label/tone, and the derived parcel journey
  format.ts      currency/date/phone formatting (locale + TZ pinned)
  cn.ts          class-name joiner
components/
  ui/            design-system primitives (see below)
  SiteHeader / SiteFooter   shared navigation and footer
  HeroVideo.tsx             the 3D animation, lazily loaded
  PhotoCapture.tsx          parcel photo capture + downscaling
  StepIndicator.tsx         booking progress
  Ticket / TicketActions    the QR ticket and its print/share actions
  BookingTimeline.tsx       booked → paid → accepted → in transit
  TrackParcel.tsx           tracking lookup + results
  StatusBadge, Logo, DepartureBoard
schema.sql      run this once to create the bookings table
ecosystem.config.js  PM2 process config for the VPS
.env.example    copy to .env.local and fill in your DB credentials
```

### Design system

Every screen is built from the same primitives in `components/ui` — `Button`,
`Card`, `Field`/`Input`/`Select`, `Badge`, `Alert`, `Skeleton`, `EmptyState`,
`Reveal` and the inline `icons` set. Colour, type, radii, shadows and the
animation keyframes all live in `tailwind.config.ts`; `app/globals.css` holds
the base layer, the focus treatment, the skeleton shimmer and the
reduced-motion and print rules.

Three things worth knowing before you add a screen:

- `amber` is a 2:1 colour on white. Use it on dark surfaces or as a non-text
  fill; for amber text on a light background use `amber-700`.
- Status is never communicated by colour alone — `StatusBadge` pairs the tone
  with a label and a dot, and `BookingTimeline` uses distinct icons per state.
- Tailwind opacity modifiers must be **multiples of 5**. `bg-ink-950/75` is
  fine; `bg-ink-950/72` compiles to nothing at all, with no build warning. Use
  bracket syntax (`/[0.72]`) if you genuinely need something in between.

The 3D animation at `public/hero-3d.mp4` (1280×720) is the background of the
landing hero: `<HeroVideo />` renders as an absolute fill behind the hero copy
and carries its own scrim — heavy on the left where the text sits, light on the
right so the animation shows through. It is not requested until it nears the
viewport, is muted and `playsInline`, and falls back to a branded gradient for
anyone with reduced motion enabled or a browser that can't decode it. To add a
first-frame poster image, drop one in `public/` and pass it as
`<HeroVideo poster="/hero-poster.jpg" />`.

## 4. Next steps toward a real pilot

1. Replace the simulated `/api/mpesa/stk` with a real Safaricom Daraja STK
   Push call, plus a callback route to receive payment confirmation.
2. Add an admin view per carrier so their staff can see all bookings routed
   to them, not just look up one ref at a time.
3. Move DB credentials out of `ecosystem.config.js` and into environment
   variables not committed to source control.
4. Add automated backups for the MySQL database (Hostinger hPanel has a
   scheduled backup option under Databases).
