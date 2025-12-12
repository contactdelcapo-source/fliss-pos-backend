import express from "express";
import cors from "cors";

import authRouter from "./auth.js";
import productsRouter from "./products.js";
import salesRouter from "./sales.js";
import statsRouter from "./stats.js";
import agenciesRouter from "./agencies.js";
import { initDb } from "./db.js";

const app = express();

/* =========================================================
   🔧 CONFIG EXPRESS — IMPORTANT
   ========================================================= */
app.use(cors({ origin: "*" }));
app.use(express.json()); // OBLIGATOIRE pour lire req.body JSON
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   🔍 ROUTE TEST
   ========================================================= */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Fliss POS Backend Advanced",
    version: "2.0",
  });
});

/* =========================================================
   🔐 LOGIN DEV – SUPER ADMIN GHASSEN
   ========================================================= */
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, username, password } = req.body || {};

    const loginId = (email || username || "").toLowerCase().trim();

    if (!loginId) {
      return res.status(400).json({
        ok: false,
        error: "email_obligatoire"
      });
    }

    const user = {
      id: 1,
      email: loginId,
      nom: "Super Admin",
      role: "super_admin",
      agences: ["Valence", "Pierrelatte"],
    };

    const token = "fliss-dev-token-" + Date.now();

    return res.json({
      ok: true,
      user,
      token,
    });
  } catch (err) {
    console.error("Erreur login /api/auth/login", err);
    return res.status(500).json({
      ok: false,
      error: "erreur_interne"
    });
  }
});

/* =========================================================
   🔗 ROUTES OFFICIELLES
   ========================================================= */
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/agencies", agenciesRouter);

/* =========================================================
   🚀 START SERVER
   ========================================================= */
const PORT = process.env.PORT || 10000;

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log("Fliss POS Backend v2 listening on port", PORT);
    });
  } catch (err) {
    console.error("Erreur init DB", err);
    process.exit(1);
  }
})();
