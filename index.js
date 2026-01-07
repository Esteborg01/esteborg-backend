import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ CORS: permite SOLO tu dominio nuevo
const allowedOrigins = ["https://membersvip.esteborg.live"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// ✅ Preflight (OPTIONS)
app.options("*", cors());

// ✅ Health check
app.get("/", (req, res) => {
  res.status(200).send("Esteborg backend running 🚀");
});

// ✅ Token endpoint (recibe lo que tu front ya manda)
app.post("/generate-token", async (req, res) => {
  try {
    const { email, personUid, accountUid } = req.body || {};

    if (!email || !personUid || !accountUid) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email, personUid, accountUid",
      });
    }

    // Token demo (para validar CORS y flujo)
    const token = Buffer.from(
      JSON.stringify({ email, personUid, accountUid, ts: Date.now() })
    ).toString("base64");

    return res.status(200).json({ success: true, token });
  } catch (err) {
    console.error("Token generation error:", err);
    return res.status(500).json({
      success: false,
      error: "Token generation failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Esteborg backend listening on port ${PORT}`);
});
app.get("/validate", (req, res) => {
  try {
    const token = req.query.token;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        valid: false,
        error: "missing_token",
      });
    }

    // ✅ Caso 1: Si el token que estás generando es BASE64 (demo)
    // (el que hicimos en /generate-token con Buffer.from(...).toString("base64"))
    let payload;
    try {
      payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    } catch (e) {
      // Si no es base64, puede ser JWT real -> ver caso 2
      payload = null;
    }

    if (payload && payload.email) {
      return res.status(200).json({
        valid: true,
        user: {
          email: payload.email,
          personUid: payload.personUid ?? null,
          accountUid: payload.accountUid ?? null,
        },
      });
    }

    // ✅ Caso 2: Si el token es JWT real (empieza con eyJ...)
    // Requiere jsonwebtoken + JWT_SECRET
    return res.status(401).json({
      valid: false,
      error: "invalid_or_unsupported_token",
    });
  } catch (err) {
    console.error("validate error:", err);
    return res.status(500).json({
      valid: false,
      error: "server_error",
    });
  }
});
