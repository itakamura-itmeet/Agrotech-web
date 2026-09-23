# Feature Specification: Login con Clerk

**Feature Branch**: `feature/001-clerk-login`

**Created**: 2026-09-21

**Status**: Draft

**Input**: Pedido de Isaac: "agregar un login conectado a la última versión estable de Clerk. No te
preocupes por la configuración del dashboard de Clerk (ya tengo un template con su JWT armado); yo
pongo a mano las variables de entorno `NEXT_PUBLIC_CLERK_WEBHOOK_SECRET` y
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. Colores del login en verde. Asegurar que la versión de Clerk
sea estable y compatible con Next 14.2 + React 18."

## Lo que se verificó antes de escribir

| Qué | Resultado | Dónde |
|---|---|---|
| Versión instalada del stack | Next 14.2.35, React 18.3.1 | `node_modules/*/package.json` |
| Última versión de `@clerk/nextjs` | 7.9.4 — **pide Next 15 o 16**, no sirve | `npm view @clerk/nextjs@latest peerDependencies` |
| Versión más nueva compatible | **6.39.7** (publicada 2026-09-18): acepta `next ^14.2.25` y `react ^18` | `npm view @clerk/nextjs@6.39.7 peerDependencies` |
| Protección de rutas del lado servidor | El middleware de Clerk **falla si no tiene la clave secreta** | `@clerk/nextjs` 6.39.7, `server/clerkMiddleware.js:59-62` |
| Nombre que Clerk usa para el secreto de webhook | `CLERK_WEBHOOK_SIGNING_SECRET`, **sin** prefijo público | `@clerk/nextjs` 6.39.7, `types/webhooks.d.ts:9` |
| Estado actual de login | No existe: ninguna página pide sesión | `src/app/` |
| Build actual | Verde, 4 rutas (`/`, `/_not-found`, `/history`, `/history/[id]`) | `npm run build`, 2026-09-21 |

## Clarifications

### Session 2026-09-21

- Q: ¿Dónde se exige la sesión y con qué variables? → A: En el servidor. Variables
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`; `NEXT_PUBLIC_CLERK_WEBHOOK_SECRET` no se
  crea (god, corrección técnica).
- Q: ¿Se ofrece registro de cuentas? → A: **No.** Sólo ingreso. No hay pantalla ni ruta de registro;
  las cuentas las crea Isaac a mano desde el panel de Clerk.
- Q: ¿En qué idioma se ven las pantallas de Clerk? → A: **Español**, con el paquete oficial de
  traducciones de Clerk.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar al dashboard con una cuenta (Priority: P1)

Una persona abre el dashboard de Agrotech sin haber iniciado sesión. En vez del dashboard, ve una
pantalla de ingreso con los colores del proyecto. Ingresa con su cuenta y llega a la página que
había pedido.

**Why this priority**: es el pedido. Sin esto no hay login.

**Independent Test**: abrir `/` en una ventana privada → aparece el ingreso; ingresar con una cuenta
válida → aparece el dashboard de sensores funcionando igual que hoy.

**Acceptance Scenarios**:

1. **Given** una persona sin sesión, **When** abre cualquier página del dashboard, **Then** ve la
   pantalla de ingreso y no el contenido.
2. **Given** una persona sin sesión que abrió `/history/abc`, **When** ingresa, **Then** llega a
   `/history/abc`, no a la portada.
3. **Given** una persona con sesión, **When** abre cualquier página, **Then** la ve directamente,
   sin pasar por el ingreso.
4. **Given** credenciales incorrectas, **When** intenta ingresar, **Then** ve un mensaje de error y
   sigue en la pantalla de ingreso.
5. **Given** la pantalla de ingreso, **When** la persona la mira, **Then** los textos están en
   español y no hay enlace para crear una cuenta.

---

### User Story 2 - Saber con qué cuenta estoy y salir (Priority: P2)

Con sesión iniciada, la persona ve en la cabecera un indicador de su cuenta y puede cerrar sesión.

**Why this priority**: sin salida, un equipo compartido queda con la sesión de otro. Es el mínimo
para que el login sea usable, no una función nueva.

**Independent Test**: con sesión, cerrar sesión desde la cabecera → al abrir `/` vuelve a pedir
ingreso.

**Acceptance Scenarios**:

1. **Given** una sesión iniciada, **When** la persona mira la cabecera, **Then** ve un indicador de
   su cuenta.
2. **Given** una sesión iniciada, **When** cierra sesión, **Then** vuelve a la pantalla de ingreso
   y ninguna página del dashboard se muestra sin volver a ingresar.

---

### Edge Cases

- **Falta la configuración de Clerk** (Isaac todavía no cargó las variables): la aplicación MUST
  mostrar o registrar un error que diga qué falta, no una pantalla en blanco (Constitución V).
- **La sesión vence con el dashboard abierto**: la próxima navegación pide ingreso de nuevo.
- **La página de ingreso** nunca pide sesión; si no, nadie podría entrar.
- **Alguien busca registrarse**: no hay dónde. La pantalla de ingreso no muestra enlace de registro y
  no existe una ruta de registro en el sitio.
- **Una persona con sesión abre la página de ingreso**: la manda al dashboard en vez de pedirle
  ingresar otra vez.

## Requirements *(mandatory)*

### Functional Requirements

**Acceso**
- **FR-001**: Toda página del dashboard —portada, historial y detalle— MUST exigir sesión iniciada.
- **FR-002**: La página de ingreso MUST ser accesible sin sesión. Es la **única** página pública.
- **FR-003**: Tras ingresar, la persona MUST llegar a la página que había pedido.
- **FR-004**: La exigencia de sesión MUST resolverse **en el servidor**, antes de enviar la página:
  sin sesión, el contenido del dashboard no llega al navegador (§Decisión tomada).

**Pantallas**
- **FR-005**: MUST existir una pantalla de ingreso. MUST NOT existir pantalla ni ruta de registro, ni
  enlace hacia una; las cuentas se crean fuera del sitio, en el panel de Clerk.
- **FR-005a**: Los textos de la pantalla de ingreso y del indicador de cuenta MUST estar en español.
- **FR-006**: La pantalla de ingreso y el indicador de cuenta MUST usar una paleta **verde**, coherente
  con el resto del sitio (mismas tipografías y esquinas).
- **FR-007**: Con sesión iniciada, la cabecera MUST mostrar un indicador de la cuenta que permita
  cerrar sesión.
- **FR-008**: Los errores de ingreso (credenciales incorrectas, cuenta inexistente) MUST mostrarse
  en la misma pantalla.

**Configuración**
- **FR-009**: La versión de Clerk MUST ser la más nueva cuyas dependencias declaradas acepten el
  Next.js y el React instalados (Constitución III). Hoy: `@clerk/nextjs` 6.39.7.
- **FR-010**: Cada variable de entorno nueva MUST agregarse a `.env.local.example` con su nombre y
  sin valor. Ningún valor se escribe en el repo.
- **FR-011**: Ninguna clave secreta MUST llevar el prefijo `NEXT_PUBLIC_` (Constitución II).

**Lo existente**
- **FR-012**: Con sesión iniciada, el dashboard de sensores, el historial y la clasificación por IA
  MUST comportarse igual que antes de esta feature (Constitución VI).

### Key Entities

- **Sesión**: la que emite y mantiene Clerk. Esta feature sólo pregunta si existe; no guarda nada.
- **Cuenta**: vive en Clerk. El repo no guarda datos de usuario.

## Decisión tomada — variables de entorno

| Variable | Pública | Para qué |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sí, por diseño de Clerk | Identifica la aplicación ante Clerk desde el navegador |
| `CLERK_SECRET_KEY` | **No** — sin prefijo `NEXT_PUBLIC_` | Permite verificar la sesión en el servidor (FR-004). Sin ella, el middleware de Clerk no arranca |

Isaac carga las dos a mano en `.env.local`, copiándolas del panel de Clerk.

**Descartado: `NEXT_PUBLIC_CLERK_WEBHOOK_SECRET`**, que nombraba el pedido original. Con ese prefijo
el secreto se copiaría en el JavaScript del navegador y dejaría de proteger nada; además un login no
usa webhooks. Si algún día hacen falta webhooks, la variable es `CLERK_WEBHOOK_SIGNING_SECRET`, en
una feature aparte.

**Descartado: proteger sólo en el navegador** (bastaba la clave pública). La página se enviaría igual
y sólo se ocultaría; cualquiera que mire la respuesta vería el contenido.

Decidido por god el 2026-09-21 como corrección técnica; Isaac avisado del cambio de variable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sin sesión, las **3** rutas del dashboard muestran el ingreso en lugar del contenido
  (3 de 3).
- **SC-001a**: **0** rutas de registro en el sitio y **0** enlaces de registro en la pantalla de
  ingreso.
- **SC-002**: Una persona con cuenta llega del ingreso al dashboard en menos de 1 minuto.
- **SC-003**: Tras cerrar sesión, **0** páginas del dashboard se muestran sin volver a ingresar.
- **SC-004**: Ningún valor de clave secreta aparece en los archivos que se envían al navegador
  (búsqueda en la salida del build: 0 coincidencias).
- **SC-005**: El build termina verde y la navegación del dashboard con sesión es la misma que antes
  (mismas rutas, mismos datos).

## Assumptions

- La configuración del panel de Clerk (aplicación, métodos de ingreso, template de JWT) ya la tiene
  Isaac y **no es parte de esta feature**.
- **Ocultar el registro en el sitio no lo desactiva en Clerk.** Clerk también ofrece páginas propias
  alojadas en su dominio. Para que "sólo Isaac crea cuentas" sea cierto, el panel de Clerk tiene que
  estar en modo de registro **restringido**. Es configuración de Isaac; queda en `quickstart.md`
  como paso previo.
- Los métodos de ingreso (correo, Google, etc.) son los que Isaac tenga activos en Clerk; la
  pantalla muestra los que Clerk devuelva.
- El sitio está en español (`lang="es"`).

## Out of Scope

- **Proteger los datos.** Los datos de sensores vienen de AppSync con una API key pública
  (`NEXT_PUBLIC_AWS_API_KEY`). El login protege las **páginas**, no las consultas: quien tenga esa
  key puede consultar AppSync sin sesión. Cerrar eso exige cambiar la autenticación de AppSync, que
  es otra feature.
- Registro de cuentas desde el sitio (decisión de Isaac, 2026-09-21).
- Roles o permisos por usuario, SSO con otros proveedores, webhooks de Clerk, uso del template de
  JWT para llamar a un backend.
- Configuración del panel de Clerk.
- Cambios en el dashboard de sensores, historial o clasificación.
