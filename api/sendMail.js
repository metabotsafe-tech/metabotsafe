
// /api/sendMail.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ error: 'SendGrid API key missing' });
    }

    const msg = {
      to: process.env.EMAIL_FROM,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'MetaBotSafe',
      },
      subject: 'Test envoi depuis MetaBotSafe ✅',
      text: 'Bonjour Julien ! Ceci est un test d’envoi via SendGrid depuis ton site MetaBotSafe.',
      html: `
        <div style="font-family:Arial, sans-serif; color:#333">
          <h2>Test réussi 🎉</h2>
          <p>Ton intégration SendGrid fonctionne parfaitement !</p>
          <p><strong>Depuis :</strong> metabotsafe.vercel.app</p>
          <p>— L’équipe MetaBotSafe</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('Email envoyé avec succès');
    return res.status(200).json({ success: true, message: 'Email envoyé avec succès 🚀' });

  } catch (error) {
    console.error('Erreur SendGrid:', error);
    return res.status(500).json({ error: error.message });
  }
}
