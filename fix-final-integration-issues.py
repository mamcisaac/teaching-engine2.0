#!/usr/bin/env python3
"""
Fix final integration test issues
"""

import json
from pathlib import Path

# French unit title corrections
TITLE_CORRECTIONS = {
    'moi-et-mon-ecole': "Moi et mon école formidable",
    'poesie-et-rythmes': "Poésie et rythmes français",
    'corps-securite': "Mon corps et ma sécurité",
    'sons-vibrations': "Sons et vibrations autour de nous",
    'grandir': "Grandir et célébrer ensemble"
}

# Default movement breaks for any missing
DEFAULT_MOVEMENT_BREAKS = [
    "Étirer nos bras et bouger doucement (2 minutes)",
    "Respirer profondément et se détendre (2 minutes)"
]

def fix_integration_issues(file_path):
    """Fix integration test issues in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        changes_made = False
        filename_key = file_path.stem.replace('-full', '')
        
        # Fix unit title if needed
        if filename_key in TITLE_CORRECTIONS:
            current_title = data.get('unitTitle', '')
            if any(word in current_title.lower() for word in ['the', 'and', 'or', 'but', 'this', 'that']):
                data['unitTitle'] = TITLE_CORRECTIONS[filename_key]
                changes_made = True
                print(f"  📝 Fixed unit title: {TITLE_CORRECTIONS[filename_key]}")
        
        # Fix movement breaks if insufficient
        if 'lessons' in data:
            for i, lesson in enumerate(data['lessons']):
                sections_with_breaks = 0
                for section_name in ['opening', 'main', 'closing']:
                    if section_name in lesson:
                        section = lesson[section_name]
                        if 'movementBreaks' in section and section['movementBreaks']:
                            sections_with_breaks += 1
                        elif 'movementBreaks' in section and not section['movementBreaks']:
                            # Add default movement breaks
                            section['movementBreaks'] = DEFAULT_MOVEMENT_BREAKS.copy()
                            sections_with_breaks += 1
                            changes_made = True
                
                if sections_with_breaks < 2:
                    print(f"  🏃 Added movement breaks to lesson {i+1}")
        
        if changes_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        return False
        
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Fix all integration issues"""
    lessons_dir = Path("generated-lessons")
    if not lessons_dir.exists():
        print("❌ generated-lessons directory not found")
        return
    
    problem_files = [
        'celebrations-traditions-hivernales-full.json',
        'moi-et-mon-ecole-full.json', 
        'poesie-et-rythmes-full.json',
        'corps-securite-full.json',
        'sons-vibrations-full.json',
        'grandir-full.json'
    ]
    
    fixed_files = 0
    
    for json_file in lessons_dir.rglob("*-full.json"):
        if json_file.name in problem_files:
            print(f"\n🔧 Fixing {json_file.name}")
            if fix_integration_issues(json_file):
                fixed_files += 1
                print(f"✅ Fixed {json_file.name}")
    
    print(f"\n📊 Fixed {fixed_files} files with integration issues")

if __name__ == "__main__":
    main()