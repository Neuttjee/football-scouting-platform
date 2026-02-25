# Vercel & Neon Setup Handleiding

Omdat Azure App Service Free Tier erg streng is qua build resources (wat vaak leidt tot memory/CPU time-outs bij Next.js apps) en het hosten van lokale SQLite bestanden op serverless/PaaS platforms problematisch is (vanwege het ontbreken van persistente storage of gelimiteerde concurrency), zijn we gemigreerd naar **Vercel** als hosting provider en **Neon** als serverless PostgreSQL database.

Deze guide helpt je om je omgeving op te zetten.

---

## 1. Database Setup met Neon (PostgreSQL)
We hebben PostgreSQL nodig omdat we geen lokaal bestand (zoals SQLite) kunnen gebruiken in een serverless omgeving zoals Vercel.

1. Ga naar [Neon.tech](https://neon.tech) en maak een gratis account aan.
2. Maak een nieuw project aan (bijv. `football-scouting`).
3. Ga in je Neon project naar het **Dashboard** en kopieer de `Connection String` (dit is een URL die begint met `postgresql://...`). Let op dat je de pooling connectie (`pooler`) gebruikt als Neon dit adviseert, óf de directe connectie. Voor Prisma met Neon wordt tegenwoordig vaak direct aangeraden indien je Edge functies vermijdt, maar Neon heeft een specifieke Prisma guide in hun dashboard.
4. **Branches (Optioneel maar handig):** Neon ondersteunt database branches. Je kunt een branch maken voor `dev` en een branch voor `main` (prod). Dit geeft je gescheiden databases per omgeving.

---

## 2. Vercel Hosting Setup
Vercel neemt al het werk van GitHub Actions over.

1. Ga naar [Vercel.com](https://vercel.com) en maak een account aan met je GitHub account.
2. Klik op **Add New... > Project**.
3. Importeer je repository `Neuttjee/football-scouting-platform`.
4. Klap de sectie **Environment Variables** open *voordat* je op Deploy klikt.

Vul de volgende Environment Variables in voor de **Production** environment in Vercel:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | *De connectiestring uit Neon (voor je Prod branch)* |
| `SESSION_SECRET` | *Genereer een willekeurige lange string (bijv. `openssl rand -base64 32`)* |
| `SMTP_HOST` | *Jouw SMTP host* |
| `SMTP_PORT` | *Jouw SMTP port* |
| `SMTP_USER` | *Jouw SMTP user* |
| `SMTP_PASS` | *Jouw SMTP pass* |
| `EMAIL_FROM` | *Jouw afzender adres (bijv. noreply@domein.nl)* |

5. Klik op **Deploy**. Vercel zal nu automatisch `npm install` en `npm run build` uitvoeren en je applicatie hosten.

---

## 3. Omgevingen Beheren in Vercel (Preview vs Production)
Het grote voordeel van Vercel is automatische CI/CD.

* **Production:** Elke keer als je code merget naar de `main` branch, triggert Vercel automatisch een Production build.
* **Preview (Dev/Test):** Elke keer als je code naar een andere branch pusht (bijv. `develop` of `test`), maakt Vercel een **Preview Deployment** aan op een unieke, tijdelijke URL.

### Specifieke Database per Omgeving configureren:
Als je wilt dat je `develop` branch een andere database gebruikt dan productie:
1. Ga in Vercel naar je project instellingen -> **Environment Variables**.
2. Voeg een nieuwe `DATABASE_URL` toe.
3. Bij het selecteren van de environments, vink je *Production* **uit** en *Preview* / *Development* **aan**.
4. Plak hier de Neon connectiestring van je *Dev* database branch.

---

## 4. Prisma Migraties Uitvoeren
Omdat we van SQLite naar PostgreSQL zijn gegaan, zul je zien dat Vercel of Neon nog geen tabellen heeft.
Je moet de tabellen aanmaken in je Neon database.

### Lokale migratie (naar je Neon dev DB):
In je lokale `.env` bestand, zet je de Neon connectiestring:
```env
DATABASE_URL="postgresql://jouw-neon-gebruiker:wachtwoord@host:5432/jouw_dev_db"
```

Draai dan lokaal in je terminal:
```bash
npx prisma db push
```
Of als je met formele migratie files wilt werken:
```bash
npx prisma migrate dev --name init_postgres
```

### Productie migratie:
In Vercel kun je bij **Settings > Build & Development Settings > Build Command** instellen dat Prisma migraties automatisch meelopen:
```bash
npx prisma generate && npx prisma migrate deploy && next build
```
*(Tip: Prisma Migrate Deploy werkt pas als je lokaal een migratie geschiedenis in `/prisma/migrations` hebt gecreëerd).*

---

## 5. Lokale Ontwikkeling
Zorg ervoor dat je `.env` bestand er lokaal zo uitziet:

```env
# Neon PostgreSQL Dev Branch URL
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"

SESSION_SECRET="lokale-sessie-sleutel-12345"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

SMTP_HOST="localhost"
SMTP_PORT="2525"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@scoutingplatform.local"
```