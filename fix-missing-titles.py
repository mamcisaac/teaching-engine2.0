#!/usr/bin/env python3
"""
Fix Missing Titles for Grade 1 French Immersion Curriculum
Fills empty unitTitle and lesson titles with engaging French titles
"""

import json
import os
from pathlib import Path

# Predefined titles for files that need them
UNIT_TITLES = {
    'impression-motifs-full.json': "Créons des motifs magiques",
    'notre-quartier-et-voisinage-full.json': "Découvrons notre quartier ensemble", 
    'ma-famille-et-mon-foyer-full.json': "Ma famille, mon trésor",
    'notre-communaute-automnale-full.json': "Notre communauté en automne",
    'moi-et-mon-ecole-full.json': "Moi et mon école formidable",
    'celebrations-traditions-hivernales-full.json': "Célébrons l'hiver ensemble",
    'fetes-hivernales-full.json': "Fêtes d'hiver joyeuses"
}

# Lesson titles by unit type
LESSON_TITLES = {
    'impression-motifs-full.json': [
        "Découvrons les motifs autour de nous",
        "Créons nos premiers motifs",
        "Les motifs dans la nature", 
        "Motifs géométriques amusants",
        "Impression avec des tampons",
        "Motifs avec nos doigts",
        "Répétons les formes",
        "Motifs colorés et joyeux",
        "Créons des bordures décoratives",
        "Les motifs sur nos vêtements",
        "Motifs à la manière des artistes",
        "Impression sur tissu",
        "Motifs d'automne",
        "Motifs d'hiver",
        "Motifs de printemps",
        "Motifs d'été",
        "Notre galerie de motifs",
        "Motifs en groupe",
        "Révision des techniques",
        "Célébrons nos créations"
    ]
}

# Default lesson goals by subject
LESSON_GOALS = {
    'arts-visuels': [
        "Explorer les techniques d'impression de motifs",
        "Créer des motifs répétitifs avec confiance", 
        "Développer la motricité fine par l'art",
        "Exprimer sa créativité par les motifs",
        "Apprécier l'art des motifs"
    ],
    'sciences-humaines': [
        "Explorer notre environnement proche",
        "Comprendre les liens communautaires",
        "Développer le sentiment d'appartenance",
        "Respecter la diversité culturelle",
        "Participer activement dans sa communauté"
    ]
}

def get_subject_key(filename):
    """Determine subject from filename"""
    if 'francais' in filename:
        return 'francais'
    elif 'mathematiques' in filename:
        return 'mathematiques'
    elif 'sciences-humaines' in filename:
        return 'sciences-humaines'
    elif 'sciences' in filename:
        return 'sciences'
    elif 'arts-visuels' in filename:
        return 'arts-visuels'
    elif 'formation-personnelle' in filename:
        return 'formation-personnelle'
    else:
        return 'francais'  # default fallback

def fix_titles_in_file(file_path):
    """Fix missing unitTitle and lesson titles in a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        filename = file_path.name
        subject = get_subject_key(filename.lower())
        changes_made = False
        
        # Fix empty unitTitle
        if 'unitTitle' in data and data['unitTitle'] == "":
            if filename in UNIT_TITLES:
                data['unitTitle'] = UNIT_TITLES[filename]
                changes_made = True
                print(f"  📝 Set unit title: {UNIT_TITLES[filename]}")
        
        # Fix empty lesson titles and goals
        if 'lessons' in data:
            for i, lesson in enumerate(data['lessons']):
                # Fix lesson title
                if 'title' in lesson and lesson['title'] == "":
                    if filename in LESSON_TITLES:
                        if i < len(LESSON_TITLES[filename]):
                            lesson['title'] = LESSON_TITLES[filename][i]
                            changes_made = True
                            print(f"  📝 Set lesson {i+1} title: {LESSON_TITLES[filename][i]}")
                
                # Fix lesson goal
                if 'oneGoal' in lesson and lesson['oneGoal'] == "":
                    if subject in LESSON_GOALS:
                        goal_index = i % len(LESSON_GOALS[subject])
                        lesson['oneGoal'] = LESSON_GOALS[subject][goal_index]
                        changes_made = True
                        print(f"  🎯 Set lesson {i+1} goal: {LESSON_GOALS[subject][goal_index]}")
                
                # Fix empty activity descriptions in sections
                for section in ['opening', 'main', 'closing']:
                    if section in lesson and 'activity' in lesson[section] and lesson[section]['activity'] == "":
                        activity_descriptions = {
                            'opening': f"Introduction à la leçon : {lesson.get('title', 'nouvelle activité')}",
                            'main': f"Activité principale : exploration pratique et créative",
                            'closing': f"Consolidation : partage et réflexion sur nos apprentissages"
                        }
                        lesson[section]['activity'] = activity_descriptions[section]
                        changes_made = True
                        print(f"  📋 Set {section} activity description")
        
        if changes_made:
            # Write back to file with proper formatting
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ Fixed titles in {file_path.name}")
            return True
        else:
            print(f"⚪ No missing titles found in {file_path.name}")
            return False
    
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Fix all missing titles in the curriculum"""
    lessons_dir = Path("generated-lessons")
    if not lessons_dir.exists():
        print("❌ generated-lessons directory not found")
        return
    
    total_files = 0
    processed_files = 0
    
    # Process all JSON files in all subdirectories
    for json_file in lessons_dir.rglob("*-full.json"):
        if ".backup" in str(json_file):
            continue  # Skip backup files
        
        total_files += 1
        print(f"\n🔍 Checking {json_file.name}...")
        if fix_titles_in_file(json_file):
            processed_files += 1
    
    print(f"\n📊 TITLES COMPLETION SUMMARY:")
    print(f"Total files checked: {total_files}")
    print(f"Files with titles added: {processed_files}")
    print(f"Files unchanged: {total_files - processed_files}")
    
    if processed_files > 0:
        print(f"\n✅ Title fixing complete!")
        print(f"Added engaging French titles appropriate for Grade 1")
    else:
        print(f"\n⚪ All titles were already present")

if __name__ == "__main__":
    main()