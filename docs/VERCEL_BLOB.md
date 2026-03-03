# Subir CSV inicial: qué necesitas en local y en Vercel

El CSV se guarda en **Vercel Blob**. Pasos para que el upload funcione en tu máquina y cuando la app esté desplegada en Vercel.

---

## Crear el Blob store (CLI o Dashboard)

### Con la CLI (recomendado)

Desde la raíz del repo, con el proyecto ya linkeado (`vercel link`):

```powershell
cd C:\Projects\health-erino
vercel blob create-store health-erino-blob --access private
```

Cuando pregunte **"Would you like to link this blob store to health-erino?"** responde **Y**. Así Vercel añade `BLOB_READ_WRITE_TOKEN` al proyecto automáticamente.

- **Nombre:** `health-erino-blob` (o el que quieras).
- **Acceso:** `--access private` para el CSV.
- **Región (opcional):** `--region iad1` (por defecto).

Si el store ya existe (por ejemplo `health-erino-blob`), no hace falta crearlo de nuevo; en el Dashboard (Storage) puedes vincularlo al proyecto si no se vinculó al crear.

### Desde el Dashboard

Vercel → tu proyecto → **Storage** → **Create** / **Add Storage** → **Blob** → nombre, **Private** → crear.

---

## En local

1. **Tener el token** en `web/.env.local`:
   - **Si creaste el store con la CLI y respondiste Y** al linkar: `vercel env pull` (desde la raíz o desde `web/`) y copia `BLOB_READ_WRITE_TOKEN` a `web/.env.local`.
   - **Si no:** En Vercel → proyecto → **Storage** → tu Blob store → configuración → copiar el **Token** y ponerlo en `web/.env.local`.

2. **Probar:** Desde `web/`: `npm run dev` → iniciar sesión → **Admin** → **Subir CSV inicial** → elegir un `.csv`. Debe subir y sincronizar.

---

## En Vercel (cuando la app ya está desplegada)

1. El Blob lo creaste en **el mismo proyecto** donde haces deploy → la variable `BLOB_READ_WRITE_TOKEN` ya está en el proyecto. No tienes que añadirla a mano.

2. **Comprobar:** En el proyecto en Vercel → **Settings** → **Environment Variables**. Debe aparecer `BLOB_READ_WRITE_TOKEN` para Production (y Preview si quieres). Si no está, créala con el token del Blob store (Storage → tu store → config).

3. **Probar en producción:** Abre la URL de tu app en Vercel → iniciar sesión → **Admin** → **Subir CSV inicial** → subir un CSV. Debe funcionar igual que en local.

Si algo falla (“Error al subir el archivo” o “BLOB_READ_WRITE_TOKEN no configurado”), revisa que la variable exista en Environment Variables y haz un **nuevo deploy** después de añadirla o cambiarla.
