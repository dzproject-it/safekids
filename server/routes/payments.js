import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠ STRIPE_SECRET_KEY non configurée — les paiements seront désactivés');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' })
  : null;

/**
 * POST /api/payments/create-payment-intent
 * Body: { amount (centimes), currency?, metadata? }
 * Retourne: { clientSecret, paymentIntentId }
 */
router.post('/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Service de paiement non configuré' });
  }

  const { amount, currency = 'eur', metadata } = req.body;

  if (typeof amount !== 'number' || amount < 50 || amount > 99999999) {
    return res.status(400).json({ error: 'Montant invalide (min 0,50 €)' });
  }

  // Valider currency (whitelist)
  const ALLOWED_CURRENCIES = ['eur', 'usd', 'gbp'];
  if (!ALLOWED_CURRENCIES.includes(currency)) {
    return res.status(400).json({ error: 'Devise non supportée' });
  }

  // Nettoyer metadata : seulement des strings, max 500 chars par valeur
  const cleanMetadata = {};
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof key === 'string' && key.length <= 40 && typeof value === 'string' && value.length <= 500) {
        cleanMetadata[key] = value;
      }
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      payment_method_types: ['card', 'paypal', 'link'],
      metadata: cleanMetadata,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err.message);
    res.status(500).json({ error: 'Erreur de création du paiement' });
  }
});

/**
 * POST /api/payments/confirm-status
 * Body: { paymentIntentId }
 * Retourne le statut du PaymentIntent
 */
router.post('/confirm-status', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Service de paiement non configuré' });
  }

  const { paymentIntentId } = req.body;

  if (!paymentIntentId || typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
    return res.status(400).json({ error: 'paymentIntentId invalide' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    console.error('Stripe retrieve error:', err.message);
    res.status(500).json({ error: 'Erreur de vérification du paiement' });
  }
});

/**
 * POST /api/payments/webhook
 * Stripe envoie les événements ici. Vérifie la signature avec STRIPE_WEBHOOK_SECRET.
 * IMPORTANT : Ce endpoint doit recevoir le body RAW (pas JSON parsé).
 *             Il est monté séparément dans index.js si besoin, ou bien
 *             on utilise la vérification inline ici.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) {
    return res.status(503).send('Stripe non configuré');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('⚠ STRIPE_WEBHOOK_SECRET non configuré — webhook ignoré');
    return res.status(200).send('Webhook non configuré');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature invalide :', err.message);
    return res.status(400).send('Signature invalide');
  }

  // Traiter les événements pertinents
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      console.log(`✅ Paiement réussi : ${pi.id} — ${pi.amount / 100} ${pi.currency}`);
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.warn(`❌ Paiement échoué : ${pi.id} — ${pi.last_payment_error?.message || 'inconnue'}`);
      break;
    }
    default:
      // Événement non géré — on ignore silencieusement
      break;
  }

  res.json({ received: true });
});

export default router;
