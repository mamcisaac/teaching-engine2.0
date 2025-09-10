#!/usr/bin/env python3
"""
Complete Unit Plan restoration combining two backups:
1. strategically-perfect-unit-plans.json (50 units with structure)
2. perfect-export unit-plans.json (45 units with rich pedagogical content)
"""
import json
import sqlite3
import sys

# Database path
DB_PATH = '/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db'

# Backup file paths
STRUCTURE_BACKUP = '/Users/michaelmcisaac/Github/teaching-engine2.0/server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/strategically-perfect-unit-plans.json'
PEDAGOGICAL_BACKUP = '/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/backup/perfect-export-2025-08-14T23-40-37/unit-plans.json'

def normalize_title(title):
    """Normalize title for matching between backups"""
    # Remove accents, lowercase, remove special chars
    import unicodedata
    normalized = unicodedata.normalize('NFD', title.lower())
    normalized = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    # Remove apostrophes and hyphens
    normalized = normalized.replace("'", "").replace("-", " ")
    return normalized.strip()

def create_title_mapping():
    """Create mapping between different title formats"""
    return {
        # Add specific mappings for known differences
        "welcome to school!": "bienvenue en français",
        "my family": "ma famille française",
        "autumn stories": "histoires d'automne",
        "winter celebrations": "célébrations d'hiver",
        "poetry and rhythm": "poésie et rythmes",
        "young creative authors": "jeunes auteurs créatifs",
        "text exploration": "exploration de textes",
        "creative communication": "communication créative",
        "word explorers": "explorateurs de mots",
        "notre annee française": "notre année française",
        "foundation numbers 0-10": "fondations des nombres 0-10",
        "patterns and relationships": "régularités et relations",
        "addition to 10": "addition jusqu'à 10",
        "2d shapes and 3d solids": "formes 2d et solides 3d",
        "subtraction and inverse relationships": "soustraction et relations inverses",
        "numbers 11-20 and base ten": "nombres 11-20 et base dix",
        "non-standard measurement": "mesure non-standard",
        "comparison and ordering": "comparaison et ordonnancement",
        "mental math strategies": "stratégies de calcul mental",
        "equality and mathematical celebration": "égalité et célébration mathématique",
    }

def main():
    print("="*60)
    print("COMPLETE UNIT PLAN RESTORATION")
    print("="*60)
    
    # Load both backups
    print("\n1. Loading backups...")
    with open(STRUCTURE_BACKUP, 'r') as f:
        structure_units = json.load(f)
    print(f"   ✓ Loaded {len(structure_units)} units from structure backup")
    
    with open(PEDAGOGICAL_BACKUP, 'r') as f:
        pedagogical_units = json.load(f)
    print(f"   ✓ Loaded {len(pedagogical_units)} units from pedagogical backup")
    
    # Create lookup for pedagogical content
    title_mapping = create_title_mapping()
    pedagogical_lookup = {}
    for unit in pedagogical_units:
        title = normalize_title(unit.get('title', ''))
        pedagogical_lookup[title] = unit
    
    # Connect to database
    print("\n2. Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get current database units for mapping
    cursor.execute("SELECT id, title FROM UnitPlan")
    db_units = {row[1].lower(): row[0] for row in cursor.fetchall()}
    print(f"   ✓ Found {len(db_units)} units in database")
    
    # Track statistics
    updated_structure = 0
    updated_pedagogical = 0
    not_found = 0
    
    print("\n3. Processing units...")
    print("-"*60)
    
    # Process each unit from structure backup
    for unit in structure_units:
        original_title = unit.get('title', '')
        normalized = normalize_title(original_title)
        
        # Find matching unit in database
        db_title = None
        for db_t in db_units.keys():
            if normalized in db_t or db_t in normalized:
                db_title = db_t
                break
        
        if not db_title:
            # Try simplified matching
            simple_title = original_title.lower().replace("'", "").replace("-", " ")
            for db_t in db_units.keys():
                if any(word in db_t for word in simple_title.split()[:3]):
                    db_title = db_t
                    break
        
        if not db_title:
            print(f"   ✗ Not found in DB: {original_title}")
            not_found += 1
            continue
        
        # Extract structure fields
        description = unit.get('description', '')
        culminating_task = unit.get('culminatingTask', '')
        assessment_plan = unit.get('assessmentPlan', '')
        
        # Find matching pedagogical content
        pedagogical_unit = None
        
        # Try exact match first
        if normalized in pedagogical_lookup:
            pedagogical_unit = pedagogical_lookup[normalized]
        # Try mapping
        elif normalized in title_mapping and title_mapping[normalized] in pedagogical_lookup:
            pedagogical_unit = pedagogical_lookup[title_mapping[normalized]]
        # Try fuzzy match
        else:
            for ped_title, ped_unit in pedagogical_lookup.items():
                if any(word in ped_title for word in normalized.split()[:3]):
                    pedagogical_unit = ped_unit
                    break
        
        # Prepare update data
        big_ideas = ''
        indigenous_perspectives = ''
        cross_curricular = ''
        parent_communication = ''
        community_connections = ''
        environmental_education = ''
        prior_knowledge = ''
        social_justice = ''
        technology_integration = ''
        
        if pedagogical_unit:
            big_ideas = pedagogical_unit.get('bigIdeas', '')
            indigenous_perspectives = pedagogical_unit.get('indigenousPerspectives', '')
            cross_curricular = pedagogical_unit.get('crossCurricularConnections', '')
            parent_communication = pedagogical_unit.get('parentCommunicationPlan', '')
            community_connections = pedagogical_unit.get('communityConnections', '')
            environmental_education = pedagogical_unit.get('environmentalEducation', '')
            prior_knowledge = pedagogical_unit.get('priorKnowledge', '')
            social_justice = pedagogical_unit.get('socialJusticeConnections', '')
            technology_integration = pedagogical_unit.get('technologyIntegration', '')
            
            # Convert dicts to JSON strings if needed
            if isinstance(cross_curricular, dict):
                cross_curricular = json.dumps(cross_curricular)
            if isinstance(parent_communication, dict):
                parent_communication = json.dumps(parent_communication)
        
        # Update database
        cursor.execute("""
            UPDATE UnitPlan 
            SET 
                description = ?,
                culminatingTask = ?,
                assessmentPlan = ?,
                bigIdeas = ?,
                indigenousPerspectives = ?,
                crossCurricularConnections = ?,
                parentCommunicationPlan = ?,
                communityConnections = ?,
                environmentalEducation = ?,
                priorKnowledge = ?,
                socialJusticeConnections = ?,
                technologyIntegration = ?
            WHERE lower(title) = ?
        """, (description, culminating_task, assessment_plan,
              big_ideas, indigenous_perspectives, cross_curricular,
              parent_communication, community_connections, environmental_education,
              prior_knowledge, social_justice, technology_integration,
              db_title))
        
        if cursor.rowcount > 0:
            updated_structure += 1
            if pedagogical_unit:
                updated_pedagogical += 1
                print(f"   ✓✓ {original_title[:40]:<40} (structure + pedagogy)")
            else:
                print(f"   ✓  {original_title[:40]:<40} (structure only)")
    
    # Commit changes
    print("\n4. Committing changes...")
    conn.commit()
    
    # Verify restoration
    print("\n5. Verifying restoration...")
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
    
    print("\n" + "="*60)
    print("RESTORATION COMPLETE")
    print("="*60)
    print(f"✓ Updated {updated_structure} units with structure")
    print(f"✓ Enriched {updated_pedagogical} units with pedagogical content")
    if not_found > 0:
        print(f"✗ Could not match {not_found} units")
    
    print(f"\nDatabase Statistics:")
    print(f"  Total units: {total}")
    print(f"  With descriptions: {has_desc}/{total} ({has_desc*100//total}%)")
    print(f"  With big ideas: {has_ideas}/{total} ({has_ideas*100//total}%)")
    print(f"  With indigenous: {has_indig}/{total} ({has_indig*100//total}%)")
    print(f"  With cross-curricular: {has_cross}/{total} ({has_cross*100//total}%)")
    print(f"  With assessment: {has_assess}/{total} ({has_assess*100//total}%)")
    
    conn.close()
    print("\n✅ Unit plans fully restored!")

if __name__ == "__main__":
    main()