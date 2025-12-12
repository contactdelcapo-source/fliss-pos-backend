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

// Test route
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Fliss POS Backend Advanced',
    version: '2.0'
  });
});

// 👇 ROUTE LOGIN COMPATIBLE FRONT
app.post('/api/login', authRouter);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/agencies', agenciesRouter);

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
