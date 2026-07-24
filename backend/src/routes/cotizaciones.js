const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/cotizacionesController");

router.get("/", ctrl.listar);
router.post("/preview", ctrl.preview);
router.post("/", ctrl.crear);
router.get("/:id", ctrl.obtener);
router.patch("/:id/estado", ctrl.actualizarEstado);
router.delete("/:id", ctrl.eliminar);

module.exports = router;
