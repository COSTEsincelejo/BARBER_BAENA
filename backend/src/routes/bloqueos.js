const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bloqueosController");

router.get("/publico", ctrl.listarPublico);

module.exports = router;
