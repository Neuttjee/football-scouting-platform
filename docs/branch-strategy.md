## Git branch- en release-strategie

Deze strategie is ontworpen voor jouw Next.js/Prisma/Neon app met GitHub en Vercel, en sluit aan op sprintmatig werken met losse features en gecontroleerde releases.

---

## Overzicht van branches

- **`main`**: enige productiebranch.
  - Bevat altijd de code die live draait op productie.
  - Wordt **nooit** direct gepusht; alleen via pull requests vanuit `release/*` of `hotfix/*`.
- **`develop`**: integratiebranch voor actieve ontwikkeling.
  - Hier komen goedgekeurde features samen.
  - Moet altijd in een \"redelijk stabiele\" staat zijn (geen bewust kapotte build).
- **`release/*`**: tijdelijke sprint- of batchrelease branches.
  - Voorbeeld: `release/2026-03-scouting-v1`.
  - Wordt gebruikt als acceptatie-/testomgeving voor een bundel van features.
- **`feature/*`**: korte-levensduur branches per ticket of feature.
  - Voorbeelden: `feature/import-wizard-validatie`, `feature/squad-planning-filter`.
  - Ontstaan altijd vanaf `develop`.
- **`hotfix/*`**: optioneel voor urgente fixes op productie.
  - Voorbeeld: `hotfix/password-reset-bug`.
  - Ontstaan vanaf `main` en worden daarna terug gemerged in zowel `main` als `develop`.

---

## Flow van feature naar productie

### 1. Nieuwe feature

1. Zorg dat `develop` up-to-date is:
   ```bash
   git checkout develop
   git pull
   ```
2. Maak een feature branch:
   ```bash
   git checkout -b feature/korte-naam-ticket
   ```
3. Werk lokaal in Cursor op deze feature branch:
   - Codeer de wijziging.
   - Houd commits klein en logisch.
4. Push de branch naar GitHub:
   ```bash
   git push -u origin feature/korte-naam-ticket
   ```
5. GitHub en Vercel maken automatisch een **preview deployment** aan voor deze branch.
6. Test de feature op de Vercel preview-URL.

### 2. Integratie in `develop`

1. Maak een pull request van `feature/*` naar `develop`.
2. GitHub Actions CI draait (lint, typecheck, build, eventuele Prisma checks/tests).
3. Na een groene build en review:
   - Merge de PR (bij voorkeur squash merge voor een nette geschiedenis).
4. De feature branch kan daarna worden verwijderd.

---

## Sprint- en releaseflow

### 3. Sprint/batch release aanmaken

Aan het begin of halverwege een sprint, wanneer je een set features wilt voorbereiden voor uitrol:

1. Zorg dat `develop` alle gewenste features bevat:
   ```bash
   git checkout develop
   git pull
   ```
2. Maak een release branch:
   ```bash
   git checkout -b release/2026-03-scouting-v1
   git push -u origin release/2026-03-scouting-v1
   ```
3. Vercel maakt een **stabiele preview** aan voor deze release branch.
   - Gebruik deze URL als **acceptatie-/testomgeving** voor de sprint.

### 4. Werken op een release branch

- Alleen bugfixes en kleine tweaks die nodig zijn om de release stabiel te krijgen, worden op de release branch gedaan.
- Grotere nieuwe features gaan **niet** meer op de huidige release branch maar op nieuwe `feature/*` branches vanaf `develop`, voor een volgende release.

Bugfix-flow op release branch:
1. Maak eventueel een aparte bugfix branch vanaf de release branch:
   ```bash
   git checkout release/2026-03-scouting-v1
   git pull
   git checkout -b bugfix/naam-issue
   ```
2. Los de bug op, push, open PR naar de release branch en merge na CI.

---

## Productierelease

### 5. Van release naar `main`

Als de release branch volledig getest is (op de Vercel preview met testdatabase):

1. Open een pull request: `release/*` ➜ `main`.
2. Zorg dat alle vereiste CI-checks groen zijn.
3. Laat de PR reviewen (desnoods door jezelf, maar met een bewuste check).
4. Merge de PR (bij voorkeur squash of merge commit volgens jouw voorkeur).
5. Merge naar `main` triggert automatisch de **Vercel production deploy**.

Na de release:
- Optioneel: merge de release branch terug naar `develop` als er hotfixes of laatste wijzigingen zijn die ook in toekomstige werk moeten zitten:
  ```bash
  git checkout develop
  git pull
  git merge --no-ff release/2026-03-scouting-v1
  git push
  ```
- Verwijder de release branch als deze niet meer nodig is.

---

## Hotfixes voor productie

Voor urgente problemen in productie:

1. Maak een hotfix branch vanaf `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/korte-naam-bug
   ```
2. Los het probleem op, commit en push:
   ```bash
   git commit -am "Fix: beschrijving van de bug"
   git push -u origin hotfix/korte-naam-bug
   ```
3. Open een PR naar `main`:
   - Wacht tot CI groen is.
   - Merge de PR ➜ Vercel deployed de fix naar productie.
4. Merge dezelfde hotfix ook naar `develop`:
   ```bash
   git checkout develop
   git pull
   git merge --no-ff hotfix/korte-naam-bug
   git push
   ```

---

## Branch protection (koppeling met deze strategie)

In GitHub richt je branch protection in (zie aparte documentatie), maar samengevat:

- **`main`**:
  - Geen directe pushes.
  - Alleen merges via PR.
  - Vereiste CI-check(s) moeten groen zijn.
- **`develop`**:
  - Bij voorkeur ook geen directe pushes; alleen via PR vanuit `feature/*` en `hotfix/*`.
  - Zelfde CI-check(s) als `main`.
- **`release/*`**:
  - Optioneel beschermd met een branch protection pattern `release/*`.
  - Geen directe pushes (of alleen door admin), bij voorkeur via PR voor bugfixes.

Deze bescherming zorgt ervoor dat productie alleen via gecontroleerde PR’s wordt bijgewerkt en nooit meer via ad-hoc commits op `main`.

---

## Praktisch gebruik in Cursor

- Start elke nieuwe taak met:
  ```bash
  git checkout develop
  git pull
  git checkout -b feature/korte-naam-ticket
  ```
- Laat Cursor je helpen met:
  - Aanpassen van code binnen de juiste branch.
  - Schrijven van migraties en seeds (Prisma).
  - Updaten van documentatie.
- Gebruik Cursor’s Git UI om:
  - Diffs te bekijken.
  - Kleine commits te maken.
  - Conflicten op te lossen wanneer je `develop` of een release branch bijwerkt.

