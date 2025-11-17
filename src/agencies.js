import express from 'express';
import { query } from './db.js';
import { authMiddleware, adminOnly } from './auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT * FROM agencies ORDER BY name ASC', []);
    res.json({ ok: true, agencies: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur chargement agences' });
  }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, code } = req.body;
  try {
    const result = await query(
      `INSERT INTO agencies (name, code)
       VALUES ($1,$2)
       ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name
       RETURNING *`,
      [name, code]
    );
    res.json({ ok: true, agency: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur sauvegarde agence' });
  }
});

export default router;
