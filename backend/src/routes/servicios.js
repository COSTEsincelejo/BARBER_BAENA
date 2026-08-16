const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/serviciosController");
const { requireAdmin } = require("../middleware/auth");

router.get("/", ctrl.listar);
router.post("/", requireAdmin, ctrl.crear);
router.post("/cotizar", ctrl.cotizar);
router.put("/:id", requireAdmin, ctrl.actualizar);
router.delete("/:id", requireAdmin, ctrl.eliminar);

module.exports = router;
