# Teaching Engine 2.0 - Backup & Recovery Documentation

## 🔒 Critical Data Protection System

This document outlines the comprehensive backup and recovery procedures for the Teaching Engine 2.0 system to ensure data is never lost.

## Current System State (as of September 11, 2025)

### Database Contents
- **6 Long Range Plans** (PROTECTED - DO NOT MODIFY)
- **50 Unit Plans** (PROTECTED - DO NOT MODIFY)
- **970 ETFO Lesson Plans**
- **60 Curriculum Expectations**
- **1,808 Expectation Links**
- **918 Lessons with Detailed Assessments** (94.6% coverage)

### Assessment Coverage by Subject
- Sciences de la nature: 100% (199/199)
- Mathématiques: 100% (197/197)
- Formation personnelle et sociale: 100% (98/98)
- Arts visuels: 92.3% (167/181)
- Français (Immersion): 89.9% (179/199)
- Sciences humaines: 81.3% (78/96)

## Backup Locations

### 1. Primary Database Location
```
/packages/database/prisma/prisma/dev.db
```

### 2. Timestamped Backups
```
/packages/database/backup/databases/YYYY-MM-DD/dev-HHMMSS.db
```

### 3. SQL Exports
```
/packages/database/backup/exports/sql/complete-YYYYMMDD-HHMMSS.sql
```

### 4. Compressed Archives
```
/packages/database/backup-complete-YYYYMMDD-HHMMSS.tar.gz
```

### 5. GitHub Repository
- Repository: https://github.com/mamcisaac/teaching-engine2.0
- Commit: dd7d923b (September 11, 2025)
- All backups tracked in version control

## Backup Procedures

### Manual Backup
```bash
# Run the backup script
cd packages/database
./backup-teaching-system.sh
```

### What Gets Backed Up
1. Complete SQLite database
2. SQL export for portability
3. All restoration scripts
4. Database statistics
5. Documentation

### Backup Verification Checklist
- [ ] All 970 lessons present
- [ ] All 50 units present
- [ ] All 6 LRPs present
- [ ] 918+ lessons have assessment criteria
- [ ] All expectation links intact
- [ ] Learning objectives are specific (not generic)

## Recovery Procedures

### Scenario 1: Complete Database Loss

#### From Latest Backup
```bash
# Navigate to database directory
cd packages/database

# Copy the latest backup
cp backup/databases/2025-09-11/dev-20250911-105449.db prisma/prisma/dev.db

# Verify recovery
sqlite3 prisma/prisma/dev.db "SELECT COUNT(*) FROM ETFOLessonPlan;"
# Should return: 970
```

#### From SQL Export
```bash
# Create new database from SQL
sqlite3 prisma/prisma/dev.db < backup/exports/sql/complete-20250911-105449.sql
```

#### From Compressed Archive
```bash
# Extract archive
tar -xzf backup-complete-20250911-105449.tar.gz

# Copy database
cp backup/20250911-105449/database/dev.db prisma/prisma/dev.db
```

### Scenario 2: Partial Data Loss (Assessments)

```bash
# Restore assessments from JSON files
npx tsx restore-assessments-from-json.ts

# Verify restoration
sqlite3 prisma/prisma/dev.db "SELECT COUNT(*) FROM ETFOLessonPlan WHERE assessmentNotes LIKE '%observable%';"
# Should return: 918+
```

### Scenario 3: Lost Learning Objectives

```bash
# Restore specific learning objectives
npx tsx generate-smart-objectives.ts

# Apply to database
npx tsx apply-smart-objectives.ts
```

### Scenario 4: Lost Expectation Links

```bash
# Restore curriculum expectation links
npx tsx link-expectations-intelligently.ts

# Verify links
sqlite3 prisma/prisma/dev.db "SELECT COUNT(*) FROM ETFOLessonPlanExpectation;"
# Should return: 1808+
```

## Critical Scripts

### Restoration Scripts
- `restore-assessments-from-json.ts` - Restore assessment criteria
- `restore-complete-expectation-coverage.ts` - Restore expectation links
- `generate-smart-objectives.ts` - Generate learning objectives
- `link-expectations-intelligently.ts` - Link curriculum expectations

### Backup Scripts
- `backup-teaching-system.sh` - Complete backup automation
- `export-all-data.ts` - Export data to JSON

## Emergency Contacts

### Database Issues
- Check `/packages/database/backup/` for latest backups
- GitHub repository for version history
- SQL exports for cross-platform recovery

### Recovery Support
1. Check this documentation first
2. Verify backup locations
3. Run verification queries after recovery
4. Test application functionality

## Automated Backup Schedule

Add to crontab for daily backups:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/packages/database && ./backup-teaching-system.sh
```

## Verification Queries

### Check Data Integrity
```sql
-- Check all tables
SELECT 'LongRangePlans', COUNT(*) FROM LongRangePlan
UNION ALL
SELECT 'UnitPlans', COUNT(*) FROM UnitPlan
UNION ALL
SELECT 'ETFOLessonPlans', COUNT(*) FROM ETFOLessonPlan
UNION ALL
SELECT 'Expectations', COUNT(*) FROM CurriculumExpectation
UNION ALL
SELECT 'Assessments', COUNT(*) FROM ETFOLessonPlan WHERE assessmentNotes LIKE '%observable%';
```

### Expected Results
- LongRangePlans: 6
- UnitPlans: 50
- ETFOLessonPlans: 970
- Expectations: 60
- Assessments: 918+

## Best Practices

1. **Never modify LRPs or Unit Plans directly** - They are protected
2. **Run backup script before major changes**
3. **Verify backup integrity after creation**
4. **Keep multiple backup generations**
5. **Test recovery procedures periodically**
6. **Document any changes to this system**

## Recovery Testing

Periodically test recovery by:
1. Creating a test database
2. Restoring from backup
3. Running verification queries
4. Checking application functionality

## Archive Structure

The `/packages/database/archive/` directory contains 196 archived scripts organized into:
- assessment-generation/ - SQL files for assessment criteria
- data-exports/ - JSON data snapshots
- documentation/ - Superseded documentation
- lesson-creation/ - Lesson plan creation scripts
- old-backups/ - Previous database backups
- perfection-scripts/ - System perfection utilities
- restoration-scripts/ - Data restoration tools
- restructuring-scripts/ - System restructuring utilities
- test-scripts/ - Test and verification scripts
- utility-scripts/ - General-purpose utilities (100 files)
- verification-scripts/ - Integrity verification tools

See `archive/ARCHIVE-INDEX.md` for detailed inventory.

## Notes

- All timestamps are in YYYYMMDD-HHMMSS format
- Backups are incremental (keep multiple generations)
- GitHub provides additional version control
- SQL exports ensure cross-platform compatibility
- Archive contains historical development scripts (not for production use)

---

Last Updated: September 11, 2025
System Version: 2.0
Backup System Version: 1.0
Archive Created: September 11, 2025 (196 files)