import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInviteEmail(email: string, token: string, role: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl}/accept-invite?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@scoutingplatform.local',
    to: email,
    subject: 'Je bent uitgenodigd voor het Football Scouting Platform',
    text: `Je bent uitgenodigd als ${role}. Klik op de volgende link om je account te activeren: ${inviteUrl}`,
    html: `
      <p>Je bent uitgenodigd als <strong>${role}</strong>.</p>
      <p>Klik op de onderstaande link om je wachtwoord in te stellen en je account te activeren:</p>
      <a href="${inviteUrl}">${inviteUrl}</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invite email sent to', email);
  } catch (error) {
    console.error('Error sending invite email:', error);
  }
}
