#!/usr/bin/env python3
"""
Fix remaining ETFO compliance issues
"""

import json
from pathlib import Path

# Default goals by subject
DEFAULT_GOALS = {
    'francais': "Développer les compétences en français et exprimer ses idées avec confiance",
    'mathematiques': "Comprendre les concepts mathématiques et appliquer les stratégies de résolution",
    'sciences': "Explorer le monde scientifique et développer la curiosité naturelle", 
    'sciences-humaines': "Explorer notre communauté et développer le sentiment d'appartenance",
    'arts-visuels': "Exprimer sa créativité et développer l'appréciation artistique",
    'formation-personnelle': "Développer des habitudes saines et des relations positives"
}

# Default vocabulary by subject  
DEFAULT_VOCABULARY = {
    'francais': ["mot", "phrase", "histoire", "lire", "écrire"],
    'mathematiques': ["nombre", "compter", "plus", "moins", "forme"],
    'sciences': ["observer", "découvrir", "nature", "grandir", "changer"],
    'sciences-humaines': ["famille", "maison", "école", "communauté", "partager"],
    'arts-visuels': ["couleur", "forme", "créer", "dessiner", "beau"],
    'formation-personnelle': ["ami", "gentil", "sain", "grandir", "heureux"]
}

def get_subject_key(subject):
    """Get subject key for defaults"""
    subject_lower = subject.lower()
    if 'francais' in subject_lower:
        return 'francais'
    elif 'mathématiques' in subject_lower:
        return 'mathematiques'
    elif 'sciences humaines' in subject_lower:
        return 'sciences-humaines'
    elif 'sciences' in subject_lower:
        return 'sciences'
    elif 'arts' in subject_lower:
        return 'arts-visuels'
    elif 'formation' in subject_lower:
        return 'formation-personnelle'
    else:
        return 'francais'

def fix_compliance_issues(file_path):
    """Fix compliance issues in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'lessons' not in data:
            return False
        
        subject_key = get_subject_key(data.get('subject', ''))
        changes_made = False
        
        for lesson in data['lessons']:
            # Fix empty oneGoal
            if 'oneGoal' not in lesson or not lesson['oneGoal'].strip():
                lesson['oneGoal'] = DEFAULT_GOALS.get(subject_key, DEFAULT_GOALS['francais'])
                changes_made = True
            
            # Fix empty keyVocabulary
            if 'keyVocabulary' not in lesson or not lesson['keyVocabulary']:
                lesson['keyVocabulary'] = DEFAULT_VOCABULARY.get(subject_key, DEFAULT_VOCABULARY['francais'])
                changes_made = True
        
        if changes_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ Fixed {file_path.name}")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Fix all compliance issues"""
    lessons_dir = Path("generated-lessons")
    if not lessons_dir.exists():
        print("❌ generated-lessons directory not found")
        return
    
    fixed_files = 0
    
    for json_file in lessons_dir.rglob("*-full.json"):
        if ".backup" in str(json_file):
            continue
        
        if fix_compliance_issues(json_file):
            fixed_files += 1
    
    print(f"\n📊 Fixed {fixed_files} files")

if __name__ == "__main__":
    main()