# MANUAL DE USUARIO DEL CLIENTE

## Sistema de gestión de citas — Baena Barber

| Campo | Valor |
|-------|--------|
| **Código del documento** | MU-BB-CLI-001 |
| **Tipo de documento** | Manual de Usuario (módulo Cliente) |
| **Norma de referencia** | IEEE Std 830-1998 *(Recommended Practice for Software Requirements Specifications)* — estructura documental adaptada a manual de usuario |
| **Versión** | 1.0 |
| **Fecha** | 24 de julio de 2026 |
| **Sistema** | Baena Barber |
| **Módulo** | Sitio público del cliente (`/`) |
| **Elaborado para** | Cristian Camilo Baena Ruiz — Baena Barber |
| **Estado** | Vigente |

> **Nota sobre la norma.** No existe una norma IEEE 380 aplicable a manuales de software de usuario. La práctica académica y profesional en ingeniería de software en Colombia y Latinoamérica utiliza la **estructura documental de IEEE Std 830-1998** para organizar especificaciones y, por extensión, manuales de usuario. Este documento sigue esa organización (Introducción, Descripción general, Requisitos / instrucciones específicas y Anexos).

---

## Control de cambios

| Versión | Fecha | Descripción | Autor |
|---------|-------|-------------|--------|
| 1.0 | 2026-07-24 | Emisión inicial del Manual de Usuario del Cliente | Baena Barber / equipo de desarrollo |

---

## Tabla de contenido

1. [Introducción](#1-introducción)  
   1.1 [Propósito](#11-propósito)  
   1.2 [Alcance](#12-alcance)  
   1.3 [Definiciones, acrónimos y abreviaturas](#13-definiciones-acrónimos-y-abreviaturas)  
   1.4 [Referencias](#14-referencias)  
   1.5 [Visión general del documento](#15-visión-general-del-documento)  
2. [Descripción general](#2-descripción-general)  
   2.1 [Perspectiva del producto](#21-perspectiva-del-producto)  
   2.2 [Funciones del producto (vista cliente)](#22-funciones-del-producto-vista-cliente)  
   2.3 [Características de los usuarios](#23-características-de-los-usuarios)  
   2.4 [Restricciones](#24-restricciones)  
   2.5 [Supuestos y dependencias](#25-supuestos-y-dependencias)  
3. [Requisitos específicos de uso](#3-requisitos-específicos-de-uso)  
   3.1 [Requisitos del entorno](#31-requisitos-del-entorno)  
   3.2 [Acceso al sistema](#32-acceso-al-sistema)  
   3.3 [Consulta de servicios y precios](#33-consulta-de-servicios-y-precios)  
   3.4 [Agendamiento de cita](#34-agendamiento-de-cita)  
   3.5 [Confirmación por WhatsApp](#35-confirmación-por-whatsapp)  
   3.6 [Pago en línea con Nequi](#36-pago-en-línea-con-nequi)  
   3.7 [Consulta de dudas](#37-consulta-de-dudas)  
4. [Interfaz de usuario — descripción de pantallas](#4-interfaz-de-usuario--descripción-de-pantallas)  
5. [Mensajes del sistema y solución de problemas](#5-mensajes-del-sistema-y-solución-de-problemas)  
6. [Anexos](#6-anexos)

---

## 1. Introducción

### 1.1 Propósito

El presente documento constituye el **Manual de Usuario del Cliente** del sistema **Baena Barber**. Su propósito es describir, de forma clara y estructurada, cómo el usuario final (cliente de la barbería) utiliza el sitio público para:

- consultar servicios y precios;
- agendar una cita;
- notificar la reserva al administrador por WhatsApp;
- realizar el pago sugerido mediante Nequi;
- solicitar información o resolver dudas.

Este manual está dirigido a **clientes** de Baena Barber y a personal de apoyo que oriente a los clientes en el uso del sistema. **No** describe el panel de administración (`/admin`).

### 1.2 Alcance

| Incluye | No incluye |
|---------|------------|
| Sitio público en la ruta `/` | Panel administrador `/admin` |
| Agendamiento de citas | Gestión de bloqueos, reportes o caja |
| Flujo WhatsApp de confirmación | Configuración de servidores o base de datos |
| Pago sugerido por Nequi | Integración bancaria automática de Nequi (API) |
| Contacto para dudas | Historial interno de preferencias (solo visible al admin) |

**Nombre del software:** Baena Barber — módulo Cliente.  
**Versión del software cubierta:** 1.0 (rama de despliegue del proyecto BARBER_BAENA).

### 1.3 Definiciones, acrónimos y abreviaturas

| Término | Definición |
|---------|------------|
| **Cliente** | Usuario final que agenda y/o paga un servicio de barbería |
| **Cita / Turno** | Reserva de un servicio en una fecha y hora específicas |
| **Slot** | Intervalo de 30 minutos disponible para atención |
| **Nequi** | Medio de pago digital; el cliente transfiere al número publicado |
| **WhatsApp** | Canal de mensajería usado para avisar la cita y el pago |
| **Admin** | Administrador de la barbería (fuera del alcance de este manual) |
| **IEEE 830** | Norma IEEE Std 830-1998 de especificación de requisitos de software |
| **UI** | Interfaz de usuario |

### 1.4 Referencias

| Código | Documento |
|--------|-----------|
| IEEE Std 830-1998 | *IEEE Recommended Practice for Software Requirements Specifications* |
| MU-BB-001 | Manual de uso general del sistema (referencia interna del repositorio) |
| README.md | Documentación técnica de instalación del proyecto BARBER_BAENA |
| — | Políticas de uso de WhatsApp / Nequi del establecimiento |

### 1.5 Visión general del documento

- La **sección 2** describe el producto desde la perspectiva del cliente.  
- La **sección 3** detalla los procedimientos de uso paso a paso (requisitos específicos de operación).  
- La **sección 4** describe las pantallas principales.  
- La **sección 5** documenta mensajes y solución de problemas.  
- La **sección 6** contiene anexos (precios, horarios, glosario visual).

---

## 2. Descripción general

### 2.1 Perspectiva del producto

Baena Barber es un sistema web de gestión de barbería. El **módulo Cliente** es la cara pública del sistema: una aplicación web responsive que se ejecuta en el navegador y se comunica con una API backend para consultar disponibilidad, crear citas y obtener datos de contacto / Nequi.

```
[ Cliente (navegador) ]  →  Sitio público (/)  →  API  →  Base de datos
                                      ↓
                         WhatsApp (wa.me) / Nequi (número)
```

### 2.2 Funciones del producto (vista cliente)

| ID | Función | Descripción |
|----|---------|-------------|
| F-C01 | Ver marca y servicios | Visualizar logo, identidad y lista de servicios con precio |
| F-C02 | Seleccionar fecha | Elegir día en calendario (sin días pasados ni bloqueados) |
| F-C03 | Seleccionar hora | Elegir slot disponible entre 9:30 y 18:00 |
| F-C04 | Seleccionar servicio | Corte, Barba o Corte + Barba |
| F-C05 | Identificarse | Ingresar nombre |
| F-C06 | Confirmar cita | Enviar aviso al administrador por WhatsApp |
| F-C07 | Pagar con Nequi | Ver número, monto, copiar y/o avisar pago |
| F-C08 | Consultar dudas | Abrir chat WhatsApp prearmado |

### 2.3 Características de los usuarios

| Perfil | Descripción | Nivel técnico esperado |
|--------|-------------|------------------------|
| Cliente final | Persona que desea cortarse el cabello / barba | Básico: navegar web, WhatsApp, Nequi |

No se requiere registro de cuenta ni contraseña en el módulo Cliente.

### 2.4 Restricciones

1. Solo se pueden agendar **días futuros o el día actual** (horas ya pasadas del día actual no están disponibles).  
2. Horario laboral del sistema: **09:30 – 18:00**, intervalos de **30 minutos**.  
3. Un horario ocupado no puede reservarse de nuevo.  
4. Días bloqueados por la barbería no permiten reserva.  
5. El nombre es **obligatorio** para confirmar la cita.  
6. La confirmación depende de que el navegador permita abrir WhatsApp (`wa.me`).  
7. El pago Nequi es **asistido** (transferencia + aviso); no es un cobro automático dentro de la app.

### 2.5 Supuestos y dependencias

- El cliente dispone de conexión a Internet y un navegador actualizado.  
- El cliente tiene (o puede usar) WhatsApp para confirmar.  
- El cliente puede usar Nequi u otro medio si acuerda con la barbería; la UI sugiere Nequi.  
- El administrador tiene configurados `BARBERSHOP_WHATSAPP` y `NEQUI_NUMERO` en el servidor.

---

## 3. Requisitos específicos de uso

### 3.1 Requisitos del entorno

| Elemento | Requisito mínimo |
|----------|------------------|
| Dispositivo | Teléfono, tablet o computador |
| Navegador | Chrome, Edge, Firefox o Safari recientes |
| Conexión | Internet estable |
| Apps externas | WhatsApp (móvil o Web); app Nequi para pagar |
| URL de acceso | `http://localhost:5173/` en desarrollo / Codespace; URL pública en producción |

### 3.2 Acceso al sistema

**Procedimiento:**

1. Abrir el navegador.  
2. Ingresar la URL del sitio de Baena Barber (ruta `/`).  
3. Esperar la carga de la página de inicio (logo, marca y llamada a agendar).

**Resultado esperado:** se muestra el sitio público de Baena Barber sin pedir usuario ni contraseña.

### 3.3 Consulta de servicios y precios

**Procedimiento:**

1. Desplazarse a la sección **Servicios y precios**.  
2. Revisar las opciones disponibles.

**Catálogo vigente:**

| Servicio | Precio (COP) | Duración referencial |
|----------|--------------|----------------------|
| Corte | $17.000 | 30 min |
| Barba | $10.000 | 20 min |
| Corte + Barba | $27.000 | 45 min |

### 3.4 Agendamiento de cita

**Identificador de requisito de uso:** RU-C01.

**Precondiciones:** el sitio está cargado; hay al menos un día y hora disponibles.

**Procedimiento:**

| Paso | Acción del usuario | Respuesta del sistema |
|------|--------------------|------------------------|
| 1 | Ir a **Agendar cita** | Muestra calendario, reloj de horas y servicios |
| 2 | Seleccionar un **día** válido | Marca el día; carga horarios de ese día |
| 3 | Seleccionar una **hora** disponible (no tachada) | Queda seleccionada la hora |
| 4 | Elegir el **tipo de servicio** | Queda resaltado el servicio elegido |
| 5 | Escribir **nombre** | Campo completado |
| 6 | Pulsar **Confirmar cita por WhatsApp** | Valida datos; intenta guardar la cita; abre WhatsApp |

**Postcondiciones:**

- Si el backend está disponible, la cita queda registrada en estado `pendiente`.  
- Se abre WhatsApp con el detalle de la cita hacia el administrador.  
- En pantalla aparece la tarjeta de pago Nequi (sección 3.6).

**Reglas de validación:**

| Condición | Mensaje / efecto |
|-----------|------------------|
| Sin día | “Selecciona un día en el calendario.” |
| Sin hora | “Selecciona un horario disponible.” |
| Sin servicio | “Selecciona un servicio (Corte, Barba o Corte + Barba).” |
| Sin nombre | “Escribe tu nombre para confirmar la cita.” |
| Horario ocupado (servidor) | Error de conflicto; el usuario debe elegir otra hora |

### 3.5 Confirmación por WhatsApp

**Identificador:** RU-C02.

Al confirmar, el sistema genera un mensaje con:

- nombre del cliente;
- servicio y precio;
- fecha y hora;
- indicación de pago sugerido por Nequi.

El usuario debe **enviar** el mensaje en WhatsApp para que el administrador lo reciba.

### 3.6 Pago en línea con Nequi

**Identificador:** RU-C03.

**Procedimiento:**

1. Tras confirmar la cita, revisar la tarjeta **Pagar con Nequi**.  
2. Verificar el **número Nequi** y el **monto** del servicio.  
3. (Opcional) Pulsar **Copiar número**.  
4. Abrir la aplicación Nequi y enviar el valor indicado.  
5. Pulsar **Avisar pago por WhatsApp** y enviar el mensaje al administrador.

**Nota:** el administrador marcará el pago como recibido en su panel. El cliente no tiene una pantalla de “estado de pago” en el módulo público.

### 3.7 Consulta de dudas

**Identificador:** RU-C04.

El usuario puede:

- usar el botón **WhatsApp** de la barra superior;
- usar el enlace del pie de página;
- usar el botón flotante **¿Dudas?**

Todos abren un chat con un texto predefinido de consulta.

---

## 4. Interfaz de usuario — descripción de pantallas

### 4.1 Encabezado (navegación)

- Logo y nombre **Baena Barber**.  
- Acciones: WhatsApp y Llamar (si hay teléfono configurado).

### 4.2 Hero / marca

- Logo principal y tipografía de marca.  
- Texto de orientación para agendar.  
- Tras confirmar: mensaje de éxito y tarjeta Nequi.

### 4.3 Sección de servicios

- Tres ítems: Corte, Barba, Corte + Barba, con precio y duración.

### 4.4 Sección de agendamiento

| Zona | Contenido |
|------|-----------|
| Paso 1 | Calendario mensual |
| Paso 2 | Selector de horas (slots) |
| Paso 3 | Chips de servicio |
| Formulario | Nombre y botón de confirmación |

### 4.5 Pie y FAB

- Datos de marca y contactos.  
- Botón flotante de WhatsApp para dudas.

---

## 5. Mensajes del sistema y solución de problemas

### 5.1 Mensajes esperados

| Situación | Mensaje típico |
|-----------|----------------|
| Cita guardada con API | “Cita guardada. Avisa al admin y paga por Nequi si quieres.” |
| Solo WhatsApp (API no disponible) | “WhatsApp abierto. También puedes pagar por Nequi.” |

### 5.2 Solución de problemas

| Problema | Causa probable | Acción recomendada |
|----------|----------------|--------------------|
| No se abren horarios | No se ha elegido día | Seleccionar un día en el calendario |
| Todas las horas tachadas | Día lleno, pasado o bloqueado | Elegir otro día |
| No abre WhatsApp | Ventana emergente bloqueada | Permitir pop-ups o copiar el enlace |
| Error al confirmar | Horario ya tomado / red | Refrescar, elegir otra hora, reintentar |
| No ve tarjeta Nequi | Aún no confirmó | Completar el flujo de confirmación |
| Número Nequi incorrecto | Configuración del servidor | Contactar a la barbería por WhatsApp |

---

## 6. Anexos

### Anexo A — Horario de atención del sistema

- Apertura: **09:30**  
- Cierre: **18:00**  
- Intervalo: **30 minutos**

### Anexo B — Diagrama de flujo del cliente

```
Inicio
  → Ver servicios
  → Elegir día
  → Elegir hora disponible
  → Elegir servicio
  → Ingresar nombre
  → Confirmar (WhatsApp al admin)
  → (Opcional) Pagar Nequi + avisar
  → Fin
```

### Anexo C — Datos de contacto de referencia (desarrollo)

| Concepto | Variable / valor de ejemplo |
|----------|-----------------------------|
| WhatsApp barbería | `BARBERSHOP_WHATSAPP` = `573114001414` |
| Nequi | `NEQUI_NUMERO` (por defecto el mismo) |
| URL cliente | `http://localhost:5173/` |

### Anexo D — Relación con IEEE Std 830-1998

Este manual adopta la organización recomendada por IEEE 830 para documentos de software:

| Sección IEEE 830 | Uso en este manual |
|------------------|--------------------|
| 1. Introduction | Sección 1 |
| 2. Overall description | Sección 2 |
| 3. Specific requirements | Secciones 3–5 (requisitos de uso / operación) |
| Appendices | Sección 6 |

---

## Aprobación

| Rol | Nombre | Firma / fecha |
|-----|--------|---------------|
| Propietario del producto | Cristian Camilo Baena Ruiz | _________________ |
| Elaboración | Equipo de desarrollo Baena Barber | 2026-07-24 |

---

**Fin del documento MU-BB-CLI-001 — Manual de Usuario del Cliente (Baena Barber)**  
*Ubicación en el repositorio / Codespace:* `docs/MANUAL_USUARIO_CLIENTE_IEEE830.md`
