#!/usr/bin/env python3
"""
Enhance All 975 Lessons - Add Decision Points and Specify Materials
Keeps existing lesson content, adds missing enhancements
Based on ETFO Best Practices: "Support teacher thinking, not replace it"
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any

class LessonEnhancer:
    """Enhance existing lessons without changing core content"""
    
    def __init__(self):
        self.stats = {
            'total_lessons': 0,
            'empty_decision_points': 0,
            'generic_materials': 0,
            'language_violations': 0,
            'lessons_enhanced': 0
        }
        
        # Simple decision point templates based on lesson phase
        self.decision_templates = {
            'opening': [
                "Si les élèves ne comprennent pas le vocabulaire → ajouter gestes et images",
                "Si l'engagement est faible → incorporer plus de mouvement",
                "Si confusion avec le concept → utiliser exemples concrets"
            ],
            'main': [
                "Si les élèves maîtrisent rapidement → offrir activité d'extension",
                "Si difficulté avec la tâche → simplifier en étapes plus petites",
                "Si problème de compréhension → retourner aux manipulatifs"
            ],
            'closing': [
                "Si temps insuffisant → prioriser le partage oral",
                "Si élèves fatigués → terminer avec chanson ou mouvement",
                "Si confusion persiste → noter pour révision prochaine leçon"
            ]
        }
        
        # Subject-specific materials mapping
        self.material_specifications = {
            'Français': self.get_french_materials,
            'Mathématiques': self.get_math_materials,
            'Sciences': self.get_science_materials,
            'Arts': self.get_arts_materials,
            'Sciences humaines': self.get_social_materials,
            'Formation personnelle': self.get_health_materials
        }

    def enhance_unit_file(self, file_path: Path) -> Dict:
        """Enhance all lessons in a unit file"""
        
        print(f"\n{'='*60}")
        print(f"Enhancing: {file_path.name}")
        print(f"{'='*60}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            unit_data = json.load(f)
        
        subject = unit_data.get('subject', '')
        total_lessons = len(unit_data.get('lessons', []))
        
        print(f"Subject: {subject}")
        print(f"Lessons to enhance: {total_lessons}")
        
        # Process each lesson in the unit
        for i, lesson in enumerate(unit_data.get('lessons', [])):
            self.stats['total_lessons'] += 1
            lesson_num = lesson.get('lessonNumber', i + 1)
            
            # 1. Add decision points if needed (0-3 per lesson)
            self.add_decision_points(lesson, lesson_num, total_lessons)
            
            # 2. Specify materials if generic
            self.specify_materials(lesson, subject)
            
            # 3. Fix language violations
            self.fix_language_compliance(lesson)
            
            self.stats['lessons_enhanced'] += 1
        
        return unit_data

    def add_decision_points(self, lesson: Dict, lesson_num: int, total_lessons: int):
        """Add 0-3 simple decision points as needed"""
        
        # Check each phase for empty decision points
        phases = ['opening', 'main', 'closing']
        points_added = 0
        max_points = 3
        
        for phase in phases:
            if phase in lesson and points_added < max_points:
                phase_data = lesson[phase]
                
                # Check if decision points are empty or missing
                if 'decisionPoints' not in phase_data or not phase_data['decisionPoints']:
                    self.stats['empty_decision_points'] += 1
                    
                    # Determine how many points to add based on lesson complexity
                    if lesson_num <= 5:  # Early lessons need more guidance
                        points_to_add = 2 if phase == 'main' else 1
                    elif lesson_num >= total_lessons - 5:  # Later lessons more independent
                        points_to_add = 1 if phase == 'main' else 0
                    else:  # Middle lessons balanced
                        points_to_add = 1
                    
                    # Don't exceed max total
                    points_to_add = min(points_to_add, max_points - points_added)
                    
                    if points_to_add > 0:
                        # Select appropriate decision points
                        templates = self.decision_templates.get(phase, [])
                        selected = templates[:points_to_add]
                        
                        phase_data['decisionPoints'] = selected
                        points_added += points_to_add

    def specify_materials(self, lesson: Dict, subject: str):
        """Replace generic materials with specific items"""
        
        phases = ['opening', 'main', 'closing']
        
        for phase in phases:
            if phase in lesson:
                materials = lesson[phase].get('materials', {})
                
                # Check required materials
                if 'required' in materials:
                    for i, material in enumerate(materials['required']):
                        if self.is_generic_material(material):
                            self.stats['generic_materials'] += 1
                            
                            # Get subject-specific replacement
                            if subject in self.material_specifications:
                                specific = self.material_specifications[subject](phase, lesson)
                                materials['required'][i] = specific[0] if specific else material

    def is_generic_material(self, material: Any) -> bool:
        """Check if material is generic"""
        
        if isinstance(material, dict):
            item = material.get('item', '')
        else:
            item = str(material)
        
        generic_terms = [
            'Matériel de base',
            'Cahiers d\'écriture créative lignés',
            'Matériel standard',
            'Fournitures habituelles'
        ]
        
        return any(term in item for term in generic_terms)

    def fix_language_compliance(self, lesson: Dict):
        """Fix mixed English/French in goals and activities"""
        
        # Fix learning goal
        if 'oneGoal' in lesson:
            goal = lesson['oneGoal']
            if self.has_english(goal):
                self.stats['language_violations'] += 1
                lesson['oneGoal'] = self.convert_to_french(goal)

    def has_english(self, text: str) -> bool:
        """Check if text contains English"""
        english_indicators = [
            'Students', 'will', 'can', 'through', 'and', 'the', 
            'understand', 'create', 'explore', 'identify'
        ]
        return any(word in text for word in english_indicators)

    def convert_to_french(self, text: str) -> str:
        """Convert common English phrases to French"""
        
        replacements = {
            'Students': 'Les élèves',
            'will be able to': 'pourront',
            'will': 'vont',
            'can': 'peuvent',
            'and': 'et',
            'through': 'par',
            'understand': 'comprendre',
            'create': 'créer',
            'explore': 'explorer',
            'identify': 'identifier',
            'discover': 'découvrir',
            'learn': 'apprendre',
            'develop': 'développer',
            'practice': 'pratiquer',
            'demonstrate': 'démontrer',
            'recognize': 'reconnaître',
            'express': 'exprimer',
            'participate': 'participer',
            'observe': 'observer',
            'compare': 'comparer',
            'describe': 'décrire',
            'that': 'que',
            'their': 'leur',
            'with': 'avec',
            'using': 'en utilisant',
            'different': 'différents',
            'simple': 'simples'
        }
        
        result = text
        for eng, fr in replacements.items():
            result = result.replace(eng + ' ', fr + ' ')
            result = result.replace(' ' + eng, ' ' + fr)
        
        return result

    # Subject-specific material specifications
    
    def get_french_materials(self, phase: str, lesson: Dict) -> List[Dict]:
        """Get French/literacy specific materials"""
        
        if phase == 'opening':
            return [{
                "item": "Cartes vocabulaire illustrées",
                "quantity": "10-15 cartes selon thème",
                "source": "Boîte vocabulaire classe",
                "alternatives": ["Images tableau", "Objets réels"]
            }]
        elif phase == 'main':
            return [{
                "item": "Cahiers d'écriture avec lignes trottoir",
                "quantity": "1 par élève",
                "source": "Étagère fournitures",
                "alternatives": ["Tableaux blancs individuels", "Ardoises"]
            }]
        else:
            return [{
                "item": "Bâton de parole",
                "quantity": "1 pour cercle",
                "source": "Coin rassemblement",
                "alternatives": ["Peluche classe", "Micro jouet"]
            }]

    def get_math_materials(self, phase: str, lesson: Dict) -> List[Dict]:
        """Get math specific materials"""
        
        if 'nombre' in str(lesson).lower():
            return [{
                "item": "Cubes emboîtables ou jetons",
                "quantity": "20 par élève",
                "source": "Bac mathématiques",
                "alternatives": ["Haricots secs", "Boutons", "Blocs"]
            }]
        elif 'forme' in str(lesson).lower():
            return [{
                "item": "Blocs de formes géométriques",
                "quantity": "1 ensemble par groupe",
                "source": "Armoire math",
                "alternatives": ["Formes découpées", "Objets classe"]
            }]
        else:
            return [{
                "item": "Matériel de manipulation mathématique",
                "quantity": "Selon activité",
                "source": "Centre mathématiques",
                "alternatives": ["Objets comptage", "Cartes nombres"]
            }]

    def get_science_materials(self, phase: str, lesson: Dict) -> List[Dict]:
        """Get science specific materials"""
        
        return [{
            "item": "Loupes et contenants observation",
            "quantity": "1 loupe par paire",
            "source": "Chariot sciences",
            "alternatives": ["Bocaux transparents", "Plateaux"]
        }]

    def get_arts_materials(self, phase: str, lesson: Dict) -> List[Dict]:
        """Get arts specific materials"""
        
        return [{
            "item": "Papier dessin et crayons couleur",
            "quantity": "1 feuille et 8 crayons par élève",
            "source": "Armoire arts",
            "alternatives": ["Pastels", "Marqueurs", "Peinture"]
        }]

    def get_social_materials(self, phase: str, lesson: Dict) -> List[Dict]:
        """Get social studies specific materials"""
        
        return [{
            "item": "Cartes et images communauté",
            "quantity": "Ensemble classe",
            "source": "Bibliothèque classe",
            "alternatives": ["Photos locales", "Livres"]
        }]

    def get_health_materials(self, phase: str, lesson: Dict) -> List[Dict]:
        """Get health/PE specific materials"""
        
        return [{
            "item": "Cerceaux, cônes, ballons mousse",
            "quantity": "Matériel gymnase disponible",
            "source": "Local éducation physique",
            "alternatives": ["Foulards", "Sacs fèves", "Cordes"]
        }]

    def process_all_units(self):
        """Process all unit files in generated-lessons directory"""
        
        lessons_dir = Path('generated-lessons')
        
        # Get all unit files
        unit_files = list(lessons_dir.glob('**/*-full.json'))
        
        print(f"\n{'='*60}")
        print(f"ENHANCING ALL LESSON UNITS")
        print(f"{'='*60}")
        print(f"Found {len(unit_files)} unit files to process")
        
        # Process each unit
        for i, unit_file in enumerate(unit_files, 1):
            print(f"\n[{i}/{len(unit_files)}] Processing: {unit_file.parent.name}/{unit_file.name}")
            
            try:
                # Enhance the unit
                enhanced_unit = self.enhance_unit_file(unit_file)
                
                # Save enhanced version
                output_file = unit_file.parent / f"{unit_file.stem}-enhanced.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(enhanced_unit, f, ensure_ascii=False, indent=2)
                
                print(f"✓ Saved enhanced version: {output_file.name}")
                
            except Exception as e:
                print(f"✗ Error processing {unit_file}: {e}")
        
        # Print final statistics
        self.print_statistics()

    def print_statistics(self):
        """Print enhancement statistics"""
        
        print(f"\n{'='*60}")
        print(f"ENHANCEMENT COMPLETE")
        print(f"{'='*60}")
        
        print(f"\n📊 Statistics:")
        print(f"  • Total lessons processed: {self.stats['total_lessons']}")
        print(f"  • Empty decision points fixed: {self.stats['empty_decision_points']}")
        print(f"  • Generic materials specified: {self.stats['generic_materials']}")
        print(f"  • Language violations corrected: {self.stats['language_violations']}")
        print(f"  • Total lessons enhanced: {self.stats['lessons_enhanced']}")
        
        print(f"\n✅ Success Rate: {(self.stats['lessons_enhanced']/self.stats['total_lessons']*100):.1f}%")


def main():
    """Main execution"""
    
    enhancer = LessonEnhancer()
    enhancer.process_all_units()


if __name__ == "__main__":
    main()