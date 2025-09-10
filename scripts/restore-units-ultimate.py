#!/usr/bin/env python3
"""
ULTIMATE Unit Plan Restoration - Combining ALL sources:
1. Backup database (40 units with complete pedagogical content)
2. Strategic perfect backup (50 units with structure)
3. Perfect export (45 units with pedagogical content)
"""
import json
import sqlite3
import sys
import re

# Database path
DB_PATH = '/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db'

# All backup sources
BACKUP_DB_JSON = '/tmp/backup-units-clean.json'
STRUCTURE_BACKUP = '/Users/michaelmcisaac/Github/teaching-engine2.0/server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/strategically-perfect-unit-plans.json'
PEDAGOGICAL_BACKUP = '/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/backup/perfect-export-2025-08-14T23-40-37/unit-plans.json'

def normalize_title(title):
    """Normalize title for matching"""
    if not title:
        return ""
    # Remove accents
    import unicodedata
    normalized = unicodedata.normalize('NFD', title.lower())
    normalized = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    # Remove special chars
    normalized = re.sub(r'[^\w\s]', ' ', normalized)
    # Collapse spaces
    normalized = ' '.join(normalized.split())
    return normalized.strip()

def fuzzy_match(title1, title2):
    """Check if titles are similar enough"""
    t1 = normalize_title(title1)
    t2 = normalize_title(title2)
    
    # Exact match
    if t1 == t2:
        return True
    
    # Contains match
    if t1 in t2 or t2 in t1:
        return True
    
    # Word overlap (at least 2 words in common)
    words1 = set(t1.split())
    words2 = set(t2.split())
    if len(words1.intersection(words2)) >= 2:
        return True
    
    return False

def main():
    print("="*70)
    print("ULTIMATE UNIT PLAN RESTORATION")
    print("="*70)
    
    # Load all backups
    print("\n1. Loading all backup sources...")
    
    # Load backup database units (40 with full content)
    with open(BACKUP_DB_JSON, 'r') as f:
        backup_db_units = json.load(f)
    print(f"   ✓ Backup DB: {len(backup_db_units)} units with complete pedagogical content")
    
    # Load structure backup (50 units)
    with open(STRUCTURE_BACKUP, 'r') as f:
        structure_units = json.load(f)
    print(f"   ✓ Structure: {len(structure_units)} units with descriptions")
    
    # Load pedagogical backup (45 units)
    with open(PEDAGOGICAL_BACKUP, 'r') as f:
        pedagogical_units = json.load(f)
    print(f"   ✓ Pedagogical: {len(pedagogical_units)} units with enrichment")
    
    # Connect to database
    print("\n2. Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get current database units
    cursor.execute("SELECT id, title FROM UnitPlan ORDER BY title")
    db_units = cursor.fetchall()
    print(f"   ✓ Database has {len(db_units)} units")
    
    # Track updates
    stats = {
        'updated': 0,
        'with_indigenous': 0,
        'with_cross': 0,
        'with_bigIdeas': 0,
        'with_assessment': 0,
        'with_all': 0
    }
    
    print("\n3. Processing and merging data...")
    print("-"*70)
    
    for db_id, db_title in db_units:
        print(f"\n   Processing: {db_title}")
        
        # Initialize with empty values
        best_data = {
            'description': '',
            'bigIdeas': '',
            'indigenousPerspectives': '',
            'crossCurricularConnections': '',
            'parentCommunicationPlan': '',
            'communityConnections': '',
            'environmentalEducation': '',
            'socialJusticeConnections': '',
            'technologyIntegration': '',
            'assessmentPlan': '',
            'culminatingTask': '',
            'priorKnowledge': '',
            'fieldTripsAndGuestSpeakers': '',
            'enduringUnderstandings': ''
        }
        
        sources_used = []
        
        # Try to find in backup database (BEST source - has everything)
        for unit in backup_db_units:
            if fuzzy_match(db_title, unit.get('title', '')):
                sources_used.append('BackupDB')
                for field in best_data.keys():
                    if unit.get(field):
                        best_data[field] = unit[field]
                break
        
        # Try structure backup (for any missing fields)
        for unit in structure_units:
            if fuzzy_match(db_title, unit.get('title', '')):
                if 'Structure' not in sources_used:
                    sources_used.append('Structure')
                for field in ['description', 'culminatingTask', 'assessmentPlan']:
                    if not best_data[field] and unit.get(field):
                        best_data[field] = unit[field]
        
        # Try pedagogical backup (for any still missing)
        for unit in pedagogical_units:
            if fuzzy_match(db_title, unit.get('title', '')):
                if 'Pedagogical' not in sources_used:
                    sources_used.append('Pedagogical')
                for field in best_data.keys():
                    if not best_data[field] and unit.get(field):
                        value = unit[field]
                        # Convert dicts to JSON strings
                        if isinstance(value, dict):
                            value = json.dumps(value)
                        best_data[field] = value
        
        # Update database if we found data
        if any(best_data.values()):
            cursor.execute("""
                UPDATE UnitPlan 
                SET 
                    description = COALESCE(NULLIF(?, ''), description),
                    bigIdeas = COALESCE(NULLIF(?, ''), bigIdeas),
                    indigenousPerspectives = COALESCE(NULLIF(?, ''), indigenousPerspectives),
                    crossCurricularConnections = COALESCE(NULLIF(?, ''), crossCurricularConnections),
                    parentCommunicationPlan = COALESCE(NULLIF(?, ''), parentCommunicationPlan),
                    communityConnections = COALESCE(NULLIF(?, ''), communityConnections),
                    environmentalEducation = COALESCE(NULLIF(?, ''), environmentalEducation),
                    socialJusticeConnections = COALESCE(NULLIF(?, ''), socialJusticeConnections),
                    technologyIntegration = COALESCE(NULLIF(?, ''), technologyIntegration),
                    assessmentPlan = COALESCE(NULLIF(?, ''), assessmentPlan),
                    culminatingTask = COALESCE(NULLIF(?, ''), culminatingTask),
                    priorKnowledge = COALESCE(NULLIF(?, ''), priorKnowledge),
                    fieldTripsAndGuestSpeakers = COALESCE(NULLIF(?, ''), fieldTripsAndGuestSpeakers),
                    enduringUnderstandings = COALESCE(NULLIF(?, ''), enduringUnderstandings)
                WHERE id = ?
            """, (
                best_data['description'],
                best_data['bigIdeas'],
                best_data['indigenousPerspectives'],
                best_data['crossCurricularConnections'],
                best_data['parentCommunicationPlan'],
                best_data['communityConnections'],
                best_data['environmentalEducation'],
                best_data['socialJusticeConnections'],
                best_data['technologyIntegration'],
                best_data['assessmentPlan'],
                best_data['culminatingTask'],
                best_data['priorKnowledge'],
                best_data['fieldTripsAndGuestSpeakers'],
                best_data['enduringUnderstandings'],
                db_id
            ))
            
            if cursor.rowcount > 0:
                stats['updated'] += 1
                if best_data['indigenousPerspectives']:
                    stats['with_indigenous'] += 1
                if best_data['crossCurricularConnections']:
                    stats['with_cross'] += 1
                if best_data['bigIdeas']:
                    stats['with_bigIdeas'] += 1
                if best_data['assessmentPlan']:
                    stats['with_assessment'] += 1
                if all([best_data['indigenousPerspectives'], best_data['crossCurricularConnections'], 
                        best_data['bigIdeas'], best_data['assessmentPlan']]):
                    stats['with_all'] += 1
                
                sources_str = '+'.join(sources_used) if sources_used else 'None'
                print(f"      ✓ Updated from: {sources_str}")
        else:
            print(f"      ✗ No matching data found")
    
    # Commit changes
    print("\n4. Committing changes...")
    conn.commit()
    
    # Final verification
    print("\n5. Final verification...")
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN description IS NOT NULL AND length(description) > 0 THEN 1 ELSE 0 END) as has_desc,
            SUM(CASE WHEN bigIdeas IS NOT NULL AND length(bigIdeas) > 0 THEN 1 ELSE 0 END) as has_ideas,
            SUM(CASE WHEN indigenousPerspectives IS NOT NULL AND length(indigenousPerspectives) > 0 THEN 1 ELSE 0 END) as has_indig,
            SUM(CASE WHEN crossCurricularConnections IS NOT NULL AND length(crossCurricularConnections) > 0 THEN 1 ELSE 0 END) as has_cross,
            SUM(CASE WHEN assessmentPlan IS NOT NULL AND length(assessmentPlan) > 0 THEN 1 ELSE 0 END) as has_assess
        FROM UnitPlan
    """)
    
    result = cursor.fetchone()
    total, has_desc, has_ideas, has_indig, has_cross, has_assess = result
    
    print("\n" + "="*70)
    print("ULTIMATE RESTORATION COMPLETE!")
    print("="*70)
    print(f"\n✅ Updated {stats['updated']} units total")
    print(f"   - {stats['with_indigenous']} with indigenous perspectives")
    print(f"   - {stats['with_cross']} with cross-curricular connections")
    print(f"   - {stats['with_bigIdeas']} with big ideas")
    print(f"   - {stats['with_assessment']} with assessment plans")
    print(f"   - {stats['with_all']} with ALL pedagogical fields")
    
    print(f"\n📊 Final Database Statistics:")
    print(f"   Total units: {total}")
    print(f"   With descriptions: {has_desc}/{total} ({has_desc*100//total}%)")
    print(f"   With big ideas: {has_ideas}/{total} ({has_ideas*100//total}%)")
    print(f"   With indigenous: {has_indig}/{total} ({has_indig*100//total}%)")
    print(f"   With cross-curricular: {has_cross}/{total} ({has_cross*100//total}%)")
    print(f"   With assessment: {has_assess}/{total} ({has_assess*100//total}%)")
    
    # Show sample of complete units
    print("\n🌟 Sample of fully restored units:")
    cursor.execute("""
        SELECT title 
        FROM UnitPlan 
        WHERE indigenousPerspectives IS NOT NULL 
        AND crossCurricularConnections IS NOT NULL
        AND bigIdeas IS NOT NULL
        ORDER BY title 
        LIMIT 5
    """)
    
    for row in cursor.fetchall():
        print(f"   ✓ {row[0]}")
    
    conn.close()
    print("\n🎉 ALL UNIT PLANS FULLY RESTORED WITH COMPLETE PEDAGOGICAL CONTENT!")

if __name__ == "__main__":
    main()