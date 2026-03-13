# Lokale Setup

Volg deze stappen om het project lokaal te draaien.

## Vereisten
- Node.js (versie 20 LTS)
- npm of yarn
- Git

## 1. Clone de repository
```bash
git clone <repository_url>
cd football-scouting-platform
```

## 2. Installeer dependencies
```bash
npm install
```

## 3. Environment Variables
Maak een `.env.local` bestand aan in de root van het project gebaseerd op de onderstaande vereisten. Dit bestand wordt **niet** gecommit en is alleen voor lokaal gebruik.

```env
# Database (Neon dev branch)
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?branch=dev"

# Authenticatie Secret (gebruik een willekeurige lange string, bv. output van `openssl rand -base64 32`)
SESSION_SECRET="jouw-geheime-lokale-sessie-sleutel"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SMTP / mail (optioneel, voor lokale test, bv. Mailtrap)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="jouw_user"
SMTP_PASS="jouw_pass"
EMAIL_FROM="noreply@scoutingplatform.local"
```

## 4. Database Setup & Migraties
Zorg dat je Neon `dev` branch bereikbaar is (via de `DATABASE_URL` in `.env.local`) en voer daarna de migraties uit:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

*Optioneel*: Draai de seed om basisdata (zoals de SUPERADMIN user) en eventuele testdata in de `dev` database te plaatsen:
```bash
npx prisma db seed
```

## 5. Start de Applicatie
Start de development server:

```bash
npm run dev
```

De applicatie is nu bereikbaar op `http://localhost:3000`.

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Bouw applicatie voor productie
- `npm run start` - Start productie build
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript typecheck (zonder build)

## Dagelijkse workflow met Cursor, branches en Vercel previews

1. **Werk vanaf `develop` op een feature branch**
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/naam-ticket
   ```
2. **Ontwikkel lokaal in Cursor**
   - Start de dev server met `npm run dev`.
   - Gebruik de Neon `dev` database via `.env.local`.
3. **Test lokaal**
   - Ga naar `http://localhost:3000`.
   - Controleer functionaliteit met je lokale dev-data.
4. **Commit en push**
   ```bash
   git commit -am "Korte beschrijving van de wijziging"
   git push -u origin feature/naam-ticket
   ```
5. **Test op Vercel preview**
   - GitHub (optioneel) PR ➜ Vercel maakt automatisch een preview deployment aan voor de feature branch.
   - Test op de preview-URL (tegen de `test` database in Neon).
6. **Merge naar `develop`**
   - Open een PR van `feature/*` naar `develop`.
   - Wacht tot de CI checks groen zijn en merge de PR.

Voor sprintreleases en productieflow, zie ook `docs/branch-strategy.md` en `docs/environments-and-databases.md`.

