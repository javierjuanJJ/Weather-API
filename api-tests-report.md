# API Test Report

Fecha: 2026-09-24
Base URL: http://localhost:3000
API: Express (Node.js) + Redis + Visual Crossing, levantada por Docker Compose (`weather-api` running, 2 contenedores).

## Resumen

| Total tests | Éxitos (2xx) | Errores esperados | Errores inesperados |
|---|---|---|---|
| 25 | 8 | 14 | 3 |

## Endpoints probados

- `GET /weather?city=<ciudad>` — Devuelve el tiempo de una ciudad (datos de Visual Crossing con caché en Redis).
- Sin otros endpoints definidos; rutas fuera de `/weather` devuelven 404.

## Tests

### 1. `GET /weather?city=London` — Happy path (ciudad válida)
- **URL:** `http://localhost:3000/weather?city=London`
- **Esperado:** 200
- **Resultado:** 200 ✅
- **Respuesta:** JSON completo con `city`, `latitude`, `longitude`, `timezone`, `currentConditions`, `days`, `cached: false`.

### 2. `GET /weather?city=London` — Cache hit (segunda llamada)
- **URL:** `http://localhost:3000/weather?city=London`
- **Esperado:** 200
- **Resultado:** 200, `cached: true` ✅
- **Respuesta:** mismos datos servidos desde Redis.

### 3. `GET /weather` — Sin parámetro `city` (parametro obligatorio)
- **URL:** `http://localhost:3000/weather`
- **Esperado:** 400
- **Resultado:** 400 ✅
- **Respuesta:** `{"error":"Parámetros inválidos","details":[{"code":"invalid_type","message":"La ciudad es obligatoria",...}]}`

### 4. `GET /weather?city=` — Ciudad vacía
- **URL:** `http://localhost:3000/weather?city=`
- **Esperado:** 400
- **Resultado:** 400 ✅

### 5. `GET /weather?city=A` — Menos de 2 caracteres
- **URL:** `http://localhost:3000/weather?city=A`
- **Esperado:** 400
- **Resultado:** 400 ✅ (detalle Zod: `too_small`, mínimo 2)

### 6. `GET /weather?city=<101 a>` — Más de 100 caracteres
- **URL:** `.../weather?city=<101 caracteres>`
- **Esperado:** 400
- **Resultado:** 400 ✅ (detalle Zod: `too_big`, máximo 100)

### 7. `GET /weather?city=<100 a>` — Longitud límite (100 chars) pero ciudad inexistente
- **URL:** `.../weather?city=<100 caracteres>`
- **Esperado:** 4xx (ciudad no encontrada)
- **Resultado:** 500 ❌ **BUG**
- **Respuesta:** `{"error":"Error al obtener la información meteorológica"}`

### 8. `GET /weather?city=Zzzzzzzqqqq` — Ciudad inexistente
- **URL:** `http://localhost:3000/weather?city=Zzzzzzzqqqq`
- **Esperado:** 4xx (Not Found / Bad Request)
- **Resultado:** 500 ❌ **BUG**
- **Respuesta:** `{"error":"Error al obtener la información meteorológica"}`

### 9. `GET /weather?city=Madrid&foo=bar&units=metric` — Parámetros extra
- **URL:** `.../weather?city=Madrid&foo=bar&units=metric`
- **Esperado:** 200 (Zod ignora campos no definidos)
- **Resultado:** 200 ✅

### 10. `GET /weather?city=New%20York` — Ciudad con espacios
- **URL:** `.../weather?city=New%20York`
- **Esperado:** 200
- **Resultado:** 200 ✅

### 11. `GET /weather?city=12345` — Ciudad con valor numérico como string
- **URL:** `.../weather?city=12345`
- **Esperado:** 200 ó 4xx
- **Resultado:** 200 ✅ (Visual Crossing resuelve el valor)

### 12. `GET /weather?city=Roma` — Miss de caché (nueva ciudad)
- **URL:** `.../weather?city=Roma`
- **Esperado:** 200
- **Resultado:** 200, `cached: false` ✅

### 13. `GET /weather?city=Roma` — Cache hit
- **URL:** `.../weather?city=Roma`
- **Esperado:** 200
- **Resultado:** 200, `cached: true` ✅

### 14. `HEAD /weather?city=London`
- **URL:** `http://localhost:3000/weather?city=London`
- **Esperado:** 200
- **Resultado:** 200 ✅ (Express responde HEAD en rutas GET)

### 15. `OPTIONS /weather` — Preflight CORS con origen permitido
- **URL:** `.../weather?city=London` con `Origin: http://localhost:5173` y `Access-Control-Request-Method: GET`
- **Esperado:** 204 con cabeceras CORS
- **Resultado:** 204 ✅ (`Access-Control-Allow-Origin: http://localhost:5173`)

### 16. `GET /weather?city=London` — Origen CORS no permitido
- **URL:** `.../weather?city=London` con `Origin: http://evil.example.com`
- **Esperado:** 403 (origen denegado)
- **Resultado:** 500 ❌ **BUG**
- **Respuesta:** página HTML de error de Express (text/html), Cabecera `Content-Security-Policy`.

### 17. `POST /weather?city=London` — Método no soportado
- **URL:** `http://localhost:3000/weather?city=London`
- **Esperado:** 404
- **Resultado:** 404 ✅

### 18. `PUT /weather?city=London` — Método no soportado
- **Esperado:** 404
- **Resultado:** 404 ✅

### 19. `PATCH /weather?city=London` — Método no soportado
- **Esperado:** 404
- **Resultado:** 404 ✅

### 20. `DELETE /weather?city=London` — Método no soportado
- **Esperado:** 404
- **Resultado:** 404 ✅

### 21. `POST /weather` con body JSON `{"city":"Madrid"}`
- **Esperado:** 404 (la ruta no acepta body)
- **Resultado:** 404 ✅

### 22. `GET /` — Raíz
- **URL:** `http://localhost:3000/`
- **Esperado:** 404
- **Resultado:** 404 ✅

### 23. `GET /weather/` — Barra final
- **URL:** `http://localhost:3000/weather/`
- **Esperado:** 400 (matchea la ruta pero falta `city`)
- **Resultado:** 400 ✅

### 24. `GET /weather/London` — Ruta con city en el path
- **URL:** `http://localhost:3000/weather/London`
- **Esperado:** 404
- **Resultado:** 404 ✅

### 25. `GET /api` — Ruta inexistente
- **URL:** `http://localhost:3000/api`
- **Esperado:** 404
- **Resultado:** 404 ✅

## Errores inesperados (bugs encontrados)

1. **`GET /weather?city=<ciudad inexistente>` → 500** en lugar de 4xx. Cuando Visual Crossing devuelve un estado no 2xx (ej. localización no encontrada), el modelo lanza una excepción que el controller convierte en un 500 genérico (`"Error al obtener la información meteorológica"`). Debería devolverse un 404 ("ciudad no encontrada") o 400.
   - Fichero: `weather-api/backend/models/weather.js:38-40` y `weather-api/backend/controllers/weather.js:9-11`.
2. **CORS con origen no permitido → 500** con página HTML de error por defecto de Express. El middleware `cors` hace `callback(new Error('Origen no permitido'))` y Express lo trata como error 500, cuando lo esperado sería un 403. (`weather-api/backend/middlewares/cors.js:16`).
3. **Rate limiting documentado pero no implementado**: `RATE_LIMIT_WINDOW_MS` y `RATE_LIMIT_MAX` existen en `config.js` y en `docs/feature-004-rate-limiting.md`, pero `app.js` no registra el middleware `express-rate-limit` ni ninguna limitación de tasa. Después de 100+ peticiones rápidas la API sigue respondiendo normalmente.

## Notas

- No hay autenticación ni tokens: cualquier cliente puede consultar la API.
- No hay endpoints websocket/SSE; todo es HTTP clásico (testable con curl).
- La clave de Visual Crossing está configurada y funciona (las respuestas vienen con datos reales de las ciudades).
- La caché de Redis funciona correctamente (TTL por defecto 12 h), como se ve en `cached: true`.
- Valores límite correctos de Zod: `city` obligatoria, mínimo 2, máximo 100 caracteres.