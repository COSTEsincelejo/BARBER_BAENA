-- Migración: servicios Corte / Barba / combo + índice anti-duplicados

CREATE UNIQUE INDEX IF NOT EXISTS idx_turnos_fecha_hora_activos
    ON turnos (fecha, hora)
    WHERE estado <> 'cancelado';

UPDATE servicios SET activo = FALSE
WHERE lower(nombre) NOT IN ('corte', 'barba', 'corte + barba');

INSERT INTO servicios (nombre, precio, duracion_min, activo)
SELECT 'Corte', 17000, 30, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM servicios WHERE lower(nombre) = 'corte' AND activo = TRUE
);

INSERT INTO servicios (nombre, precio, duracion_min, activo)
SELECT 'Barba', 10000, 20, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM servicios WHERE lower(nombre) = 'barba' AND activo = TRUE
);

INSERT INTO servicios (nombre, precio, duracion_min, activo)
SELECT 'Corte + Barba', 27000, 45, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM servicios WHERE lower(nombre) = 'corte + barba' AND activo = TRUE
);

UPDATE servicios SET precio = 17000, duracion_min = 30, activo = TRUE
WHERE lower(nombre) = 'corte';

UPDATE servicios SET precio = 10000, duracion_min = 20, activo = TRUE
WHERE lower(nombre) = 'barba';

UPDATE servicios SET precio = 27000, duracion_min = 45, activo = TRUE
WHERE lower(nombre) = 'corte + barba';
