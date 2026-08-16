require("dotenv").config();
const express = require("express");
const cors = require("cors");

const turnosRouter = require("./routes/turnos");
const serviciosRouter = require("./routes/servicios");
const finanzasRouter = require("./routes/finanzas");
const horariosRouter = require("./routes/horarios");
const bloqueosRouter = require("./routes/bloqueos");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/turnos", turnosRouter);
app.use("/api/servicios", serviciosRouter);
app.use("/api/finanzas", finanzasRouter);
app.use("/api/horarios", horariosRouter);
app.use("/api/bloqueos", bloqueosRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API de la barbería corriendo en http://localhost:${PORT}`);
});
