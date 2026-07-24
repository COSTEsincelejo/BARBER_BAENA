const bcrypt = require("bcryptjs");
const pool = require("../db");
const { signAdminToken } = require("../middleware/auth");

async function ensureDefaultAdmin() {
  const usuario = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASSWORD || "baena2026";
  try {
    const { rows } = await pool.query("SELECT id FROM admins WHERE usuario = $1", [
      usuario,
    ]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO admins (usuario, password_hash) VALUES ($1, $2)",
        [usuario, hash]
      );
      console.log(`Admin creado: usuario="${usuario}"`);
    }
  } catch (err) {
    // Tabla puede no existir aún en el primer arranque
    console.warn("No se pudo asegurar admin (¿migración pendiente?):", err.message);
  }
}

async function login(req, res) {
  const usuario = String(req.body.usuario || "").trim();
  const password = String(req.body.password || "");
  if (!usuario || !password) {
    return res.status(400).json({ error: "usuario y password son requeridos" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT id, usuario, password_hash FROM admins WHERE usuario = $1",
      [usuario]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }
    const admin = rows[0];
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }
    const token = signAdminToken(admin);
    res.json({
      token,
      admin: { id: admin.id, usuario: admin.usuario },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

async function me(req, res) {
  res.json({ admin: req.admin });
}

module.exports = { login, me, ensureDefaultAdmin };
