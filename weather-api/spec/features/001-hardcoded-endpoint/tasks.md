# Tasks: Feature 001 - Hardcoded Endpoint

## Task List

### Task 1: Create package.json
- [x] Initialize npm project
- [x] Add dependencies (express, zod, cors)
- [x] Configure scripts (start, dev, test)
- [x] Set module type to ESM

**Status**: Completed

---

### Task 2: Create config.js
- [x] Define DEFAULTS object
- [x] Set PORT default (3000)
- [x] Export configuration

**Status**: Completed

---

### Task 3: Create CORS Middleware
- [x] Import cors package
- [x] Define ACCEPTED_ORIGINS array
- [x] Implement origin validation
- [x] Export middleware function

**Status**: Completed

---

### Task 4: Create Validation Schema
- [x] Import Zod
- [x] Define weatherSchema
- [x] Add city validation (min 2, max 100 chars)
- [x] Export validation function

**Status**: Completed

---

### Task 5: Create Weather Controller
- [x] Create WeatherController class
- [x] Implement getWeather static method
- [x] Add try/catch error handling
- [x] Return hardcoded weather data

**Status**: Completed

---

### Task 6: Create Weather Routes
- [x] Import Router
- [x] Define validateQuery middleware
- [x] Connect validation to route
- [x] Mount controller

**Status**: Completed

---

### Task 7: Create Express App
- [x] Import dependencies
- [x] Setup middleware stack
- [x] Mount routes
- [x] Conditional server start

**Status**: Completed

---

### Task 8: Create Tests
- [x] Setup test server
- [x] Implement before/after hooks
- [x] Test 400 response
- [x] Test 200 response

**Status**: Completed

---

## Definition of Done
- [x] All tasks completed
- [x] Tests passing
- [x] Code follows style guidelines
- [x] No console errors
- [x] Documentation updated
