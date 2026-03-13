## Branch protection & release governance

Deze gids beschrijft hoe je branch protection in GitHub instelt voor `main`, `develop` en `release/*` om te zorgen dat productie alleen via gecontroleerde PR’s wordt bijgewerkt.

---

## Beschermde branches

We beschermen drie categorieën:

- **`main`** – productiebranch.
- **`develop`** – centrale integratiebranch.
- **`release/*`** – tijdelijke sprint- of batchrelease branches.

---

## Instellen in GitHub

Ga in GitHub naar:

1. *Settings* → *Branches*.
2. Onder *Branch protection rules* kies je **Add rule**.

### 1. Regel voor `main`

- **Branch name pattern**: `main`
- Schakel in:
  - **Require a pull request before merging**
  - **Require status checks to pass before merging**
    - Selecteer de check: `CI / build-and-check` (of hoe de workflow in GitHub wordt weergegeven).
  - (Aanbevolen) **Require linear history** of gebruik standaard *squash merge* als merge-strategie.
  - (Optioneel) **Require approvals**:
    - Voor een soloproject kun je dit uit laten of 1 approval eisen (self-review).
- Schakel uit:
  - Directe pushes (worden automatisch geblokkeerd door de PR-verplichting).

Effect:
- Productie kan alleen worden bijgewerkt via een PR naar `main` met een groene CI-check.

### 2. Regel voor `develop`

- **Branch name pattern**: `develop`
- Schakel in:
  - **Require a pull request before merging**
  - **Require status checks to pass before merging**
    - Zelfde check als bij `main` (CI workflow).
- Optioneel:
  - Sta directe pushes alleen toe voor admins, of blokkeer ze volledig.

Effect:
- Alle features komen gecontroleerd binnen via PR’s van `feature/*` (en eventueel `hotfix/*`) naar `develop`.

### 3. Regel voor `release/*`

- **Branch name pattern**: `release/*`
- Schakel in:
  - **Require a pull request before merging**
  - **Require status checks to pass before merging**
    - Gebruik opnieuw de CI check.

Effect:
- Bugfixes op een release branch gaan via PR’s (bijvoorbeeld `bugfix/*` → `release/2026-03-scouting-v1`), zodat de releaseomgeving stabiel blijft.

---

## Aanvullende aanbevelingen

- **Merge-strategie**
  - Gebruik *squash and merge* voor PR’s vanuit `feature/*` naar `develop` voor een schone geschiedenis.
  - Voor `release/*` → `main` kun je squash of een normale merge commit gebruiken, afhankelijk van je voorkeur.

- **Tagging van releases**
  - Overweeg na een succesvolle merge naar `main` een git tag aan te maken, bijvoorbeeld `v2026.03.1`.

---

## Korte samenvatting

- `main`:
  - Alleen via PR’s.
  - Vereist groene CI-status.
  - Geen directe pushes.
- `develop`:
  - Alleen via PR’s vanaf `feature/*` of `hotfix/*`.
  - Zelfde CI-eisen als `main`.
- `release/*`:
  - Alleen via PR’s (voor bugfixes).
  - Zelfde CI-eisen als `main`/`develop`.

Met deze regels is productie goed beschermd en passen alle merges netjes in de sprint- en releaseflow uit `docs/branch-strategy.md`.

