#!/usr/bin/env python3
"""
Restore complete Unit Plan data from the strategically perfect backup
"""
import json
import sqlite3
import sys

# Database path
DB_PATH = '/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db'

# Backup file path
BACKUP_PATH = '/Users/michaelmcisaac/Github/teaching-engine2.0/server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/strategically-perfect-unit-plans.json'

def main():
    # Load backup data
    print("Loading backup data...")
    with open(BACKUP_PATH, 'r') as f:
        backup_units = json.load(f)
    
    print(f"Found {len(backup_units)} units in backup")
    
    # Connect to database
    print("Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Track statistics
    updated = 0
    not_found = 0
    
    # Title mapping from backup to database (simplified titles)
    title_mapping = {
        "Premiers pas artistiques": "premiers pas artistiques",
        "L'aventure des lignes et formes": "aventure lignes formes",
        "La magie des couleurs": "magie couleurs",
        "Arts des fêtes hivernales": "fetes hivernales",
        "Textures et matériaux": "textures materiaux",
        "Impression et motifs": "impression motifs",
        "Exploration 3D et sculpture": "exploration 3d",
        "Art environnemental printanier": "art environnemental printanier",
        "Techniques artistiques avancées": "techniques artistiques",
        "Notre galerie d'art française": "exposition finale",
        "Mon corps et ma sécurité": "corps securite",
        "Mes émotions et sentiments": "emotions sentiments",
        "Amitiés et relations positives": "amities",
        "Nutrition et mode de vie sain": "nutrition vie saine",
        "Grandir, changer et célébrer ensemble": "egalite celebration",
        "Bienvenue en français": "bienvenue",
        "Histoires d'automne": "histoires automne",
        "Ma famille française": "famille",
        "Célébrations d'hiver": "celebrations dhiver",
        "Poésie et rythmes": "poesie rythmes",
        "Jeunes auteurs créatifs": "jeunes auteurs",
        "Exploration de textes": "exploration de textes",
        "Communication créative": "communication creative",
        "Explorateurs de mots": "explorateurs de mots",
        "Notre année française": "notre annee",
        "Fondations des nombres 0-10": "fondations nombres",
        "Régularités et relations": "regularites relations",
        "Addition jusqu'à 10": "addition jusqua 10",
        "Formes 2D et solides 3D": "formes solides",
        "Soustraction et relations inverses": "soustraction relations",
        "Nombres 11-20 et base dix": "nombres jusqua 20",
        "Mesure non-standard": "mesure non standard",
        "Comparaison et ordonnancement": "comparaison",
        "Stratégies de calcul mental": "strategies calcul",
        "Égalité et célébration mathématique": "mathematiques celebration",
        "Petits scientifiques sécuritaires": "petits scientifiques",
        "Matériaux de notre environnement": "materiaux",
        "Changements saisonniers d'automne": "changements saisonniers",
        "Lumière et chaleur hivernales": "lumiere chaleur",
        "Croissance et besoins des vivants": "croissance besoins",
        "Forces et mouvements simples": "forces mouvements",
        "Éveil du printemps": "eveil printemps",
        "Notre environnement partagé": "environnement partage",
        "Sons et vibrations fascinants": "sons vibrations",
        "Exposition scientifique de fin d'année": "exposition finale",
        "Moi et mon école": "moi ecole",
        "Ma famille et mon foyer": "famille",
        "Notre communauté automnale": "notre communaute",
        "Célébrations et traditions hivernales": "celebrations traditions hivernales",
        "Notre quartier et voisinage": "notre quartier"
    }
    
    # Process each unit from backup
    for unit in backup_units:
        original_title = unit.get('title', '')
        # Map to database title
        title = title_mapping.get(original_title, original_title.lower())
        
        # Extract all important fields from backup
        description = unit.get('description', '')
        big_ideas = unit.get('bigIdeas', '')
        if isinstance(big_ideas, list):
            big_ideas = json.dumps(big_ideas)
        
        # Handle all the assessment and planning fields
        assessment_plan = unit.get('assessmentPlan', '')
        indigenous_perspectives = unit.get('indigenousPerspectives', '')
        cross_curricular = unit.get('crossCurricularConnections', '')
        parent_communication = unit.get('parentCommunicationPlan', '')
        community_connections = unit.get('communityConnections', '')
        culminating_task = unit.get('culminatingTask', '')
        enduring_understandings = unit.get('enduringUnderstandings', '')
        environmental_education = unit.get('environmentalEducation', '')
        field_trips = unit.get('fieldTripsAndGuestSpeakers', '')
        prior_knowledge = unit.get('priorKnowledge', '')
        social_justice = unit.get('socialJusticeConnections', '')
        technology_integration = unit.get('technologyIntegration', '')
        
        # Handle JSON fields that might be dicts
        if isinstance(cross_curricular, dict):
            cross_curricular = json.dumps(cross_curricular)
        if isinstance(parent_communication, dict):
            parent_communication = json.dumps(parent_communication)
        
        print(f"\nProcessing: {original_title} -> {title}")
        
        # Update the database
        cursor.execute("""
            UPDATE UnitPlan 
            SET 
                description = ?,
                bigIdeas = ?,
                assessmentPlan = ?,
                indigenousPerspectives = ?,
                crossCurricularConnections = ?,
                parentCommunicationPlan = ?,
                communityConnections = ?,
                culminatingTask = ?,
                enduringUnderstandings = ?,
                environmentalEducation = ?,
                fieldTripsAndGuestSpeakers = ?,
                priorKnowledge = ?,
                socialJusticeConnections = ?,
                technologyIntegration = ?
            WHERE title = ?
        """, (description, big_ideas, assessment_plan, indigenous_perspectives,
              cross_curricular, parent_communication, community_connections,
              culminating_task, enduring_understandings, environmental_education,
              field_trips, prior_knowledge, social_justice, technology_integration,
              title))
        
        if cursor.rowcount > 0:
            updated += 1
            print(f"  ✓ Updated successfully")
            print(f"    - Description: {len(description) if description else 0} chars")
            print(f"    - Indigenous: {len(indigenous_perspectives) if indigenous_perspectives else 0} chars")
            print(f"    - Cross-curricular: {len(str(cross_curricular)) if cross_curricular else 0} chars")
        else:
            not_found += 1
            print(f"  ✗ Not found in database")
    
    # Commit changes
    print("\n" + "="*60)
    print("Committing changes...")
    conn.commit()
    
    # Verify the restoration
    print("\nVerifying restoration...")
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN description IS NOT NULL AND length(description) > 0 THEN 1 ELSE 0 END) as has_desc,
            SUM(CASE WHEN bigIdeas IS NOT NULL AND length(bigIdeas) > 0 THEN 1 ELSE 0 END) as has_ideas,
            SUM(CASE WHEN indigenousPerspectives IS NOT NULL AND length(indigenousPerspectives) > 0 THEN 1 ELSE 0 END) as has_indig,
            SUM(CASE WHEN crossCurricularConnections IS NOT NULL AND length(crossCurricularConnections) > 0 THEN 1 ELSE 0 END) as has_cross,
            SUM(CASE WHEN parentCommunicationPlan IS NOT NULL AND length(parentCommunicationPlan) > 0 THEN 1 ELSE 0 END) as has_parent
        FROM UnitPlan
    """)
    
    result = cursor.fetchone()
    total, has_desc, has_ideas, has_indig, has_cross, has_parent = result
    
    print("\n" + "="*60)
    print("RESTORATION SUMMARY")
    print("="*60)
    print(f"✓ Successfully updated: {updated} units")
    if not_found > 0:
        print(f"✗ Not found in database: {not_found} units")
    
    print("\nDatabase Statistics:")
    print(f"  Total units: {total}")
    print(f"  With descriptions: {has_desc}/{total} ({has_desc*100//total}%)")
    print(f"  With big ideas: {has_ideas}/{total} ({has_ideas*100//total if total else 0}%)")
    print(f"  With indigenous perspectives: {has_indig}/{total} ({has_indig*100//total}%)")
    print(f"  With cross-curricular: {has_cross}/{total} ({has_cross*100//total}%)")
    print(f"  With parent communication: {has_parent}/{total} ({has_parent*100//total if total else 0}%)")
    
    # Show a sample of restored units
    print("\nSample of restored units:")
    cursor.execute("""
        SELECT title, 
               length(description) as desc_len,
               length(indigenousPerspectives) as indig_len
        FROM UnitPlan 
        WHERE description IS NOT NULL 
        ORDER BY title 
        LIMIT 5
    """)
    
    for row in cursor.fetchall():
        title, desc_len, indig_len = row
        print(f"  - {title[:40]:<40} D:{desc_len or 0:>4} I:{indig_len or 0:>4}")
    
    conn.close()
    print("\n✅ Unit plan restoration complete!")

if __name__ == "__main__":
    main()