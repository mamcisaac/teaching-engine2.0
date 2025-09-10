#!/usr/bin/env python3
"""
Restore pedagogical content from backups with English titles to database with French titles.
Uses titleFr field from backups to match with current French database titles.
"""
import json
import sqlite3
import re

# Database path
DB_PATH = '/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db'

# Best backup source (has titleFr field for matching)
BACKUP_PATH = '/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/backup/CRITICAL-PERFECT-PLANS-2025-08-14/UNIT-PLANS-COMPLETE.json'

def normalize_title(title):
    """Normalize title for fuzzy matching"""
    if not title:
        return ""
    # Remove accents
    import unicodedata
    normalized = unicodedata.normalize('NFD', title.lower())
    normalized = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    # Remove special chars
    normalized = re.sub(r'[^\\w\\s]', ' ', normalized)
    # Collapse spaces
    normalized = ' '.join(normalized.split())
    return normalized.strip()

def main():
    print("="*70)
    print("RESTORE PEDAGOGICAL CONTENT FROM ENGLISH TO FRENCH UNITS")
    print("="*70)
    
    # Load backup with pedagogical content
    print("\n1. Loading backup with pedagogical content...")
    with open(BACKUP_PATH, 'r') as f:
        backup_units = json.load(f)
    print(f"   ✓ Loaded {len(backup_units)} units from backup")
    
    # Connect to database
    print("\n2. Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get current database units
    cursor.execute("SELECT id, title FROM UnitPlan ORDER BY title")
    db_units = cursor.fetchall()
    print(f"   ✓ Database has {len(db_units)} units")
    
    # Create mapping using multiple strategies
    print("\n3. Creating mapping between English and French titles...")
    
    # Strategy 1: Direct titleFr matching
    mapping = {}
    for db_id, db_title in db_units:
        db_norm = normalize_title(db_title)
        
        for backup_unit in backup_units:
            # Try titleFr field
            if backup_unit.get('titleFr'):
                backup_norm = normalize_title(backup_unit['titleFr'])
                if db_norm == backup_norm or db_norm in backup_norm or backup_norm in db_norm:
                    mapping[db_id] = backup_unit
                    break
            
            # Try title field with French detection
            if backup_unit.get('title'):
                backup_norm = normalize_title(backup_unit['title'])
                if db_norm == backup_norm or db_norm in backup_norm or backup_norm in db_norm:
                    mapping[db_id] = backup_unit
                    break
    
    # Strategy 2: Manual mappings for known translations
    manual_mappings = {
        'bienvenue': 'Welcome to School!',
        'famille': 'My Family',
        'ma famille et mon foyer': 'My Family and Our Class',
        'moi et mon ecole': 'Me, Myself, and I',
        'nombres 0 10': 'Numbers All Around Us',
        'nombres 11 20': 'Making Sense of Numbers',
        'addition jusqua 10': 'Adding and Subtracting',
        'soustraction': 'Adding and Subtracting',
        'comparaison': 'Measurement Exploration',
        'mesure non standard': 'Measurement Exploration',
        'formes 2d': 'Patterns and Shapes',
        'regularites et relations': 'Patterns and Shapes',
        'strategies calcul': 'Mental Math Strategies',
        'changements saisonniers': 'Fall Changes',
        'forces mouvements': 'Energy in Our Lives',
        'lumiere chaleur': 'Energy in Our Lives',
        'sons vibrations': 'Energy in Our Lives',
        'croissance besoins': 'Growing and Changing',
        'materiaux': 'Exploring Our World',
        'environnement partage': 'Our Impact on Nature',
        'eveil printemps': 'Spring Awakening',
        'petits scientifiques': 'Problem Solving Adventures',
        'notre communaute automnale': 'Ma communauté',
        'notre quartier et voisinage': 'Ma communauté',
        'fetes hivernales': 'Winter Celebrations Through Art',
        'celebrations dhiver': 'Winter Celebrations Through Art',
        'celebrations traditions hivernales': 'Winter Celebrations Through Art',
        'histoires automne': 'Les fêtes d\'automne',
        'egalite celebration': 'Our Rights and Responsibilities',
        'grandir': 'Growing and Changing',
        'corps securite': 'Safe and Sound',
        'emotions sentiments': 'Friends and Feelings',
        'amities': 'Friends and Feelings',
        'nutrition et mode de vie sain': 'Healthy Me',
        'magie couleurs': 'Colors and Feelings',
        'aventure lignes formes': 'Discovering Art in Our World',
        'premiers pas artistiques': 'Discovering Art in Our World',
        'impression motifs': 'Textures and Patterns',
        'textures materiaux': 'Textures and Patterns',
        'exploration 3d': 'Stories in Art',
        'techniques artistiques avancees': 'Our Art Gallery',
        'notre galerie art francaise': 'Our Art Gallery',
        'art environnemental printanier': 'Spring Awakening',
        'explorateurs de mots': 'Our Wonderful World',
        'communication creative': 'Nos amis les animaux',
        'poesie et rythmes': 'Le printemps en fleurs',
        'exploration de textes': 'L\'hiver magique',
        'jeunes auteurs creatifs': 'My Story Through Time',
        'notre annee francaise': 'Célébrons nos apprentissages',
        'exposition finale': 'Math Celebration'
    }
    
    for db_id, db_title in db_units:
        if db_id not in mapping:
            db_norm = normalize_title(db_title)
            for backup_unit in backup_units:
                backup_title = backup_unit.get('title', '')
                if db_norm in manual_mappings and manual_mappings[db_norm].lower() == backup_title.lower():
                    mapping[db_id] = backup_unit
                    break
    
    print(f"   ✓ Mapped {len(mapping)} units")
    
    # Update database with pedagogical content
    print("\n4. Updating database with pedagogical content...")
    stats = {
        'updated': 0,
        'with_indigenous': 0,
        'with_cross': 0,
        'with_bigIdeas': 0,
        'with_assessment': 0
    }
    
    for db_id, backup_unit in mapping.items():
        # Get the French title for display
        cursor.execute("SELECT title FROM UnitPlan WHERE id = ?", (db_id,))
        db_title = cursor.fetchone()[0]
        
        # Extract pedagogical content
        indigenous = backup_unit.get('indigenousPerspectives', '')
        cross_curricular = backup_unit.get('crossCurricularConnections', '')
        big_ideas = backup_unit.get('bigIdeas', '') or backup_unit.get('bigIdeasFr', '')
        assessment = backup_unit.get('assessmentPlan', '')
        community = backup_unit.get('communityConnections', '')
        culminating = backup_unit.get('culminatingTask', '')
        differentiation = backup_unit.get('differentiationStrategies', '')
        environmental = backup_unit.get('environmentalEducation', '')
        field_trips = backup_unit.get('fieldTripsAndGuestSpeakers', '')
        parent_comm = backup_unit.get('parentCommunicationPlan', '')
        prior_knowledge = backup_unit.get('priorKnowledge', '')
        social_justice = backup_unit.get('socialJusticeConnections', '')
        technology = backup_unit.get('technologyIntegration', '')
        enduring = backup_unit.get('enduringUnderstandings', '')
        
        # Convert dict/list to JSON string if needed
        for field in [indigenous, cross_curricular, big_ideas, assessment, community, 
                     culminating, differentiation, environmental, field_trips, 
                     parent_comm, prior_knowledge, social_justice, technology, enduring]:
            if isinstance(field, (dict, list)):
                field = json.dumps(field)
        
        # Update the unit
        cursor.execute("""
            UPDATE UnitPlan 
            SET 
                bigIdeas = COALESCE(NULLIF(?, ''), bigIdeas),
                indigenousPerspectives = COALESCE(NULLIF(?, ''), indigenousPerspectives),
                crossCurricularConnections = COALESCE(NULLIF(?, ''), crossCurricularConnections),
                assessmentPlan = COALESCE(NULLIF(?, ''), assessmentPlan),
                communityConnections = COALESCE(NULLIF(?, ''), communityConnections),
                culminatingTask = COALESCE(NULLIF(?, ''), culminatingTask),
                differentiationStrategies = COALESCE(NULLIF(?, ''), differentiationStrategies),
                environmentalEducation = COALESCE(NULLIF(?, ''), environmentalEducation),
                fieldTripsAndGuestSpeakers = COALESCE(NULLIF(?, ''), fieldTripsAndGuestSpeakers),
                parentCommunicationPlan = COALESCE(NULLIF(?, ''), parentCommunicationPlan),
                priorKnowledge = COALESCE(NULLIF(?, ''), priorKnowledge),
                socialJusticeConnections = COALESCE(NULLIF(?, ''), socialJusticeConnections),
                technologyIntegration = COALESCE(NULLIF(?, ''), technologyIntegration),
                enduringUnderstandings = COALESCE(NULLIF(?, ''), enduringUnderstandings)
            WHERE id = ?
        """, (
            big_ideas, indigenous, cross_curricular, assessment,
            community, culminating, differentiation, environmental,
            field_trips, parent_comm, prior_knowledge, social_justice,
            technology, enduring, db_id
        ))
        
        if cursor.rowcount > 0:
            stats['updated'] += 1
            if indigenous:
                stats['with_indigenous'] += 1
            if cross_curricular:
                stats['with_cross'] += 1
            if big_ideas:
                stats['with_bigIdeas'] += 1
            if assessment:
                stats['with_assessment'] += 1
            
            print(f"   ✓ Updated: {db_title} ← {backup_unit.get('title', 'Unknown')}")
    
    # Commit changes
    print("\n5. Committing changes...")
    conn.commit()
    
    # Final verification
    print("\n6. Final verification...")
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN bigIdeas IS NOT NULL AND length(bigIdeas) > 0 THEN 1 ELSE 0 END) as has_ideas,
            SUM(CASE WHEN indigenousPerspectives IS NOT NULL AND length(indigenousPerspectives) > 0 THEN 1 ELSE 0 END) as has_indig,
            SUM(CASE WHEN crossCurricularConnections IS NOT NULL AND length(crossCurricularConnections) > 0 THEN 1 ELSE 0 END) as has_cross,
            SUM(CASE WHEN assessmentPlan IS NOT NULL AND length(assessmentPlan) > 0 THEN 1 ELSE 0 END) as has_assess
        FROM UnitPlan
    """)
    
    result = cursor.fetchone()
    total, has_ideas, has_indig, has_cross, has_assess = result
    
    print("\n" + "="*70)
    print("PEDAGOGICAL CONTENT RESTORATION COMPLETE!")
    print("="*70)
    print(f"\n✅ Updated {stats['updated']} units with pedagogical content")
    print(f"   - {stats['with_indigenous']} with indigenous perspectives")
    print(f"   - {stats['with_cross']} with cross-curricular connections")
    print(f"   - {stats['with_bigIdeas']} with big ideas")
    print(f"   - {stats['with_assessment']} with assessment plans")
    
    print(f"\n📊 Final Database Statistics:")
    print(f"   Total units: {total}")
    print(f"   With big ideas: {has_ideas}/{total} ({has_ideas*100//total}%)")
    print(f"   With indigenous: {has_indig}/{total} ({has_indig*100//total}%)")
    print(f"   With cross-curricular: {has_cross}/{total} ({has_cross*100//total}%)")
    print(f"   With assessment: {has_assess}/{total} ({has_assess*100//total}%)")
    
    # Show sample of restored units
    print("\n🌟 Sample of restored units:")
    cursor.execute("""
        SELECT title, 
               substr(indigenousPerspectives, 1, 50) as indig,
               substr(bigIdeas, 1, 50) as ideas
        FROM UnitPlan 
        WHERE indigenousPerspectives IS NOT NULL 
        AND bigIdeas IS NOT NULL
        ORDER BY title 
        LIMIT 5
    """)
    
    for row in cursor.fetchall():
        print(f"   ✓ {row[0]}")
        print(f"      Indigenous: {row[1]}...")
        print(f"      Big Ideas: {row[2]}...")
    
    conn.close()
    print("\n🎉 PEDAGOGICAL CONTENT FULLY RESTORED!")

if __name__ == "__main__":
    main()