const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
const turnos = require("../controllers/turnosController");
const bloqueos = require("../controllers/bloqueosController");
const finanzas = require("../controllers/finanzasController");
const cotizaciones = require("../controllers/cotizacionesController");
const servicios = require("../controllers/serviciosController");

router.use(requireAdmin);

// Citas
router.get("/turnos", turnos.listar);
router.patch("/turnos/:id/estado", turnos.actualizarEstado);
router.patch("/turnos/:id/pago", turnos.marcarPago);
router.delete("/turnos/:id", turnos.eliminar);

// Clientes
const clientes = require("../controllers/clientesController");
router.get("/clientes", clientes.listar);
router.get("/clientes/:id", clientes.obtener);
router.patch("/clientes/:id", clientes.actualizar);

// Reportes
const reportes = require("../controllers/reportesController");
router.get("/reportes", reportes.resumen);

// Bloqueos
router.get("/bloqueos", bloqueos.listarAdmin);
router.post("/bloqueos", bloqueos.crear);
router.delete("/bloqueos/:id", bloqueos.eliminar);

// Finanzas / cotizaciones / servicios (solo admin)
router.get("/finanzas", finanzas.listar);
router.get("/finanzas/resumen", finanzas.resumen);
router.post("/finanzas", finanzas.crear);
router.delete("/finanzas/:id", finanzas.eliminar);

router.get("/cotizaciones", cotizaciones.listar);
router.post("/cotizaciones", cotizaciones.crear);
router.post("/cotizaciones/preview", cotizaciones.preview);
router.patch("/cotizaciones/:id/estado", cotizaciones.actualizarEstado);
router.delete("/cotizaciones/:id", cotizaciones.eliminar);

router.post("/servicios", servicios.crear);
router.delete("/servicios/:id", servicios.eliminar);

module.exports = router;
