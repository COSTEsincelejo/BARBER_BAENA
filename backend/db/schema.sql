-- Baena Barber — modelo de datos
-- turnos (citas), cotizaciones, ingresos y gastos

CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    duracion_min INT NOT NULL DEFAULT 30 CHECK (duracion_min > 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(120) NOT NULL,
    cliente_telefono VARCHAR(30) NOT NULL DEFAULT '',
    servicio_id INT REFERENCES servicios(id) ON DELETE SET NULL,
    barbero VARCHAR(100),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'confirmado', 'completado', 'cancelado')),
    notas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);

-- Evita dos citas activas en el mismo día/hora
CREATE UNIQUE INDEX IF NOT EXISTS idx_turnos_fecha_hora_activos
    ON turnos (fecha, hora)
    WHERE estado <> 'cancelado';

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

-- Servicios: Corte, Barba, Corte + Barba
INSERT INTO servicios (nombre, precio, duracion_min) VALUES
    ('Corte', 25000, 30),
    ('Barba', 18000, 20),
    ('Corte + Barba', 38000, 45)
ON CONFLICT DO NOTHING;
