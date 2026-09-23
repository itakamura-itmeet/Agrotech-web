# spec-kit — cómo funciona y orden de comandos

spec-kit organiza el desarrollo en capas: cada comando genera un artefacto que alimenta al
siguiente. La idea es separar **qué quieres construir** (spec) de **cómo lo vas a construir**
(plan) de **en qué orden lo vas a ejecutar** (tasks), antes de tocar código.

## Orden de comandos

1. **`/speckit-constitution`** *(una sola vez, o cuando cambien las reglas del proyecto)*
   Define principios no negociables del proyecto (ej. "todo endpoint requiere auth", "no se
   rompe el dashboard existente", stack permitido, etc.). Vive en `.specify/memory/constitution.md`.

2. **`/speckit-specify`** — Describe el **qué y por qué**, sin hablar de implementación técnica.
   Crea un archivo de spec nuevo bajo `specs/` con requisitos, criterios de aceptación, fuera de
   alcance, etc.

3. **`/speckit-clarify`** *(opcional pero recomendado antes de planear)*
   Hace preguntas para resolver ambigüedades antes de diseñar (ej. mecanismo exacto de
   propagación de sesión entre repos).

4. **`/speckit-plan`** — El **cómo técnico**: arquitectura, stack, integración con servicios
   existentes. Se valida contra la constitución del paso 1.

5. **`/speckit-tasks`** — Convierte el plan en una lista de tareas concretas y ordenadas.

6. **`/speckit-analyze`** *(opcional)* — Revisa que spec, plan y tasks sean consistentes entre
   sí antes de implementar.

7. **`/speckit-checklist`** *(opcional)* — Genera checklists de calidad para validar que la
   spec esté completa/clara.

8. **`/speckit-implement`** — Ejecuta las tareas y escribe el código real.

Extra:
- **`/speckit-taskstoissues`** convierte las tasks en issues de GitHub si se quiere trackear ahí.
- **`/speckit-converge`** audita el código ya existente y agrega como tasks pendientes lo que
  falte.

## Ejemplo de aplicación: botón de login-redirect vía Lambda middleware

Feature: un botón en el dashboard de Hydro que permite al usuario navegar, ya autenticado, a
otro repositorio/sitio web independiente, sin tener que loguearse de nuevo ahí (relevante para
la branch `feature/clerk-jwt-user-identity`).

Flujo sugerido:

`/speckit-constitution` (si no está llena aún)
→ `/speckit-specify` describiendo el botón y el flujo de redirect autenticado
→ `/speckit-clarify` para resolver el mecanismo exacto de propagación de sesión (¿dominio
  compartido/cookie, query param firmado, o token temporal emitido por la Lambda?)
→ `/speckit-plan` para diseñar la Lambda como middleware que valida el JWT de Clerk y genera el
  redirect/token de sesión
→ `/speckit-tasks`
→ `/speckit-implement`
