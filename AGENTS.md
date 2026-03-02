# AGENTS.md

Guía para el agente en el repositorio Health Erino.

## Dónde está el plan

**El plan del proyecto** (stack acordado, estructura de la app, variables de entorno, seguridad y deploy) **está en `docs/STACK.md`.** Consultar ese archivo para contexto de Neon, Clerk, web, mobile y APIs.

- **Schema y migraciones Neon**: `neon/SCHEMA.md`, `neon/migrations/`.
- **Reglas de Cursor**: `.cursor/rules/` (PowerShell, operaciones, MCPs).

## Comportamiento esperado

- Respetar las reglas en `.cursor/rules/` (por ejemplo, usar solo PowerShell en terminal).
- Para cambios de BD o deploy: usar Neon MCP, Vercel MCP o GitHub MCP cuando aplique.
- No modificar `docs/STACK.md` salvo que el usuario pida actualizar el plan o el stack.
