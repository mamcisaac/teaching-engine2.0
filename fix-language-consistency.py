#!/usr/bin/env python3
"""
Fix language consistency issues in lesson files
Replace English phrases with proper French equivalents
"""
import json
import os
import re

# Define replacements for common mixed language issues
LANGUAGE_REPLACEMENTS = {
    # Common English phrases to French
    "and respond": "et répondre",
    "the teacher": "l'enseignant(e)",
    "can identify": "peut identifier",
    "will be able": "sera capable de",
    "will be able to": "sera capable de",
    "Les élèves pourront reconnaître and respond": "Les élèves pourront reconnaître et répondre",
    "can recognize": "peut reconnaître",
    "and understand": "et comprendre",
    "and use": "et utiliser",
    "and create": "et créer",
    "and express": "et exprimer",
    "and participate": "et participer",
    "and appreciate": "et apprécier",
    "and develop": "et développer",
    "and demonstrate": "et démontrer",
    "and apply": "et appliquer",
    "and explore": "et explorer",
    "and share": "et partager",
    "and communicate": "et communiquer",
    "and collaborate": "et collaborer",
    "and practice": "et pratiquer",
    "and observe": "et observer",
    "and describe": "et décrire",
    "and compare": "et comparer",
    "and classify": "et classifier",
    "and analyze": "et analyser",
    "and evaluate": "et évaluer",
    "and reflect": "et réfléchir",
    "and connect": "et connecter",
    "and integrate": "et intégrer",
    "and adapt": "et adapter",
    "and modify": "et modifier",
    "and improve": "et améliorer",
    "and support": "et soutenir",
    "and encourage": "et encourager",
    "and guide": "et guider",
    "and facilitate": "et faciliter",
    "and assess": "et évaluer",
    "and document": "et documenter",
    "and plan": "et planifier",
    "and organize": "et organiser",
    "and prepare": "et préparer",
    "and implement": "et implémenter",
    "and manage": "et gérer",
    "and maintain": "et maintenir",
    "and monitor": "et surveiller",
    "and adjust": "et ajuster",
    "and differentiate": "et différencier",
    "and scaffold": "et échafauder",
    "and extend": "et étendre",
    "and reinforce": "et renforcer",
    "and review": "et réviser",
    "and consolidate": "et consolider",
    "and synthesize": "et synthétiser",
    "and summarize": "et résumer",
    "and conclude": "et conclure",
    "and celebrate": "et célébrer",
    
    # Other common mistakes
    "the student": "l'élève",
    "the students": "les élèves",
    "students will": "les élèves vont",
    "students can": "les élèves peuvent",
    "students are able": "les élèves sont capables",
    "teacher will": "l'enseignant(e) va",
    "teacher can": "l'enseignant(e) peut",
    "will learn": "va apprendre",
    "will understand": "va comprendre",
    "will develop": "va développer",
    "will practice": "va pratiquer",
    "will explore": "va explorer",
    "will create": "va créer",
    "will demonstrate": "va démontrer",
    "will participate": "va participer",
    "will share": "va partager",
    "will use": "va utiliser",
    
    # Common learning objectives phrases
    "Students will be able to": "Les élèves seront capables de",
    "The student will be able to": "L'élève sera capable de",
    "By the end of": "À la fin de",
    "At the end of": "À la fin de",
    "During this lesson": "Durant cette leçon",
    "In this lesson": "Dans cette leçon",
    "Through this activity": "À travers cette activité",
    "With support": "Avec du soutien",
    "With guidance": "Avec des conseils",
    "With help": "Avec de l'aide",
    "Independently": "De manière autonome",
    "In groups": "En groupes",
    "In pairs": "En paires",
    "As a class": "En classe entière",
    "Individually": "Individuellement",
    
    # Assessment language
    "Formative assessment": "Évaluation formative",
    "Summative assessment": "Évaluation sommative",
    "Self-assessment": "Auto-évaluation",
    "Peer assessment": "Évaluation par les pairs",
    "Portfolio assessment": "Évaluation du portfolio",
    "Performance assessment": "Évaluation de performance",
    "Observation notes": "Notes d'observation",
    "Anecdotal records": "Dossiers anecdotiques",
    "Rubric": "Grille d'évaluation",
    "Checklist": "Liste de contrôle",
    "Success criteria": "Critères de réussite",
    "Learning goals": "Objectifs d'apprentissage",
    
    # Differentiation language
    "For struggling students": "Pour les élèves en difficulté",
    "For advanced students": "Pour les élèves avancés",
    "For English language learners": "Pour les apprenants de langue anglaise",
    "For students with special needs": "Pour les élèves ayant des besoins particuliers",
    "Differentiation strategies": "Stratégies de différenciation",
    "Accommodation": "Accommodation",
    "Modification": "Modification",
    "Extension activities": "Activités d'enrichissement",
    "Support strategies": "Stratégies de soutien",
    "Scaffolding": "Échafaudage"
}

def fix_language_in_string(text):
    """Fix language consistency in a string"""
    if not isinstance(text, str):
        return text
    
    fixed_text = text
    for english, french in LANGUAGE_REPLACEMENTS.items():
        # Case-insensitive replacement while preserving original case where possible
        pattern = re.compile(re.escape(english), re.IGNORECASE)
        fixed_text = pattern.sub(french, fixed_text)
    
    return fixed_text

def fix_language_in_object(obj):
    """Recursively fix language in any JSON object"""
    if isinstance(obj, dict):
        return {k: fix_language_in_object(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [fix_language_in_object(item) for item in obj]
    elif isinstance(obj, str):
        return fix_language_in_string(obj)
    else:
        return obj

def fix_file_language(filename):
    """Fix language consistency in a single file"""
    print(f"\n📝 Processing: {os.path.basename(filename)}")
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error: {e}")
        return 0
    
    # Count replacements
    original_str = json.dumps(data, ensure_ascii=False)
    
    # Fix language throughout the entire data structure
    fixed_data = fix_language_in_object(data)
    
    # Count how many replacements were made
    fixed_str = json.dumps(fixed_data, ensure_ascii=False)
    changes = 0
    for english in LANGUAGE_REPLACEMENTS.keys():
        changes += original_str.lower().count(english.lower()) - fixed_str.lower().count(english.lower())
    
    if changes > 0:
        # Save the fixed file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(fixed_data, f, ensure_ascii=False, indent=2)
        print(f"✅ Fixed approximately {changes} language inconsistencies")
    else:
        print(f"ℹ️ No language issues found")
    
    return changes

def main():
    """Main function to fix language consistency"""
    print("="*60)
    print("🌐 FIXING LANGUAGE CONSISTENCY")
    print("="*60)
    
    total_changes = 0
    files_fixed = 0
    
    # Process all JSON files in generated-lessons
    for root, dirs, files in os.walk('generated-lessons'):
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(root, file)
                changes = fix_file_language(filepath)
                if changes > 0:
                    files_fixed += 1
                    total_changes += changes
    
    # Final summary
    print("\n" + "="*60)
    print(f"🎉 COMPLETE! Fixed {total_changes} language issues in {files_fixed} files")
    print("="*60)
    
    # Verify by checking for remaining English phrases
    print("\n📊 Checking for remaining English phrases...")
    remaining_issues = 0
    for root, dirs, files in os.walk('generated-lessons'):
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        for english in ["and respond", "the teacher", "can identify", "will be able"]:
                            if english.lower() in content.lower():
                                count = content.lower().count(english.lower())
                                if count > 0:
                                    remaining_issues += count
                                    print(f"  ⚠️ Found '{english}' {count}x in {os.path.basename(filepath)}")
                except:
                    pass
    
    if remaining_issues == 0:
        print("✅ All major language consistency issues resolved!")
    else:
        print(f"⚠️ {remaining_issues} English phrases may still remain")

if __name__ == "__main__":
    main()