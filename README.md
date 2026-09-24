# Weather API

API de consulta meteorológica construida con **Express (Node.js)**, integración con
[Visual Crossing](https://www.visualcrossing.com/weather-api) para datos reales,
caché distribuida con **Redis** y validación de parámetros con **Zod**.

El despliegue está preparado para **Docker** (aplicación + Redis).

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) con Docker Compose v2
- Una clave API de Visual Crossing (gratuita en su web)

## Variables de entorno

Todas las variables se definen en un fichero `.env` en la raíz del repositorio
(ver `.env.example`).

| Variable | Obligatoria | Por defecto | Descripción |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Puerto donde escucha la API / se publica en el host. |
| `VISUAL_CROSSING_API_KEY` | **Sí** | *(vacía)* | Clave API de Visual Crossing. Sin ella la API responde `500`. |
| `CACHE_TTL_SECONDS` | No | `43200` | TTL de la caché en Redis, en segundos (12 horas). |
| `REDIS_HOST` | No | `localhost` | Host de Redis. En Docker Compose se fuerza a `redis` automáticamente. |
| `REDIS_PORT` | No | `6379` | Puerto de Redis. |
| `REDIS_PASSWORD` | No | *(vacía)* | Contraseña de Redis (vacía = sin autenticación). |

> **Importante:** no definas `NODE_ENV`. El código de la aplicación solo arranca
> el servidor cuando `NODE_ENV` no está definida (es el mecanismo usado para poder
> ejecutar los test sin abrir un puerto).

## Ejecutar con Docker (recomendado)

```bash
# 1. Crear el .env a partir del ejemplo y poner tu API key
cp .env.example .env
#    edita .env y rellena VISUAL_CROSSING_API_KEY

# 2. Construir y levantar todos los servicios (api + redis)
docker compose up --build -d

# 3. Ver el estado y los logs
docker compose ps
docker compose logs -f api

# 4. Parar los servicios
docker compose down
#    Con --volumes se eliminan también los datos de Redis:
docker compose down -v
```

Después de arrancar, la API queda disponible en `http://localhost:3000`.

### Uso de la API

```bash
curl "http://localhost:3000/weather?city=London"
```

Respuesta (ejemplo):

```json
{
  "data": {
    "city": "London",
    "latitude": 51.5085,
    "longitude": -0.1257,
    "timezone": "Europe/London",
    "currentConditions": { "...": "..." },
    "days": [ "..." ],
    "cached": false
  }
}
```

El campo `cached` indica si la respuesta se sirvió desde la caché de Redis.

## Informe de pruebas de la API

Resultado de probar la API levantada en `http://localhost:3000` con `curl`.
Informe completo en [`api-tests-report.md`](api-tests-report.md).

### Resumen

| Total tests | Éxitos (2xx) | Errores esperados | Errores inesperados |
|---:|---:|---:|---:|
| **25** | **8** ✅ | **14** ⚠️ | **3** ❌ |

### Endpoint probado

- `GET /weather?city=<ciudad>` — tiempo de una ciudad (Visual Crossing + caché Redis). No hay otros endpoints; cualquier otra ruta devuelve `404`.

### Tabla de tests

| # | Comando curl | Caso | Esperado | Resultado | Estado |
|---|---|---|---|---|---|
| 1 | `curl "http://localhost:3000/weather?city=London"` | Happy path (ciudad válida) | 200 | 200, `cached: false` | ✅ |
| 2 | `curl "http://localhost:3000/weather?city=London"` | Cache hit (2ª llamada) | 200 | 200, `cached: true` | ✅ |
| 3 | `curl "http://localhost:3000/weather"` | Sin parámetro `city` | 400 | 400 (`La ciudad es obligatoria`) | ✅ |
| 4 | `curl "http://localhost:3000/weather?city="` | Ciudad vacía | 400 | 400 | ✅ |
| 5 | `curl "http://localhost:3000/weather?city=A"` | Menos de 2 caracteres | 400 | 400 (Zod `too_small`) | ✅ |
| 6 | `curl "http://localhost:3000/weather?city=<101 × a>"` | Más de 100 caracteres | 400 | 400 (Zod `too_big`) | ✅ |
| 7 | `curl "http://localhost:3000/weather?city=<100 × a>"` | 100 caracteres pero ciudad inexistente | 4xx | **500** | ❌ **BUG** |
| 8 | `curl "http://localhost:3000/weather?city=Zzzzzzzqqqq"` | Ciudad inexistente | 4xx | **500** | ❌ **BUG** |
| 9 | `curl "http://localhost:3000/weather?city=Madrid&foo=bar&units=metric"` | Parámetros extra | 200 | 200 (Zod los ignora) | ✅ |
| 10 | `curl "http://localhost:3000/weather?city=New%20York"` | Ciudad con espacios | 200 | 200 | ✅ |
| 11 | `curl "http://localhost:3000/weather?city=12345"` | Valor numérico como string | 200/4xx | 200 (VC lo resuelve) | ✅ |
| 12 | `curl "http://localhost:3000/weather?city=Roma"` | Miss de caché | 200 | 200, `cached: false` | ✅ |
| 13 | `curl "http://localhost:3000/weather?city=Roma"` | Cache hit | 200 | 200, `cached: true` | ✅ |
| 14 | `curl -I "http://localhost:3000/weather?city=London"` | `HEAD` | 200 | 200 | ✅ |
| 15 | `curl -X OPTIONS -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" "http://localhost:3000/weather?city=London"` | Preflight CORS (origen permitido) | 204 | 204 con cabeceras CORS | ✅ |
| 16 | `curl -H "Origin: http://evil.example.com" "http://localhost:3000/weather?city=London"` | Origen CORS no permitido | 403 | **500** (HTML) | ❌ **BUG** |
| 17 | `curl -X POST "http://localhost:3000/weather?city=London"` | Método no soportado | 404 | 404 | ✅ |
| 18 | `curl -X PUT "http://localhost:3000/weather?city=London"` | Método no soportado | 404 | 404 | ✅ |
| 19 | `curl -X PATCH "http://localhost:3000/weather?city=London"` | Método no soportado | 404 | 404 | ✅ |
| 20 | `curl -X DELETE "http://localhost:3000/weather?city=London"` | Método no soportado | 404 | 404 | ✅ |
| 21 | `curl -X POST -H "Content-Type: application/json" -d '{"city":"Madrid"}' "http://localhost:3000/weather"` | Body JSON en `POST` | 404 | 404 | ✅ |
| 22 | `curl "http://localhost:3000/"` | Raíz | 404 | 404 | ✅ |
| 23 | `curl "http://localhost:3000/weather/"` | Barra final | 400 | 400 (falta `city`) | ✅ |
| 24 | `curl "http://localhost:3000/weather/London"` | `city` en el path | 404 | 404 | ✅ |
| 25 | `curl "http://localhost:3000/api"` | Ruta inexistente | 404 | 404 | ✅ |

### Bugs encontrados

1. **Ciudad inexistente → `500` en vez de `4xx`.** Cuando Visual Crossing devuelve un estado no 2xx, el modelo lanza una excepción que acaba en un `500` genérico (`"Error al obtener la información meteorológica"`) en lugar de un `404`/`400`. Ficheros: `weather-api/backend/models/weather.js:38-40` y `weather-api/backend/controllers/weather.js:9-11`.
2. **CORS con origen no permitido → `500`.** `middlewares/cors.js:16` hace `callback(new Error(...))` y Express lo trata como error 500 (página HTML), cuando lo correcto sería `403`.
3. **Rate limiting documentado pero no implementado.** `RATE_LIMIT_WINDOW_MS` y `RATE_LIMIT_MAX` existen en `config.js` y en `docs/feature-004-rate-limiting.md`, pero `app.js` no registra el middleware `express-rate-limit`: tras 100+ peticiones rápidas la API sigue respondiendo.

### Notas

- Sin autenticación ni tokens: cualquier cliente puede consultar la API.
- Sin endpoints WebSocket/SSE: todo es HTTP clásico y probable con `curl`.
- La caché Redis funciona (TTL por defecto 12 h, ver `cached: true` en respuestas repetidas).
- Validación Zod correcta: `city` obligatoria, mínimo 2 y máximo 100 caracteres.

## Publicar y descargar la imagen en Docker Hub

La imagen pública está en **`jjal20021998/weather-api:latest`**
([ver en el navegador](https://hub.docker.com/r/jjal20021998/weather-api)).
A continuación, el flujo completo: construir, subir, verificar y descargar.

### 1. Construir la imagen

Se construye desde el `Dockerfile` del repositorio. El tag se compone de
`<usuario-dockerhub>/<nombre-imagen>:<tag>`.

```bash
docker build -t jjal20021998/weather-api:latest .
```

### 2. Subir la imagen a Docker Hub

Primero hay que hacer login en Docker Hub y después hacer `push`:

```bash
docker login                # te pide usuario y contraseña / token de acceso
docker push jjal20021998/weather-api:latest
```

### 3. Verificar que la imagen existe

Desde la línea de comandos (consulta el registro remoto, no hace falta
descargarla):

```bash
docker manifest inspect jjal20021998/weather-api:latest
```

Ver qué imagen tenemos localmente y su tamaño:

```bash
docker images
# o filtrado por nombre:
docker images jjal20021998/weather-api
```

Y en el navegador: <https://hub.docker.com/r/jjal20021998/weather-api>.

### 4. Bajar la imagen desde el repositorio del código

La imagen se obtiene a partir del código fuente: se clona el repo y se construye
con Dockerfile + `docker-compose.yml`.

```bash
git clone https://github.com/javierjuanJJ/Weather-API.git
cd Weather-API
cp .env.example .env        # rellenar VISUAL_CROSSING_API_KEY
docker compose up --build -d
```

### 5. Bajar la imagen directamente desde Docker Hub

Sin tocar el código: la API se descarga tal cual de Docker Hub usando
`docker-compose.dockerhub.yml` (que referencia `jjal20021998/weather-api:latest`
en lugar de construirlo).

```bash
# Opción A: pull explícito + compose desde la imagen publicada
docker pull jjal20021998/weather-api:latest
docker compose -f docker-compose.dockerhub.yml up -d

# Opción B: arrancar solo el contenedor de la API (necesita un Redis accesible
# vía REDIS_HOST; levanta el puerto 3000)
docker run --rm -d -p 3000:3000 --env-file .env jjal20021998/weather-api:latest
```

En ambos casos la API queda en `http://localhost:3000`.

## Ejecutar sin Docker (desarrollo local)

Requisitos: Node.js 20+, Redis (`redis-server`) y una clave de Visual Crossing.

```bash
cd backend
npm install
export VISUAL_CROSSING_API_KEY="tu_api_key"
## opcional: export REDIS_PASSWORD="..."   # si tu Redis lo requiere
npm start
```

### Tests

```bash
cd backend
npm test
```

## Estructura del proyecto

```
.
├── Dockerfile              # Imagen de la API
├── docker-compose.yml      # Orquestación (api + redis) construyendo desde el código
├── docker-compose.dockerhub.yml  # Idem usando la imagen publicada en Docker Hub
├── .env.example            # Plantilla de variables de entorno
└── weather-api/
    ├── backend/            # Código de la API (Express)
    │   ├── app.js
    │   ├── config.js       # Valores por defecto
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── models/         # Lógica de negocio + Redis
    │   ├── routes/
    │   └── schemas/        # Validación con Zod
    └── docs/               # Documentación por feature
```