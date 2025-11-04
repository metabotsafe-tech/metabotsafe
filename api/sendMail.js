// /api/sendMail.js
// Fonction utilitaire pour envoyer des e-mails via SendGrid
// Utilisé par le webhook Stripe

export async function sendEmail(to, subject, html, text) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("SENDGRID_API_KEY or EMAIL_FROM is missing");
  }

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from, name: "MetaBotSafe" },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html }
    ]
  };

  const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (resp.status !== 202) {
    const err = await resp.text();
    console.error("SendGrid error:", err);
    throw new Error("SendGrid did not accept the email");
  }
}

// Handler direct pour tester manuellement si besoin
export default async function handler(req, res) {
  try {
    await sendEmail(
      "rougeauxjulien@gmail.com",
      "Test manuel - MetaBotSafe",
      "<p>Test d'envoi manuel depuis l'API</p>",
      "Test manuel"
    );
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
