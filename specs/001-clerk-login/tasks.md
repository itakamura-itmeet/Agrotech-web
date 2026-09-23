# Tasks: Login con Clerk

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [quickstart.md](./quickstart.md)
**Implementa**: Ryan · **Especifica y verifica**: Jim
**Pruebas automáticas**: no hay ejecutor en el repo; la verificación es T012–T013 (Constitución IV).

## Phase 1: Setup

- [x] T001 Crear la rama `feature/001-clerk-login` desde `main` en `Agrotech-web/`
- [x] T002 Instalar con versión exacta: `npm install --save-exact @clerk/nextjs@6.39.7 @clerk/localizations@3.37.9`. Confirmar que `package.json` queda con `"6.39.7"` y `"3.37.9"` sin `^`, y que `npm` no reporta conflictos de dependencias con Next 14 (research R-1; FR-009)
- [x] T003 [P] Agregar a `.env.local.example` `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=` y `CLERK_SECRET_KEY=` **sin valores**, con un comentario: "copiar del panel de Clerk; la secret key nunca lleva NEXT_PUBLIC_". **No tocar `.env.local`** (FR-010, FR-011)

## Phase 2: Foundational (bloquea las dos historias)

- [x] T004 [P] Crear `src/config/clerk-appearance.js` que exporte `clerkAppearance`: `variables` { `colorPrimary: '#16a34a'`, `borderRadius: '0.75rem'`, `fontFamily: 'Inter, system-ui, sans-serif'` } y `elements` { `footerAction: { display: 'none' }` } (research R-3; FR-005, FR-006)
- [x] T005 En `src/app/layout.jsx`, envolver `<AmplifyProvider>{children}</AmplifyProvider>` con `<ClerkProvider localization={esES} appearance={clerkAppearance} signInUrl="/sign-in" signInFallbackRedirectUrl="/" afterSignOutUrl="/sign-in">`. `esES` de `@clerk/localizations`. **`AmplifyProvider` no cambia** (FR-003, FR-005a, FR-006, FR-012)

## Phase 3: User Story 1 — Entrar al dashboard con una cuenta (P1) 🎯 MVP

**Prueba independiente**: `quickstart.md` §3, filas 1–6 y 8.

- [x] T006 [US1] Crear `src/middleware.js` con `clerkMiddleware` y `createRouteMatcher(['/sign-in(.*)'])` como **única** lista pública. Ruta pública con sesión → `NextResponse.redirect` a `/`. Ruta no pública → `await auth.protect()`. Opciones: `{ signInUrl: '/sign-in' }`. `export const config` con el `matcher` estándar de Clerk que excluye `_next` y archivos estáticos (research R-2; FR-001, FR-002, FR-003, FR-004)
- [x] T007 [P] [US1] Crear `src/app/sign-in/[[...sign-in]]/page.jsx`: `<SignIn path="/sign-in" routing="path" />` centrado en pantalla completa sobre `bg-green-50`, con el logo del sitio (`@/assets/logo/LogoHeader`) arriba. Sin enlace a registro (FR-005, FR-006, FR-008)
- [x] T008 [US1] Verificar que **no** existe ninguna ruta `sign-up` en `src/app/` (FR-005, SC-001a)

## Phase 4: User Story 2 — Saber con qué cuenta estoy y salir (P2)

**Prueba independiente**: `quickstart.md` §3, fila 7.

- [x] T009 [P] [US2] Crear `src/components/auth/AccountMenu.jsx` (`"use client"`) que renderice `<UserButton />` de `@clerk/nextjs` (FR-007)
- [x] T010 [US2] Agregar `<AccountMenu />` como **último hijo** del contenedor `flex` de la cabecera en `src/app/page.jsx`, `src/app/history/page.jsx` y `src/app/history/[id]/page.jsx`. Ningún otro cambio en esos archivos (FR-007, FR-012)

## Phase 5: Verificación

- [x] T011 Revisar el diff completo: sólo aparecen los archivos de la tabla §Diseño de `plan.md`; `AmplifyProvider`, `SensorDashboard`, hooks y `src/config/aws-config.js` sin cambios (FR-012, Constitución VI)
- [x] T012 `npm run build` verde; la lista de rutas incluye `/sign-in` y no `/sign-up` (Constitución IV; `quickstart.md` §1)
- [ ] T013 (parcial) Con las dos claves cargadas en `.env.local`: correr `quickstart.md` §2 (0 coincidencias del secreto en `.next/static`, SC-004), §3 completo y §4. Si no hay claves en la sesión, declararlo y dejar §2–§4 para Isaac

## Dependencias

T001 → T002 → (T003, T004) → T005 → T006 → T007/T008 → T009 → T010 → T011 → T012 → T013.
US2 depende de T005 (necesita `ClerkProvider`), no de US1.

## Trazabilidad

| Req. | Tareas |
|---|---|
| FR-001, FR-002, FR-004 | T006 |
| FR-003 | T005, T006 |
| FR-005 | T004, T007, T008 |
| FR-005a | T005 |
| FR-006 | T004, T005, T007 |
| FR-007 | T009, T010 |
| FR-008 | T007 |
| FR-009 | T002 |
| FR-010, FR-011 | T003 |
| FR-012 | T005, T010, T011 |
| SC-001, SC-002, SC-003, SC-005 | T013 |
| SC-001a | T008, T012 |
| SC-004 | T013 |

## Estado 2026-09-21 — verificado por Jim sobre el código (commit `22702bc`)

- **T001–T012 hechas.** Diff = exactamente la tabla §Diseño de `plan.md` (11 archivos con
  `package-lock.json`). Árbol de dependencias con **una sola** versión de `@clerk/shared` (3.48.0) y
  de `@clerk/types` (4.101.27): la pareja de R-1 se mantiene.
- **Build** repetido por Jim: verde; rutas `/`, `/history`, `/history/[id]`, `/sign-in/[[...sign-in]]`
  y Middleware; sin `/sign-up`.
- **§2 (SC-004)**: 0 archivos de `.next/static` contienen el valor de la secret key. **Control
  positivo**: la misma búsqueda con la publishable key encuentra 1 archivo, así que el método sí
  detectaría una fuga.
- **Protección (FR-001, FR-002, FR-004)**, con `next start` y pedidos sin cabeceras de navegador:
  `/`, `/history`, `/history/abc` → **404** sin contenido; `/sign-in` → **200** con la página de
  ingreso; `/sign-up` → 404. Con cabeceras de navegador **todas** las rutas, incluida `/sign-in`,
  van al *handshake* de Clerk, así que eso solo no prueba protección.
- **Pendiente para Isaac (T013)**: `quickstart.md` §3 filas 2–7 (verlo en verde y en español, sin
  enlace de registro, login real, volver a la página pedida, cerrar sesión) y §4. Necesitan navegador.
