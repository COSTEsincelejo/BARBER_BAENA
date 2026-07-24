const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/turnosController");

router.get("/", ctrl.listar);
router.post("/", ctrl.crear);
router.patch("/:id/estado", ctrl.actualizarEstado);
router.delete("/:id", ctrl.eliminar);

module.exports = router;
