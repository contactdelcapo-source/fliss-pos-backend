# Fliss POS Backend Advanced v2

- Admin / JWT
- Multi-agences (Valence, Pierrelatte + ajout illimité)
- Produits (CRUD)
- Ventes + lignes de vente
- Stats journalières et par agence

## Identifiants par défaut

- username: `admin`
- password: `admin`

## Config .env

Placer un fichier `.env` avec :

DATABASE_URL=...
JWT_SECRET=...
DB_SSL=1

Sur Render, utiliser un Secret File nommé `.env` (monté dans /etc/secrets/.env).
