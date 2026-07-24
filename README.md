# Barbería — Gestión de Turnos, Cotizaciones e Ingresos/Gastos

Aplicación web full-stack para gestionar una barbería:

- **Turnos**: agendar citas, cambiar estado (pendiente → confirmado → completado → cancelado), y contactar al cliente por **WhatsApp** o **llamada** con un solo clic.
- **Cotización**: seleccionar servicios y calcular el precio total y la duración estimada antes de agendar.
- **Ingresos y gastos**: registrar movimientos financieros manuales; al marcar un turno como "completado" se registra el ingreso automáticamente.

## Stack técnico

- **Backend**: Node.js + Express + PostgreSQL (driver `pg`, SQL directo, sin ORM)
- **Frontend**: React 18 + Vite + React Router
- **Base de datos**: PostgreSQL 16
- **Orquestación**: Docker Compose

## Contacto por WhatsApp y llamadas

⚠️ Importante: esta app **no usa la API oficial de WhatsApp Business** (esa requiere una cuenta de Meta Business verificada y aprobación). En su lugar, genera enlaces `wa.me` con el mensaje precargado — al hacer clic se abre WhatsApp (Web o app) con el chat listo para enviar. Es la solución más común y funcional para negocios pequeños sin necesidad de contratar la API de Meta.

Para llamadas se usa el esquema `tel:`, que en celulares abre el marcador directamente.

Configura el número de la barbería en `docker-compose.yml`:
```yaml
BARBERSHOP_WHATSAPP: "573001234567"   # sin +, sin espacios
BARBERSHOP_PHONE: "+573001234567"
```

## Cómo correr el proyecto

Necesitas Docker y Docker Compose instalados.

```bash
cd barberia-app
docker compose up --build
```

Esto levanta:
- PostgreSQL en `localhost:5432` (con las tablas y servicios de ejemplo ya creados)
- Backend (API) en `http://localhost:4000`
- Frontend en `http://localhost:5173`

Abre `http://localhost:5173` en el navegador.

## Correr sin Docker (modo desarrollo manual)

**Base de datos:** instala PostgreSQL localmente y ejecuta `backend/db/schema.sql` contra una base llamada `barberia_db`.

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # ajusta las variables si es necesario
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Estructura del proyecto

```
barberia-app/
├── docker-compose.yml
├── backend/
│   ├── db/schema.sql          # tablas + datos de ejemplo
│   └── src/
│       ├── index.js           # servidor Express
│       ├── db.js              # conexión PostgreSQL
│       ├── routes/            # turnos, servicios, finanzas
│       ├── controllers/       # lógica de negocio
│       └── utils/contacto.js  # enlaces de WhatsApp / llamada
└── frontend/
    └── src/
        ├── App.jsx            # navegación
        ├── api.js             # cliente API
        └── pages/              # Turnos, Cotizacion, Finanzas
```

## Modelo de datos

- `servicios` (id, nombre, precio, duracion_min, activo)
- `turnos` (id, cliente_nombre, cliente_telefono, servicio_id, barbero, fecha, hora, estado, notas)
- `movimientos_financieros` (id, tipo ingreso/gasto, concepto, monto, fecha, turno_id)

## Próximos pasos sugeridos

- Autenticación para el dueño/barberos (login)
- Reportes y gráficas (ingresos por mes, servicio más vendido) — se puede usar Chart.js, como en tu proyecto SIPITEX
- Recordatorios automáticos de turnos (requeriría la API de WhatsApp Business o un servicio como Twilio)
- Despliegue en un VPS o en Vercel (frontend) + Railway/Render (backend + DB)
