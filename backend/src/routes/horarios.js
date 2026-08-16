const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/horariosController");

router.get("/", ctrl.listar);
router.put("/:dia_semana", ctrl.actualizar);

module.exports = router;
