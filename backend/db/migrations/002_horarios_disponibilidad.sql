-- Migración 002: horarios de atención, bloqueos y índice de turnos
-- NO se aplica automáticamente.
--
-- Docker:
--   docker exec -i barberia_db psql -U barberia -d barberia_db < backend/db/migrations/002_horarios_disponibilidad.sql
--
-- psql local:
--   psql -U barberia -d barberia_db -h localhost -f backend/db/migrations/002_horarios_disponibilidad.sql

CREATE TABLE IF NOT EXISTS horarios_atencion (
    id SERIAL PRIMARY KEY,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (dia_semana)
);

CREATE TABLE IF NOT EXISTS bloqueos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NULL,
    hora_fin TIME NULL,
    motivo VARCHAR(200) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bloqueos_fecha ON bloqueos (fecha);

-- Índice de performance (no UNIQUE): barbero puede ser NULL y UNIQUE de Postgres no colisiona NULLs.
-- La unicidad de fecha+hora se valida en la aplicación al crear el turno.
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_hora ON turnos (fecha, hora);

-- Semilla: lunes a sábado 8:00–19:00. Domingo cerrado (sin fila).
-- 0=domingo, 1=lunes, …, 6=sábado
INSERT INTO horarios_atencion (dia_semana, hora_apertura, hora_cierre, activo) VALUES
    (1, '08:00', '19:00', TRUE),
    (2, '08:00', '19:00', TRUE),
    (3, '08:00', '19:00', TRUE),
    (4, '08:00', '19:00', TRUE),
    (5, '08:00', '19:00', TRUE),
    (6, '08:00', '19:00', TRUE)
ON CONFLICT (dia_semana) DO NOTHING;
