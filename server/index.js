import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import qrProfilesRouter from './routes/qrProfiles.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Sécurité : en-têtes HTTP ────────────────────────────────────────────────
app.use(helmet());

// ── Sécurité : rate limiting global ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requêtes par fenêtre par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessayez plus tard' },
});
app.use(globalLimiter);

// Rate limit strict pour les paiements
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20,                   // 20 tentatives par heure par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de paiement, réessayez plus tard' },
});

// Rate limit pour la création de commandes
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de commandes, réessayez plus tard' },
});

// ── Sécurité : CORS dynamique ───────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
app.use(cors({
  origin(origin, callback) {
    // Autoriser les requêtes sans origin (curl, health checks, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  },
}));

// ── Body parser avec limite de taille ────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Stripe webhook (raw body nécessaire AVANT json parse) ───────────────────
// Le webhook Stripe est monté dans payments.js avec express.raw()

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/products', productsRouter);
app.use('/api/orders', orderLimiter, ordersRouter);
app.use('/api/qr-profiles', qrProfilesRouter);
app.use('/api/payments', paymentLimiter, paymentsRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Serveur SafeKids démarré sur le port ${PORT}`);
});
