#!/usr/bin/env python3
"""
Fix script to ensure all lesson sections are fully enhanced
Specifically targets empty materials, visualSupports, and decisionPoints arrays
"""

import json
from pathlib import Path

def fix_lesson_enhancements():
    """Fix any remaining empty sections in lessons"""
    
    file_path = Path("generated-lessons/sciences/changements-saisonniers-full.json")
    
    # Load the unit
    with open(file_path, 'r', encoding='utf-8') as f:
        unit_data = json.load(f)
    
    # Enhanced materials by section type
    materials_map = {
        "opening": ["Cartes visuelles du vocabulaire (25)", "Tableau d'affichage (1)", "Marqueurs de couleur (4)"],
        "main": ["Matériaux de manipulation (25 ensembles)", "Feuilles d'activité (25)", "Crayons de couleur (25 ensembles)", "Loupes (10)", "Tableau de classe (1)"],
        "closing": ["Tableau de synthèse (1)", "Autocollants étoiles (25)", "Marqueurs (3)"]
    }
    
    visual_supports_map = {
        "opening": "Cartes visuelles du vocabulaire de la leçon, pictogrammes d'appui, affichage de référence",
        "main": "Guides visuels étape par étape, cartes de consignes illustrées, supports d'observation",
        "closing": "Tableau de synthèse visuel, cartes de réflexion, affichage des apprentissages"
    }
    
    decision_points_bank = [
        "Si les élèves ont des difficultés de compréhension : utiliser plus de supports visuels et gestuelle",
        "Si l'activité prend plus de temps que prévu : ajuster en gardant l'essentiel", 
        "Si certains élèves terminent rapidement : fournir extension ou rôle d'aide",
        "Si les élèves sont très excités : utiliser signal de calme et recentrer"
    ]
    
    fixes_made = 0
    
    for lesson in unit_data['lessons']:
        lesson_num = lesson.get('lessonNumber', 0)
        
        # Determine decision point count based on lesson number
        if lesson_num <= 5:
            dp_count = 3
        elif lesson_num <= 15:
            dp_count = 2
        else:
            dp_count = 1
        
        # Fix each section
        for section_name in ['opening', 'main', 'closing']:
            if section_name in lesson:
                section = lesson[section_name]
                
                # Fix empty materials
                if not section.get('materials') or section['materials'] == []:
                    section['materials'] = materials_map[section_name]
                    fixes_made += 1
                
                # Fix empty visual supports
                if not section.get('visualSupports') or section['visualSupports'] == "":
                    section['visualSupports'] = visual_supports_map[section_name]
                    fixes_made += 1
                
                # Fix empty decision points
                if not section.get('decisionPoints') or section['decisionPoints'] == []:
                    points_for_section = min(dp_count, len(decision_points_bank))
                    section['decisionPoints'] = decision_points_bank[:points_for_section]
                    dp_count = max(0, dp_count - points_for_section)
                    fixes_made += 1
    
    # Save the fixed file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(unit_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Fixed {fixes_made} empty sections across all lessons")
    return fixes_made > 0

if __name__ == "__main__":
    fix_lesson_enhancements()