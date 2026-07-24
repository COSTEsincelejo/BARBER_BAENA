const { Pool } = require("pg");

// Neon / Render / Railway suelen dar DATABASE_URL
const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl:
        process.env.DB_SSL === "false"
          ? false
          : { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || "barberia",
      password: process.env.DB_PASSWORD || "barberia123",
      database: process.env.DB_NAME || "barberia_db",
    });

module.exports = pool;
