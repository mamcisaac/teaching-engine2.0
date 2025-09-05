#!/usr/bin/env python3
"""
Fix lesson classification:
- Lessons 1-14, 19-20: Core (must be taught, maintain sequence)
- Lessons 15-18: Extensions (flexible enrichment)
"""

import sqlite3
from datetime import datetime

def main():
    conn = sqlite3.connect('./packages/database/prisma/prisma/dev.db')
    cursor = conn.cursor()
    
    print("🔧 Fixing lesson classification...")
    print("=" * 60)
    
    # Get current statistics
    cursor.execute("""
        SELECT 
            lessonType,
            COUNT(*) as count,
            GROUP_CONCAT(DISTINCT lessonNumber) as lesson_numbers
        FROM ETFOLessonPlan
        WHERE lessonNumber IS NOT NULL
        GROUP BY lessonType
    """)
    
    print("📊 Current classification:")
    for row in cursor.fetchall():
        lesson_type, count, numbers = row
        print(f"  {lesson_type}: {count} lessons")
    
    # Fix classification
    print("\n🏷️ Applying correct classification...")
    
    # Mark lessons 1-14 and 19-20 as core
    cursor.execute("""
        UPDATE ETFOLessonPlan
        SET lessonType = 'core'
        WHERE lessonNumber IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,19,20)
    """)
    core_updated = cursor.rowcount
    print(f"  ✅ Marked {core_updated} lessons as CORE (1-14, 19-20)")
    
    # Mark lessons 15-18 as extension
    cursor.execute("""
        UPDATE ETFOLessonPlan
        SET lessonType = 'extension'
        WHERE lessonNumber IN (15,16,17,18)
    """)
    extension_updated = cursor.rowcount
    print(f"  ✅ Marked {extension_updated} lessons as EXTENSION (15-18)")
    
    # Update isScheduled based on actual dates
    # Extensions with year 2099 are unscheduled
    cursor.execute("""
        UPDATE ETFOLessonPlan
        SET isScheduled = CASE 
            WHEN date(date/1000, 'unixepoch') >= '2099-01-01' THEN 0
            ELSE 1
        END
        WHERE lessonNumber IS NOT NULL
    """)
    print(f"  ✅ Updated isScheduled flags based on dates")
    
    # Verify the changes
    print("\n✅ New classification:")
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
    
    # Sample verification
    print("\n🔍 Sample - 'bienvenue' unit:")
    cursor.execute("""
        SELECT 
            lessonNumber,
            SUBSTR(titleFr, 1, 35) as title,
            lessonType,
            isScheduled
        FROM ETFOLessonPlan
        WHERE unitPlanId = (SELECT id FROM UnitPlan WHERE titleFr = 'bienvenue' LIMIT 1)
        AND lessonNumber >= 14
        ORDER BY lessonNumber
    """)
    
    print("  Num | Title                               | Type      | Scheduled")
    print("  " + "-" * 65)
    for row in cursor.fetchall():
        num, title, lesson_type, is_scheduled = row
        scheduled_str = "Yes" if is_scheduled else "No"
        print(f"  {num:3} | {title:35} | {lesson_type:9} | {scheduled_str}")
    
    # Check culminating lessons
    print("\n🎯 Culminating lessons (19-20) now marked as CORE:")
    cursor.execute("""
        SELECT 
            u.titleFr,
            lp.lessonNumber,
            lp.titleFr,
            lp.lessonType
        FROM ETFOLessonPlan lp
        JOIN UnitPlan u ON lp.unitPlanId = u.id
        WHERE lp.lessonNumber IN (19, 20)
        AND lp.lessonType = 'core'
        LIMIT 10
    """)
    
    for row in cursor.fetchall():
        unit, num, title, lesson_type = row
        print(f"  {unit:25} | Lesson {num}: {title[:30]} ({lesson_type})")
    
    conn.commit()
    conn.close()
    
    print("\n🎉 Classification fixed!")
    print("\nSummary:")
    print("  • Core lessons: 1-14, 19-20 (essential + culminating)")
    print("  • Extension lessons: 15-18 (flexible enrichment)")

if __name__ == '__main__':
    main()