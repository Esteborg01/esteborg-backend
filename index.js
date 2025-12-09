// ==========================
//     ESTEBORG BACKEND
// ==========================

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Clave para firmar el Tokken (ponla en variables de entorno en Render)
const TOKEN_SECRET = process.env.TOKEN_SECRET || "CAMBIA_ESTA_CLAVE_EN_RENDER";

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

// ====== RUTAS BÁSICAS ======

// Salud
app.get("/", (req, res) => {
  res.send("Esteborg backend OK ✔");
});

// Info de prueba de /generate-token
app.get("/generate-token", (req, res) => {
  res.json({
    ok: true,
    message: "Usa POST para generar tu Tokken Esteborg.",
  });
});

// ====== GENERAR TOKKEN (JWT) ======

app.post("/generate-token", (req, res) => {
  try {
    const { email, personUid, accountUid } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Falta email" });
    }

    // Payload del usuario
    const payload = {
      email,
      personUid: personUid || null,
      accountUid: accountUid || null,
      nonce: crypto.randomBytes(8).toString("hex"),
    };

    // Firmar Tokken (ej. 30 días)
    const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: "30d" });

    console.log("Tokken generado para:", email);

    return res.json({ token });
  } catch (err) {
    console.error("Error en /generate-token:", err);
    return res.status(500).json({ error: "Error interno generando Tokken" });
  }
});

// ====== VALIDAR TOKKEN ======

app.post("/validate-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ valid: false, error: "No se recibió tokken" });
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);

    // Si todo está bien:
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

// ====== LEVANTAR SERVIDOR ======

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🔥 Servidor Esteborg escuchando en el puerto " + port);
});
