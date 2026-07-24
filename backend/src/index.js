require("dotenv").config();
const express = require("express");
const cors = require("cors");

const turnosRouter = require("./routes/turnos");
const serviciosRouter = require("./routes/servicios");
const finanzasRouter = require("./routes/finanzas");
const cotizacionesRouter = require("./routes/cotizaciones");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const bloqueosRouter = require("./routes/bloqueos");
const { ensureDefaultAdmin } = require("./controllers/authController");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><title>Baena Barber API</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0b0c0f;color:#f4efe6;display:grid;place-items:center;min-height:100vh;margin:0}
  main{max-width:420px;padding:24px;border:1px solid rgba(212,168,75,.35);border-radius:16px;background:#12141a}
  h1{margin:0 0 8px;font-size:1.4rem;color:#d4a84b}
  code{background:#000;padding:2px 6px;border-radius:6px}
  p{line-height:1.5;color:#9a9286}
</style></head><body><main>
  <h1>Baena Barber — API</h1>
  <p>Puerto <code>4000</code> (API). UI en <code>5173</code>.</p>
  <p>Health: <a href="/api/health" style="color:#d4a84b">/api/health</a></p>
</main></body></html>`);
});

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", app: "Baena Barber" })
);

app.get("/api/contacto", (_req, res) => {
  const { linkWhatsApp, linkLlamada } = require("./utils/contacto");
  const wa = process.env.BARBERSHOP_WHATSAPP || "573114001414";
  const phone = process.env.BARBERSHOP_PHONE || "+573114001414";
  const nequi = process.env.NEQUI_NUMERO || wa;
  res.json({
    whatsapp: linkWhatsApp(wa, "Hola Baena Barber, quiero agendar un turno."),
    telefono: linkLlamada(phone),
    numero_whatsapp: wa,
    numero_telefono: phone,
    nequi_numero: nequi,
  });
});

// Público
app.use("/api/auth", authRouter);
app.use("/api/turnos", turnosRouter);
app.use("/api/servicios", serviciosRouter); // GET list público
app.use("/api/bloqueos", bloqueosRouter);

// Admin protegido
app.use("/api/admin", adminRouter);

// Compat: finanzas/cotizaciones solo vía /api/admin (404 en rutas viejas sin auth)
app.use("/api/finanzas", (_req, res) =>
  res.status(401).json({ error: "Usa /api/admin/finanzas con autenticación" })
);
app.use("/api/cotizaciones", (_req, res) =>
  res.status(401).json({ error: "Usa /api/admin/cotizaciones con autenticación" })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Baena Barber API en http://localhost:${PORT}`);
  await ensureDefaultAdmin();
});
