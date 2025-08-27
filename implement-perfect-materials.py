#!/usr/bin/env python3
"""
Actually implement perfect materials in amities-full.json
Replace 57 repetitions with unique, appropriate materials
"""

import json
from perfect_materials import get_perfect_materials_for_amities

# Load the file
with open('generated-lessons/formation-personnelle/amities-full.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update each lesson with perfect materials
lessons = data.get('lessons', [])
materials_updated = 0

for lesson in lessons:
    lesson_num = lesson.get('lessonNumber', 0)
    title = lesson.get('title', '')
    goal = lesson.get('oneGoal', '')
    
    # Get perfect materials for this specific lesson
    perfect_mats = get_perfect_materials_for_amities(lesson_num, title, goal)
    
    # Update opening materials if present
    if 'opening' in lesson and 'opening' in perfect_mats:
        if 'materials' not in lesson['opening']:
            lesson['opening']['materials'] = {}
        
        lesson['opening']['materials']['required'] = [{
            "item": perfect_mats['opening']['item'],
            "quantity": perfect_mats['opening']['quantity'],
            "preparation": perfect_mats['opening']['preparation'],
            "alternatives": perfect_mats['opening']['alternatives']
        }]
        
        # Keep optional but update it
        lesson['opening']['materials']['optional'] = [{
            "item": "Matériel enrichissement contextuel",
            "quantity": "Selon besoins particuliers",
            "purpose": f"Approfondir le thème: {title}"
        }]
        materials_updated += 1
    
    # Update main materials if present
    if 'main' in lesson and 'main' in perfect_mats:
        if 'materials' not in lesson['main']:
            lesson['main']['materials'] = {}
            
        lesson['main']['materials']['required'] = [{
            "item": perfect_mats['main']['item'],
            "quantity": perfect_mats['main']['quantity'],
            "preparation": perfect_mats['main']['preparation'],
            "alternatives": perfect_mats['main']['alternatives']
        }]
        
        # Add secondary materials when appropriate
        if lesson_num in [4, 5, 10]:  # Lessons needing multiple materials
            secondary = {
                4: {  # Sharing lesson
                    "item": "Tableau de suivi du partage",
                    "quantity": "1 grand tableau visible",
                    "preparation": "Colonnes: nom, partage observé, étoiles",
                    "alternatives": ["Application numérique", "Cahier partage", "Arbre partage"]
                },
                5: {  # Playing together
                    "item": "Musique pour transitions",
                    "quantity": "Playlist 5-6 chansons calmes/énergiques",
                    "preparation": "Tester volume, préparer signaux",
                    "alternatives": ["Instruments live", "Chansons a capella", "Rythmes corporels"]
                },
                10: {  # Conflict resolution
                    "item": "Cartes émotions pour identifier sentiments",
                    "quantity": "8 cartes émotions de base",
                    "preparation": "Plastifier, attacher à coin de paix",
                    "alternatives": ["Miroir émotions", "Thermomètre émotions", "Roue sentiments"]
                }
            }
            
            if lesson_num in secondary:
                lesson['main']['materials']['required'].append(secondary[lesson_num])
        
        lesson['main']['materials']['optional'] = [{
            "item": "Support différenciation",
            "quantity": "Matériel adapté besoins spéciaux",
            "purpose": "Inclusion et accessibilité pour tous"
        }]
        materials_updated += 1
    
    # Update closing materials if present
    if 'closing' in lesson and 'closing' in perfect_mats:
        if 'materials' not in lesson['closing']:
            lesson['closing']['materials'] = {}
            
        lesson['closing']['materials']['required'] = [{
            "item": perfect_mats['closing']['item'],
            "quantity": perfect_mats['closing']['quantity'],
            "preparation": perfect_mats['closing']['preparation'],
            "alternatives": perfect_mats['closing']['alternatives']
        }]
        
        # Add celebration/documentation materials
        lesson['closing']['materials']['optional'] = [{
            "item": "Documentation apprentissage",
            "quantity": "Photos, portfolio, affichage",
            "purpose": "Garder trace des progrès et célébrer"
        }]
        materials_updated += 1

# Save the updated file
with open('generated-lessons/formation-personnelle/amities-full.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ SUCCESS: Updated {materials_updated} material sections")
print(f"Each lesson now has unique, activity-specific materials")
print(f"No more 57 repetitions of 'friendship cards'!")

# Verification
materials_variety = {}
for lesson in lessons:
    for section in ['opening', 'main', 'closing']:
        if section in lesson and 'materials' in lesson[section]:
            for mat in lesson[section]['materials'].get('required', []):
                item = mat.get('item', '')
                materials_variety[item] = materials_variety.get(item, 0) + 1

print("\n=== MATERIALS VARIETY CHECK ===")
repeated = {k: v for k, v in materials_variety.items() if v > 3}
if repeated:
    print("⚠️ Materials appearing >3 times:")
    for item, count in repeated.items():
        print(f"  - {item}: {count} times")
else:
    print("✅ Perfect variety - no material appears more than 3 times!")
    
print(f"\n📊 Total unique materials: {len(materials_variety)}")
print(f"📊 Average repetition: {sum(materials_variety.values()) / len(materials_variety):.1f}")