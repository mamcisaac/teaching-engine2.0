#!/usr/bin/env python3
"""
Properly schedule lessons according to Emily's teaching system:
- 5 lessons per day (one from each subject)
- Units stay together (lessons progress sequentially)
- Respects PEI school calendar
- French/Math/Science/Arts daily, Social Studies/Health alternating
- Skip second-last lesson in each unit to fit within 184 days
"""

import sqlite3
from datetime import datetime, timedelta

# PEI School Year 2025-2026
SCHOOL_START = datetime(2025, 9, 3)
SCHOOL_END = datetime(2026, 6, 19)

# Holiday breaks (approximate PEI calendar)
HOLIDAYS = [
    # Thanksgiving
    (datetime(2025, 10, 13), datetime(2025, 10, 13)),
    # November PD Day
    (datetime(2025, 11, 7), datetime(2025, 11, 7)),
    # Winter Break
    (datetime(2025, 12, 20), datetime(2026, 1, 4)),
    # February Break
    (datetime(2026, 2, 14), datetime(2026, 2, 22)),
    # April Break
    (datetime(2026, 4, 10), datetime(2026, 4, 19)),
    # Victoria Day
    (datetime(2026, 5, 18), datetime(2026, 5, 18)),
]

def is_school_day(date):
    """Check if a date is a school day"""
    # Skip weekends
    if date.weekday() >= 5:
        return False
    
    # Skip holidays
    for start, end in HOLIDAYS:
        if start <= date <= end:
            return False
    
    return True

def get_school_days():
    """Get all school days for the year"""
    school_days = []
    current = SCHOOL_START
    
    while current <= SCHOOL_END:
        if is_school_day(current):
            school_days.append(current)
        current += timedelta(days=1)
    
    return school_days

def main():
    conn = sqlite3.connect('./packages/database/prisma/prisma/dev.db')
    cursor = conn.cursor()
    
    print("📅 Scheduling lessons according to Emily's teaching system...")
    print("   - Skipping second-last lesson in each unit")
    print("   - Properly alternating Social Studies/Health")
    print("=" * 60)
    
    # Get school days
    school_days = get_school_days()
    print(f"📊 Total school days: {len(school_days)}")
    
    # Subject to slot mapping
    subject_slots = {
        'Français (Immersion)': 1,
        'Mathématiques': 2,
        'Sciences de la nature': 3,
        'Arts visuels': 4,
        'Sciences humaines': 5,
        'Formation personnelle et sociale': 5
    }
    
    # Track which days are used for each subject
    subject_schedules = {
        'Français (Immersion)': [],
        'Mathématiques': [],
        'Sciences de la nature': [],
        'Arts visuels': [],
        'Sciences humaines': [],
        'Formation personnelle et sociale': []
    }
    
    # Create alternating schedule for slot 5
    # Social Studies on odd days, Health on even days
    for i, day in enumerate(school_days):
        if i % 2 == 0:
            subject_schedules['Sciences humaines'].append(day)
        else:
            subject_schedules['Formation personnelle et sociale'].append(day)
    
    # Daily subjects get all days
    for subject in ['Français (Immersion)', 'Mathématiques', 'Sciences de la nature', 'Arts visuels']:
        subject_schedules[subject] = school_days.copy()
    
    print(f"\n📊 Days available per subject:")
    for subject, days in subject_schedules.items():
        print(f"  {subject:35} | {len(days)} days")
    
    # Get all units ordered by subject and start date
    cursor.execute("""
        SELECT u.id, u.titleFr, lrp.subject, u.startDate, u.endDate
        FROM UnitPlan u
        JOIN LongRangePlan lrp ON u.longRangePlanId = lrp.id
        ORDER BY lrp.subject, u.startDate
    """)
    
    units = cursor.fetchall()
    
    # Track lesson scheduling
    subject_day_index = {
        'Français (Immersion)': 0,
        'Mathématiques': 0,
        'Sciences de la nature': 0,
        'Arts visuels': 0,
        'Sciences humaines': 0,
        'Formation personnelle et sociale': 0
    }
    
    updates = []
    skipped_lessons = []
    lessons_scheduled = 0
    
    for unit_id, unit_name, subject, start_date, end_date in units:
        # Get all lessons for this unit in order
        cursor.execute("""
            SELECT id, titleFr, lessonNumber
            FROM ETFOLessonPlan
            WHERE unitPlanId = ?
            ORDER BY lessonNumber
        """, (unit_id,))
        
        lessons = cursor.fetchall()
        
        if not lessons:
            continue
        
        # Determine which lessons to skip
        # Skip second-last lesson (max lessonNumber - 1)
        max_lesson_num = max(l[2] for l in lessons if l[2] is not None)
        skip_lesson_nums = [max_lesson_num - 1] if max_lesson_num > 2 else []
        
        # For subjects that need extra skipping to fit in 184 days
        if subject in ['Français (Immersion)', 'Sciences de la nature', 'Mathématiques']:
            # Also skip the 3rd-to-last lesson
            if max_lesson_num > 3:
                skip_lesson_nums.append(max_lesson_num - 2)
        
        scheduled_in_unit = 0
        skipped_in_unit = 0
        
        print(f"\n📚 Scheduling {subject} - {unit_name}")
        print(f"    Total: {len(lessons)} lessons, Skipping: {len(skip_lesson_nums)} lessons")
        
        slot = subject_slots[subject]
        
        # Schedule each lesson
        for lesson_id, lesson_title, lesson_num in lessons:
            # Check if we should skip this lesson
            if lesson_num in skip_lesson_nums:
                skipped_lessons.append((lesson_id, lesson_title, unit_name, subject))
                skipped_in_unit += 1
                # Set date to far future (year 2099) for skipped lessons to indicate they're not scheduled
                far_future = int(datetime(2099, 12, 31).timestamp() * 1000)
                updates.append((far_future, slot, lesson_id))
                continue
            
            # Get next available day for this subject
            day_index = subject_day_index[subject]
            available_days = subject_schedules[subject]
            
            if day_index >= len(available_days):
                print(f"    ⚠️  Not enough days for lesson {lesson_num}: {lesson_title[:30]}")
                # Set to far future if we run out of days
                far_future = int(datetime(2099, 12, 31).timestamp() * 1000)
                updates.append((far_future, slot, lesson_id))
                continue
            
            lesson_date = available_days[day_index]
            subject_day_index[subject] += 1
            
            # Store update with proper date format
            updates.append((
                int(lesson_date.timestamp() * 1000),  # Convert to milliseconds
                slot,
                lesson_id
            ))
            
            scheduled_in_unit += 1
            lessons_scheduled += 1
            
            if lesson_num <= 2:
                print(f"    Lesson {lesson_num}: {lesson_date.strftime('%Y-%m-%d')} - {lesson_title[:40]}")
        
        print(f"    ✅ Scheduled: {scheduled_in_unit}, Skipped: {skipped_in_unit}")
    
    print("\n" + "=" * 60)
    print(f"💾 Applying {len(updates)} updates to database...")
    print(f"   - Lessons scheduled: {lessons_scheduled}")
    print(f"   - Lessons skipped: {len(skipped_lessons)}")
    
    # Apply all updates
    cursor.executemany("""
        UPDATE ETFOLessonPlan
        SET date = ?, slotNumber = ?
        WHERE id = ?
    """, updates)
    
    conn.commit()
    
    print(f"\n✅ Successfully updated {len(updates)} lessons!")
    
    # List some skipped lessons
    print(f"\n📝 Sample of skipped lessons:")
    for lesson_id, title, unit, subject in skipped_lessons[:10]:
        print(f"   - {subject} / {unit}: {title[:40]}")
    
    # Verify the scheduling
    print("\n🔍 Verification - Lessons per day sample:")
    cursor.execute("""
        SELECT 
            date(date/1000, 'unixepoch') as day,
            COUNT(*) as lessons_per_day
        FROM ETFOLessonPlan
        WHERE date IS NOT NULL AND date(date/1000, 'unixepoch') < '2099-01-01'
        GROUP BY date(date/1000, 'unixepoch')
        ORDER BY day
        LIMIT 10
    """)
    
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]} lessons")
    
    # Check slot distribution
    print("\n📊 Final slot assignments by subject:")
    cursor.execute("""
        SELECT 
            lrp.subject,
            lp.slotNumber,
            COUNT(CASE WHEN date(lp.date/1000, 'unixepoch') < '2099-01-01' THEN 1 END) as scheduled,
            COUNT(CASE WHEN date(lp.date/1000, 'unixepoch') >= '2099-01-01' THEN 1 END) as skipped
        FROM ETFOLessonPlan lp
        JOIN UnitPlan u ON lp.unitPlanId = u.id
        JOIN LongRangePlan lrp ON u.longRangePlanId = lrp.id
        GROUP BY lrp.subject, lp.slotNumber
        ORDER BY lrp.subject, lp.slotNumber
    """)
    
    for row in cursor.fetchall():
        print(f"  {row[0]:35} | Slot {row[1]}: {row[2]} scheduled, {row[3]} skipped")
    
    # Summary statistics
    print("\n📈 Summary Statistics:")
    cursor.execute("""
        SELECT 
            COUNT(CASE WHEN date(date/1000, 'unixepoch') < '2099-01-01' THEN 1 END) as scheduled_total,
            COUNT(CASE WHEN date(date/1000, 'unixepoch') >= '2099-01-01' THEN 1 END) as skipped_total,
            COUNT(*) as total_lessons
        FROM ETFOLessonPlan
    """)
    
    row = cursor.fetchone()
    print(f"  Total lessons: {row[2]}")
    print(f"  Scheduled: {row[0]}")
    print(f"  Skipped: {row[1]}")
    print(f"  Completion rate: {row[0]/row[2]*100:.1f}%")
    
    conn.close()
    print("\n🎉 Lesson scheduling complete!")

if __name__ == '__main__':
    main()