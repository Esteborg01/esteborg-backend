import express from "express";
import cors from "cors";

// ==============================
// APP SETUP
// ==============================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==============================
// CORS CONFIG (CLAVE)
// ==============================
const allowedOrigins = [
  "https://membersvip.esteborg.live",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requests sin origin (Render health checks, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // pon true SOLO si usas cookies
  })
);

// Preflight (OPTIONS) para todas las rutas
app.options("*", cors());

// ==============================
// HEALTH CHECK (Render lo ama)
// ==============================
app.get("/", (req, res) => {
  res.send("Esteborg backend running 🚀");
});

// ==============================
// TOKEN GENERATION ENDPOINT
// ==============================
app.post("/generate-token", async (req, res) => {
  try {
    const { user } = req.body;

    if (!user) {
      return res.status(400).json({ error: "User data missing" });
    }

    // 👉 AQUÍ VA TU LÓGICA REAL DE TOKEN
    // Ejemplo simple:
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id || "demo",
        email: user.email || "demo@esteborg.live",
        issuedAt: Date.now(),
      })
    ).toString("base64");

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return res.status(500).json({
      success: false,
      error: "Token generation failed",
    });
  }
});

// ==============================
// SERVER START
// ==============================
app.listen(PORT, () => {
  console.log(`🔥 Esteborg backend listening on port ${PORT}`);
});

});
