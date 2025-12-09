// ==========================
//     ESTEBORG BACKEND
// ==========================

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://esteborg-membersvip.carrd.co",
      "https://*.carrd.co",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Esteborg backend OK ✔");
});

// GET de prueba para /generate-token
app.get("/generate-token", (req, res) => {
  res.json({
    ok: true,
    message: "Usa POST para generar tu Tokken Esteborg.",
  });
});

// Ruta principal: POST /generate-token
app.post("/generate-token", (req, res) => {
  try {
    const { email, personUid, accountUid } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Falta email" });
    }

    // Generar token aleatorio de 64 chars
    const token = crypto.randomBytes(32).toString("hex");

    console.log("Tokken generado para:", email, token, personUid, accountUid);

    // Por ahora SOLO devolvemos el token.
    // (Luego volvemos a conectar Outseta si quieres.)
    return res.json({ token });
  } catch (err) {
    console.error("Error en /generate-token:", err);
    return res.status(500).json({ error: "Error interno generando Tokken" });
  }
});

// Levantar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🔥 Servidor Esteborg escuchando en el puerto " + port);
});
