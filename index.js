const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken"); // 👈 NUEVO

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

// 👉 Función para crear un token de miembro
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

// 👉 Endpoint para emitir un token de membresía
// POST /api/issue-token
// Body JSON: { "userId": "usuario123", "plan": "premium" }
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

app.listen(PORT, () => {
  console.log(`Esteborg backend escuchando en http://localhost:${PORT}`);
});
