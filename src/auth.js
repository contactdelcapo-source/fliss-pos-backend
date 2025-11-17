import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fliss_default_secret';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Non authentifié' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Token invalide' });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Accès admin requis' });
  }
  next();
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'username et password requis' });
  }

  try {
    const result = await query(
      'SELECT id, username, role FROM users WHERE username=$1 AND password=$2 AND active=TRUE',
      [username, password]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ ok: false, error: 'Identifiants invalides' });
    }
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ ok: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erreur serveur' });
  }
});

export default router;
