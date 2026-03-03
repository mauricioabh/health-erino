# Vincular Vercel con GitHub (health-erino)

El repo está en GitHub y el proyecto **health-erino** en Vercel ya está creado, vinculado al repo y con Root Directory = `web`. Cada `git push origin main` dispara un deploy.

## Variables de entorno en Vercel

**MCP:** El Vercel MCP no incluye herramientas para crear/editar env vars; solo gestión de proyectos, deployments y logs.

**CLI:** Sí puedes añadirlas desde la terminal (desde la raíz del repo, con el proyecto ya linkeado con `vercel link`):

```powershell
cd C:\Projects\health-erino

# Añadir una variable (te pedirá el valor por stdin o lo puedes pegar)
# Para Production, Preview y Development:
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# O leer el valor desde un archivo (¡no subas .env.local al repo!)
# Get-Content web\.env.local | Select-String "DATABASE_URL" no es recomendable por seguridad.
# Mejor: copia el valor y pégalo cuando la CLI lo pida.

# Variables que necesitas (repite para production, preview, development si aplica):
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production --sensitive
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production --sensitive
vercel env add BLOB_READ_WRITE_TOKEN production --sensitive
# Clerk redirects (mismo valor que en .env.local):
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
```

**Valor sin salto de línea (recomendado en PowerShell):** si usas `"valor" | vercel env add ...` la CLI puede recibir un newline extra. Para evitarlo, escribe el valor en un archivo y redirige stdin desde ese archivo:

```powershell
# Escribir valor sin newline y añadir/actualizar la variable
$f = "$env:TEMP\ve.txt"
[System.IO.File]::WriteAllText($f, "TU_VALOR_AQUI")
cmd /c "vercel env add DATABASE_URL production --yes --sensitive < `"$f`""
# Para actualizar: vercel env update DATABASE_URL production --yes --sensitive < $f
```

**Listar variables ya configuradas:**

```powershell
vercel env list production
```

**Dashboard:** también puedes configurarlas en Vercel → proyecto **health-erino** → **Settings** → **Environment Variables**.

## Resumen

| Paso | Hecho |
|------|--------|
| Repo GitHub | **https://github.com/mauricioabh/health-erino** |
| Proyecto Vercel | **health-erino** (linkeado, Git conectado, Root = `web`) |
| Env vars | CLI: `vercel env add ...` o Dashboard → Settings → Environment Variables |
