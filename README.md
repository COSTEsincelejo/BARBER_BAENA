# Baena Barber

Panel full-stack para gestionar **turnos**, **cotizaciones** e **ingresos/gastos**, con contacto directo por WhatsApp (`wa.me`) y llamada (`tel:`).

## Estructura

```
BARBER_BAENA/
├── docker-compose.yml
├── backend/
│   ├── db/schema.sql              # modelo de datos + seed
│   ├── .env.example
│   └── src/
│       ├── index.js               # Express + rutas API
│       ├── db.js                  # pool PostgreSQL
│       ├── routes/                # turnos, servicios, cotizaciones, finanzas
│       ├── controllers/
│       └── utils/contacto.js      # wa.me / tel:
└── frontend/
    ├── .env.example
    └── src/
        ├── App.jsx                # rutas / (cliente) y /admin
        ├── pages/
        │   ├── Cliente.jsx        # sitio del cliente
        │   └── Admin.jsx          # panel administrador
        ├── api.js
        └── panels/                # Turnos, Cotizaciones, Finanzas
```

## Paneles

| Ruta | Quién | Qué hace |
|------|-------|----------|
| `/` | Cliente | Ver servicios, agendar turno, cotizar, WhatsApp/llamar |
| `/admin` | Administrador | Gestionar turnos, cotizaciones y caja |

## Modelo de datos

| Tabla | Propósito |
|-------|-----------|
| `servicios` | Catálogo (nombre, precio, duración) |
| `turnos` | Citas: cliente, teléfono, servicio, fecha/hora, estado |
| `cotizaciones` | Presupuestos persistidos (cliente, total, estado) |
| `cotizacion_items` | Ítems de cada cotización |
| `movimientos_financieros` | Ingresos y gastos (`tipo`, monto, concepto, `turno_id` opcional) |

Estados de turno: `pendiente` → `confirmado` → `completado` / `cancelado`.  
Al marcar un turno como **completado**, se registra el ingreso automáticamente.

Estados de cotización: `borrador` | `enviada` | `aceptada` | `rechazada`.

## API REST (resumen)

- `GET/POST /api/turnos` · `PATCH /api/turnos/:id/estado` · `DELETE /api/turnos/:id`
- `GET/POST /api/servicios` · `DELETE /api/servicios/:id`
- `GET/POST /api/cotizaciones` · `POST /api/cotizaciones/preview` · `PATCH /api/cotizaciones/:id/estado`
- `GET/POST /api/finanzas` · `GET /api/finanzas/resumen` · `DELETE /api/finanzas/:id`
- `GET /api/contacto` · `GET /api/health`

## Contacto WhatsApp / teléfono

No usa la API de WhatsApp Business. Genera enlaces:

- `https://wa.me/<numero>?text=...`
- `tel:<numero>`

Configura en `docker-compose.yml` o `.env`:

```yaml
BARBERSHOP_WHATSAPP: "573001234567"   # sin + ni espacios
BARBERSHOP_PHONE: "+573001234567"
```

## Cómo correr

```bash
docker compose up --build
```

- Frontend: http://localhost:5173  
- API: http://localhost:4000  
- PostgreSQL: localhost:5432  

### Sin Docker

1. Crea la DB y ejecuta `backend/db/schema.sql`
2. Backend: `cd backend && cp .env.example .env && npm install && npm run dev`
3. Frontend: `cd frontend && cp .env.example .env && npm install && npm run dev`
