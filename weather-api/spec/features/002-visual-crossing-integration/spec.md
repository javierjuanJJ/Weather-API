# Feature 002: Visual Crossing API Integration

## Overview
Integrar la API de Visual Crossing Weather para obtener datos meteorológicos reales en tiempo, reemplazando los datos hardcodeados.

## User Story
Como usuario, quiero consultar el clima actual de cualquier ciudad del mundo, para obtener información meteorológica precisa y actualizada.

## Acceptance Criteria
1. Endpoint GET `/weather` retorna datos reales de Visual Crossing API
2. Manejo de errores cuando la API externa falla
3. API key configurada via variable de entorno
4. Respuesta incluye: ciudad, coordenadas, condiciones actuales, pronóstico
5. Tests pasan con mock de API externa
6. Manejo de rate limiting de la API externa

## Technical Requirements
- Fetch API nativo para llamadas HTTP
- API key en variable de entorno `VISUAL_CROSSING_API_KEY`
- Timeout de 10 segundos para llamadas externas
- Retry automático en errores transitorios
- Logging de errores sin exponer datos sensibles

## API Response Structure
```javascript
{
  "data": {
    "city": "london",
    "latitude": 51.5085,
    "longitude": -0.1257,
    "timezone": "Europe/London",
    "currentConditions": {
      "temp": 15.0,
      "conditions": "Partially cloudy",
      "humidity": 72,
      "windspeed": 12.5
    },
    "days": [
      {
        "datetime": "2024-01-15",
        "tempmax": 18.0,
        "tempmin": 12.0,
        "description": "Partly cloudy throughout the day"
      }
    ]
  }
}
```

## External API Details
- **Base URL**: `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/`
- **Parameters**: unitGroup=metric, include=days,hours, contentType=json
- **Authentication**: API key in query parameter
- **Rate Limits**: 1000 requests/day (free tier)

## Dependencies
- Node.js fetch API (built-in)
- Environment variable: VISUAL_CROSSING_API_KEY

## Testing Strategy
- Mock Visual Crossing API responses
- Test error scenarios (timeout, 4xx, 5xx)
- Test successful response parsing
- Integration test with real API (optional, requires key)
