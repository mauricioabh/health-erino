# Subir CSV inicial: qué necesitas en local y en Vercel

El CSV se guarda en **Vercel Blob**. Pasos para que el upload funcione en tu máquina y cuando la app esté desplegada en Vercel.

---

## En local

1. **Crear el Blob store** (una vez, en el proyecto de Vercel):
   - [Vercel Dashboard](https://vercel.com/dashboard) → tu proyecto **health-erino** (o el que uses).
   - Pestaña **Storage** → **Create** / **Add Storage** → **Blob**.
   - Nombre (ej. `health-erino-blob`), acceso **Private** → crear.
   - Vercel crea la variable `BLOB_READ_WRITE_TOKEN` en ese proyecto.

2. **Poner el token en tu PC** (en `web/.env.local`):
   - **Opción A:** En la carpeta del repo: `vercel link` (si no está enlazado) y `vercel env pull .env.local`. Luego mueve o copia `BLOB_READ_WRITE_TOKEN` a `web/.env.local` si hace falta.
   - **Opción B:** En Vercel → tu proyecto → **Storage** → tu Blob store → configuración → copiar el **Token**. En `web/.env.local` añadir:
     ```env
     BLOB_READ_WRITE_TOKEN=el_token_que_copiaste
     ```

3. **Probar:** Desde `web/`: `npm run dev` → iniciar sesión → **Admin** → **Subir CSV inicial** → elegir un `.csv`. Debe subir y sincronizar.

---

## En Vercel (cuando la app ya está desplegada)

1. El Blob lo creaste en **el mismo proyecto** donde haces deploy → la variable `BLOB_READ_WRITE_TOKEN` ya está en el proyecto. No tienes que añadirla a mano.

2. **Comprobar:** En el proyecto en Vercel → **Settings** → **Environment Variables**. Debe aparecer `BLOB_READ_WRITE_TOKEN` para Production (y Preview si quieres). Si no está, créala con el token del Blob store (Storage → tu store → config).

3. **Probar en producción:** Abre la URL de tu app en Vercel → iniciar sesión → **Admin** → **Subir CSV inicial** → subir un CSV. Debe funcionar igual que en local.

Si algo falla (“Error al subir el archivo” o “BLOB_READ_WRITE_TOKEN no configurado”), revisa que la variable exista en Environment Variables y haz un **nuevo deploy** después de añadirla o cambiarla.
