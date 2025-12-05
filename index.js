const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken"); // 👈 ya lo tenías

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SECRET = process.env.SECRET_TOKEN_KEY || "dev-secret";

// 👉 Ruta simple para probar que el server está vivo
app.get("/", (req, res) => {
  res.send("Servidor Esteborg está vivo 🦾");
});

// 👉 Función para crear un token de miembro (ya la tenías)
function createMemberToken(userId, plan = "premium") {
  const payload = {
    sub: userId,          // ID del usuario
    plan,                 // plan del usuario
    type: "esteborg_member"
  };

  // Token válido por 1 año (puedes cambiarlo después)
  const token = jwt.sign(payload, SECRET, { expiresIn: "365d" });
  return token;
}

// 👉 Endpoint para emitir un token de membresía (ya lo tenías)
// POST /api/issue-token
app.post("/api/issue-token", (req, res) => {
  const { userId, plan } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId es requerido" });
  }

  const token = createMemberToken(userId, plan || "premium");

  return res.json({
    ok: true,
    userId,
    plan: plan || "premium",
    token
  });
});


// 🔐 MIDDLEWARE: verificar token de miembro
function verifyMemberToken(req, res, next) {
  const { member_token } = req.body;

  if (!member_token) {
    return res.status(401).json({ error: "member_token es requerido" });
  }

  try {
    const decoded = jwt.verify(member_token, SECRET);

    // Guardamos los datos del miembro en la request para usarlos después
    req.member = {
      id: decoded.sub,
      plan: decoded.plan || "premium",
      raw: decoded
    };

    next(); // sigue al siguiente handler
  } catch (err) {
    console.error("Error verificando token:", err.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// 🔐 ENDPOINT PREMIUM protegido por token
// POST /api/premium/exercise
// Body JSON: { "member_token": "...", "prompt_usuario": "...", "objetivo": "..." }
app.post("/api/premium/exercise", verifyMemberToken, (req, res) => {
  const { prompt_usuario, objetivo } = req.body;
  const member = req.member; // viene del middleware

  const objetivoTexto = objetivo || "Mejorar tu comunicación";

  const resultado = `
Hola, ${member.id} 👋 (plan: ${member.plan})

Este es un EJERCICIO PREMIUM Esteborg.

Objetivo: ${objetivoTexto}

Instrucciones:
1. Describe una situación real donde sentiste que no te comunicaste bien.
2. Escribe qué dijiste y qué te hubiera gustado decir.
3. Identifica una emoción que sentías en ese momento.
4. Reescribe tu respuesta incorporando claridad + empatía.

Tu contexto:
"${prompt_usuario || "sin contexto recibido todavía"}"
`;

  return res.json({
    ok: true,
    memberId: member.id,
    plan: member.plan,
    result: resultado
  });
});

app.listen(PORT, () => {
  console.log(`Esteborg backend escuchando en http://localhost:${PORT}`);
});
