## Omgevingen, Vercel en databases

Deze gids beschrijft hoe de verschillende omgevingen (lokaal, test/preview, productie) samenwerken met Vercel en Neon, inclusief `DATABASE_URL` en andere belangrijke environment variables.

---

## Overzicht van omgevingen

- **Lokaal development**
  - Je draait `npm run dev` in Cursor op je eigen machine.
  - Verbindt standaard met de **Neon `dev` branch**.
- **Test / preview (acceptatie)**
  - Vercel **Preview deployments** voor `feature/*`, `develop` en `release/*` branches.
  - Verbindt met de **Neon `test` branch** met fictieve/testdata.
- **Productie**
  - Vercel **Production deployment** voor de `main` branch.
  - Verbindt met de **Neon `main` (prod) branch** met echte klantdata.

---

## Vercel project-configuratie

Gebruik één Vercel project voor de app en configureer:

- **Production Branch**
  - Stel `main` in als **Production Branch**.
  - Laat **Automatic Production Deployments** ingeschakeld, maar bescherm `main` in GitHub met branch protection en vereiste checks.

- **Preview Deployments**
  - Alle overige branches (`develop`, `release/*`, `feature/*`, `hotfix/*`) krijgen standaard een **Preview deployment**.
  - Deze previews gebruiken dezelfde code als de branch in GitHub en draaien tegen de testdatabase.

Praktisch gebruik:
- **Feature testen**: push naar `feature/*` ➜ Vercel preview-URL voor die feature.
- **Sprint testen**: push naar `release/*` ➜ Vercel preview-URL als sprint/acceptatieomgeving.
- **Productie**: merge naar `main` ➜ Vercel production deployment.

---

## Neon database-structuur

Gebruik één Neon project met drie branches/databases:

- `main` (of `prod`): **productiedata**.
- `test`: test/acceptatie data, met fictieve spelers/clubs.
- `dev`: lokale ontwikkeldata.

Voordelen:
- Duidelijke scheiding tussen echte data en testdata.
- Eén schema gedeeld via Prisma migrations.
- Geen risico dat testdata in productie belandt zolang `DATABASE_URL` per omgeving goed staat.

---

## DATABASE_URL per omgeving

### Lokaal (Cursor)

Gebruik een `.env.local` bestand (niet committen naar git) met o.a.:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?branch=dev"
SESSION_SECRET="random-32-characters-or-more"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_API_KEY="test-or-dev-key"
```

Belangrijk:
- De exacte Neon-URL komt uit het Neon dashboard; kies de **`dev` branch**.
- `.env.local` wordt door Next.js automatisch ingelezen in development.

### Vercel Production

In Vercel → Project → **Settings → Environment Variables → Production**:

- `DATABASE_URL` → Neon URL voor **`main` (prod)** branch.
- `SESSION_SECRET` → sterke geheime waarde (anders dan lokaal/test).
- `RESEND_API_KEY` → productie-mailprovider sleutel.
- `NEXT_PUBLIC_APP_URL` → `https://<jouw-prod-domain>`.

Deze values worden gebruikt voor de **`main` branch deployments**.

### Vercel Preview

In Vercel → Project → **Settings → Environment Variables → Preview**:

- `DATABASE_URL` → Neon URL voor **`test` branch**.
- `SESSION_SECRET` → aparte secret voor preview.
- `RESEND_API_KEY` → test-/sandbox key (zodat je geen echte klanten mailt).
- `NEXT_PUBLIC_APP_URL` → mag algemeen blijven, vaak niet kritisch in preview.

Deze values gelden voor alle **niet-main** branches (feature/develop/release/hotfix).

---

## Prisma migrations per omgeving

### Ontwikkeling (Neon `dev` branch)

- Gebruik `npx prisma migrate dev` met `DATABASE_URL` naar de `dev` branch:
  ```bash
  npx prisma migrate dev --name beschrijving-wijziging
  ```
- Dit past het schema aan op de `dev` database en genereert de Prisma client.

### Test / acceptatie (Neon `test` branch)

- Na afronden van een schemawijziging:
  - Zorg dat `DATABASE_URL` naar de `test` branch wijst (bijv. via een tijdelijk `.env.test` of door de env variabele even aan te passen).
  - Draai:
    ```bash
    npx prisma migrate deploy
    ```
- Dit brengt de testdatabase naar dezelfde migratiestatus als dev/prod, zonder nieuwe migratiebestanden aan te maken.

### Productie (Neon `main` branch)

- Bij een productierelease (merge naar `main`):
  - Zorg dat `DATABASE_URL` naar de Neon `main` branch wijst (bijv. op een beheermachine of via een CI job die alleen op `main` draait).
  - Draai:
    ```bash
    npx prisma migrate deploy
    ```
- Doe dit **vóór** of tijdens de release, zodat Vercel productie altijd tegen een up-to-date schema praat.

---

## Seeding en testdata

De seed-structuur is als volgt opgezet:

- `prisma/seed.base.ts`:
  - Bevat basisdata die zowel in dev als test mogen bestaan (bijvoorbeeld de `Platform` club en de SUPERADMIN user).
- `prisma/seed.dev.ts`:
  - Optionele extra data voor lokale ontwikkeling (bijvoorbeeld een demo club en wat voorbeeldspelers).
- `prisma/seed.test.ts`:
  - Fictieve clubs en spelers voor de test/acceptatieomgeving.
- `prisma/seed.ts`:
  - Router die base + dev/test seeds uitvoert op basis van een `SEED_TARGET` variabele.

### Veiligheid: nooit seeden op productie

In `prisma/seed.ts` is een guard ingebouwd:

- Als `NODE_ENV === 'production'` wordt seeding afgebroken met een fout.
- Seed-scripts in `package.json` zetten expliciet `NODE_ENV=development`, zodat ze alleen bedoeld zijn voor dev/test.

Daarnaast geldt als procesafspraak:
- Draai seed-scripts **alleen** tegen `dev` en `test` databases.
- Draai **nooit** Prisma seeding op de productieomgeving.

### Aanbevolen scripts (zie ook `package.json`)

- `npm run seed:dev`
  - Seed basis + dev data tegen de Neon `dev` database.
- `npm run seed:test`
  - Seed basis + testdata tegen de Neon `test` database.
- `npm run reset:test`
  - Reset de testdatabase (migraties opnieuw) en seed de testdata opnieuw.

Je hoeft in Vercel productie nooit seed-scripts aan te roepen; alleen migrations via `prisma migrate deploy` zijn daar relevant.

---

## Samenvatting

- **Vercel**: één project met `main` als Production Branch en previews voor alle andere branches.
- **Neon**: één project met drie branches: `main` (prod), `test`, `dev`.
- **`DATABASE_URL`**:
  - Lokaal: Neon `dev`.
  - Preview: Neon `test`.
  - Productie: Neon `main`.
- **Prisma**:
  - `migrate dev` op `dev` database.
  - `migrate deploy` op `test` en `main`.
- **Seeding**:
  - Alleen op `dev` en `test`, via gescheiden seed-scripts; nooit op productie.

