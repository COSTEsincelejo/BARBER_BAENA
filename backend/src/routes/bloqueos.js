const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bloqueosController");
const { requireAdmin } = require("../middleware/auth");

router.get("/", requireAdmin, ctrl.listar);
router.post("/", requireAdmin, ctrl.crear);
router.delete("/:id", requireAdmin, ctrl.eliminar);

module.exports = router;
