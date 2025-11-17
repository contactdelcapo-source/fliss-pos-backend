import express from 'express';
import { query } from './db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// Enregistrer une vente
router.post('/', authMiddleware, async (req, res) => {
  const { agencyCode, items } = req.body;
  if (!agencyCode || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, error: 'agencyCode + items requis' });
  }

  try {
    // Récup agence
    const agRes = await query('SELECT id FROM agencies WHERE code=$1', [agencyCode]);
    if (agRes.rowCount === 0) {
      return res.status(400).json({ ok: false, error: 'Agence inconnue' });
    }
    const agencyId = agRes.rows[0].id;

    // Calcul total
    let total = 0;
    for (const it of items) {
      total += Number(it.quantity) * Number(it.unit_price);
    }

    // Insère vente
    const saleRes = await query(
      `INSERT INTO sales (agency_id, user_id, total_amount)
       VALUES ($1,$2,$3)
       RETURNING id, created_at`,
      [agencyId, req.user.id, total]
    );
    const saleId = saleRes.rows[0].id;

    // Items
    for (const it of items) {
      await query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
         VALUES ($1,$2,$3,$4,$5)`,
        [saleId, it.product_id, it.quantity, it.unit_price, it.quantity * it.unit_price]
      );
    }

    res.json({ ok: true, saleId, total, created_at: saleRes.rows[0].created_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur enregistrement vente' });
  }
});

// Liste des ventes du jour par agence
router.get('/today', authMiddleware, async (req, res) => {
  const { agencyCode } = req.query;
  try {
    let filter = '';
    const params = [];
    if (agencyCode) {
      filter = 'WHERE a.code=$1 AND s.created_at::date = CURRENT_DATE';
      params.push(agencyCode);
    } else {
      filter = 'WHERE s.created_at::date = CURRENT_DATE';
    }
    const q = `
      SELECT s.id, s.total_amount, s.created_at, a.name as agency_name, u.username
      FROM sales s
      JOIN agencies a ON a.id = s.agency_id
      LEFT JOIN users u ON u.id = s.user_id
      ${filter}
      ORDER BY s.created_at DESC
    `;
    const result = await query(q, params);
    res.json({ ok: true, sales: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur chargement ventes' });
  }
});

export default router;
