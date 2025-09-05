#!/usr/bin/env python3
"""
Assign sequential lesson numbers to all lessons within their units.
This preserves the current pedagogical order based on lesson IDs.
"""

import sqlite3
from datetime import datetime

def main():
    # Connect to database
    conn = sqlite3.connect('./packages/database/prisma/prisma/dev.db')
    cursor = conn.cursor()
    
    print("🔢 Assigning lesson numbers to all units...")
    print("=" * 60)
    
    # Get all units
    cursor.execute("""
        SELECT DISTINCT u.id, u.titleFr, lrp.subject
        FROM UnitPlan u
        JOIN LongRangePlan lrp ON u.longRangePlanId = lrp.id
        ORDER BY lrp.subject, u.titleFr
    """)
    
    units = cursor.fetchall()
    total_lessons_updated = 0
    units_processed = 0
    
    for unit_id, unit_title, subject in units:
        # Get all lessons for this unit, ordered by ID (preserves creation order)
        cursor.execute("""
            SELECT id, titleFr
            FROM ETFOLessonPlan
            WHERE unitPlanId = ?
            ORDER BY id
        """, (unit_id,))
        
        lessons = cursor.fetchall()
        
        if not lessons:
            print(f"⚠️  No lessons found for: {unit_title}")
            continue
        
        # Assign sequential lesson numbers
        for lesson_number, (lesson_id, lesson_title) in enumerate(lessons, 1):
            cursor.execute("""
                UPDATE ETFOLessonPlan
                SET lessonNumber = ?
                WHERE id = ?
            """, (lesson_number, lesson_id))
        
        total_lessons_updated += len(lessons)
        units_processed += 1
        
        print(f"✅ {subject:35} | {unit_title:40} | {len(lessons):2} lessons numbered")
    
    # Commit all changes
    conn.commit()
    
    print("=" * 60)
    print(f"📊 Summary:")
    print(f"  - Units processed: {units_processed}")
    print(f"  - Lessons numbered: {total_lessons_updated}")
    
    # Verify the update
    print("\n🔍 Verification - Sample from each subject:")
    cursor.execute("""
        SELECT 
            lrp.subject,
            u.titleFr as unit,
            lp.lessonNumber,
            lp.titleFr as lesson
        FROM ETFOLessonPlan lp
        JOIN UnitPlan u ON lp.unitPlanId = u.id
        JOIN LongRangePlan lrp ON u.longRangePlanId = lrp.id
        WHERE lp.lessonNumber IN (1, 2)
        ORDER BY lrp.subject, u.titleFr, lp.lessonNumber
        LIMIT 12
    """)
    
    for row in cursor.fetchall():
        print(f"  {row[0]:30} | Unit: {row[1]:25} | Lesson {row[2]}: {row[3]}")
    
    # Check for any lessons without numbers
    cursor.execute("""
        SELECT COUNT(*) 
        FROM ETFOLessonPlan 
        WHERE lessonNumber IS NULL
    """)
    
    null_count = cursor.fetchone()[0]
    if null_count > 0:
        print(f"\n⚠️  WARNING: {null_count} lessons still have NULL lesson numbers!")
    else:
        print("\n✅ SUCCESS: All lessons have been assigned lesson numbers!")
    
    # Create unique constraint if not exists
    try:
        cursor.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS ETFOLessonPlan_unitPlanId_lessonNumber_unique 
            ON ETFOLessonPlan(unitPlanId, lessonNumber)
            WHERE lessonNumber IS NOT NULL
        """)
        print("✅ Unique constraint created to prevent duplicate lesson numbers within units")
    except sqlite3.Error as e:
        print(f"ℹ️  Unique constraint may already exist: {e}")
    
    conn.commit()
    conn.close()
    
    print("\n🎉 Lesson numbering complete!")

if __name__ == '__main__':
    main()