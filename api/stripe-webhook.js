
// /api/stripe-webhook.js
import Stripe from 'stripe';
import sgMail from '@sendgrid/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const buf = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Erreur de vérification webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email;

    console.log(`💰 Paiement validé : ${session.amount_total / 100} EUR par ${customerEmail}`);

    try {
      // Envoi du mail client
      await sgMail.send({
        to: customerEmail,
        from: process.env.EMAIL_FROM,
        subject: 'Confirmation de votre achat MetaBotSafe ✅',
        html: `<h3>Merci pour votre achat 🎉</h3>
               <p>Votre paiement de <strong>1 €</strong> a bien été reçu.</p>
               <p>Vous pouvez visiter notre site : <a href="${process.env.SITE_URL}">${process.env.SITE_URL}</a></p>`,
      });
      console.log('📩 Email client envoyé !');

      // Envoi du mail vendeur
      await sgMail.send({
        to: process.env.SELLER_EMAIL,
        from: process.env.EMAIL_FROM,
        subject: 'Nouvelle vente MetaBotSafe 💰',
        html: `<p>Un client vient d'effectuer un paiement de 1 €.</p>
               <p>Email client : ${customerEmail}</p>`,
      });
      console.log('📩 Email vendeur envoyé !');
    } catch (mailErr) {
      console.error('❌ Erreur lors de l’envoi des e-mails :', mailErr);
    }
  }

  res.status(200).json({ received: true });
}
