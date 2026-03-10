import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is niet ingesteld. Voeg RESEND_API_KEY toe aan je environment variabelen om e-mails te kunnen versturen.',
    );
  }
  return new Resend(apiKey);
}

export async function sendInviteEmail(
  email: string,
  token: string,
  role: string,
  clubName: string | null,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl}/accept-invite?token=${token}`;

  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@scoutingplatform.local';

  const subject = `Uitnodiging voor het Football Scouting Platform${clubName ? ` - ${clubName}` : ''}`;

  const html = `
    <div style="background-color:#050816;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
      <table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background-color:#020617;border-radius:16px;border:1px solid #1f2937;padding:32px;">
        <tr>
          <td style="text-align:center;padding-bottom:24px;">
            <div style="font-size:20px;font-weight:700;color:#f9fafb;">Football Scouting Platform</div>
            ${clubName ? `<div style="margin-top:4px;font-size:13px;color:#9ca3af;">Uitnodiging voor <strong>${clubName}</strong></div>` : ''}
          </td>
        </tr>
        <tr>
          <td style="font-size:14px;line-height:1.6;color:#e5e7eb;">
            <p style="margin:0 0 12px 0;">Je bent uitgenodigd om toegang te krijgen tot het Football Scouting Platform.</p>
            <p style="margin:0 0 12px 0;">
              Rol: <strong>${role}</strong>${clubName ? ` bij <strong>${clubName}</strong>` : ''}.
            </p>
            <p style="margin:0 0 20px 0;">
              Klik op de knop hieronder om je uitnodiging te accepteren en je account aan te maken.
            </p>
            <p style="margin:0 0 24px 0;text-align:center;">
              <a href="${inviteUrl}"
                 style="display:inline-block;padding:10px 24px;border-radius:999px;background:linear-gradient(90deg,#2563eb,#38bdf8);color:#f9fafb;text-decoration:none;font-weight:600;font-size:14px;">
                Uitnodiging accepteren
              </a>
            </p>
            <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;">
              Werkt de knop niet? Kopieer en plak dan de onderstaande link in je browser:
            </p>
            <p style="margin:0 0 16px 0;font-size:12px;color:#6b7280;word-break:break-all;">
              <a href="${inviteUrl}" style="color:#93c5fd;text-decoration:none;">${inviteUrl}</a>
            </p>
            <p style="margin:0;font-size:12px;color:#6b7280;">
              Deze uitnodiging verloopt na 7 dagen. Als je geen toegang meer nodig hebt of deze uitnodiging niet had verwacht, kun je deze e-mail negeren.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = `Je bent uitgenodigd om als ${role}${
    clubName ? ` bij ${clubName}` : ''
  } toegang te krijgen tot het Football Scouting Platform.

Klik op de volgende link om je account aan te maken:
${inviteUrl}

Deze uitnodiging verloopt na 7 dagen.`;

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from,
      to: email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error('Error sending invite email via Resend:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@scoutingplatform.local';

  const subject = `Wachtwoord opnieuw instellen - Football Scouting Platform`;

  const html = `
    <div style="background-color:#050816;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
      <table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background-color:#020617;border-radius:16px;border:1px solid #1f2937;padding:32px;">
        <tr>
          <td style="text-align:center;padding-bottom:24px;">
            <div style="font-size:20px;font-weight:700;color:#f9fafb;">Football Scouting Platform</div>
            <div style="margin-top:4px;font-size:13px;color:#9ca3af;">Wachtwoord opnieuw instellen</div>
          </td>
        </tr>
        <tr>
          <td style="font-size:14px;line-height:1.6;color:#e5e7eb;">
            <p style="margin:0 0 12px 0;">We hebben een verzoek ontvangen om je wachtwoord te wijzigen.</p>
            <p style="margin:0 0 12px 0;">
              Klik op de knop hieronder om een nieuwe wachtzin in te stellen. Deze link is 30 minuten geldig.
            </p>
            <p style="margin:0 0 24px 0;text-align:center;">
              <a href="${resetUrl}"
                 style="display:inline-block;padding:10px 24px;border-radius:999px;background:linear-gradient(90deg,#2563eb,#38bdf8);color:#f9fafb;text-decoration:none;font-weight:600;font-size:14px;">
                Wachtwoord opnieuw instellen
              </a>
            </p>
            <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;">
              Werkt de knop niet? Kopieer en plak dan de onderstaande link in je browser:
            </p>
            <p style="margin:0 0 16px 0;font-size:12px;color:#6b7280;word-break:break-all;">
              <a href="${resetUrl}" style="color:#93c5fd;text-decoration:none;">${resetUrl}</a>
            </p>
            <p style="margin:0;font-size:12px;color:#6b7280;">
              Heb je dit verzoek niet zelf gedaan? Negeer deze e-mail dan. Je wachtwoord blijft ongewijzigd.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = `We hebben een verzoek ontvangen om je wachtwoord te wijzigen.

Klik op de volgende link om een nieuwe wachtzin in te stellen (30 minuten geldig):
${resetUrl}

Heb je dit niet zelf aangevraagd? Negeer deze e-mail dan.`;

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from,
      to: email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error('Error sending password reset email via Resend:', error);
    throw error;
  }
}
