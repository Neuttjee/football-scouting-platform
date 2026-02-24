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
Maak een `.env` bestand aan in de root van het project gebaseerd op de onderstaande vereisten:

```env
# Database (Lokaal gebruiken we gewoon een lokaal bestand in de prisma folder)
DATABASE_URL="file:./dev.db"

# Authenticatie Secret (gebruik een willekeurige lange string, bv. output van `openssl rand -base64 32`)
SESSION_SECRET="jouw-geheime-lokale-sessie-sleutel"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SMTP Instellingen (voor lokale test, bv. Mailtrap of een Ethereal account)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="jouw_user"
SMTP_PASS="jouw_pass"
EMAIL_FROM="noreply@scoutingplatform.local"
```

## 4. Database Setup & Migraties
Zorg ervoor dat het SQLite bestand wordt aangemaakt en de tabellen worden gegenereerd:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

*Optioneel*: Draai de seed (indien beschikbaar) om een Admin account en een testclub aan te maken:
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
