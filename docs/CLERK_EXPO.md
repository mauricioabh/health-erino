# Clerk en la app Expo (mobile)

La app móvil usa **Clerk** (misma aplicación que la web) para iniciar sesión y llamar a las APIs protegidas (subir CSV, sync).

## Configuración en Clerk Dashboard

1. Entra en [Clerk Dashboard](https://dashboard.clerk.com) y abre tu aplicación.
2. Ve a **Configure** → **Native applications** (o [Native applications](https://dashboard.clerk.com/~/native-applications)).
3. **Activa "Native API"** para que la app Expo pueda autenticarse con la misma aplicación Clerk que la web.

## Variables en la app móvil

En la raíz de `mobile/` crea o edita `.env`:

```env
EXPO_PUBLIC_APP_URL=http://localhost:3000
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

- **EXPO_PUBLIC_APP_URL**: URL del backend Next.js (`http://localhost:3000` en local, o la URL de tu deploy en Vercel).
- **EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY**: La **misma** Publishable Key que usas en la web (en `web/.env.local` está como `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`). Cópiala de ahí.

## Flujo en la app

- **Inicio de sesión**: Las pantallas `(auth)/sign-in` y `(auth)/sign-up` permiten registrarse e iniciar sesión con email y contraseña (y código por email si lo tienes configurado en Clerk).
- **Subir CSV**: La pantalla **Subir CSV inicial** requiere estar autenticado. Si no hay sesión, se redirige a `sign-in`. Al subir el archivo, la app envía el **Bearer token** de Clerk en `Authorization` y el backend Next.js lo acepta (`acceptsToken: "session_token"`).

## Producción (app en Vercel / backend en Vercel)

- En `mobile/.env` (o en EAS / tu CI) pon `EXPO_PUBLIC_APP_URL` con la URL pública del backend en Vercel (por ejemplo `https://tu-proyecto.vercel.app`).
- La `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` puede ser la misma de producción si usas la misma aplicación Clerk para web y mobile.
