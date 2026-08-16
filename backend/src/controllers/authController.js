const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username y password son requeridos" });
  }
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET no está configurado");
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, username, password_hash FROM administradores WHERE username = $1",
      [username]
    );
    const admin = rows[0];
    const coincide = admin ? await bcrypt.compare(password, admin.password_hash) : false;
    if (!admin || !coincide) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

module.exports = { login };
