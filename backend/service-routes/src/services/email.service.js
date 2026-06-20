const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/**
 * Envoie la feuille de route PDF à l'agent
 * @param {object} route  - objet route complet avec steps et agent
 * @param {Buffer} pdf    - buffer PDF généré
 */
const sendRoutePDF = async (route, pdf, agentName, agentEmail) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP non configuré — email non envoyé (SMTP_USER / SMTP_PASS manquants)');
    return { sent: false, reason: 'SMTP non configuré' };
  }

  if (!agentEmail) {
    return { sent: false, reason: 'Aucun agent assigné à cette tournée' };
  }

  const date = new Date(route.date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const stepsHtml = route.steps?.length
    ? `<ul>${[...route.steps]
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((s) => `<li>Étape ${s.stepOrder} — Zone ${s.container?.zoneId ?? '?'} (${s.container?.fillLevel ?? '?'}% plein)</li>`)
        .join('')}</ul>`
    : '<p>Aucune étape définie.</p>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2E7D32; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Feuille de tournée EcoTrack</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Bonjour <strong>${agentName || 'Agent'}</strong>,</p>
        <p>Votre feuille de tournée pour le <strong>${date}</strong> est disponible en pièce jointe.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px; color: #666;">Distance totale</td><td style="padding: 6px; font-weight: bold;">${route.totalDistance ? route.totalDistance + ' km' : 'Non calculée'}</td></tr>
          <tr style="background: #f5f5f5;"><td style="padding: 6px; color: #666;">Durée estimée</td><td style="padding: 6px; font-weight: bold;">${route.estimatedTime ? route.estimatedTime + ' min' : 'Non calculée'}</td></tr>
          <tr><td style="padding: 6px; color: #666;">Nombre d'arrêts</td><td style="padding: 6px; font-weight: bold;">${route.steps?.length ?? 0}</td></tr>
        </table>

        <h3 style="color: #2E7D32;">Itinéraire</h3>
        ${stepsHtml}

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
        <p style="color: #9e9e9e; font-size: 12px; text-align: center;">
          Généré automatiquement par EcoTrack • Ne pas répondre à cet email
        </p>
      </div>
    </div>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"EcoTrack" <${process.env.SMTP_USER}>`,
    to: agentEmail,
    subject: `Votre tournée du ${date}`,
    html,
    attachments: [
      {
        filename: `tournee-${new Date(route.date).toISOString().slice(0, 10)}.pdf`,
        content: pdf,
        contentType: 'application/pdf',
      },
    ],
  });

  return { sent: true, to: agentEmail };
};

module.exports = { sendRoutePDF };
