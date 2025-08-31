#!/usr/bin/env python3
"""
Generate Emily's Complete School Year Schedule
Assigns all 970 lessons to 195 school days
September 3, 2025 to June 20, 2026
"""

import sqlite3
from datetime import datetime, timedelta
import json

# School year configuration
SCHOOL_START = datetime(2025, 9, 3)
SCHOOL_END = datetime(2026, 6, 20)

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

# Daily schedule (45-minute blocks)
TIME_BLOCKS = [
    ('08:45', 'Français (Immersion)'),
    ('09:30', 'Mathématiques'),
    ('10:30', 'Sciences de la nature'),
    ('11:15', 'Arts visuels'),
    ('13:00', 'rotating')  # Alternates between Social Studies and Health
]

def get_school_days():
    """Get all school days (weekdays not on holidays)"""
    days = []
    current = SCHOOL_START
    
    while current <= SCHOOL_END:
        date_str = current.strftime('%Y-%m-%d')
        # Skip weekends (5=Saturday, 6=Sunday)
        if current.weekday() < 5 and date_str not in HOLIDAYS:
            days.append(current)
        current += timedelta(days=1)
    
    return days

def main():
    # Connect to database
    conn = sqlite3.connect('./packages/database/prisma/prisma/dev.db')
    cursor = conn.cursor()
    
    # Get all lessons organized by subject
    cursor.execute("""
        SELECT 
            elp.id,
            elp.title,
            elp.titleFr,
            lrp.subject
        FROM ETFOLessonPlan elp
        JOIN UnitPlan up ON elp.unitPlanId = up.id
        JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
        ORDER BY lrp.subject, up.startDate, elp.title
    """)
    
    all_lessons = cursor.fetchall()
    
    # Organize by subject
    lessons_by_subject = {}
    for lesson in all_lessons:
        subject = lesson[3]
        if subject not in lessons_by_subject:
            lessons_by_subject[subject] = []
        lessons_by_subject[subject].append({
            'id': lesson[0],
            'title': lesson[1],
            'titleFr': lesson[2]
        })
    
    print(f"Lessons by subject:")
    for subject, lessons in lessons_by_subject.items():
        print(f"  {subject}: {len(lessons)} lessons")
    
    # Get school days
    school_days = get_school_days()
    print(f"\nTotal school days: {len(school_days)}")
    
    # Track lesson indices
    lesson_indices = {subject: 0 for subject in lessons_by_subject.keys()}
    
    # Track assignments
    assignments = []
    update_count = 0
    rotating_index = 0  # 0 = Social Studies, 1 = Health
    
    # Assign lessons to each day
    for day_num, day in enumerate(school_days):
        print(f"\rProcessing day {day_num + 1}/{len(school_days)}...", end='')
        
        for time, subject_or_rotating in TIME_BLOCKS:
            # Handle rotating block
            if subject_or_rotating == 'rotating':
                subject = 'Sciences humaines' if rotating_index == 0 else 'Formation personnelle et sociale'
                rotating_index = 1 - rotating_index
            else:
                subject = subject_or_rotating
            
            # Get next lesson for this subject
            if subject in lessons_by_subject:
                subject_lessons = lessons_by_subject[subject]
                idx = lesson_indices[subject]
                
                if idx < len(subject_lessons):
                    lesson = subject_lessons[idx]
                    
                    # Create datetime with time
                    hour, minute = map(int, time.split(':'))
                    lesson_datetime = day.replace(hour=hour, minute=minute, second=0, microsecond=0)
                    
                    # Update the lesson
                    cursor.execute("""
                        UPDATE ETFOLessonPlan 
                        SET date = ? 
                        WHERE id = ?
                    """, (lesson_datetime.isoformat() + 'Z', lesson['id']))
                    
                    lesson_indices[subject] += 1
                    update_count += 1
                    
                    assignments.append({
                        'date': day.strftime('%Y-%m-%d'),
                        'time': time,
                        'subject': subject,
                        'lesson_id': lesson['id'],
                        'title': lesson['titleFr'] or lesson['title']
                    })
    
    print(f"\n\nUpdated {update_count} lessons")
    
    # Commit changes
    conn.commit()
    
    # Verify the updates
    cursor.execute("""
        SELECT 
            COUNT(*) as scheduled,
            MIN(date) as first_date,
            MAX(date) as last_date
        FROM ETFOLessonPlan
        WHERE date IS NOT NULL
    """)
    
    result = cursor.fetchone()
    print(f"\nScheduled lessons: {result[0]}")
    print(f"First lesson: {result[1]}")
    print(f"Last lesson: {result[2]}")
    
    # Save assignments to JSON for reference
    with open('emily-yearly-schedule.json', 'w') as f:
        json.dump(assignments, f, indent=2)
    print(f"\nSchedule saved to emily-yearly-schedule.json")
    
    # Show sample of first week
    cursor.execute("""
        SELECT 
            date(date) as day,
            COUNT(*) as lessons,
            GROUP_CONCAT(SUBSTR(titleFr, 1, 20), ' | ') as titles
        FROM ETFOLessonPlan
        WHERE date >= '2025-09-03' AND date <= '2025-09-05'
        GROUP BY date(date)
        ORDER BY date(date)
    """)
    
    print("\nFirst week sample:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]} lessons")
    
    conn.close()
    print("\n✅ Schedule generation complete!")

if __name__ == '__main__':
    main()