# Implementation Plan: Login con Clerk

**Branch**: `feature/001-clerk-login` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

## Summary

Exigir sesión de Clerk en todo el sitio salvo `/sign-in`, verificándola en el servidor con el
middleware de Clerk. Una sola pantalla pública de ingreso, en español y en verde, sin registro. Con
sesión, cada cabecera muestra el menú de cuenta de Clerk para cerrar sesión. El dashboard existente
no cambia.

## Technical Context

**Language/Version**: JavaScript (sin TypeScript), Node 22 local
**Primary Dependencies**: Next.js 14.2.35 (App Router), React 18.3.1, Tailwind 3, aws-amplify 6.
**Nuevas**: `@clerk/nextjs` **6.39.7** y `@clerk/localizations` **3.37.9** (research R-1)
**Storage**: ninguno. La sesión la guarda Clerk
**Testing**: no hay ejecutor de pruebas. Compuerta: `npm run build` + `quickstart.md` (Constitución IV)
**Target Platform**: navegador + servidor de Next (middleware)
**Project Type**: aplicación web, un solo proyecto
**Constraints**: dos variables de entorno, ninguna secreta con prefijo público; sin tocar la lógica de
sensores ni de IA
**Scale/Scope**: 4 archivos nuevos (middleware, página de ingreso, menú de cuenta, tema) y 6 existentes
con cambios mínimos (`package.json`, `.env.local.example`, `layout.jsx` y las 3 páginas), más
`package-lock.json`

## Constitution Check

| Principio | Cumple | Cómo |
|---|---|---|
| I. Capas simples, dependencias en un solo lugar | Sí | Clerk se configura **una vez** en `layout.jsx` (`ClerkProvider`) y en `middleware.js`. Las páginas sólo usan componentes de Clerk |
| II. Ningún secreto en código ni navegador | Sí | `CLERK_SECRET_KEY` sin prefijo público; `.env.local.example` con nombres sin valor; SC-004 lo verifica en la salida del build |
| III. Clerk como proveedor de identidad | Sí | Sin sesiones propias. Versión elegida por dependencias declaradas (R-1) |
| IV. Build verde | Sí | T012 corre `npm run build`. No hay lógica pura nueva que probar |
| V. Sin fallos silenciosos | Sí | Sin variables, el middleware de Clerk falla con un error que nombra la clave faltante (R-4). No se agrega ningún `catch` |
| VI. Alcance declarado | Sí | Los cambios en páginas existentes son la línea del menú de cuenta en cada cabecera; nada más |

Sin violaciones. **Re-evaluado tras el diseño: igual.**

## Diseño

| Archivo | Cambio | Requisitos |
|---|---|---|
| `package.json` | + `@clerk/nextjs: "6.39.7"`, `@clerk/localizations: "3.37.9"`, versión **exacta** (R-1) | FR-009 |
| `.env.local.example` | + `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=` y `CLERK_SECRET_KEY=`, sin valores, con comentario de origen | FR-010, FR-011 |
| `src/middleware.js` **nuevo** | `clerkMiddleware` con `signInUrl: '/sign-in'`. `/sign-in(.*)` es la única ruta pública; el resto hace `await auth.protect()`. Si hay sesión y se pide `/sign-in`, redirige a `/`. `config.matcher` estándar de Clerk (excluye `_next` y estáticos) (R-2) | FR-001..FR-004 |
| `src/app/layout.jsx` | Envolver `<AmplifyProvider>` con `<ClerkProvider>`: `localization={esES}`, `appearance={clerkAppearance}`, `signInUrl="/sign-in"`, `signInFallbackRedirectUrl="/"`, `afterSignOutUrl="/sign-in"`. **AmplifyProvider no se toca** | FR-003, FR-005a, FR-006 |
| `src/config/clerk-appearance.js` **nuevo** | Tema verde en un solo lugar (R-3), incluido `elements.footerAction: { display: 'none' }` para que no aparezca el enlace de registro | FR-005, FR-006 |
| `src/app/sign-in/[[...sign-in]]/page.jsx` **nuevo** | `<SignIn path="/sign-in" routing="path" />` centrado sobre fondo `bg-green-50`, con el logo del sitio | FR-005, FR-008 |
| `src/components/auth/AccountMenu.jsx` **nuevo** | `<UserButton />` de Clerk, `"use client"` | FR-007 |
| `src/app/page.jsx`, `history/page.jsx`, `history/[id]/page.jsx` | Agregar `<AccountMenu />` al final de la cabecera existente. **Ningún otro cambio** | FR-007, FR-012 |

**No se crea**: ruta `/sign-up`, ni `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (la URL va en código, para que
Isaac cargue sólo las dos variables decididas), ni manejo de webhooks.

## Project Structure

```text
specs/001-clerk-login/
├── spec.md
├── plan.md          # este archivo
├── research.md      # R-1..R-4
├── quickstart.md    # validación manual (sustituye pruebas automáticas, Constitución IV)
├── tasks.md
└── checklists/requirements.md
```

No hay `data-model.md` (la feature no guarda datos) ni `contracts/` (no expone interfaz a otros
sistemas).

## Complexity Tracking

Sin violaciones que justificar.
