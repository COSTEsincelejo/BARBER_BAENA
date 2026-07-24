const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
const ctrl = require("../controllers/authController");

router.post("/login", ctrl.login);
router.get("/me", requireAdmin, ctrl.me);

module.exports = router;
