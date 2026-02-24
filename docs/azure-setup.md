# Azure App Service & SQLite Setup

Deze guide beschrijft de specifieke configuratie die nodig is om SQLite veilig en betrouwbaar te draaien op Azure App Service (Linux).

## Risico's & Beperkingen van SQLite op Azure
SQLite is een file-based database. Dit brengt specifieke uitdagingen mee op een PaaS platform zoals Azure App Service:
1. **Bestandssysteem Persistentie**: Bij een deploy of herstart van de App Service wordt het lokale bestandssysteem (buiten `/home`) gewist.
2. **File Locks / Concurrency**: SQLite kan corrumperen als meerdere processen tegelijkertijd naar hetzelfde bestand schrijven zonder goede coördinatie.
3. **Schaalbaarheid**: Omdat SQLite op schijf leeft, mag er **absoluut niet** worden uitgeschaald (geen meerdere instances), omdat de instances niet hetzelfde SQLite bestand kunnen delen.

## Configuratie Stappen per Omgeving (Dev, Test, Prod)

### 1. Separate App Services
Gebruik 3 fysiek gescheiden App Services (geen deployment slots) om te voorkomen dat omgevingen per ongeluk elkaars bestanden overschrijven of dat er file lock problemen ontstaan tijdens deployments.

### 2. Scaling Uitzetten
Zorg ervoor dat de App Service Plan is ingesteld op een vaste grootte:
- **Scale out (App Service Plan)**: Handmatig schalen
- **Instance count**: `1` (NOOIT verhogen!)

### 3. Database Bestand Locatie
Sla de SQLite database altijd op binnen de `/home` directory, omdat dit de enige persistente storage is op Azure App Service Linux.
- Maak een map aan, bv. `/home/data/` (kan via SSH in de Azure portal).
- Stel de `DATABASE_URL` environment variable in op het absolute pad per omgeving.

**Environment Variables in Azure Portal:**
- **Dev**: `DATABASE_URL` = `file:/home/data/dev.db`
- **Test**: `DATABASE_URL` = `file:/home/data/test.db`
- **Prod**: `DATABASE_URL` = `file:/home/data/prod.db`

### 4. Prisma Migraties in Productie
- In Dev en Test kan de CI/CD pipeline veilig `npx prisma migrate deploy` uitvoeren.
- In **Productie** brengt dit een risico met zich mee als de app op dat moment database verbindingen open heeft staan (file locks).
- Voer `prisma migrate deploy` in productie alleen uit via een gecontroleerde pipeline job tijdens een onderhoudsvenster, eventueel nadat de app in "offline" modus of gestopt is, of wees er zeker van dat de deployment pipeline de app stopt/restart rondom de migratie. (Azure doet dit deels automatisch tijdens deploy, maar handmatige goedkeuring in de pipeline voorkomt onverwachte downtime).

### 5. Algemene Azure App Service (Linux) Settings
- **Runtime stack**: Node 20 LTS
- **Startup Command**: `npm run start` (of de standaard Next.js start command)
- **WEBSITES_ENABLE_APP_SERVICE_STORAGE**: `true` (Zorgt ervoor dat `/home` wordt gemount)