// ==========================
//     ESTEBORG BACKEND
// ==========================

// Librerías
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

// Inicializar app Express
const app = express();

// Para leer JSON del body
app.use(express.json());

// ==========================
//     CORS (IMPORTANTE)
// ==========================
// Cambia esta URL por tu dominio real de Carrd
app.use(
  cors({
    origin: [
      "https://esteborg-membersvip.carrd.co",
      "https://*.carrd.co"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

// ==========================
//     RUTA RAÍZ (PRUEBA)
// ==========================
app.get("/", (req, res) => {
  res.send("Esteborg backend OK ✔");
});

// ==========================
//   RUTA GET /generate-token
//    (para probar en navegador)
// ==========================
app.get("/generate-token", (req, res) => {
  res.json({
    ok: true,
    message: "Usa POST para generar tu Tokken Esteborg."
  });
});

// ==========================
//   RUTA POST /generate-token
//   (la real que usa tu botón)
// ==========================
app.post("/generate-token", (req, res) => {
  const { email, personUid, accountUid } = req.body;

  // Validación básica
  if (!email) {
    return res.status(400).json({ error: "Falta email" });
  }

  // Generar token aleatorio d
