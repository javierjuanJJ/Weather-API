# Feature 001: Hardcoded Endpoint

## Overview
Implementar un endpoint básico de weather que retorne datos hardcodeados para validar la arquitectura MVC y el pipeline de middleware.

## User Story
Como desarrollador, quiero un endpoint `/weather` que acepte una ciudad como query parameter y retorne información meteorológica básica, para verificar que la infraestructura funciona correctamente.

## Acceptance Criteria
1. Endpoint GET `/weather` acepta query parameter `city`
2. Retorna HTTP 400 si no se proporciona `city`
3. Retorna HTTP 200 con datos hardcodeados cuando se proporciona una ciudad válida
4. Validación con Zod rechaza ciudades con menos de 2 caracteres
5. Headers CORS habilitados
6. Tests integrados pasan

## Technical Requirements
- Express server en puerto configurable (default: 3000)
- Middleware de validación con Zod
- CORS habilitado para orígenes específicos
- Respuesta en formato JSON: `{ data: {...} }`
- Error response: `{ error: "mensaje", details: [...] }`

## API Contract
```
GET /weather?city={city_name}

Response 200:
{
  "data": {
    "city": "London",
    "temperature": 15,
    "condition": "Cloudy",
    "humidity": 72
  }
}

Response 400:
{
  "error": "Parámetros inválidos",
  "details": [...]
}
```

## Dependencies
- express
- zod
- cors

## Testing Strategy
- Unit tests para validación Zod
- Integration tests para endpoint
- Test de CORS headers
- Test de error handling
