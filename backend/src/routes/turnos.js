const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/turnosController");

// Público: cliente agenda y consulta disponibilidad
router.get("/disponibilidad", ctrl.disponibilidad);
router.post("/", ctrl.crear);

module.exports = router;
