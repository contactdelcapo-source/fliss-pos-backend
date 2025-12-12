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

// Route de test
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Fliss POS Backend Advanced',
    version: '2.0'
  });
});

/* =========================================================
   ✅ LOGIN API PROPRE – SUPER ADMIN GHASSEN
   Route utilisée par ton front : POST /api/auth/login
   Email : ghassen@thefliss.com
   Mot de passe : 123456
   ========================================================= */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    const loginId = (email || username || '').toLowerCase().trim();

    if (!loginId || !password) {
      return res.status(400).json({
        ok: false,
        error: 'email_et_mot_de_passe_obligatoires'
      });
    }

    // 🔐 Compte super admin FIXE
    if (loginId === 'ghassen@thefliss.com' && password === '123456') {
      const user = {
        id: 1,
        email: 'ghassen@thefliss.com',
        nom: 'Ghassen Fliss',
        role: 'super_admin',
        agences: ['Valence']   // tu pourras ajuster si besoin
      };

      const token = 'fliss-dev-token-' + Date.now();

      return res.json({
        ok: true,
        user,
        token
      });
    }

    // Si ce n’est pas le compte ghassen@thefliss.com,
    // on renvoie un refus propre.
    return res.status(401).json({
      ok: false,
      error: 'Identifiants invalides'
    });
  } catch (err) {
    console.error('Erreur login /api/auth/login', err);
    return res.status(500).json({
      ok: false,
      error: 'erreur_interne'
    });
  }
});

// Routes API existantes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/agencies', agenciesRouter);

// Port pour Render
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
