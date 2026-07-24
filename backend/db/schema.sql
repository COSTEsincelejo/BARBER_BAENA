-- Esquema de base de datos: Barbería

CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    duracion_min INT NOT NULL DEFAULT 30,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(120) NOT NULL,
    cliente_telefono VARCHAR(30) NOT NULL,
    servicio_id INT REFERENCES servicios(id),
    barbero VARCHAR(100),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- pendiente | confirmado | completado | cancelado
    notas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimientos_financieros (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL, -- ingreso | gasto
    concepto VARCHAR(150) NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    turno_id INT REFERENCES turnos(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Datos de ejemplo: servicios típicos de barbería
INSERT INTO servicios (nombre, precio, duracion_min) VALUES
    ('Corte clásico', 20000, 30),
    ('Corte + barba', 30000, 45),
    ('Afeitado tradicional', 15000, 20),
    ('Diseño / línea', 10000, 15),
    ('Corte niño', 15000, 25)
ON CONFLICT DO NOTHING;
