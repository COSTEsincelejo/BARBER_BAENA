const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/finanzasController");
const { requireAdmin } = require("../middleware/auth");

router.get("/", requireAdmin, ctrl.listar);
router.get("/resumen", requireAdmin, ctrl.resumen);
router.post("/", requireAdmin, ctrl.crear);
router.delete("/:id", requireAdmin, ctrl.eliminar);

module.exports = router;
