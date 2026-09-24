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