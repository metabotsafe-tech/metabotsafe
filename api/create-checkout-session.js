import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Achat test MetaBotSafe",
            },
            unit_amount: 100, // 1€ en centimes
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.SITE_URL}/success.html`,
      cancel_url: `${process.env.SITE_URL}/cancel.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Erreur Stripe :", err);
    return res.status(500).json({ error: err.message });
  }
}
