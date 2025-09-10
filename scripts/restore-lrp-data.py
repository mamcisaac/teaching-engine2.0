#!/usr/bin/env python3
"""
Restore complete LRP data including all fields and curriculum expectations from backup
"""
import json
import sqlite3
import sys

# Database path
DB_PATH = '/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db'

# Backup file path
BACKUP_PATH = '/Users/michaelmcisaac/Github/teaching-engine2.0/backups/perfect-lrps-20250818/perfect-lrps.json'

def main():
    # Load backup data
    print("Loading backup data...")
    with open(BACKUP_PATH, 'r') as f:
        backup_data = json.load(f)
    
    # Connect to database
    print("Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Process each LRP
    for lrp in backup_data['lrps']:
        title = lrp['title']
        subject = lrp['subject']
        
        # Extract all fields from backup
        description = lrp.get('description', '')
        goals = lrp.get('goals', '')
        overarching_questions = lrp.get('overarchingQuestions', '')
        themes = lrp.get('themes', '')  # This is JSON data
        assessment_overview = lrp.get('assessmentOverview', '')
        resource_needs = lrp.get('resourceNeeds', '')
        professional_goals = lrp.get('professionalGoals', '')
        
        # Additional important fields - convert dicts to JSON strings
        cross_curricular = lrp.get('crossCurricularConnections', '')
        if isinstance(cross_curricular, dict):
            cross_curricular = json.dumps(cross_curricular)
            
        differentiation = lrp.get('differentiationFramework', '')
        if isinstance(differentiation, dict):
            differentiation = json.dumps(differentiation)
            
        indigenous_perspectives = lrp.get('indigenousPerspectives', '')
        parent_communication = lrp.get('parentCommunication', '')
        resource_library = lrp.get('resourceLibrary', '')
        professional_development = lrp.get('professionalDevelopmentPlan', '')
        if isinstance(professional_development, dict):
            professional_development = json.dumps(professional_development)
        
        print(f"\nRestoring {title}...")
        
        # Update the database with ALL fields
        cursor.execute("""
            UPDATE LongRangePlan 
            SET 
                description = ?,
                goals = ?,
                overarchingQuestions = ?,
                themes = ?,
                assessmentOverview = ?,
                resourceNeeds = ?,
                professionalGoals = ?,
                crossCurricularConnections = ?,
                differentiationFramework = ?,
                indigenousPerspectives = ?,
                parentCommunication = ?,
                resourceLibrary = ?,
                professionalDevelopmentPlan = ?
            WHERE title = ?
        """, (description, goals, overarching_questions, themes, 
              assessment_overview, resource_needs, professional_goals,
              cross_curricular, differentiation, indigenous_perspectives,
              parent_communication, resource_library, professional_development,
              title))
        
        # Check if update was successful
        if cursor.rowcount > 0:
            print(f"  ✓ Updated {title}")
            print(f"    - Description: {len(description)} chars")
            print(f"    - Goals: {len(goals)} chars")
            print(f"    - Questions: {len(overarching_questions)} chars")
            print(f"    - Themes: {len(themes)} chars")
            print(f"    - Assessment: {len(assessment_overview)} chars")
            print(f"    - Resources: {len(resource_needs)} chars")
            
            # Handle curriculum expectations
            if 'expectations' in lrp and lrp['expectations']:
                print(f"    - Restoring {len(lrp['expectations'])} curriculum expectations...")
                
                # First, get the LRP ID from database
                cursor.execute("SELECT id FROM LongRangePlan WHERE title = ?", (title,))
                lrp_result = cursor.fetchone()
                if lrp_result:
                    lrp_id = lrp_result[0]
                    
                    # Clear existing expectations for this LRP
                    cursor.execute("DELETE FROM LongRangePlanExpectation WHERE longRangePlanId = ?", (lrp_id,))
                    
                    # Add expectations from backup
                    for exp_link in lrp['expectations']:
                        exp_id = exp_link['expectationId']
                        planned_term = exp_link.get('plannedTerm', None)
                        # Check if expectation exists in CurriculumExpectation table
                        cursor.execute("SELECT id FROM CurriculumExpectation WHERE id = ?", (exp_id,))
                        if cursor.fetchone():
                            # Link the expectation to the LRP
                            cursor.execute("""
                                INSERT INTO LongRangePlanExpectation (longRangePlanId, expectationId, plannedTerm)
                                VALUES (?, ?, ?)
                            """, (lrp_id, exp_id, planned_term))
                    
                    print(f"      ✓ Linked curriculum expectations")
        else:
            print(f"  ✗ Could not find {title} in database")
    
    # Commit changes
    print("\nCommitting changes...")
    conn.commit()
    
    # Verify the restoration
    print("\nVerifying restoration...")
    cursor.execute("""
        SELECT title, 
               length(description) as desc_len,
               length(goals) as goals_len,
               length(overarchingQuestions) as questions_len
        FROM LongRangePlan
        ORDER BY title
    """)
    
    results = cursor.fetchall()
    print("\nCurrent database state:")
    print("-" * 80)
    for row in results:
        title, desc_len, goals_len, questions_len = row
        print(f"{title[:50]:<50} D:{desc_len or 0:>5} G:{goals_len or 0:>5} Q:{questions_len or 0:>5}")
    
    conn.close()
    print("\n✅ Restoration complete!")

if __name__ == "__main__":
    main()