const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/turnosController");
const { requireAdmin } = require("../middleware/auth");

router.get("/", requireAdmin, ctrl.listar);
router.get("/disponibilidad", ctrl.consultarDisponibilidad);
router.post("/", ctrl.crear);
router.patch("/:id/estado", requireAdmin, ctrl.actualizarEstado);
router.delete("/:id", requireAdmin, ctrl.eliminar);

module.exports = router;
