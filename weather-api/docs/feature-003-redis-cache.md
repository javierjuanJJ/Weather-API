# Feature 003: Redis Caching

## Description
Implementación de caché distribuido con Redis para mejorar rendimiento y reducir llamadas a la API externa.

## Components Created/Modified
1. `backend/models/weather.js` - Added Redis integration
2. `backend/config.js` - Added Redis configuration
3. `backend/.env.example` - Added Redis variables

## Environment Variables Required
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL_SECONDS=43200
```

## Git Commit
```bash
git add -A
git commit -m "feat: Add Redis caching layer"
```

## Rollback Instructions

### Option 1: Git Revert (Recommended)
```bash
# Find the commit hash for this feature
git log --oneline

# Revert the specific commit
git revert <commit-hash>

# Push changes
git push origin main
```

### Option 2: Git Reset (Destructive)
```bash
# Find the commit before this feature
git log --oneline

# Reset to that commit (DESTRUCTIVE)
git reset --hard <previous-commit-hash>

# Force push (CAUTION)
git push --force origin main
```

### Option 3: Manual Rollback
```bash
# Remove Redis from models/weather.js
# Restore version without cache
git checkout HEAD~1 -- backend/models/weather.js

# Remove Redis config from config.js
git checkout HEAD~1 -- backend/config.js

# Remove Redis variables from .env.example
git checkout HEAD~1 -- backend/.env.example
```

## Verification After Rollback
```bash
# Check git status
git status

# Verify Redis is removed
grep -r "ioredis" backend/

# Run tests
npm test
```

## Impact Assessment
- **Risk Level**: Low
- **Affected Files**: 3 files
- **Dependencies**: ioredis
- **Infrastructure**: Requires Redis server
- **Performance**: Significant improvement on cache hits
