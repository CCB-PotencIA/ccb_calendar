# Guía de Uso — CCB Tareas

Sistema de gestión de tareas de la Cámara de Comercio de Barranquilla.

**Acceso:** https://ccbcalendar.vercel.app

---

## 1. Iniciar sesión

Entra con el correo y contraseña que te dieron. Si es tu primera vez y te llegó una invitación por correo, haz clic en el enlace y define tu contraseña antes de entrar.

Si olvidaste tu contraseña, pídele a un administrador que te la restablezca desde **Administración → Usuarios**.

---

## 2. Panorama general

El menú lateral tiene:

- **Dashboard**: resumen general — cuántas tareas hay, en qué estado, cuáles están por vencer y cómo se reparten entre las Vicepresidencias/Unidades.
- **Calendario**: todas las tareas ubicadas por su fecha de plazo interno.
- **Tareas**: el listado completo, con filtros y donde se crean/editan tareas.
- **Notificaciones**: avisos dentro de la aplicación (tarea asignada, próxima a vencer, etc.).
- **Administración** (solo administradores): gestión de usuarios y de Vicepresidencia/Unidad.

---

## 3. Crear una tarea

Desde **Tareas → Nueva tarea**, completa:

| Campo | Qué es |
|---|---|
| Nombre de la tarea | Título descriptivo — es lo primero que se ve en tarjetas y calendario |
| Origen | De dónde surge la tarea (ej. interna, legal) |
| Referencia externa | Un identificador de referencia, si la tarea viene de otro documento/proceso |
| Descripción | Detalle de la tarea |
| Unidad/Vicepresidencia | La unidad dueña de la tarea (obligatorio) |
| **Responsables (usuarios del sistema)** | Las personas de la plataforma responsables de ejecutarla — puedes elegir varias |
| **Otras menciones** | Texto libre para comités, cargos o entidades externas que no tienen cuenta en el sistema (ej. "Junta Directiva", "Oficial de Cumplimiento") — es solo informativo, no envía notificaciones |
| Fecha inicio | Cuándo arranca (opcional) |
| Plazo interno | La fecha límite real que usa la aplicación para colores y avisos (obligatorio) |
| Plazo legal | Fecha normativa de referencia, si aplica |
| Estado / Prioridad | Pendiente, en proceso, completada, cancelada / baja, media, alta, crítica |
| Progreso (%) | Manual, salvo que la tarea tenga subtareas (ver sección 5) |

> **Nota:** el campo "Responsables (usuarios del sistema)" es para asignar personas reales que reciben notificaciones. El campo "Otras menciones" es solo una etiqueta de texto para no perder información de comités o cargos que no tienen cuenta — no confundirlos.

---

## 4. Una tarea, varias Vicepresidencias

Si una tarea involucra a más de una Vicepresidencia/Unidad, todas cuentan en el gráfico "Tareas por Unidad" del dashboard — no se pierde ni se duplica en el calendario, que sigue mostrando un solo evento por tarea.

En las tarjetas de tareas verás:
- 1 o 2 unidades: se muestran ambas.
- 3 o más: se muestra la primera + un indicador "+N" con las demás.

---

## 5. Subtareas y progreso automático

Dentro del detalle de cada tarea (haz clic sobre ella) hay una sección **Subtareas**: puedes agregar pasos individuales con una casilla de verificación.

**Importante:** en cuanto una tarea tiene al menos una subtarea, el % de progreso deja de ser manual y se calcula solo (subtareas completas ÷ total). Si quitas todas las subtareas, vuelve a poder editarse a mano.

---

## 6. Seguimientos

También en el detalle de la tarea hay una sección **Seguimientos**: son los puntos de control periódicos (por ejemplo, reuniones mensuales de revisión). Cada uno tiene una casilla de "completado" y un cuadro de texto para anotar qué se concluyó en esa revisión.

---

## 7. Calendario

Cada tarea aparece en su fecha de **plazo interno**, coloreada según qué tan cerca está de vencer:

| Color | Significado |
|---|---|
| 🔴 Rojo | Vencida |
| 🟠 Naranja | Urgente — vence en 15 días o menos |
| 🟡 Ámbar | Próxima — vence entre 16 y 30 días |
| 🟢 Verde | A tiempo — vence en más de 30 días |

Al pasar el mouse sobre un evento aparece una vista previa con más detalle (departamentos, estado, progreso, responsables). Haz clic para abrir el detalle completo.

---

## 8. Dashboard

- **Tarjetas KPI**: total de tareas, pendientes, en proceso, completadas y vencidas.
- **Tareas por Unidad**: gráfico circular — cada color es una Vicepresidencia/Unidad distinta.
- **Próximos vencimientos**: lista de tareas por vencer en los próximos 30 días, separadas en "Vencidas" y "Próximas". Haz clic en cualquiera para abrir su detalle.

---

## 9. Notificaciones

- **Dentro de la app**: la campana en la esquina superior avisa cuando te asignan una tarea o está por vencer.
- **Por correo**: si eres responsable de una tarea, recibes un recordatorio automático 30 y 15 días antes del plazo interno.

---

## 10. Administración (solo administradores)

- **Usuarios**: invitar nuevas personas, asignarles Vicepresidencia/Unidad y rol (miembro o administrador).
- **Vicepresidencia/Unidad**: crear, editar o eliminar unidades y su color identificador en el sistema.

---

## Preguntas frecuentes

**¿Por qué no puedo cambiar el progreso de mi tarea?**
Porque tiene subtareas — el progreso se calcula solo según cuántas están completas. Marca las subtareas en vez de editar el número.

**¿Cómo asigno una tarea a un comité que no tiene usuario en el sistema?**
Usa el campo "Otras menciones" — queda registrado como texto, aunque no reciba notificaciones automáticas.

**No me llegó el correo de invitación.**
Revisa spam. Si no aparece, pide a un administrador que verifique tu cuenta desde Administración → Usuarios.
