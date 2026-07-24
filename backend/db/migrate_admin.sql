-- Admin privado + días bloqueados (migración)

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- tipo: 'fecha' (fecha exacta) | 'dia_semana' (0=domingo … 6=sábado, igual que JS)
CREATE TABLE IF NOT EXISTS dias_bloqueados (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('fecha', 'dia_semana')),
    fecha DATE,
    dia_semana SMALLINT CHECK (dia_semana IS NULL OR (dia_semana >= 0 AND dia_semana <= 6)),
    motivo VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT dias_bloqueados_fecha_chk CHECK (
        (tipo = 'fecha' AND fecha IS NOT NULL AND dia_semana IS NULL)
        OR (tipo = 'dia_semana' AND dia_semana IS NOT NULL AND fecha IS NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bloqueos_fecha
    ON dias_bloqueados (fecha)
    WHERE tipo = 'fecha';

CREATE UNIQUE INDEX IF NOT EXISTS idx_bloqueos_dia_semana
    ON dias_bloqueados (dia_semana)
    WHERE tipo = 'dia_semana';
