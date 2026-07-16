# PWA (Serwist) — Health Erino web

La app web es instalable como PWA (manifest + iconos 192/512 + service worker en producción).

## Verificación local

El service worker **no** refleja el comportamiento de producción en `npm run dev` (Turbopack). Para probar instalación, caché y fallback offline:

```powershell
cd web
npm run build
npm run start
```

Abre `http://localhost:3000` en HTTPS o localhost, revisa **Application → Service Workers** en DevTools y comprueba:

- Manifest con iconos 192/512
- SW registrado (`/sw.js`)
- Navegación offline muestra `/offline`
- Las rutas `/api/*` no se sirven desde caché (NetworkOnly)

En Vercel preview/producción el flujo es el mismo (HTTPS).
