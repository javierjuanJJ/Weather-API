# Feature 004: Rate Limiting

## Overview
Implementar limitación de tasa de peticiones para proteger la API contra abuso y asegurar disponibilidad equitativa.

## User Story
Como administrador del sistema, quiero limitar las peticiones por cliente, para prevenir abuso y mantener la estabilidad del servicio.

## Acceptance Criteria
1. Límite de 100 peticiones por ventana de 15 minutos
2. Headers informativos en cada respuesta
3. Respuesta HTTP 429 cuando se excede el límite
4. Mensaje de error claro incluyendo tiempo de espera
5. Diferentes límites por cliente (opcional)
6. Tests verifican comportamiento

## Technical Requirements
- Rate limiter por IP del cliente
- Ventana deslizante o fija (15 minutos)
- Headers estándar: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- Respuesta 429 con Retry-After header
- Configurable via variables de entorno

## Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
Retry-After: 900
```

## Error Response
```json
{
  "error": "Demasiadas peticiones",
  "message": "Has excedido el límite de 100 peticiones por 15 minutos",
  "retryAfter": 900
}
```

## Configuration
- Window: 15 minutes (900000ms)
- Max requests: 100
- Key: IP address
- Skip successful: false

## Implementation Options
1. **express-rate-limit**: Middleware estándar
2. **Custom implementation**: Más control
3. **Redis-backed**: Para múltiples instancias

## Dependencies
- express-rate-limit (recommended)
- Redis (for distributed rate limiting)

## Testing Strategy
- Test rate limit headers
- Test 429 response after limit
- Test window reset
- Test different IPs
