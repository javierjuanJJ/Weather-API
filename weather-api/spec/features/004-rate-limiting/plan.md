# Implementation Plan: Feature 004

## Architecture Overview
```
Client → Rate Limit Middleware → Express → Controller → Model
              ↓ (exceeded)
         429 Response
```

## Implementation Steps

### Step 1: Install Rate Limiter
- Add express-rate-limit to dependencies
- Configure basic options

### Step 2: Create Rate Limiter Middleware
- Define window and max
- Configure key generation (IP-based)
- Add custom handler for 429

### Step 3: Add Response Headers
- X-RateLimit-Limit
- X-RateLimit-Remaining
- X-RateLimit-Reset
- Retry-After (on 429)

### Step 4: Update Express App
- Import rate limiter
- Apply before routes
- Configure per-route limits (optional)

### Step 5: Configuration
- Add to config.js
- Update .env.example
- Document limits

### Step 6: Tests
- Test normal requests pass
- Test headers present
- Test 429 after limit
- Test window reset

## Rate Limiting Strategy
- **Global limit**: 100 requests per 15 minutes
- **Per IP**: Each IP tracked separately
- **In-memory**: Simple implementation
- **Distributed**: Redis-backed (future enhancement)

## Performance Considerations
- Minimal overhead per request
- In-memory storage for single instance
- Redis for multi-instance deployment

## Rollback Strategy
- Remove rate limiter middleware
- Revert to unlimited requests
- Remove package dependency
