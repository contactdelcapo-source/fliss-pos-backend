import express from 'express';
import { query } from './db.js';
import { authMiddleware, adminOnly } from './auth.js';

const router = express.Router();

// Liste des produits
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY name ASC', []);
    res.json({ ok: true, products: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur chargement produits' });
  }
});

// Créer / modifier produit (admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { id, sku, name, price, stock, active } = req.body;
  try {
    if (id) {
      const result = await query(
        `UPDATE products
         SET sku=$1, name=$2, price=$3, stock=$4, active=$5
         WHERE id=$6
         RETURNING *`,
        [sku, name, price, stock ?? 0, active ?? true, id]
      );
      return res.json({ ok: true, product: result.rows[0] });
    } else {
      const result = await query(
        `INSERT INTO products (sku, name, price, stock, active)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [sku, name, price, stock ?? 0, active ?? true]
      );
      return res.json({ ok: true, product: result.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur sauvegarde produit' });
  }
});

// Supprimer produit (admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur suppression produit' });
  }
});

export default router;
