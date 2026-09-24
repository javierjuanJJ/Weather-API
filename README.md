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
├── docker-compose.yml      # Orquestación (api + redis)
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