const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const TOKEN_SECRET = process.env.TOKEN_SECRET || "CAMBIA_ESTA_CLAVE_EN_RENDER";

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

// Salud
app.get("/", (req, res) => {
  res.send("Esteborg backend OK ✔");
});

// Info de prueba
app.get("/generate-token", (req, res) => {
  res.json({
    ok: true,
    message: "Usa POST para generar tu Tokken Esteborg.",
  });
});

// ========= GENERAR TOKKEN (POST) =========
app.post("/generate-token", (req, res) => {
  try {
    const { email, personUid, accountUid } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Falta email" });
    }

    const payload = {
      email,
      personUid: personUid || null,
      accountUid: accountUid || null,
      nonce: crypto.randomBytes(8).toString("hex"),
    };

    // Tokken JWT válido 30 días
    const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: "30d" });

    console.log("Tokken generado para:", email);

    return res.json({ token });
  } catch (err) {
    console.error("Error en /generate-token:", err);
    return res.status(500).json({ error: "Error interno generando Tokken" });
  }
});

// ========= VALIDAR TOKKEN (GET /validate?token=...) =========
app.get("/validate", (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res
      .status(400)
      .json({ valid: false, error: "No se recibió tokken" });
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);

    return res.json({
      valid: true,
      user: {
        email: decoded.email,
        personUid: decoded.personUid,
        accountUid: decoded.accountUid,
      },
    });
  } catch (err) {
    console.error("Error validando tokken:", err.message);
    return res
      .status(401)
      .json({ valid: false, error: "Tokken inválido o expirado" });
  }
});

// (opcional) también POST /validate-token, por si después lo usas
app.post("/validate-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ valid: false, error: "No se recibió tokken" });
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);

    return res.json({
      valid: true,
      user: {
        email: decoded.email,
        personUid: decoded.personUid,
        accountUid: decoded.accountUid,
      },
    });
  } catch (err) {
    console.error("Error validando tokken (POST):", err.message);
    return res
      .status(401)
      .json({ valid: false, error: "Tokken inválido o expirado" });
  }
});

// Levantar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🔥 Servidor Esteborg escuchando en el puerto " + port);
});
