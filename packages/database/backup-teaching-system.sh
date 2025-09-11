#!/bin/bash

# Teaching Engine 2.0 - Comprehensive Backup System
# This script creates multiple redundant backups to ensure data is never lost

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DATE_DIR=$(date +%Y-%m-%d)
BACKUP_DIR="backup/$TIMESTAMP"

echo "🔒 Teaching Engine 2.0 - Comprehensive Backup System"
echo "====================================================="
echo "Timestamp: $TIMESTAMP"
echo ""

# Create directories
echo "📁 Creating backup directories..."
mkdir -p "$BACKUP_DIR"/{database,exports,scripts,stats}
mkdir -p "backup/databases/$DATE_DIR"
mkdir -p "backup/exports/sql"
mkdir -p "backup/exports/json"

# Backup database
echo "💾 Backing up database..."
cp prisma/prisma/dev.db "$BACKUP_DIR/database/dev.db"
cp prisma/prisma/dev.db "backup/databases/$DATE_DIR/dev-$TIMESTAMP.db"

# Export to SQL for portability
echo "📄 Exporting to SQL format..."
sqlite3 prisma/prisma/dev.db .dump > "$BACKUP_DIR/exports/complete.sql"
sqlite3 prisma/prisma/dev.db .dump > "backup/exports/sql/complete-$TIMESTAMP.sql"

# Get database statistics
echo "📊 Gathering statistics..."
sqlite3 prisma/prisma/dev.db <<EOF > "$BACKUP_DIR/stats/database-stats.txt"
.headers on
.mode column
SELECT 'Table' as Category, 'Count' as Total;
SELECT 'LongRangePlans', COUNT(*) FROM LongRangePlan;
SELECT 'UnitPlans', COUNT(*) FROM UnitPlan;
SELECT 'ETFOLessonPlans', COUNT(*) FROM ETFOLessonPlan;
SELECT 'CurriculumExpectations', COUNT(*) FROM CurriculumExpectation;
SELECT 'UnitPlanExpectations', COUNT(*) FROM UnitPlanExpectation;
SELECT 'ETFOLessonPlanExpectations', COUNT(*) FROM ETFOLessonPlanExpectation;
SELECT 'Lessons with assessments', COUNT(*) FROM ETFOLessonPlan WHERE assessmentNotes LIKE '%observable%';
EOF

# Copy restoration scripts
echo "🔧 Copying restoration scripts..."
cp restore-*.ts "$BACKUP_DIR/scripts/" 2>/dev/null || true
cp link-*.ts "$BACKUP_DIR/scripts/" 2>/dev/null || true
cp assessment-*.sql "$BACKUP_DIR/scripts/" 2>/dev/null || true

# Create comprehensive README
echo "📝 Creating documentation..."
cat > "$BACKUP_DIR/README.md" << EOF
# Teaching Engine 2.0 - Backup
## Created: $TIMESTAMP

### Database Statistics
- **LongRangePlans**: 6
- **UnitPlans**: 50  
- **ETFOLessonPlans**: 970
- **CurriculumExpectations**: 60
- **Assessment Coverage**: 94.6% (918/970 lessons)
- **Expectation Links**: 1,808

### Backup Contents
- \`database/dev.db\` - Complete SQLite database
- \`exports/complete.sql\` - SQL export for portability
- \`scripts/\` - All restoration and linking scripts
- \`stats/database-stats.txt\` - Current database statistics

### Restoration Instructions
1. **From SQLite backup**: 
   \`\`\`bash
   cp database/dev.db /path/to/prisma/prisma/dev.db
   \`\`\`

2. **From SQL export**:
   \`\`\`bash
   sqlite3 /path/to/prisma/prisma/dev.db < exports/complete.sql
   \`\`\`

### Verification Checklist
- [ ] All 970 lessons present
- [ ] All 50 units present
- [ ] All 6 LRPs present
- [ ] 918+ lessons have assessment criteria
- [ ] All expectation links intact
EOF

# Compress for archival
echo "📦 Creating compressed archive..."
tar -czf "backup-complete-$TIMESTAMP.tar.gz" "$BACKUP_DIR"

# Final summary
echo ""
echo "✅ BACKUP COMPLETE!"
echo "=================="
echo "📍 Locations:"
echo "  - Full backup: backup-complete-$TIMESTAMP.tar.gz"
echo "  - Database: backup/databases/$DATE_DIR/dev-$TIMESTAMP.db"
echo "  - SQL export: backup/exports/sql/complete-$TIMESTAMP.sql"
echo "  - Working dir: $BACKUP_DIR/"
echo ""
echo "💡 Next steps:"
echo "  1. Run: git add backup-complete-$TIMESTAMP.tar.gz"
echo "  2. Run: git commit -m '🔒 Complete system backup - $TIMESTAMP'"
echo "  3. Run: git push"