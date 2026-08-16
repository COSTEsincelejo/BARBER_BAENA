const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/horariosController");
const { requireAdmin } = require("../middleware/auth");

router.get("/", requireAdmin, ctrl.listar);
router.put("/:dia_semana", requireAdmin, ctrl.actualizar);

module.exports = router;
