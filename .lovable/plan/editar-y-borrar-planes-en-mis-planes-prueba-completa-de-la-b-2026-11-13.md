# Editar y borrar planes en Mis planes + prueba completa de la base de datos

## Qué verás
- En cada tarjeta de **Mis planes**: botones **Renombrar** (cambiar el título en línea), **Editar** (abre el plan) y **Eliminar** (ya existe, se mantiene con confirmación).
- Al abrir un plan guardado y cambiar paradas o ajustes, el botón pasa a **Guardar cambios** y actualiza ese mismo plan en lugar de crear uno nuevo (no consume otro de los 3 planes gratis).
- Cada tarjeta muestra también fecha de creación, número de paradas y si es público.

## Validación con datos de prueba (cuenta "Familia de prueba")
1. Comprobar la estructura: plan -> paradas -> lugar del catálogo; al borrar un plan se borran sus paradas y mensajes; no se puede borrar un lugar usado por un plan.
2. Crear: guardar un plan nuevo desde la app.
3. Leer: aparece en Mis planes y se reabre con sus datos.
4. Actualizar: renombrar y cambiar una parada; comprobar en la base de datos que cambian título, paradas y coste sin duplicar el plan.
5. Borrar: eliminarlo y comprobar que no quedan paradas huérfanas.
6. Seguridad: confirmar que otra sesión no puede ver ni modificar planes ajenos, y que el límite de 3 planes gratis sigue funcionando.
7. Informe breve con los resultados.

## Detalles técnicos
- Nuevas server functions autenticadas: `renamePlan(id,title)` y `updatePlan(id,{title,preferences,slots})` que revalidan catálogo y presupuesto, actualizan cabecera (total_cost, preferences_snapshot) y reemplazan `itinerary_items` (delete + insert); RLS de propietario ya cubre UPDATE/DELETE.
- FKs actuales ya correctas: items y chat con ON DELETE CASCADE, place_id restrictivo. No hace falta migración.
- `PlanView`: conservar `editingId` del plan guardado tras ajustes y llamar `updatePlan` en vez de `savePlan`.
- Tests: añadir prueba unitaria de la regla "actualizar no cuenta para el límite" si es aplicable; verificación CRUD vía Playwright + consultas SQL de lectura.
