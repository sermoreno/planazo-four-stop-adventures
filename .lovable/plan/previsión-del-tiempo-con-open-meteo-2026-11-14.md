# Previsión del tiempo con Open-Meteo

Open-Meteo es gratis, no pide clave ni registro y cubre toda la provincia de Madrid.

## Qué verá la familia
- En "Nuevo plan": una tarjeta con la previsión del próximo sábado y domingo en Madrid (icono, temperatura máxima y mínima, probabilidad de lluvia).
- Si la probabilidad de lluvia es de un 50 % o más el día elegido, aparece el aviso "Parece que lloverá: ¿preparamos un plan bajo techo?" con la opción ya activada (se puede desactivar).
- En el plan: un aviso del tiempo en la zona del plan, con la temperatura por franjas horarias junto a cada parada. Si hace calor extremo (34 °C o más) o llueve, se recomienda el botón "Plan de lluvia" que ya existe.
- Fuente visible: "Previsión: Open-Meteo". Si no hay previsión (más de 16 días o falla del servicio), no se muestra nada y el plan funciona igual.

## Detalles técnicos
- Nuevo `src/features/planazo/weather.ts`: endpoint `https://api.open-meteo.com/v1/forecast` con `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`, `hourly=temperature_2m,precipitation_probability`, `timezone=Europe/Madrid`. La respuesta se valida con Zod y se calcula la fecha del próximo sábado y domingo.
- La consulta se hace desde el navegador con TanStack Query (CORS permitido, sin clave), con caché de 30 minutos y por coordenadas: el centro de Madrid en el formulario y la media de las paradas en el plan.
- Funciones puras: `nextWeekendDates`, `suggestIndoor(prob)` (umbral del 50 %) y `heatWarning(tmax)` (34 °C), además de un mapa de los códigos WMO a iconos y textos en español.
- No se cambia la lógica de selección: la lluvia solo activa la preferencia `rain` que ya existe.
- Pruebas en `src/test/weather.test.ts`: umbral de lluvia del 50 %, umbral de calor de 34 °C, fechas del próximo fin de semana y que una respuesta incompleta se rechace.
- Regla nueva en AGENTS.md: el tiempo viene de Open-Meteo y solo sugiere ajustes, nunca bloquea el plan.
