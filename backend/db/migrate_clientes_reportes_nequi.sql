-- Clientes, pagos Nequi, no-shows / reportes

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NOT NULL DEFAULT '',
    notas TEXT,
    alergias TEXT,
    preferencias TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_telefono
    ON clientes (telefono)
    WHERE telefono <> '';

-- Ampliar turnos: cliente_id + pago
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL;
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS pago_estado VARCHAR(20) NOT NULL DEFAULT 'pendiente';
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS pago_metodo VARCHAR(20);
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS pago_referencia VARCHAR(80);
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS monto NUMERIC(10, 2);

-- Recrear check de estado para incluir no_asistio
ALTER TABLE turnos DROP CONSTRAINT IF EXISTS turnos_estado_check;
ALTER TABLE turnos ADD CONSTRAINT turnos_estado_check
    CHECK (estado IN ('pendiente', 'confirmado', 'completado', 'cancelado', 'no_asistio'));

-- El slot se libera si canceló o no asistió
DROP INDEX IF EXISTS idx_turnos_fecha_hora_activos;
CREATE UNIQUE INDEX IF NOT EXISTS idx_turnos_fecha_hora_activos
    ON turnos (fecha, hora)
    WHERE estado NOT IN ('cancelado', 'no_asistio');
