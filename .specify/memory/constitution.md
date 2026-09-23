<!--
Sync Impact Report
- Version change: [TEMPLATE] → 1.0.0 (ratificación inicial)
- Origen: principios rescatados de la constitución de la plataforma HRP Hydrog (v1.1.0) y
  adaptados a un frontend Next.js independiente. Se tomó sólo lo que aplica a este repo.
- Rescatados y adaptados: I (capas) + VII (bajo acoplamiento) → Principio I;
  III (sin secretos en el código) → Principio II; restricción "Auth = Clerk" → Principio III;
  IV (pruebas como compuerta) → Principio IV, ajustado a que hoy no hay ejecutor de pruebas;
  V (observabilidad) → Principio V; VI (desvíos declarados) → Principio VI.
- Descartados, no aplican a este repo: II (migraciones Alembic/PostgreSQL), la parte
  Terraform/SSM de III, los contratos entre servicios de VI (SDL, modelos compartidos,
  parámetros SSM), y Supabase como capa de roles.
- Templates: plan-template.md, spec-template.md, tasks-template.md, checklist-template.md
  ✅ sin cambios — su "Constitution Check" es genérico y se deriva de este archivo.
- Pendientes conocidos: ver Principio IV (sin ejecutor de pruebas) y Principio V
  (`removeConsole` en producción).
-->

# Constitución de Agrotech Web

## Principios

### I. Capas simples y dependencias en un solo lugar
Las páginas de `src/app/` MUST ser delgadas: arman la vista y delegan. El acceso a datos vive
en `src/hooks/`; la configuración de servicios externos en `src/config/`; la lógica pura en
`src/utils/`, sin llamadas de red ni efectos. Un servicio externo (Amplify, Clerk) MUST
configurarse **en un único punto** —un provider o un archivo de configuración— y no
instanciarse dentro de cada componente que lo usa.

Motivo: es la estructura que el repo ya tiene. Mantenerla es lo que permite reemplazar o
probar una pieza sin tocar las demás.

### II. Ningún secreto en el código ni en el navegador
En Next.js toda variable que empieza con `NEXT_PUBLIC_` se copia dentro del JavaScript que
descarga el navegador. Por lo tanto:
- Una clave secreta MUST NOT llevar el prefijo `NEXT_PUBLIC_`. Sólo lo llevan valores que
  pueden ser públicos (por ejemplo, la *publishable key* de Clerk).
- Los valores reales viven en `.env.local`, que no se versiona. `.env.local.example` MUST
  listar cada variable nueva **con su nombre y sin su valor**.
- Ningún valor de clave se escribe en specs, commits, logs ni mensajes.

Hecho conocido, no se cambia acá: `NEXT_PUBLIC_AWS_API_KEY` es la API key de AppSync y es
pública por diseño de ese modo de autenticación. Protege contra abuso casual, no autentica
usuarios.

### III. Clerk es el proveedor de identidad
La identidad de usuario la resuelve Clerk (`@clerk/nextjs`). El repo MUST NOT implementar
contraseñas, sesiones ni tokens propios. La versión de Clerk MUST fijarse comprobando que sus
dependencias declaradas aceptan el Next.js y el React instalados; "la última" no es un
criterio si pide una major que el repo no tiene.

### IV. Nada se integra sin build verde
`npm run build` MUST terminar sin errores antes de integrar un cambio: compila, corre el lint
de Next y genera las páginas. La lógica nueva que no dependa de la UI MUST escribirse como
función pura en `src/utils/`, de modo que se pueda probar sin navegador ni red.

Pendiente conocido: el repo **no tiene ejecutor de pruebas**. Hasta que se agregue, la
compuerta es el build más la validación manual escrita en el `quickstart.md` de cada feature.
Agregar un ejecutor es una decisión propia, no un efecto lateral de una feature.

### V. Sin fallos silenciosos
Un error MUST NOT tragarse en silencio: cada `catch` deja rastro con contexto suficiente para
diagnosticar, y cuando corresponde el usuario ve un estado de error, no una pantalla vacía.

Pendiente conocido: `next.config.mjs` usa `removeConsole` en producción, que elimina **todos**
los `console.*`, incluidos los de error. En producción hoy los errores no dejan rastro en el
navegador. Se registra acá para que ninguna feature asuma lo contrario; cambiarlo es una
decisión aparte.

### VI. Alcance declarado, desvíos escritos
Una feature MUST NOT cambiar el comportamiento de lo existente —dashboard de sensores,
historial, clasificación por IA— más allá de lo que su spec declara. Todo desvío respecto de
la spec o del pedido original (un paso omitido, un nombre cambiado, una variable distinta de
la pedida) MUST quedar escrito en la spec o en el plan en el momento en que se decide.

## Restricciones del stack

- Next.js 14.2 con App Router, React 18, **JavaScript sin TypeScript**, Tailwind CSS 3,
  aws-amplify 6 para el dashboard (AppSync). Gestor de paquetes: **npm** (`package-lock.json`).
- Alias de importación `@/` → `src/`.
- Dominio: dashboard de sensores agrícolas y clasificación de cultivos por IA. La inferencia la
  hace el backend; el frontend no la duplica.
- Repositorio con una sola rama estable, `main`. El trabajo se hace en una rama `feature/*` y
  se integra por PR que arma Isaac. Commits según Conventional Commits.

## Gobierno

Esta constitución rige sobre la práctica ad hoc en este repositorio. Es **propia** de Agrotech
Web: no depende de la de Hydrog ni la referencia; si una cambia, la otra no cambia sola.

Enmendarla requiere: el motivo escrito, la actualización de lo que dependa de ella bajo
`.specify/`, y un cambio de versión — MAJOR si se quita o redefine un principio, MINOR si se
agrega uno o se amplía materialmente, PATCH para aclaraciones.

**Versión**: 1.0.0 | **Ratificada**: 2026-09-21 | **Última enmienda**: 2026-09-21
