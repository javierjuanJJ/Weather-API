# Technology Stack

## Runtime & Framework
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Framework | Express.js | 4.18.x | Web framework |
| Language | JavaScript (ES Modules) | ES2022+ | Application code |

## Data Layer
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Cache | Redis | 7.x | Caché distribuido |
| Redis Client | ioredis | 5.3.x | Cliente Redis para Node.js |

## Validation & Security
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Validation | Zod | 3.22.x | Schema validation |
| CORS | cors | 2.8.x | Cross-Origin Resource Sharing |
| Rate Limiting | express-rate-limit | 7.x | Request throttling |

## External APIs
| Component | Technology | Purpose |
|-----------|------------|---------|
| Weather Data | Visual Crossing API | Datos meteorológicos en tiempo real |

## Development Tools
| Component | Technology | Purpose |
|-----------|------------|---------|
| Testing | node:test | Testing framework nativo |
| Assertions | node:assert | Assertions library |
| Package Manager | npm | Gestión de dependencias |
| Watch Mode | node --watch | Hot reload en desarrollo |

## Architecture Patterns
- **MVC (Model-View-Controller)**: Separación de responsabilidades
- **Middleware Pipeline**: Procesamiento encadenado de requests
- **Repository Pattern**: Acceso a datos abstracto
- **Configuration Management**: Variables de entorno con defaults

## Module System
- **ES Modules**: Uso de `import/export` nativo
- **Package.json**: `"type": "module"` habilitado

## Code Style
- Sin comentarios adicionales (código autoexplicativo)
- Nombres descriptivos en español
- Funciones puras cuando sea posible
- Manejo de errores con try/catch
