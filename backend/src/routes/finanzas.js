const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/finanzasController");

router.get("/", ctrl.listar);
router.get("/resumen", ctrl.resumen);
router.post("/", ctrl.crear);
router.delete("/:id", ctrl.eliminar);

module.exports = router;
