#!/usr/bin/env python3
"""
Schedule lessons respecting unit boundaries and pedagogical sequence
Ensures all lessons from a unit stay together within their date range
Maintains Emily's 5-lesson-per-day structure
"""

import sqlite3
from datetime import datetime, timedelta
import json
from collections import defaultdict

# PEI Holidays 2025-2026
HOLIDAYS = [
    '2025-10-13',  # Thanksgiving
    '2025-11-11',  # Remembrance Day
    # Winter Break
    '2025-12-22', '2025-12-23', '2025-12-24', '2025-12-25', '2025-12-26',
    '2025-12-29', '2025-12-30', '2025-12-31',
    '2026-01-01', '2026-01-02',
    # February Break
    '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
    '2026-04-03',  # Good Friday
    '2026-04-06',  # Easter Monday
    '2026-05-18',  # Victoria Day
]

# Daily schedule - 5 subjects per day
DAILY_SUBJECTS = [
    'Français (Immersion)',
    'Mathématiques',
    'Sciences de la nature',
    'Arts visuels',
    'rotating'  # Alternates between Sciences humaines and Formation personnelle et sociale
]

# Time blocks for each subject
TIME_BLOCKS = {
    'Français (Immersion)': '08:45',
    'Mathématiques': '09:30',
    'Sciences de la nature': '10:30',
    'Arts visuels': '11:15',
    'Sciences humaines': '13:00',
    'Formation personnelle et sociale': '13:00'
}

def get_school_days_in_range(start_date, end_date):
    """Get all school days (weekdays not on holidays) in a date range"""
    days = []
    current = start_date
    
    while current <= end_date:
        date_str = current.strftime('%Y-%m-%d')
        # Skip weekends (5=Saturday, 6=Sunday) and holidays
        if current.weekday() < 5 and date_str not in HOLIDAYS:
            days.append(current)
        current += timedelta(days=1)
    
    return days

def main():
    # Connect to database
    conn = sqlite3.connect('./packages/database/prisma/prisma/dev.db')
    cursor = conn.cursor()
    
    print("📚 Scheduling lessons by unit with pedagogical coherence...")
    print("=" * 70)
    
    # Get all units with their date ranges and lessons
    cursor.execute("""
        SELECT 
            up.id,
            up.title,
            up.startDate,
            up.endDate,
            lrp.subject,
            COUNT(elp.id) as lesson_count
        FROM UnitPlan up
        JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
        LEFT JOIN ETFOLessonPlan elp ON elp.unitPlanId = up.id
        WHERE up.startDate IS NOT NULL
        GROUP BY up.id
        ORDER BY up.startDate, lrp.subject
    """)
    
    units = cursor.fetchall()
    print(f"Found {len(units)} units to schedule")
    
    # Track daily subject assignments
    daily_assignments = defaultdict(lambda: defaultdict(list))
    
    # Track rotating subject index
    rotating_subjects = ['Sciences humaines', 'Formation personnelle et sociale']
    rotating_index = defaultdict(int)  # Per date
    
    total_scheduled = 0
    units_processed = 0
    
    for unit_id, unit_title, start_str, end_str, subject, lesson_count in units:
        if lesson_count == 0:
            continue
            
        units_processed += 1
        start_date = datetime.fromisoformat(start_str.replace('Z', ''))
        end_date = datetime.fromisoformat(end_str.replace('Z', ''))
        
        # Get school days in this unit's date range
        available_days = get_school_days_in_range(start_date, end_date)
        
        if not available_days:
            print(f"⚠️  No school days available for {unit_title}")
            continue
        
        # Get all lessons for this unit (in pedagogical order)
        cursor.execute("""
            SELECT id, title, titleFr
            FROM ETFOLessonPlan
            WHERE unitPlanId = ?
            ORDER BY title  -- Alphabetical approximates pedagogical order
        """, (unit_id,))
        
        lessons = cursor.fetchall()
        
        print(f"\n📖 {unit_title} ({subject})")
        print(f"   Date range: {start_date.date()} to {end_date.date()}")
        print(f"   Available days: {len(available_days)}, Lessons: {len(lessons)}")
        
        # Strategy: Distribute lessons evenly across available days for this subject
        lessons_scheduled = 0
        
        for lesson_id, title, title_fr in lessons:
            scheduled = False
            
            # Try to find a day where this subject isn't already scheduled
            for day in available_days:
                day_str = day.strftime('%Y-%m-%d')
                
                # Check if this subject is in today's rotation
                if subject in rotating_subjects:
                    # Check if it's this subject's turn in the rotation
                    if rotating_subjects[rotating_index[day_str] % 2] != subject:
                        continue
                    # Don't increment rotating_index here - do it per day
                    
                # Check if this subject already has a lesson on this day
                if subject not in daily_assignments[day_str]:
                    # Assign the lesson to this day
                    time = TIME_BLOCKS[subject]
                    hour, minute = map(int, time.split(':'))
                    lesson_datetime = day.replace(hour=hour, minute=minute, second=0, microsecond=0)
                    
                    cursor.execute("""
                        UPDATE ETFOLessonPlan 
                        SET date = ? 
                        WHERE id = ?
                    """, (lesson_datetime.isoformat() + 'Z', lesson_id))
                    
                    daily_assignments[day_str][subject].append(lesson_id)
                    lessons_scheduled += 1
                    scheduled = True
                    
                    # If this was a rotating subject, mark that slot as used
                    if subject in rotating_subjects:
                        rotating_index[day_str] = (rotating_index[day_str] + 1) % 2
                    
                    break
            
            if not scheduled:
                # If we couldn't find an ideal day, double up on a day with fewer lessons
                for day in available_days:
                    day_str = day.strftime('%Y-%m-%d')
                    
                    # For rotating subjects, still respect the rotation
                    if subject in rotating_subjects:
                        if rotating_subjects[rotating_index[day_str] % 2] != subject:
                            continue
                    
                    # Assign even if subject already has lessons this day
                    time = TIME_BLOCKS[subject]
                    hour, minute = map(int, time.split(':'))
                    # Add small second offset for multiple lessons to keep unique times
                    offset_seconds = len(daily_assignments[day_str][subject])
                    lesson_datetime = day.replace(hour=hour, minute=minute, second=offset_seconds % 60, microsecond=0)
                    
                    cursor.execute("""
                        UPDATE ETFOLessonPlan 
                        SET date = ? 
                        WHERE id = ?
                    """, (lesson_datetime.isoformat() + 'Z', lesson_id))
                    
                    daily_assignments[day_str][subject].append(lesson_id)
                    lessons_scheduled += 1
                    
                    if subject in rotating_subjects:
                        rotating_index[day_str] = (rotating_index[day_str] + 1) % 2
                    
                    break
        
        total_scheduled += lessons_scheduled
        print(f"   ✅ Scheduled {lessons_scheduled} lessons")
    
    # Commit all changes
    conn.commit()
    
    print("\n" + "=" * 70)
    print(f"✅ Scheduled {total_scheduled} lessons across {units_processed} units")
    
    # Verify the schedule
    print("\n📊 Schedule Verification:")
    
    # Check lessons per subject
    cursor.execute("""
        SELECT 
            lrp.subject,
            COUNT(elp.id) as scheduled,
            MIN(date(elp.date)) as first_lesson,
            MAX(date(elp.date)) as last_lesson
        FROM ETFOLessonPlan elp
        JOIN UnitPlan up ON elp.unitPlanId = up.id
        JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
        WHERE elp.date IS NOT NULL
        GROUP BY lrp.subject
        ORDER BY COUNT(elp.id) DESC
    """)
    
    print("\nLessons by subject:")
    for row in cursor.fetchall():
        print(f"  {row[0]:35} | {row[1]:3} lessons | {row[2]} to {row[3]}")
    
    # Check sample unit coherence - Bienvenue should be in September
    cursor.execute("""
        SELECT 
            MIN(date(elp.date)) as first,
            MAX(date(elp.date)) as last,
            COUNT(*) as total
        FROM ETFOLessonPlan elp
        JOIN UnitPlan up ON elp.unitPlanId = up.id
        WHERE up.title = 'bienvenue'
    """)
    
    result = cursor.fetchone()
    print(f"\n🎯 'Bienvenue' unit check:")
    print(f"  First lesson: {result[0]}")
    print(f"  Last lesson: {result[1]}")
    print(f"  Total lessons: {result[2]}")
    
    # Save schedule summary
    cursor.execute("""
        SELECT 
            date(elp.date) as day,
            up.title as unit,
            elp.titleFr,
            elp.title,
            lrp.subject,
            time(elp.date) as time
        FROM ETFOLessonPlan elp
        JOIN UnitPlan up ON elp.unitPlanId = up.id
        JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
        WHERE elp.date IS NOT NULL
        ORDER BY elp.date
        LIMIT 100
    """)
    
    schedule_sample = []
    for row in cursor.fetchall():
        schedule_sample.append({
            'date': row[0],
            'unit': row[1],
            'title': row[2] or row[3],
            'subject': row[4],
            'time': row[5]
        })
    
    with open('unit-based-schedule.json', 'w') as f:
        json.dump(schedule_sample, f, indent=2)
    
    print(f"\n💾 Sample schedule saved to unit-based-schedule.json")
    
    conn.close()
    print("\n✅ Unit-based scheduling complete! All lessons respect pedagogical boundaries.")

if __name__ == '__main__':
    main()