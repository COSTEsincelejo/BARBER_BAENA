const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/serviciosController");

router.get("/", ctrl.listar);
router.post("/", ctrl.crear);
router.post("/cotizar", ctrl.cotizar);
router.delete("/:id", ctrl.eliminar);

module.exports = router;
