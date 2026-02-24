# Privacy & Security (AVG/GDPR by Design)

Deze documentatie beschrijft hoe het Whitelabel Football Recruitment platform is ontworpen om te voldoen aan de AVG (Algemene Verordening Gegevensbescherming) en best practices rondom privacy en security.

## 1. Dataminimalisatie
We slaan alleen op wat strikt noodzakelijk is voor het doel (football recruitment).
- **Spelers aanmaken**: Alleen de `naam` van een speler is een verplicht veld. Alle andere velden (geboortedatum, positie, contactgegevens) zijn optioneel en worden alleen ingevuld indien relevant voor het scoutingsproces.
- **Uitnodigingen**: Alleen naam, email en rol worden opgevraagd bij het aanmaken van een nieuw account via de Admin.

## 2. Doelbinding en Rollen (RBAC & Tenant Isolation)
Gegevens worden uitsluitend gebruikt voor het scoutingproces van de betreffende club.
- **Tenant Isolation**: Elke gebruiker, speler, taak en contactmoment is gekoppeld aan een `clubId`. In elke database query wordt verplicht gefilterd op dit `clubId`. Een gebruiker kan onmogelijk data van een andere club inzien.
- **Rollen en Rechten (RBAC)**:
  - **Admin**: Kan instellingen beheren, accounts aanmaken/deactiveren.
  - **TC lid / Scout**: Kan spelers, contacten en taken aanmaken en wijzigen.
  - **Lezer**: Heeft uitsluitend leesrechten op spelers en taken.

## 3. Data Verwijdering & Retentie
- **Soft Delete**: In plaats van records direct fysiek uit de database te verwijderen, wordt in de toekomst een `deletedAt` flag gebruikt. In de MVP fase kan de Admin accounts "deactiveren" in plaats van verwijderen, om de referentiële integriteit van audit trails (`createdBy`) te behouden.
- **Recht om vergeten te worden**: Als een speler of gebruiker verzoekt om verwijdering van zijn data, dient de Admin van de club de betreffende records (inclusief contactmomenten) handmatig te anonimiseren of te verwijderen via een nog te ontwikkelen beheer-interface (post-MVP).

## 4. Audit Trail
Om bij te houden wie welke gegevens heeft gewijzigd (accountability):
- Alle entiteiten in de database (Player, ContactMoment, Task) hebben de volgende velden:
  - `createdAt`: Tijdstip van aanmaak.
  - `updatedAt`: Tijdstip van laatste wijziging.
  - `createdBy`: De ID van de gebruiker die het record heeft aangemaakt.

## 5. Security & Authenticatie
- **Authenticatie**: Authenticatie verloopt via sessies en veilige cookies (`HttpOnly`, `Secure` in productie).
- **Wachtwoorden**: Wachtwoorden worden nooit in plain-text opgeslagen, maar worden gehasht middels `bcrypt`.
- **2FA (Two-Factor Authentication)**: De applicatie architectuur is voorbereid op TOTP 2FA. De benodigde velden (`twoFactorEnabled`, `twoFactorSecret`, etc.) zijn reeds aanwezig in het database model, zodat dit na de MVP eenvoudig kan worden ingeschakeld.
- **Verbindingen**: Het platform forceert HTTPS in productie.

## 6. Logging
- Server logs (bijv. van Next.js of API requests) mogen **geen** gevoelige persoonsgegevens (PII) bevatten.
- Waar mogelijk worden e-mailadressen of namen gemaskeerd in error logs. Wachtwoorden en sessietokens worden *nooit* gelogd.