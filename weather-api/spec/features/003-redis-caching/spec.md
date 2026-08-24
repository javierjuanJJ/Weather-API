# Feature 003: Redis Caching

## Overview
Implementar caché distribuido con Redis para mejorar el rendimiento y reducir llamadas a la API externa de Visual Crossing.

## User Story
Como usuario, quiero que las consultas del clima sean rápidas, para obtener información sin esperas innecesarias.

## Acceptance Criteria
1. Datos se almacenan en Redis después de la primera consulta
2. Consultas subsecuentes retornan datos cacheados
3. TTL de 12 horas para cada entrada
4. Indicador `cached: true/false` en la respuesta
5. Manejo graceful de errores de Redis
6. Tests pasan con Redis mock

## Technical Requirements
- Redis client: ioredis
- Key format: `weather:${city.toLowerCase()}`
- TTL: 43200 segundos (12 horas)
- Connection pooling
- Error handling without breaking the app

## Cache Flow
```
1. Check Redis for key `weather:{city}`
2. If found → Return cached data with cached: true
3. If not found → Fetch from Visual Crossing API
4. Store result in Redis with TTL
5. Return fresh data with cached: false
```

## Response with Cache Indicator
```javascript
{
  "data": {
    "city": "london",
    "temperature": 15,
    "cached": true  // or false
  }
}
```

## Redis Configuration
- Host: localhost (configurable)
- Port: 6379 (configurable)
- Password: optional
- DB: 0 (default)

## Error Scenarios
| Scenario | Behavior |
|----------|----------|
| Redis down | Continue without cache |
| Redis timeout | Continue without cache |
| Invalid cached data | Fetch fresh data |
| Cache key collision | Unlikely with city-based keys |

## Performance Targets
- Cache hit: < 50ms response time
- Cache miss: < 500ms response time (API call + cache write)
- Memory usage: ~1KB per cached city

## Dependencies
- ioredis
- Redis server (external)

## Testing Strategy
- Mock Redis client
- Test cache hit/miss scenarios
- Test TTL expiration
- Test Redis error handling
- Integration test with real Redis (optional)
