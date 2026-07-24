const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "baena-barber-dev-secret-change-me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, usuario: admin.usuario, role: "admin" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "No autorizado. Inicia sesión." });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    req.admin = { id: payload.sub, usuario: payload.usuario };
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

module.exports = { signAdminToken, requireAdmin, JWT_SECRET };
