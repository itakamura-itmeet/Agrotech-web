# Quickstart — validar el login

No hay pruebas automáticas en el repo (Constitución IV): esta es la validación.

## 0. Antes de empezar (Isaac, en el panel de Clerk)

1. Copiar la **Publishable key** y la **Secret key** a `.env.local`:
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=` y `CLERK_SECRET_KEY=`.
2. Poner el registro en modo **Restringido**. Sin esto, ocultar el registro en el sitio no impide que
   alguien cree una cuenta desde las páginas que Clerk aloja.
3. Tener al menos una cuenta creada a mano para probar.

## 1. Build

`npm run build` → termina verde. Aparece la ruta `/sign-in` y **no** aparece `/sign-up` (SC-001a).

## 2. Secretos fuera del navegador (SC-004)

Tras el build, buscar **el valor exacto** de la Secret key en lo que se envía al navegador:

```bash
K=$(sed -n 's/^CLERK_SECRET_KEY=//p' .env.local); [ -n "$K" ] && grep -rlF "$K" .next/static | wc -l
```

Esperado: **0**. Se busca el valor y no el prefijo `sk_`, que aparece en palabras comunes y daría
falsos positivos. El `[ -n "$K" ]` evita que una variable vacía haga coincidir todo.

## 3. Recorrido (`npm run dev`, ventana privada)

| # | Acción | Esperado | Req. |
|---|---|---|---|
| 1 | Abrir `/`, `/history` y `/history/abc` | Las tres llevan a `/sign-in` | FR-001, SC-001 |
| 2 | Mirar `/sign-in` | En español, botón verde, **sin** enlace de registro | FR-005, FR-005a, FR-006 |
| 3 | Ingresar con contraseña incorrecta | Error en la misma pantalla | FR-008 |
| 4 | Partiendo de `/history/abc`, ingresar bien | Llega a `/history/abc` | FR-003 |
| 5 | Con sesión, abrir `/sign-in` | Redirige a `/` | caso borde |
| 6 | Con sesión, usar el dashboard | Sensores, historial y clasificación iguales que antes | FR-012, SC-005 |
| 7 | Menú de cuenta en la cabecera → cerrar sesión | Vuelve a `/sign-in`; abrir `/` pide ingreso otra vez | FR-007, SC-003 |
| 8 | Abrir `/sign-up` | 404 | FR-005 |

## 4. Sin variables

Vaciar `CLERK_SECRET_KEY` y abrir `/` en `npm run dev` → error que nombra la clave faltante en la
terminal, no pantalla en blanco silenciosa (R-4).
