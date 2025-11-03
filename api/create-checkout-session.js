import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    const { email } = req.body;

    console.log("🧾 Création de session pour :", email);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Bot de trading (test 1€)",
              description: "Achat test MetaBotSafe",
            },
            unit_amount: 100, // 1€
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/success.html`,
      cancel_url: `${siteUrl}/cancel.html`,
    });

    console.log("✅ Session Stripe créée :", session.id);

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("❌ Erreur Stripe :", error.message);
    return res.status(500).json({ error: error.message });
  }
}
