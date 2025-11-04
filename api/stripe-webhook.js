// /api/stripe-webhook.js
import { buffer } from "micro";
import Stripe from "stripe";
import { sendEmail } from "./sendMail.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // === 1️⃣ Quand Stripe confirme le paiement ===
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Informations du client
      const customerEmail = session.customer_details?.email;
      const amount = (session.amount_total / 100).toFixed(2);
      const productName = session.metadata?.productName || "Bot inconnu";

      // === 2️⃣ Email client ===
      const htmlClient = `
        <div style="font-family:sans-serif;line-height:1.5;color:#333">
          <h2>🤖 Merci pour votre achat sur MetaBotSafe !</h2>
          <p>Votre paiement de <strong>${amount} €</strong> pour le bot <strong>${productName}</strong> a bien été reçu.</p>
          <p>Vous recevrez sous peu un e-mail séparé contenant votre guide et vos fichiers d’installation.</p>
          <p>Merci pour votre confiance,<br>L’équipe MetaBotSafe</p>
        </div>
      `;

      await sendEmail(
        customerEmail,
        `Confirmation de votre achat MetaBotSafe — ${productName}`,
        htmlClient,
        `Merci pour votre achat de ${productName} (${amount} €) sur MetaBotSafe !`
      );

      // === 3️⃣ Email admin ===
      const htmlAdmin = `
        <div style="font-family:sans-serif;line-height:1.5;color:#333">
          <h2>🧾 Nouvelle vente !</h2>
          <p><strong>${productName}</strong> vient d’être acheté pour <strong>${amount} €</strong>.</p>
          <p>Client : ${customerEmail}</p>
          <p>La somme sera transférée automatiquement sur votre compte Stripe/Bancaire.</p>
        </div>
      `;

      await sendEmail(
        "metabotsafe@gmail.com",
        `🧾 Nouvelle vente : ${productName}`,
        htmlAdmin,
        `Le bot ${productName} a été vendu à ${customerEmail} pour ${amount} €`
      );

      console.log(`✅ E-mails envoyés pour ${productName} (${customerEmail})`);
    } catch (err) {
      console.error("Erreur lors de l'envoi des e-mails :", err);
    }
  }

  res.status(200).json({ received: true });
}
