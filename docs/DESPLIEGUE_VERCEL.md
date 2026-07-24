# Despliegue gratis: Vercel (frontend) + Render (API) + Neon (PostgreSQL)

Vercel es gratis y perfecto para el **frontend**.  
La **API** (Node/Express) y la **base de datos** no viven bien solo en Vercel gratis; por eso usamos:

| Pieza | Servicio gratis | Qué hace |
|-------|-----------------|----------|
| Sitio web (React) | **Vercel** | Cliente + `/admin` |
| API (Express) | **Render** | Turnos, login, reportes |
| Base de datos | **Neon** | PostgreSQL |

WhatsApp de citas: **3114001414** (`573114001414`).

---

## Paso 1 — Base de datos en Neon (gratis)

1. Entra a [https://neon.tech](https://neon.tech) y crea una cuenta.
2. Crea un proyecto (ej. `baena-barber`).
3. Copia la **Connection string** (empieza con `postgresql://...`).
4. En el SQL Editor de Neon, pega y ejecuta todo el contenido de:
   - `backend/db/schema.sql`
5. Guarda la URL; la usarás en Render como `DATABASE_URL`.

---

## Paso 2 — API en Render (gratis)

1. Entra a [https://render.com](https://render.com) y crea una cuenta (puedes con GitHub).
2. **New → Web Service**.
3. Conecta el repo `BARBER_BAENA`.
4. Configura:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Variables de entorno (Environment):

```env
DATABASE_URL=postgresql://...la-de-neon...
JWT_SECRET=pon-una-clave-larga-y-secreta
ADMIN_USER=admin
ADMIN_PASSWORD=baena2026
BARBERSHOP_WHATSAPP=573114001414
BARBERSHOP_PHONE=+573114001414
NEQUI_NUMERO=573114001414
ALLOWED_ORIGINS=https://TU-PROYECTO.vercel.app
```

6. Despliega. Anota la URL de la API, por ejemplo:
   `https://baena-barber-api.onrender.com`

7. Prueba en el navegador:  
   `https://baena-barber-api.onrender.com/api/health`  
   Debe responder `{ "status": "ok", ... }`.

> **Nota:** en el plan gratis de Render, el servicio se “duerme” si nadie lo usa ~15 min. La primera petición puede tardar ~30–60 s.

---

## Paso 3 — Frontend en Vercel (gratis)

1. Entra a [https://vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. **Add New → Project** → importa `BARBER_BAENA`.
3. Configura el proyecto:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`  
     *(o deja la raíz del repo: ya hay un `vercel.json` en la raíz)*
   - **Build Command:** `npm run build` (si Root = `frontend`)
   - **Output Directory:** `dist`
4. Variables de entorno (Environment Variables):

```env
VITE_API_URL=https://baena-barber-api.onrender.com/api
VITE_WHATSAPP=573114001414
VITE_PHONE=+573114001414
```

> Cambia `baena-barber-api.onrender.com` por **tu** URL de Render.

5. Pulsa **Deploy**.
6. Cuando termine, copia la URL de Vercel (ej. `https://baena-barber.vercel.app`).
7. Vuelve a Render y actualiza:

```env
ALLOWED_ORIGINS=https://baena-barber.vercel.app
```

   (Si tienes dominio custom, agrégalo separado por comas.)

8. Redeploy del servicio en Render (o espera el próximo deploy).

---

## Paso 4 — Probar

| Qué | URL |
|-----|-----|
| Cliente | `https://tu-app.vercel.app/` |
| Admin | `https://tu-app.vercel.app/admin` |
| Usuario | `admin` |
| Contraseña | `baena2026` |

Agenda una cita de prueba: debe abrirse WhatsApp al **3114001414**.

---

## Dominio propio (opcional)

En Vercel → Project → **Settings → Domains** → agrega tu dominio (puede ser gratis con algunos registradores; Vercel da `*.vercel.app` sin costo).

---

## Actualizar después de cambios

```bash
git push origin cursor/baena-barber-setup-b2f3
```

- Vercel redespliega el frontend solo.
- Render redespliega la API si está conectada al mismo repo/rama.

Si usas otra rama (`main`), en Vercel/Render elige esa rama como Production Branch.

---

## Problemas frecuentes

| Problema | Solución |
|----------|----------|
| Admin no carga datos / error de red | Revisa `VITE_API_URL` (debe terminar en `/api`) y que Render esté despierto |
| CORS error en la consola | Pon la URL exacta de Vercel en `ALLOWED_ORIGINS` de Render |
| DB error | Verifica `DATABASE_URL` y que corriste `schema.sql` en Neon |
| Primera carga lenta | Normal en Render free (cold start) |
| `/admin` da 404 al refrescar | Debe existir `vercel.json` con rewrite a `index.html` (ya está en el repo) |

---

## Resumen rápido

1. **Neon** → crear DB → ejecutar `schema.sql` → copiar `DATABASE_URL`  
2. **Render** → Web Service en carpeta `backend` → pegar variables → anotar URL API  
3. **Vercel** → proyecto con `frontend` → `VITE_API_URL` = URL de Render + `/api`  
4. Poner URL de Vercel en `ALLOWED_ORIGINS` de Render  
5. Entrar a `/admin` con `admin` / `baena2026`
