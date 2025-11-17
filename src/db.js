import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// Load .env from Render secret mount if present, else local .env
const secretEnvPath = '/etc/secrets/.env';
if (fs.existsSync(secretEnvPath)) {
  dotenv.config({ path: secretEnvPath });
  console.log('Loaded .env from /etc/secrets/.env');
} else {
  dotenv.config();
  console.log('Loaded .env from local .env');
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL manquant dans .env');
  process.exit(1);
}

const useSSL = process.env.DB_SSL !== '0';

export const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

export async function initDb() {
  // Création des tables principales si elles n'existent pas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agencies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      agency_id INTEGER REFERENCES agencies(id),
      active BOOLEAN NOT NULL DEFAULT TRUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      agency_id INTEGER REFERENCES agencies(id),
      user_id INTEGER REFERENCES users(id),
      total_amount NUMERIC(12,2) NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price NUMERIC(12,2) NOT NULL,
      line_total NUMERIC(12,2) NOT NULL
    );
  `);

  // Seed agences VALENCE & PIERRELATTE
  await pool.query(
    `INSERT INTO agencies (name, code)
     VALUES 
       ('Valence', 'VALENCE'),
       ('Pierrelatte', 'PIERRELATTE')
     ON CONFLICT (code) DO NOTHING;`
  );

  // Seed admin
  await pool.query(
    `INSERT INTO users (username, password, role)
     VALUES ('admin', 'admin', 'admin')
     ON CONFLICT (username) DO NOTHING;`
  );

  console.log('Database initialisée (tables + admin/admin + agences)');
}
