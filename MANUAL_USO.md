# Manual de uso — Baena Barber

Guía rápida para **clientes** y **administrador**.

> **Manual formal del cliente (norma IEEE 830):**  
> [`docs/MANUAL_USUARIO_CLIENTE_IEEE830.md`](docs/MANUAL_USUARIO_CLIENTE_IEEE830.md)

| Quién | Dirección |
|-------|-----------|
| Cliente (público) | `http://localhost:5173/` |
| Administrador | `http://localhost:5173/admin` |

Horario de atención en el sistema: **9:30 a.m. – 6:00 p.m.**, cada **30 minutos**.

Servicios y precios:

| Servicio | Precio |
|----------|--------|
| Corte | $17.000 |
| Barba | $10.000 |
| Corte + Barba | $27.000 |

---

## 1. Manual del cliente

### 1.1 Qué puedes hacer

- Ver servicios y precios
- Agendar una cita (día + hora + servicio)
- Avisar al barbero por WhatsApp al confirmar
- Pagar por **Nequi** (opcional, después de confirmar)
- Escribir dudas por el botón flotante de WhatsApp

### 1.2 Paso a paso para agendar

1. Entra al sitio público (`/`).
2. Baja a **Agendar cita**.
3. **Elige el día** en el calendario.
   - Los días pasados no se pueden seleccionar.
   - Los días bloqueados por el admin aparecen no disponibles.
4. **Elige la hora** disponible.
   - Las tachadas están ocupadas o ya pasaron.
5. **Elige el servicio**: Corte, Barba o Corte + Barba.
6. Escribe tu **nombre** y tu **celular** (obligatorio).
7. Pulsa **Confirmar cita por WhatsApp**.
8. Se abre WhatsApp con el mensaje de la cita para el administrador.
9. En la página aparece la tarjeta **Pagar con Nequi**:
   - Copia el número o envía el monto por Nequi.
   - Usa **Avisar pago por WhatsApp** para avisar que ya pagaste.

### 1.3 Dudas o preguntas

- Usa el botón **WhatsApp** de la barra superior, el del pie, o el ícono flotante **¿Dudas?**

### 1.4 Tips

- El celular sirve para tu historial en la barbería y para el seguimiento del pago.
- Si WhatsApp no se abre, revisa que el navegador no esté bloqueando ventanas emergentes.
- Si un horario desaparece al refrescar, otro cliente ya lo tomó: elige otra hora.

---

## 2. Manual del administrador

### 2.1 Entrar al panel

1. Ve a `/admin`.
2. Usuario: `admin`
3. Contraseña: `baena2026` (cámbiala en producción con `ADMIN_PASSWORD`)
4. Pulsa **Iniciar sesión**.
5. Para salir: **Cerrar sesión**.

El panel es privado: el cliente no ve enlaces al admin en el sitio público.

### 2.2 Pestañas del panel

| Pestaña | Para qué sirve |
|---------|----------------|
| **Citas** | Ver y gestionar la agenda |
| **Clientes** | Historial (visitas, notas, alergias, preferencias) |
| **Reportes** | Ingresos, servicio más vendido, no-shows |
| **Bloqueos** | Días sin servicio |
| **Caja** | Ingresos/gastos manuales |

---

### 2.3 Citas

**Filtrar**

- Por día exacto, por rango (desde–hasta) o por estado.
- Estados: `pendiente`, `confirmado`, `completado`, `cancelado`, `no_asistio`.

**Cambiar estado de una cita**

1. En la fila de la cita, abre el selector de estado.
2. Elige el nuevo estado:
   - **confirmado**: cita aceptada.
   - **completado**: servicio hecho → el sistema registra el ingreso en caja.
   - **cancelado**: se libera el horario.
   - **no_asistio**: el cliente no llegó → se libera el horario y cuenta en reportes.

**Pago Nequi**

1. Cuando el cliente avisa que pagó, pulsa **Marcar Nequi**.
2. El pago pasa a `pagado · nequi`.

**Eliminar**

- **Eliminar** borra la cita por completo (pide confirmación).

Flujo recomendado del día:

```
pendiente → confirmado → (cliente llega) → completado
                         (no llegó)      → no_asistio
                         (canceló)       → cancelado
```

---

### 2.4 Clientes (historial)

1. Abre **Clientes**.
2. Busca por nombre o teléfono.
3. Selecciona un cliente.
4. Completa:
   - **Alergias** (ej. sensibilidad a un producto)
   - **Preferencias** (ej. fade alto, barba perfilada)
   - **Notas** generales
5. Pulsa **Guardar historial**.
6. Abajo verás las **últimas visitas** (fecha, hora, servicio, estado).

Los clientes se crean solos cuando alguien agenda con celular.

---

### 2.5 Reportes

1. Abre **Reportes**.
2. Elige **Esta semana** o **Este mes**.
3. Verás:
   - **Ingresos** y **gastos** del período
   - **No-shows** (citas en `no_asistio`)
   - **Servicio más vendido** y tabla por servicio

Sirve para saber qué se vende más y cuántas ausencias hubo.

---

### 2.6 Bloqueos

Usa esta pestaña cuando no hay servicio.

**Fecha exacta** (ej. un feriado o vacaciones un día):

1. Elige la fecha.
2. (Opcional) escribe el motivo.
3. Guarda.

**Día de la semana recurrente** (ej. todos los domingos):

1. Elige el día (Domingo…Sábado).
2. (Opcional) motivo.
3. Guarda.

En el calendario público esos días quedan bloqueados. Puedes quitar un bloqueo cuando quieras.

---

### 2.7 Caja

- Registra **ingresos** o **gastos** manuales (concepto, monto, fecha).
- Al marcar una cita como **completado**, el ingreso del servicio se suma solo.
- El resumen muestra ingresos, gastos y balance.

---

### 2.8 WhatsApp y Nequi (configuración)

En `backend/.env` (o docker-compose):

| Variable | Qué es |
|----------|--------|
| `BARBERSHOP_WHATSAPP` | Número para WhatsApp (sin `+`, ej. `573001234567`) |
| `BARBERSHOP_PHONE` | Teléfono para llamadas (`+573001234567`) |
| `NEQUI_NUMERO` | Número Nequi que ve el cliente |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Acceso al panel |

Después de cambiar variables, reinicia el backend.

---

## 3. Flujo completo (ejemplo)

1. Cliente agenda Corte el viernes 10:00 y confirma por WhatsApp.
2. Admin ve la cita en **Citas** → la pasa a **confirmado**.
3. Cliente paga por Nequi y avisa por WhatsApp.
4. Admin pulsa **Marcar Nequi**.
5. El viernes el cliente llega; admin marca **completado**.
6. Admin abre **Clientes** y anota “fade alto” en preferencias.
7. El domingo mira **Reportes → Esta semana** para ver ingresos y no-shows.

---

## 4. Problemas frecuentes

| Problema | Qué hacer |
|----------|-----------|
| No puedo entrar al admin | Revisa usuario/contraseña; limpia sesión o usa otro navegador |
| No hay horarios un día | Ese día puede estar bloqueado o ya pasado |
| “Horario ocupado” | Elige otra hora; alguien lo reservó antes |
| No aparece tarjeta Nequi | Confirma la cita primero; revisa `NEQUI_NUMERO` en el backend |
| Reportes en cero | Aún no hay citas completadas / pagos / no-shows en el período |
| Clientes vacíos | Deben agendar con celular para crear el historial |

---

*Baena Barber — manual de uso v1*
