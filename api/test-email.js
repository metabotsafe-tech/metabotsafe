// /api/test-email.js
// Minimal SendGrid email test for Vercel (no external packages needed)
//
// ▶ How to use (after deploy):
//   GET  https://YOUR_DOMAIN/api/test-email
//   or POST (JSON): { "to": "someone@example.com", "from": "sender@example.com", "subject": "...", "text": "..." }
//
// It uses environment variables if present:
//   - SENDGRID_API_KEY  (required)
//   - EMAIL_FROM        (default sender if not provided in request)
//   - SITE_URL          (optional, used in body)

module.exports = async (req, res) => {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "Missing SENDGRID_API_KEY env variable" });
    }

    const method = (req.method || "GET").toUpperCase();
    let body = {};
    try {
      if (method === "POST" && req.body && typeof req.body === "object") {
        body = req.body;
      }
    } catch (_) {}

    const from = (body.from || process.env.EMAIL_FROM || "metabotsafe@gmail.com").trim();
    const to = (body.to || req.query?.to || "rougeauxjulien@gmail.com").trim();
    const now = new Date().toISOString();
    const site = process.env.SITE_URL || `https://${req.headers.host || "localhost"}`;

    const subject = body.subject || `[MetaBotSafe] Test email (${now})`;
    const text = body.text || `Ceci est un e-mail de test envoyé via SendGrid.
- Date: ${now}
- Expéditeur: ${from}
- Destinataire: ${to}
- Site: ${site}
`;
    const html = body.html || `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.6; color:#111;">
        <h2>✅ E-mail de test MetaBotSafe</h2>
        <p>Si vous lisez ceci, l'envoi SendGrid fonctionne ✅</p>
        <ul>
          <li><strong>Date:</strong> ${now}</li>
          <li><strong>Expéditeur:</strong> ${from}</li>
          <li><strong>Destinataire:</strong> ${to}</li>
          <li><strong>Site:</strong> <a href="${site}">${site}</a></li>
        </ul>
        <p>— Votre assistant 🤖</p>
      </div>
    `;

    // Build SendGrid payload
    const payload = {
      personalizations: [
        {
          to: [{ email: to }]
        }
      ],
      from: { email: from, name: "MetaBotSafe" },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html }
      ]
    };

    // Call SendGrid API without external dependencies
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (resp.status === 202) {
      return res.status(200).json({ ok: true, status: 202, message: "Email accepted by SendGrid", to, from });
    } else {
      const textErr = await resp.text();
      return res.status(500).json({
        ok: false,
        status: resp.status,
        error: "SendGrid did not accept the email",
        details: textErr
      });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
