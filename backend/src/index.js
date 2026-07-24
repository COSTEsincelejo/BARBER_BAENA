require("dotenv").config();
const express = require("express");
const cors = require("cors");

const turnosRouter = require("./routes/turnos");
const serviciosRouter = require("./routes/servicios");
const finanzasRouter = require("./routes/finanzas");
const cotizacionesRouter = require("./routes/cotizaciones");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", app: "Baena Barber" })
);

app.get("/api/contacto", (_req, res) => {
  const { linkWhatsApp, linkLlamada } = require("./utils/contacto");
  const wa = process.env.BARBERSHOP_WHATSAPP || "573000000000";
  const phone = process.env.BARBERSHOP_PHONE || "+573000000000";
  res.json({
    whatsapp: linkWhatsApp(wa, "Hola Baena Barber, quiero agendar un turno."),
    telefono: linkLlamada(phone),
    numero_whatsapp: wa,
    numero_telefono: phone,
  });
});

app.use("/api/turnos", turnosRouter);
app.use("/api/servicios", serviciosRouter);
app.use("/api/finanzas", finanzasRouter);
app.use("/api/cotizaciones", cotizacionesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Baena Barber API en http://localhost:${PORT}`);
});
