# Baena Barber

App full-stack para **Baena Barber**: agenda pública, panel admin, historial de clientes, reportes y pagos por Nequi.

## Estructura

```
BARBER_BAENA/
├── docker-compose.yml
├── backend/
│   ├── db/schema.sql
│   ├── db/migrate_*.sql
│   └── src/
└── frontend/
    └── src/
        ├── pages/Cliente.jsx   # sitio público
        ├── pages/Admin.jsx     # panel privado
        └── panels/             # Citas, Clientes, Reportes, Bloqueos, Caja
```

## Paneles

| Ruta | Quién | Qué hace |
|------|-------|----------|
| `/` | Cliente | Calendario 9:30–18:00 · Corte/Barba/Combo · WhatsApp al confirmar · pago Nequi |
| `/admin` | Admin | Login → Citas, Clientes (historial), Reportes, Bloqueos, Caja |

Admin por defecto: usuario `admin` / contraseña `baena2026` (`ADMIN_USER` / `ADMIN_PASSWORD`).

## Funciones nuevas

- **Historial de clientes**: visitas, notas, alergias, preferencias (ej. “fade alto”). Se crea/actualiza el cliente por celular al agendar.
- **Reportes**: ingresos semana/mes, servicio más vendido, no-shows.
- **Nequi**: el cliente ve el número (`NEQUI_NUMERO`), copia o avisa por WhatsApp; el admin marca “Marcar Nequi” en Citas.

## Migraciones (DB ya existente)

```bash
psql ... -f backend/db/migrate_agendamiento.sql
psql ... -f backend/db/migrate_admin.sql
psql ... -f backend/db/migrate_clientes_reportes_nequi.sql
```

Instalaciones nuevas: solo `backend/db/schema.sql`.

## Modelo de datos

| Tabla | Propósito |
|-------|-----------|
| `servicios` | Catálogo (Corte, Barba, Combo) |
| `clientes` | Historial: notas, alergias, preferencias |
| `turnos` | Citas + `pago_estado` / `pago_metodo` / `monto` / `cliente_id` |
| `movimientos_financieros` | Caja manual + ingresos al completar cita |
| `admins` / `dias_bloqueados` | Acceso y días sin servicio |

Estados de turno: `pendiente` → `confirmado` → `completado` / `cancelado` / `no_asistio`.  
Al **completar**, se registra el ingreso en caja. `no_asistio` libera el horario.

## Variables de entorno

```env
BARBERSHOP_WHATSAPP=573114001414
BARBERSHOP_PHONE=+573114001414
NEQUI_NUMERO=573114001414
ADMIN_USER=admin
ADMIN_PASSWORD=baena2026
JWT_SECRET=cambia-esto
```

## Cómo correr

```bash
docker compose up --build
```

- Frontend: http://localhost:5173  
- API: http://localhost:4000  

### Sin Docker / Codespaces

1. DB: ejecuta `schema.sql` (o migraciones si ya existía)
2. Backend: `cd backend && cp .env.example .env && npm install && npm run dev`
3. Frontend: `cd frontend && cp .env.example .env && npm install && npm run dev`
