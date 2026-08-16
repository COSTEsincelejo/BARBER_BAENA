require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../db");

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error("ADMIN_USERNAME y ADMIN_PASSWORD son requeridos");
    process.exitCode = 1;
    return;
  }

  const existente = await pool.query(
    "SELECT id FROM administradores WHERE username = $1",
    [username]
  );
  if (existente.rows.length > 0) {
    console.log(`El administrador "${username}" ya existe. No se creó uno nuevo.`);
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO administradores (username, password_hash)
     VALUES ($1, $2) RETURNING id, username, created_at`,
    [username, password_hash]
  );
  console.log(`Administrador creado: ${rows[0].username} (id=${rows[0].id})`);
}

seedAdmin()
  .catch((err) => {
    console.error("Error al crear el administrador:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
