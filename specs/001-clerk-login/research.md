# Research — Login con Clerk

**Fase 0** · 2026-09-21 · Plan: [plan.md](./plan.md)

Todo lo que sigue se comprobó en los paquetes publicados (`npm view` / `npm pack`), no de memoria.

## R-1 — Qué versiones se fijan

**Decisión**: `@clerk/nextjs` **6.39.7** y `@clerk/localizations` **3.37.9**, con versión exacta.

**Motivo**:
- `@clerk/nextjs` 7.x (última: 7.9.4) declara `next ^15.2.8 || ^16…`: no instala sobre Next 14.
- 6.39.7 declara `next ^13.5.7 || ^14.2.25 || ^15.2.3 || ^16` y `react ^18.0.0 || …`. El repo tiene
  14.2.35 y 18.3.1. Publicada 2026-09-18: la línea 6 sigue mantenida.
- Las traducciones tienen que ser de la **misma línea**: `@clerk/localizations` 3.37.9 depende de
  `@clerk/types ^4.101.27`, igual que `@clerk/nextjs` 6.39.7; salieron el mismo día. La 4.x actual
  depende de `@clerk/shared ^4`, que es de la línea 7.
- Versión exacta y no `^`: el par se verificó para estos dos números. Subir uno sin el otro puede
  romper la pareja; una actualización tiene que ser una decisión, no un `npm install`.

**Descartado**: `^6.39.7` (deja que el par se desalinee solo) y la 7.x (exige migrar a Next 15).

## R-2 — Dónde se exige la sesión

**Decisión**: middleware de Clerk (`src/middleware.js`) con lista de rutas **públicas**, no de
protegidas: sólo `/sign-in(.*)`. Todo lo demás exige sesión.

**Motivo**: FR-004 pide verificar en el servidor. Listar lo público hace que una página nueva quede
protegida por defecto; listar lo protegido hace que quede abierta por olvido. `auth.protect()`
redirige a `signInUrl` con la página pedida como destino de vuelta, que es FR-003.

**Descartado**: `<SignedIn>`/`<RedirectToSignIn>` en el cliente — la página se enviaría igual.

## R-3 — Cómo se pinta de verde

**Decisión**: un objeto `appearance` en `src/config/clerk-appearance.js`, pasado una vez a
`ClerkProvider`: `variables.colorPrimary: '#16a34a'` (Tailwind `green-600`),
`borderRadius: '0.75rem'`, `fontFamily: 'Inter, system-ui, sans-serif'`, y
`elements.footerAction: { display: 'none' }`.

**Motivo**: el verde no se inventa: el botón principal del dashboard ya es `bg-green-600
hover:bg-green-700` (`AgrotechContainer.jsx:86`) y las tarjetas usan `rounded-xl` (0.75rem). Las
claves existen en `@clerk/shared` 3.48.0 (`colorPrimary`, `borderRadius`, `fontFamily`,
`footerAction`).

**Sobre ocultar el pie**: `footerAction` es el bloque *"¿No tienes cuenta? Regístrate"*. Ocultarlo es
cosmético; lo que **impide** registrarse es el modo restringido en el panel de Clerk (ver
`quickstart.md` §0).

## R-4 — Qué pasa si faltan las variables

`clerkMiddleware` valida las dos claves al atender cada pedido y, si falta una, lanza un error que la
nombra (`clerkMiddleware.js:55-62`: `throwMissingPublishableKeyError` /
`throwMissingSecretKeyError`). El error aparece en la terminal de `npm run dev`. Cumple el caso borde
"falta la configuración" sin código propio.
