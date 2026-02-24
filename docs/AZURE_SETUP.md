# Azure Configuratie & Setup Gids

Deze gids helpt je om de applicatie in de cloud te draaien op **Azure**, met behulp van gratis of goedkope diensten voor de database en de webhosting.

Omdat je geen Node/Postgres rechten hebt op je laptop, koppelen we je lokale code rechtstreeks aan een cloud-database, zodat we meteen verder kunnen bouwen!

## Stap 1: Azure PostgreSQL Database Aanmaken

Next.js en Prisma hebben een PostgreSQL database nodig. Azure biedt hiervoor de **Azure Database for PostgreSQL - Flexible Server**.

1. Ga naar de [Azure Portal](https://portal.azure.com/) en log in of maak een (gratis) account aan.
2. Zoek in de bovenste zoekbalk naar **Azure Database for PostgreSQL servers** en klik hierop.
3. Klik op **+ Create** (of + Nieuw).
4. Kies bij Resource type voor **Flexible server** en klik Create.
5. Vul de **Basics** in:
   - **Subscription**: Kies je abonnement (of je gratis proefabonnement).
   - **Resource group**: Klik "Create new" en noem hem bijv. `football-scouting-rg`.
   - **Server name**: Kies een unieke naam (bijv. `scouting-db-123`).
   - **Region**: Kies iets dichtbij, zoals `West Europe` (Nederland).
   - **Compute + storage**: **Belangrijk voor kosten!** Klik op "Configure server", kies de **Burstable** tier (B1ms is vaak de goedkoopste/gratis in de free tier) en bespaar kosten.
6. Vul bij **Administrator account** je gegevens in:
   - **Admin username**: `scoutingadmin`
   - **Password**: Bedenk een sterk wachtwoord en bewaar dit goed!
7. Klik onderaan op **Next: Networking**.
8. Bij **Firewall rules**, zorg dat je **Allow public access from any Azure service within Azure to this server** aanzet.
9. Voeg ook je eigen IP toe door te klikken op **+ Add current client IP address** (zodat je laptop er lokaal bij kan).
10. Klik op **Review + create** en vervolgens op **Create**. Dit duurt een paar minuten.

### Je Database URL samenstellen
Zodra de database klaar is, ga je naar je server overzicht. Je hebt de volgende gegevens:
- **Server name** (bijv. `scouting-db-123.postgres.database.azure.com`)
- **Admin username** (bijv. `scoutingadmin`)
- **Password** (wat je zelf hebt ingesteld)
- **Database name** (Standaard is er een database `postgres` aangemaakt, die gaan we gebruiken).

Jouw **Connection String** ziet er als volgt uit (vervang de haakjes met jouw waarden):
`postgresql://[admin_username]:[password]@[server_name]/postgres?sslmode=require`

**Kopieer deze URL.**

## Stap 2: Je Database Koppelen aan deze App

1. Ga in je Cursor editor naar het bestand `.env` in de hoofdmap (als deze niet bestaat, maak hem aan).
2. Plak je Connection String erin:

```env
DATABASE_URL="postgresql://scoutingadmin:JouwWachtwoord123@scouting-db-123.postgres.database.azure.com/postgres?sslmode=require"
NEXTAUTH_SECRET="maak_hier_een_willekeurige_lange_tekst_van_12345"
NEXTAUTH_URL="http://localhost:3000"
```

3. Geef in de chat aan mij door dat je dit hebt gedaan. Ik zal dan de migraties (tabellen aanmaken) voor je draaien en de database vullen met dummy data!

---

## Stap 3: Azure Web App (App Service) Aanmaken (Voor Later)
*(Dit doen we nadat de app lokaal goed draait tegen de Azure database).*

1. Zoek in de Azure portal naar **App Services**.
2. Klik **+ Create** -> **Web App**.
3. Kies je `football-scouting-rg` resource group.
4. Name: `football-scouting-app-123` (wordt je url: `.azurewebsites.net`).
5. Publish: **Code**.
6. Runtime stack: **Node 20 LTS**.
7. Operating System: **Linux**.
8. Region: **West Europe**.
9. Pricing plan: Klik "Explore pricing plans" en kies de **Free F1** tier als je geen kosten wilt maken (let op: dit is wel trager).
10. Klik **Review + create** en dan **Create**.

Zodra deze klaar is, gaan we in GitHub Actions de deployment instellen! Maar doe eerst Stap 1 en 2.