# Emily's Monday Morning Runbook 🎯

## Quick Health Check (30 seconds)

1. **Server Health**
   - Visit: http://localhost:3000/healthz → Should return 200 OK
   - Visit: http://localhost:3000/readyz → Should return 200 OK

2. **App Load**
   - Visit: http://localhost:5173/ → Dashboard should load
   - Sign in: emmcisaac@gmail.com / myhusbandisthebest

## Core Validation Path (2 minutes)

### 1. Week View → Lesson Detail → Assessment
```
1. Navigate to /planner/week
2. Click any lesson card (e.g., "Textures à toucher")
3. Verify shows:
   - French title & subject
   - Mise en train / Action / Consolidation
   - Différenciation strategies (bullet list)
   - Vocabulaire with copy button
4. Click "Évaluer la classe"
5. Verify URL has ?lessonId=XXX
6. Verify header shows lesson title
```

### 2. Day View Check
```
1. Navigate to /planner/today
2. Click any lesson card
3. Should land on same detail page as Week view
```

### 3. Dashboard Count
```
1. Navigate to / (dashboard)
2. September section should show actual lesson count (not 0)
```

## If Something Breaks

### Lesson Detail Shows Empty/Crashes
```bash
# Check server logs for JSON parse errors
tail -f server.log | grep "Failed to parse"

# Check specific lesson data
sqlite3 packages/database/prisma/prisma/dev.db \
  "SELECT differentiationStrategies, engagementHooks FROM ETFOLessonPlan WHERE id='[LESSON_ID]';"
```

### Assessment Not Receiving LessonId
```
1. Open Network tab
2. Navigate to assessment from lesson
3. Check URL has ?lessonId=XXX
4. Check QuickAssessmentGrid props in React DevTools
```

### Week/Day View Not Linking
```
1. Inspect lesson card element
2. Should have <Link to="/planner/lessons/XXX">
3. If missing, check DayViewPage.tsx line 192-210
```

## Emergency Rollback

### Database Snapshot
```bash
# Restore from Friday's snapshot
cp packages/database/prisma/prisma/dev.db.backup-2025-09-09 \
   packages/database/prisma/prisma/dev.db
```

### Code Rollback
```bash
# Revert to last known good commit
git log --oneline -5  # Find last working commit
git checkout [COMMIT_HASH]
```

## Common Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| Lesson cards not clickable | Link component present? | See DayViewPage line 192 |
| French content missing | titleFr field populated? | Check toLessonView() adapter |
| Differentiation not showing | JSON parse working? | Check server logs for warnings |
| Assessment missing context | lessonId in URL? | Check AssessmentPage line 301 |
| September count wrong | Using date filter? | Check public-stats.ts line 24-32 |

## Debug Info Collection

If Emily reports an issue, collect:
```bash
# 1. Current lesson being viewed
echo "Lesson ID from URL: ___"

# 2. Server logs
tail -n 100 server.log > debug-$(date +%Y%m%d-%H%M).log

# 3. Browser console errors
# Right-click → Inspect → Console → Copy all

# 4. Network tab
# Failed requests? 404s? 500s?
```

## Contact for Help

- **Technical Issues**: Michael (you!)
- **DB Backup Location**: `/packages/database/prisma/prisma/dev.db.backup-*`
- **Last Tested**: September 10, 2025, 3:00 PM

## Success Criteria ✅

- [ ] Week/Day cards open lesson detail
- [ ] Lesson shows French content + differentiation
- [ ] Assessment receives lessonId
- [ ] No date crashes (RangeError)
- [ ] Dashboard shows real September count

---

*Generated for Emily McIsaac's Grade 1 French Immersion Teaching System*
*970 lessons ready with differentiation and movement breaks!*