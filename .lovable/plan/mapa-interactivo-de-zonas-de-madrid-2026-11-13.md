# Mapa interactivo de zonas de Madrid

## Qué verá el usuario
- Nueva página **Explorar** (`/explorar`), enlazada desde la cabecera y la portada.
- Mapa de la provincia de Madrid con las 10 zonas del catálogo (Madrid centro, oeste, norte, este, El Escorial, Sierra de Guadarrama, Rascafría, Alcalá, Aranjuez, Torrejón) dibujadas como círculos de zona con su nombre y nº de lugares.
- Al tocar una zona: el mapa se acerca y aparece un panel (lateral en escritorio, hoja inferior en móvil) con pestañas **Restaurantes** y **Ocio** (resto de categorías, con filtro "Familia").
- Cada lugar muestra precio orientativo, duración y aviso de confirmar horarios.
- **Trayectos reales a pie**: al elegir dos lugares (o "Desde aquí" en uno y otro destino), se dibuja la ruta peatonal real con minutos y metros. Además, botón "Ruta por la zona" que une los lugares visibles más cercanos en un paseo.
- Botón "Crear plan en esta zona" que abre el formulario con la zona ya elegida.

## Notas
- Las zonas fuera de la capital están lejos entre sí: las rutas a pie solo se ofrecen dentro de una zona; si dos lugares distan más de ~8 km se avisa en vez de trazar.

## Detalles técnicos
- Ruta `src/routes/explorar.tsx` con loader `ensureQueryData` del catálogo público existente y head() propio.
- Componente `zone-map.tsx` lazy tras ClientOnly (Leaflet, tiles HOT), centros de zona calculados como media de coordenadas; reutiliza `walkingRoute` (FOSSGIS foot).
- Agrupación/categorías en funciones puras de `model.ts` (`groupByZone`, `isRestaurant`) con tests.
- `plan.nuevo` lee `?zona=` para preseleccionar zona.
