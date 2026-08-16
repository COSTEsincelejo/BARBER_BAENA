-- Migración 003: autenticación de administrador
-- NO se aplica automáticamente.
-- El admin inicial se crea con: npm run seed:admin
-- (variables ADMIN_USERNAME y ADMIN_PASSWORD).
--
-- Docker:
--   docker exec -i barberia_db psql -U barberia -d barberia_db < backend/db/migrations/003_admin_auth.sql
--
-- psql local:
--   psql -U barberia -d barberia_db -h localhost -f backend/db/migrations/003_admin_auth.sql

CREATE TABLE IF NOT EXISTS administradores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
