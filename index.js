import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ CORS
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

// ✅ Preflight
app.options("*", cors());

// ✅ Health check
app.get("/", (req, res) => {
  res.status(200).send("Esteborg backend running 🚀");
});

// ✅ Token endpoint
app.post("/generate-token", async (req, res) => {
  try {
    const { email, personUid, accountUid } = req.body || {};

    if (!email || !personUid || !accountUid) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email, personUid, accountUid",
      });
    }

    // TODO: aquí va tu lógica REAL para generar token
    // Por ahora regresamos uno de prueba para validar CORS:
    const token = Buffer.from(
      JSON.stringify({ email, personUid, accountUid, ts: Date.now() })
    ).toString("base64");

    return res.status(200).json({ success: true, token });
  } catch (err) {
    console.error("Token generation error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Token generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Esteborg backend listening on port ${PORT}`);
});
