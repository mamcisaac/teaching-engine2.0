#!/usr/bin/env python3
"""
Migrate existing lessons to mark core vs extension types
- Lessons 1-14: Core (must be taught in sequence)
- Lessons 15-20: Extensions (flexible scheduling)
"""

import sqlite3
from datetime import datetime

def main():
    conn = sqlite3.connect('./packages/database/prisma/prisma/dev.db')
    cursor = conn.cursor()
    
    print("🔄 Migrating lesson types (core vs extension)...")
    print("=" * 60)
    
    # First, add the new columns if they don't exist
    try:
        cursor.execute("ALTER TABLE ETFOLessonPlan ADD COLUMN lessonType TEXT DEFAULT 'core'")
        print("✅ Added lessonType column")
    except sqlite3.OperationalError:
        print("ℹ️  lessonType column already exists")
    
    try:
        cursor.execute("ALTER TABLE ETFOLessonPlan ADD COLUMN isScheduled INTEGER DEFAULT 1")
        print("✅ Added isScheduled column")
    except sqlite3.OperationalError:
        print("ℹ️  isScheduled column already exists")
    
    # Count lessons before migration
    cursor.execute("SELECT COUNT(*) FROM ETFOLessonPlan WHERE lessonNumber IS NOT NULL")
    total_lessons = cursor.fetchone()[0]
    print(f"\n📊 Total lessons to migrate: {total_lessons}")
    
    # Update lesson types based on lesson number
    print("\n🏷️ Setting lesson types...")
    
    # Mark lessons 1-14 as core
    cursor.execute("""
        UPDATE ETFOLessonPlan
        SET lessonType = 'core',
            isScheduled = CASE 
                WHEN date(date/1000, 'unixepoch') >= '2099-01-01' THEN 0
                ELSE 1
            END
        WHERE lessonNumber BETWEEN 1 AND 14
    """)
    core_updated = cursor.rowcount
    print(f"  ✅ Marked {core_updated} lessons as CORE (1-14)")
    
    # Mark lessons 15-20 as extension
    cursor.execute("""
        UPDATE ETFOLessonPlan
        SET lessonType = 'extension',
            isScheduled = CASE 
                WHEN date(date/1000, 'unixepoch') >= '2099-01-01' THEN 0
                ELSE 1
            END
        WHERE lessonNumber BETWEEN 15 AND 20
    """)
    extension_updated = cursor.rowcount
    print(f"  ✅ Marked {extension_updated} lessons as EXTENSION (15-20)")
    
    # Get statistics
    print("\n📈 Migration Statistics:")
    
    cursor.execute("""
        SELECT 
            lessonType,
            COUNT(*) as total,
            SUM(CASE WHEN isScheduled = 1 THEN 1 ELSE 0 END) as scheduled,
            SUM(CASE WHEN isScheduled = 0 THEN 1 ELSE 0 END) as unscheduled
        FROM ETFOLessonPlan
        WHERE lessonNumber IS NOT NULL
        GROUP BY lessonType
    """)
    
    for row in cursor.fetchall():
        lesson_type, total, scheduled, unscheduled = row
        print(f"  {lesson_type:10} | Total: {total:4} | Scheduled: {scheduled:4} | Unscheduled: {unscheduled:4}")
    
    # Check which extensions are currently unscheduled (year 2099)
    print("\n🔍 Checking unscheduled extensions:")
    cursor.execute("""
        SELECT 
            u.titleFr,
            COUNT(*) as unscheduled_extensions
        FROM ETFOLessonPlan lp
        JOIN UnitPlan u ON lp.unitPlanId = u.id
        WHERE lp.lessonType = 'extension'
        AND lp.isScheduled = 0
        GROUP BY u.titleFr
        LIMIT 10
    """)
    
    for row in cursor.fetchall():
        unit_title, count = row
        print(f"  {unit_title:30} | {count} unscheduled extensions")
    
    # Sample verification
    print("\n✅ Sample verification - 'bienvenue' unit:")
    cursor.execute("""
        SELECT 
            lessonNumber,
            SUBSTR(titleFr, 1, 30) as title,
            lessonType,
            isScheduled,
            date(date/1000, 'unixepoch') as scheduled_date
        FROM ETFOLessonPlan
        WHERE unitPlanId = (SELECT id FROM UnitPlan WHERE titleFr = 'bienvenue' LIMIT 1)
        ORDER BY lessonNumber
    """)
    
    print("  Num | Title                          | Type      | Scheduled | Date")
    print("  " + "-" * 70)
    for row in cursor.fetchall():
        num, title, lesson_type, is_scheduled, date = row
        scheduled_str = "Yes" if is_scheduled else "No"
        print(f"  {num:3} | {title:30} | {lesson_type:9} | {scheduled_str:9} | {date}")
    
    conn.commit()
    conn.close()
    
    print("\n🎉 Migration complete!")
    print("\nNext steps:")
    print("1. Run 'npx prisma db pull' to sync the schema")
    print("2. Run 'npx prisma generate' to update the client")
    print("3. Test the new scheduling endpoints")

if __name__ == '__main__':
    main()