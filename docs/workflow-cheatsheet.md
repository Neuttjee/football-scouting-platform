## Dagelijkse workflow – tickets en pipelines

Deze cheat sheet is bedoeld om snel te zien **welke stappen je moet doen per ticket**, van lokaal ontwikkelen tot productie. Alle commando’s zijn zo geschreven dat je ze direct kunt kopiëren en plakken.

Uitgangspunten:
- **Eén ticket = één feature branch** (`feature/<ticket-naam>`).
- **develop** = integratiebranch.
- **release/\*** = sprint/batch richting productie.
- **main** = productie.

---

## 1. Nieuw ticket oppakken

### 1.1 Branch maken vanaf `develop`

```bash
git checkout develop
git pull
git checkout -b feature/<korte-naam-ticket>
```

Vervang `<korte-naam-ticket>` door iets herkenbaars, bijvoorbeeld:

```bash
git checkout -b feature/players-table-sortering
```

### 1.2 Lokaal werken in Cursor

Zorg dat `.env.local` is ingesteld voor de **dev database** (Neon branch `dev`):

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?branch=dev"
SESSION_SECRET="<lokale-secret-32+chars>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Daarna:

```bash
npm run dev
```

Optioneel: dev-data seeden in de Neon `dev` database:

```bash
npm run seed:dev
```

Nu kun je in Cursor je wijzigingen maken op de feature branch.

---

## 2. Lokale checks vóór push

Niet verplicht, maar handig om snelle feedback te krijgen:

```bash
npm run lint
npm run typecheck
```

Als deze beiden slagen, is de kans groot dat CI op GitHub ook groen is.

---

## 3. Committen en pushen van het ticket

### 3.1 Commit maken

```bash
git status
git add .
git commit -m "Feat: <korte omschrijving van ticket>"
```

Voorbeelden:

```bash
git commit -m "Feat: verbeter sorteren in spelerslijst"
git commit -m "Fix: foutmelding bij opnieuw versturen uitnodiging"
```

### 3.2 Branch pushen naar GitHub

```bash
git push -u origin feature/<korte-naam-ticket>
```

Na deze push:
- GitHub ziet de nieuwe branch.
- Vercel maakt automatisch een **Preview deployment** aan voor deze feature branch.

---

## 4. Testen op Vercel preview (testomgeving)

1. Ga naar het Vercel dashboard van je project.
2. Zoek de deployment die hoort bij `feature/<korte-naam-ticket>`.
3. Open de **Preview URL** en test je wijziging.

De preview draait tegen de **Neon `test` database** (via de Vercel Preview `DATABASE_URL`).

### 4.1 Testdata in de testdatabase

Als je extra testdata nodig hebt in de `test` database:

1. Zorg lokaal dat `DATABASE_URL` wijst naar Neon `test` (tijdelijk in je shell of in een `.env.test` die je bewust gebruikt).
2. Draai:

```bash
npm run seed:test
```

Voor een volledige reset van de testdatabase:

```bash
npm run reset:test
```

> Let op: `reset:test` draait `prisma migrate reset --force` tegen de `test` database en seed daarna opnieuw. Gebruik dit alleen als je bereid bent alle testdata opnieuw op te bouwen.

---

## 5. PR van feature naar `develop`

Als je tevreden bent met het ticket (lokaal + preview getest):

1. Open in GitHub een **Pull Request**:
   - Base branch: `develop`
   - Compare: `feature/<korte-naam-ticket>`

2. Wacht tot de CI workflow **CI / build-and-check** groen is.

3. Review je eigen wijzigingen (diff) en merge de PR naar `develop`.

Samenvattend commando-overzicht tot hier:

```bash
git checkout develop
git pull
git checkout -b feature/<ticket>

npm run dev           # lokaal werken
npm run lint          # optioneel
npm run typecheck     # optioneel

git add .
git commit -m "Feat: <omschrijving>"
git push -u origin feature/<ticket>
```

Daarna via GitHub: PR → `develop` → CI groen → merge.

---

## 6. Features bundelen in een release (naar productie)

Zodra je één of meerdere tickets hebt gemerged in `develop` en je wilt die naar productie brengen:

### 6.1 Release branch maken

```bash
git checkout develop
git pull
git checkout -b release/<datum-of-sprintnaam>
git push -u origin release/<datum-of-sprintnaam>
```

Voorbeelden:

```bash
git checkout -b release/2026-03-sprint-01
git checkout -b release/2026-03-kleine-fixes
```

### 6.2 Testen op release preview

Net als bij een feature branch maakt Vercel nu een **Preview deployment** voor `release/<...>`.  
Gebruik deze als **sprint-/acceptatieomgeving**:

- URL uit Vercel kopiëren.
- Testen met Neon `test` database.
- Eventueel opnieuw:

```bash
npm run seed:test
```

### 6.3 Prisma migraties (indien schema is gewijzigd)

Als er schemawijzigingen zijn doorgevoerd met Prisma:

1. Tijdens ontwikkeling (al gebeurd):
   ```bash
   npm run prisma:migrate:dev
   ```

2. Migrations naar `test` deployen:

   - Zorg dat `DATABASE_URL` naar Neon `test` wijst.
   - Draai:

   ```bash
   npm run prisma:migrate:deploy
   ```

3. Migrations naar productie (`main` database) deployen, vóór of tijdens de release:

   - Zet `DATABASE_URL` tijdelijk naar Neon `main`.
   - Draai:

   ```bash
   npm run prisma:migrate:deploy
   ```

> Belangrijk: **nooit** seeds draaien tegen productie (`main`). Alleen migraties.

### 6.4 Release naar `main` (productie)

1. Open een PR: `release/<...>` → `main`.
2. Wacht tot CI groen is.
3. Merge de PR naar `main`.

Vercel ziet de wijziging op `main` en doet automatisch een **Production deployment**.

---

## 7. Urgente bugfix (hotfix) op productie

Voor acute bugs in productie gebruik je een `hotfix/*` branch vanaf `main`:

```bash
git checkout main
git pull
git checkout -b hotfix/<korte-bug-naam>
```

Los de bug op, test lokaal, en doe:

```bash
git add .
git commit -m "Fix: <bugbeschrijving>"
git push -u origin hotfix/<korte-bug-naam>
```

Daarna:

1. PR `hotfix/<...>` → `main` (prod-fix).
2. Na merge óók PR `hotfix/<...>` → `develop`, zodat `develop` synchroon blijft met productie.

---

## 8. Samenvatting in één oogopslag

**Nieuw ticket:**
```bash
git checkout develop
git pull
git checkout -b feature/<ticket>
# werken, testen
git add .
git commit -m "Feat: <omschrijving>"
git push -u origin feature/<ticket>
```

**Release maken:**
```bash
git checkout develop
git pull
git checkout -b release/<naam>
git push -u origin release/<naam>
```

**Hotfix:**
```bash
git checkout main
git pull
git checkout -b hotfix/<bug>
git add .
git commit -m "Fix: <bug>"
git push -u origin hotfix/<bug>
```

Gebruik deze file als snelle referentie. Voor meer details per onderdeel kun je terugvallen op:
- `docs/branch-strategy.md` voor de volledige branch- en release-strategie.
- `docs/environments-and-databases.md` voor Neon/Prisma en omgevingen.
- `docs/local-setup.md` voor lokale installatie en basis-setup.

