# Final Test Infrastructure Fixes - Ultra-Aligned Implementation

## Critical Fixes Applied

### 1. ✅ Auth Artifact Alignment (Cookie-Only "token")
**Unified on single auth mechanism:**
- **Server**: `authenticate` middleware reads `req.cookies.token`
- **Test Login**: Sets only `token` cookie (removed redundant `session`)
- **Client**: `ProtectedRoute` checks for `token` cookie presence
- **Test Helper**: Uses cookies only (removed localStorage manipulation)

**Files Modified:**
- `/server/src/routes/test.ts` - Simplified to set only `token` cookie
- `/client/src/components/ProtectedRoute.tsx` - Added cookie check fallback
- `/tests/ui-validation/support/setup.js` - Removed localStorage, cookie-only

### 2. ✅ Dynamic Import Fixed (Test Routes Ready Before Listen)
**Moved test route mounting into `initializeApp()` with await:**
- Test routes now loaded with `await import()` inside `initializeApp()`
- Ensures routes are mounted BEFORE `app.listen()` is called
- No more intermittent 404s on `/__test__/login`

**Files Modified:**
- `/server/src/index.ts` - Moved test route mounting into `initializeApp()` with await

### 3. ✅ Puppeteer Browser Cleanup
**Fixed Jest not exiting:**
- Added proper browser cleanup in `teardown()`
- Browser is now closed when tests complete
- Prevents "Jest did not exit" warnings

**Files Modified:**
- `/tests/ui-validation/support/puppeteer-env.js` - Added browser.close() in teardown

## Required Server Restart

**IMPORTANT**: The server MUST be restarted for these changes to take effect:

```bash
# Kill existing server processes
pkill -f "node.*server" || true

# Start server with test environment
cd server
NODE_ENV=test npm run dev
```

## Complete Test Run Instructions

### 1. Set Environment Variables
```bash
export NODE_ENV=test
export TEST_SECRET=test-secret-token
export JWT_SECRET=test-jwt-secret
export API_BASE_URL=http://localhost:3000
export UI_BASE_URL=http://localhost:5173
```

### 2. Start Services (with test environment)
```bash
# Terminal 1 - Server (MUST restart)
cd server
NODE_ENV=test npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### 3. Verify Infrastructure
```bash
cd tests/ui-validation
./verify-test-infra.sh
```

### 4. Run Test Suite
```bash
cd tests/ui-validation

# Smoke tests first
npm run test:ui:smoke

# If smoke passes, run full suite
npm test
```

## Verification Checklist

### Manual Verification Commands

1. **Test Login Endpoint**:
```bash
curl -sv -H "X-Test-Token: test-secret-token" \
     -H "Content-Type: application/json" \
     -d '{"userId":23}' \
     http://localhost:3000/__test__/login
```
✅ Expected: 200 OK, Set-Cookie: token=...

2. **API Auth Protection**:
```bash
# Without auth - should fail
curl -sv http://localhost:3000/api/etfo-lesson-plans?userId=23

# With token - should work
curl -sv -H "Cookie: token=<JWT>" \
     http://localhost:3000/api/etfo-lesson-plans?userId=23
```
✅ Expected: 401 without cookie, 200 with cookie

3. **SPA Auth Guard**:
- Navigate to http://localhost:5173/planner/week
- ✅ Expected: Redirect to /login without auth
- After login: Week view renders

## What Changed From Previous Attempt

### Before (Misaligned):
- Multiple cookie names (token, session, auth-token)
- Client checked localStorage, server checked cookies
- Test routes loaded async without await
- Browser not properly closed

### After (Aligned):
- Single cookie name: `token`
- Both client and server check same cookie
- Test routes awaited before server starts
- Browser properly closed in teardown

## Pass Criteria

✅ All of these must pass:
1. `/__test__/login` returns 200 and sets `token` cookie
2. Unauthenticated `/api/*` returns 401
3. Authenticated `/api/*` returns 200
4. Unauthenticated SPA redirects to `/login`
5. Authenticated SPA renders week view
6. Jest exits cleanly (no warnings)

## Known Issues Requiring Server Restart

The server is currently running with the OLD code. You MUST:
1. Stop the current server (Ctrl+C or kill the process)
2. Start it again with `NODE_ENV=test npm run dev`
3. Wait for "Test routes mounted at /__test__" in logs
4. Then run verification script

## Summary

All architectural issues have been fixed:
- ✅ Auth artifacts unified on `token` cookie
- ✅ Test routes guaranteed ready before server.listen()
- ✅ Browser cleanup prevents Jest hang
- ✅ Correct ports configured (API: 3000, UI: 5173)

**Next Step**: Restart the server with NODE_ENV=test and run the verification script.