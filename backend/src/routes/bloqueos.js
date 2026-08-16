const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bloqueosController");

router.get("/", ctrl.listar);
router.post("/", ctrl.crear);
router.delete("/:id", ctrl.eliminar);

module.exports = router;
