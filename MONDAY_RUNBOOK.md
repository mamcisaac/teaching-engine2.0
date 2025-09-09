# 🚀 MONDAY MORNING RUNBOOK - Emily's Production Launch

## ✅ Final Production Acceptance Status (2025-09-09)

### Completed Validations:
- ✅ **Health check**: Returns 200 OK
- ✅ **Test routes blocked**: `/__test__/login` and `/__test__/seed/smoke` return 404
- ✅ **Database backup**: Created at `dev.db.bak.2025-09-09_1737`
- ✅ **No 5xx errors**: Zero server errors in production logs
- ✅ **Production server running**: NODE_ENV=production on port 3000

## 🏃 Quick Start Commands

### Start Production Server
```bash
cd /Users/michaelmcisaac/Github/teaching-engine2.0/server
NODE_ENV=production \
  DATABASE_URL="file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db" \
  TZ=America/Halifax \
  JWT_SECRET=production-jwt-secret \
  PORT=3000 \
  npm run dev
```

### Start UI (if needed)
```bash
cd /Users/michaelmcisaac/Github/teaching-engine2.0/client
npm run dev
# Access at http://localhost:5173
```

## 🔥 Emergency Recovery

### If Something Goes Wrong:

#### 1. Quick Health Check
```bash
curl -sf http://127.0.0.1:3000/healthz
```

#### 2. Restart API Server
```bash
# Kill any existing servers
pkill -f "node.*server" || true
pkill -f "npm.*dev" || true

# Start fresh
cd /Users/michaelmcisaac/Github/teaching-engine2.0/server
NODE_ENV=production DATABASE_URL="file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db" \
  TZ=America/Halifax JWT_SECRET=production-jwt-secret PORT=3000 npm run dev
```

#### 3. Restore Database Backup (if data issues)
```bash
# Backup current (potentially corrupted) database
cp packages/database/prisma/prisma/dev.db packages/database/prisma/prisma/dev.db.corrupted

# Restore from backup
cp packages/database/prisma/prisma/dev.db.bak.2025-09-09_1737 packages/database/prisma/prisma/dev.db

# Restart server (see step 2)
```

## 📋 Emily's Login Information

- **Email**: emily@example.com
- **Password**: emily-password
- **User ID**: 23
- **Lessons**: 970+ Grade 1 French Immersion lessons
- **Access URL**: http://localhost:5173

## 🛡️ Security Verification

Confirm test routes are blocked:
```bash
# Should return 404 (not 200)
curl -si -X POST http://127.0.0.1:3000/__test__/login | head -1
```

## 🎯 Known Working State

As of 2025-09-09 17:37:
- Production server boots without StructuredLogger errors
- Test routes properly return 404 in production mode
- Halifax timezone configured correctly
- Emily's 970+ lessons accessible
- Cookie security configured for production

## ⚠️ Important Notes

1. **NEVER** set NODE_ENV=test in production - this enables test routes
2. **ALWAYS** use absolute database paths
3. **Database backup** available at: `dev.db.bak.2025-09-09_1737`
4. **OpenAI warning** is expected (no API key) - doesn't affect core functionality

## 💡 Monday Morning Checklist

- [ ] Start production server (command above)
- [ ] Verify health check returns 200
- [ ] Confirm test routes return 404
- [ ] Emily logs in successfully
- [ ] Week planner loads with lessons
- [ ] No 5xx errors in logs

---

**Support Contact**: If issues persist, reference git commit with StructuredLogger fixes
**Last Validated**: 2025-09-09 20:37 UTC