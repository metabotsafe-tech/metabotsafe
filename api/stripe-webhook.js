import Stripe from "stripe";
import sgMail from "@sendgrid/mail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const config = {
  api: {
    bodyParser: false, // Stripe nécessite le raw body
  },
};

import { buffer } from "micro"; // micro est déjà inclus dans Vercel

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  let event;
  try {
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err) {
    console.error("❌ Erreur de vérification Webhook :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = session.customer_email;
    const amount = session.amount_total / 100;
    const sellerEmail = process.env.SELLER_EMAIL || "metabotsafe@gmail.com";

    console.log(`💰 Paiement validé : ${amount} EUR par ${customerEmail}`);

    try {
      // ✉️ Email client
      await sgMail.send({
        to: customerEmail,
        from: sellerEmail,
        subject: "✅ Paiement réussi - MetaBotSafe",
        html: `
          <h2>Merci pour votre achat !</h2>
          <p>Votre paiement de <strong>${amount} €</strong> a été reçu avec succès.</p>
          <p>Vous allez recevoir votre guide PDF par e-mail.</p>
          <p>— L’équipe MetaBotSafe</p>
        `,
      });
      console.log("📩 Email client envoyé !");
    } catch (err) {
      console.error("❌ Erreur mail client :", err.message);
    }

    try {
      // ✉️ Email vendeur
      await sgMail.send({
        to: sellerEmail,
        from: sellerEmail,
        subject: "💸 Nouvelle commande MetaBotSafe",
        html: `
          <h3>Nouvelle commande reçue</h3>
          <p><strong>Client :</strong> ${customerEmail}</p>
          <p><strong>Montant :</strong> ${amount} €</p>
        `,
      });
      console.log("📩 Email vendeur envoyé !");
    } catch (err) {
      console.error("❌ Erreur mail vendeur :", err.message);
    }
  }

  res.json({ received: true });
}
