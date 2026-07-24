-- Baena Barber — modelo de datos completo

CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    duracion_min INT NOT NULL DEFAULT 30 CHECK (duracion_min > 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(120) NOT NULL,
    cliente_telefono VARCHAR(30) NOT NULL DEFAULT '',
    cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
    servicio_id INT REFERENCES servicios(id) ON DELETE SET NULL,
    barbero VARCHAR(100),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'confirmado', 'completado', 'cancelado', 'no_asistio')),
    notas TEXT,
    pago_estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (pago_estado IN ('pendiente', 'pagado', 'anulado')),
    pago_metodo VARCHAR(20),
    pago_referencia VARCHAR(80),
    monto NUMERIC(10, 2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_cliente ON turnos(cliente_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_turnos_fecha_hora_activos
    ON turnos (fecha, hora)
    WHERE estado NOT IN ('cancelado', 'no_asistio');

CREATE TABLE IF NOT EXISTS cotizaciones (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(120),
    cliente_telefono VARCHAR(30),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    duracion_total INT NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador'
        CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'rechazada')),
    notas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cotizacion_items (
    id SERIAL PRIMARY KEY,
    cotizacion_id INT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
    servicio_id INT REFERENCES servicios(id) ON DELETE SET NULL,
    nombre_servicio VARCHAR(100) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    duracion_min INT NOT NULL DEFAULT 30
);

CREATE INDEX IF NOT EXISTS idx_cotizacion_items_cotizacion
    ON cotizacion_items(cotizacion_id);

CREATE TABLE IF NOT EXISTS movimientos_financieros (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    concepto VARCHAR(150) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    turno_id INT REFERENCES turnos(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_financieros(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos_financieros(tipo);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

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

INSERT INTO servicios (nombre, precio, duracion_min) VALUES
    ('Corte', 17000, 30),
    ('Barba', 10000, 20),
    ('Corte + Barba', 27000, 45)
ON CONFLICT DO NOTHING;
