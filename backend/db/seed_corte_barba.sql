-- Actualiza catálogo a solo Corte y Barba (DB ya existente)
UPDATE servicios SET activo = FALSE
WHERE lower(nombre) NOT IN ('corte', 'barba');

INSERT INTO servicios (nombre, precio, duracion_min, activo)
SELECT 'Corte', 25000, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE lower(nombre) = 'corte' AND activo = TRUE);

INSERT INTO servicios (nombre, precio, duracion_min, activo)
SELECT 'Barba', 18000, 20, TRUE
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE lower(nombre) = 'barba' AND activo = TRUE);

UPDATE servicios SET precio = 25000, duracion_min = 30, activo = TRUE
WHERE lower(nombre) = 'corte';

UPDATE servicios SET precio = 18000, duracion_min = 20, activo = TRUE
WHERE lower(nombre) = 'barba';
