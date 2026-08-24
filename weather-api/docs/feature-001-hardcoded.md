# Feature 001: Hardcoded Endpoint

## Description
Implementación del endpoint básico `/weather` con datos hardcodeados para validar la arquitectura MVC y el pipeline de middleware.

## Components Created
1. `backend/app.js` - Express application setup
2. `backend/config.js` - Configuration defaults
3. `backend/schemas/weather.js` - Zod validation schema
4. `backend/controllers/weather.js` - Request handling
5. `backend/routes/weather.js` - Route definitions
6. `backend/middlewares/cors.js` - CORS configuration
7. `backend/app.test.js` - Integration tests

## Git Commit
```bash
git add -A
git commit -m "feat: Add basic weather endpoint with hardcoded data"
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

# Reset to that commit (DESTRUCTIVE - removes commits)
git reset --hard <previous-commit-hash>

# Force push (CAUTION: rewrites history)
git push --force origin main
```

### Option 3: Manual Rollback
```bash
# Remove files created by this feature
rm backend/app.js
rm backend/config.js
rm backend/schemas/weather.js
rm backend/controllers/weather.js
rm backend/routes/weather.js
rm backend/middlewares/cors.js
rm backend/app.test.js

# Restore original app.js if needed
git checkout HEAD~1 -- backend/app.js
```

## Verification After Rollback
```bash
# Check git status
git status

# Verify no broken imports
npm test

# Start server to verify
npm start
```

## Impact Assessment
- **Risk Level**: Low
- **Affected Files**: 7 files
- **Dependencies**: express, zod, cors
- **Tests**: 2 test cases
