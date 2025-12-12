import express from 'express';
import cors from 'cors';

import authRouter from './auth.js';
import productsRouter from './products.js';
import salesRouter from './sales.js';
import statsRouter from './stats.js';
import agenciesRouter from './agencies.js';

import { initDb } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

// Route test
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Fliss POS Backend Advanced',
    version: '2.0'
  });
});

// === Routers des autres modules ===
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/agencies', agenciesRouter);

// === Router AUTH mais SANS le login précédent ===
app.use('/api/auth', (req, res, next) => {
  // On neutralise /api/auth/login du router original
  if (req.path === '/login') {
    return next('route');
  }
  return authRouter(req, res, next);
});

// === LOGIN DEV — SUPER ADMIN ===
// Toujours chargé EN DERNIER
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, email } = req.body || {};
    const loginId = (email || username || '').toLowerCase().trim();

    if (!loginId) {
      return res.status(400).json({
        ok: false,
        error: 'email_obligatoire'
      });
    }

    const user = {
      id: 1,
      email: loginId,
      nom: 'Super Admin',
      role: 'super_admin',
      agences: ['Valence', 'Pierrelatte']
    };

    return res.json({
      ok: true,
      user,
      token: 'fliss-dev-token-' + Date.now()
    });
  } catch (err) {
    console.error('Erreur login DEV', err);
    return res.status(500).json({
      ok: false,
      error: 'erreur_interne'
    });
  }
});

// === Lancement Serveur ===
const PORT = process.env.PORT || 10000;

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Fliss POS Backend v2 listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Erreur init DB', err);
    process.exit(1);
  }
})();
