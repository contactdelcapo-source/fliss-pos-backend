import express from 'express';
import { query } from './db.js';
import { authMiddleware, adminOnly } from './auth.js';

const router = express.Router();

// Stat globales par jour
router.get('/daily', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  try {
    const result = await query(
      `
      SELECT s.created_at::date as day,
             SUM(s.total_amount) as total,
             COUNT(*) as count
      FROM sales s
      WHERE s.created_at::date BETWEEN $1 AND $2
      GROUP BY s.created_at::date
      ORDER BY day DESC
      `,
      [from || '2000-01-01', to || '2999-12-31']
    );
    res.json({ ok: true, stats: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur stats journalières' });
  }
});

// Stat par agence
router.get('/by-agency', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  try {
    const result = await query(
      `
      SELECT a.code, a.name,
             SUM(s.total_amount) as total,
             COUNT(*) as count
      FROM sales s
      JOIN agencies a ON a.id = s.agency_id
      WHERE s.created_at::date BETWEEN $1 AND $2
      GROUP BY a.code, a.name
      ORDER BY total DESC
      `,
      [from || '2000-01-01', to || '2999-12-31']
    );
    res.json({ ok: true, stats: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur stats agences' });
  }
});

export default router;
