#!/usr/bin/env python3
"""
Fix unit dates to follow proper pedagogical sequence for Grade 1 French Immersion
Each unit gets appropriate date ranges based on content and seasonal themes
"""

import sqlite3
from datetime import datetime, timedelta

# Unit date assignments based on pedagogical sequence
# Format: (unit_title, start_date, end_date)
UNIT_SCHEDULE = [
    # SEPTEMBER - Introduction and Foundation (4 weeks)
    ('bienvenue', '2025-09-03', '2025-09-19'),  # Welcome unit - MUST be first!
    ('nombres 0 10', '2025-09-08', '2025-09-26'),  # Basic numbers parallel with welcome
    ('petits scientifiques', '2025-09-15', '2025-09-30'),  # Introduction to science
    ('moi et mon ecole', '2025-09-22', '2025-10-03'),  # School community
    ('premiers pas artistiques', '2025-09-22', '2025-10-10'),  # Introduction to art
    ('corps securite', '2025-09-15', '2025-10-03'),  # Safety first for Grade 1
    
    # OCTOBER - Building Community (4 weeks)
    ('histoires automne', '2025-10-06', '2025-10-24'),  # Fall stories
    ('notre communaute automnale', '2025-10-06', '2025-10-24'),  # Fall community
    ('famille', '2025-10-14', '2025-10-31'),  # Family unit
    ('ma famille et mon foyer', '2025-10-14', '2025-10-31'),  # Home and family
    ('formes 2d', '2025-10-06', '2025-10-24'),  # 2D shapes
    ('magie couleurs', '2025-10-14', '2025-10-31'),  # Colors in art
    ('emotions sentiments', '2025-10-20', '2025-11-07'),  # Emotions
    
    # NOVEMBER - Deepening Understanding (4 weeks)
    ('explorateurs de mots', '2025-11-03', '2025-11-21'),  # Word exploration
    ('notre quartier et voisinage', '2025-11-03', '2025-11-21'),  # Neighborhood
    ('nombres 11 20', '2025-11-03', '2025-11-21'),  # Numbers 11-20
    ('materiaux', '2025-11-10', '2025-11-28'),  # Materials science
    ('aventure lignes formes', '2025-11-10', '2025-11-28'),  # Lines and shapes
    ('amities', '2025-11-17', '2025-12-05'),  # Friendships
    
    # DECEMBER - Winter Preparation (3 weeks before break)
    ('celebrations dhiver', '2025-12-01', '2025-12-19'),  # Winter celebrations
    ('celebrations traditions hivernales', '2025-12-01', '2025-12-19'),  # Winter traditions
    ('fetes hivernales', '2025-12-08', '2025-12-19'),  # Winter holidays art
    ('addition jusqua 10', '2025-12-01', '2025-12-19'),  # Addition basics
    ('lumiere chaleur', '2025-12-08', '2025-12-19'),  # Light and heat
    
    # JANUARY - New Year, New Skills (3 weeks after break)
    ('communication creative', '2026-01-05', '2026-01-23'),  # Creative communication
    ('exploration de textes', '2026-01-05', '2026-01-23'),  # Text exploration
    ('soustraction', '2026-01-05', '2026-01-23'),  # Subtraction
    ('changements saisonniers', '2026-01-12', '2026-01-30'),  # Seasonal changes
    ('textures materiaux', '2026-01-12', '2026-01-30'),  # Textures in art
    ('nutrition et mode de vie sain', '2026-01-19', '2026-02-06'),  # Nutrition
    
    # FEBRUARY - Building Skills (3 weeks before break)
    ('poesie et rythmes', '2026-02-02', '2026-02-13'),  # Poetry and rhythms
    ('mesure non standard', '2026-02-02', '2026-02-13'),  # Non-standard measurement
    ('sons vibrations', '2026-02-09', '2026-02-13'),  # Sounds and vibrations
    ('impression motifs', '2026-02-09', '2026-02-13'),  # Pattern printing
    
    # MARCH - Spring Awakening (4 weeks)
    ('jeunes auteurs creatifs', '2026-03-02', '2026-03-20'),  # Creative young authors
    ('regularites et relations', '2026-03-02', '2026-03-20'),  # Patterns
    ('eveil printemps', '2026-03-09', '2026-03-27'),  # Spring awakening
    ('exploration 3d', '2026-03-09', '2026-03-27'),  # 3D exploration
    ('croissance besoins', '2026-03-16', '2026-04-02'),  # Growth and needs
    
    # APRIL - Advanced Concepts (4 weeks)
    ('notre annee francaise', '2026-04-07', '2026-04-24'),  # Our French year
    ('comparaison', '2026-04-07', '2026-04-24'),  # Comparison
    ('forces mouvements', '2026-04-13', '2026-05-01'),  # Forces and movement
    ('techniques artistiques avancees', '2026-04-13', '2026-05-01'),  # Advanced art
    ('strategies calcul', '2026-04-20', '2026-05-08'),  # Calculation strategies
    
    # MAY - Integration and Environment (4 weeks)
    ('environnement partage', '2026-05-04', '2026-05-22'),  # Shared environment
    ('art environnemental printanier', '2026-05-04', '2026-05-22'),  # Spring environmental art
    ('egalite celebration', '2026-05-11', '2026-05-29'),  # Equality celebration
    ('grandir', '2026-05-19', '2026-06-05'),  # Growing up
    
    # JUNE - Year-End Celebration (3 weeks)
    ('exposition finale', '2026-06-01', '2026-06-19'),  # Final exhibition
    ('notre galerie art francaise', '2026-06-08', '2026-06-19'),  # French art gallery
]

def main():
    # Connect to database
    conn = sqlite3.connect('./packages/database/prisma/prisma/dev.db')
    cursor = conn.cursor()
    
    print("🔧 Fixing unit dates for pedagogical sequence...")
    print("=" * 60)
    
    updated_count = 0
    not_found = []
    
    for unit_title, start_date, end_date in UNIT_SCHEDULE:
        # Update the unit with proper dates
        cursor.execute("""
            UPDATE UnitPlan
            SET startDate = ?, endDate = ?
            WHERE LOWER(REPLACE(title, ' ', '')) = LOWER(REPLACE(?, ' ', ''))
        """, (start_date + 'T00:00:00Z', end_date + 'T23:59:59Z', unit_title))
        
        if cursor.rowcount > 0:
            updated_count += 1
            print(f"✅ {unit_title:40} | {start_date} to {end_date}")
        else:
            not_found.append(unit_title)
            print(f"❌ {unit_title:40} | NOT FOUND")
    
    # Commit changes
    conn.commit()
    
    print("=" * 60)
    print(f"✅ Updated {updated_count} units with proper dates")
    
    if not_found:
        print(f"⚠️  {len(not_found)} units not found: {', '.join(not_found)}")
    
    # Verify the updates
    print("\n📊 Verification by subject:")
    cursor.execute("""
        SELECT 
            lrp.subject,
            COUNT(up.id) as unit_count,
            MIN(date(up.startDate)) as first_unit,
            MAX(date(up.endDate)) as last_unit
        FROM UnitPlan up
        JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
        WHERE up.startDate IS NOT NULL
        GROUP BY lrp.subject
        ORDER BY MIN(up.startDate)
    """)
    
    for row in cursor.fetchall():
        print(f"  {row[0]:35} | {row[1]:2} units | {row[2]} to {row[3]}")
    
    conn.close()
    print("\n✅ Unit dates fixed for proper pedagogical sequence!")

if __name__ == '__main__':
    main()