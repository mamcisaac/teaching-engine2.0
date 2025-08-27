#!/usr/bin/env python3
"""
Agent 1: Lesson Comprehension Agent
Purpose: Deep understanding of each lesson's unique pedagogical intent
No parent donations - all materials must be school-provided or free
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

class LessonComprehensionAgent:
    """Analyzes lessons to extract specific material requirements"""
    
    def __init__(self):
        self.current_lesson = None
        self.specification = {}
        
    def analyze_lesson(self, lesson_data: Dict[str, Any]) -> Dict[str, Any]:
        """Deep analysis of lesson to understand material needs"""
        
        self.current_lesson = lesson_data
        self.specification = {
            "lessonTitle": "",
            "specificObjective": "",
            "uniqueAspects": "",
            "actualActivities": [],
            "cognitiveProcess": "",
            "materialNeeds": {
                "primary": [],
                "quantities": {},
                "rationale": {},
                "preparation": []
            }
        }
        
        # Extract lesson identity
        self._extract_lesson_identity()
        
        # Analyze pedagogical intent
        self._analyze_pedagogical_intent()
        
        # Extract actual activities
        self._extract_activities()
        
        # Determine specific material needs
        self._determine_material_needs()
        
        # Calculate appropriate quantities
        self._calculate_quantities()
        
        return self.specification
    
    def _extract_lesson_identity(self):
        """Extract basic lesson information"""
        
        # Handle different JSON structures
        if 'title' in self.current_lesson:
            self.specification['lessonTitle'] = self.current_lesson['title']
        elif 'lessonTitle' in self.current_lesson:
            self.specification['lessonTitle'] = self.current_lesson['lessonTitle']
            
        if 'oneGoal' in self.current_lesson:
            self.specification['specificObjective'] = self.current_lesson['oneGoal']
        elif 'goal' in self.current_lesson:
            self.specification['specificObjective'] = self.current_lesson['goal']
        elif 'focus' in self.current_lesson:
            self.specification['specificObjective'] = self.current_lesson['focus']
    
    def _analyze_pedagogical_intent(self):
        """Understand what cognitive process is being developed"""
        
        objective = self.specification['specificObjective'].lower()
        
        # Identify cognitive process
        if 'compter' in objective or 'dénombrer' in objective:
            self.specification['cognitiveProcess'] = 'counting_enumeration'
        elif 'regrouper' in objective or 'grouper' in objective:
            self.specification['cognitiveProcess'] = 'grouping_classification'
        elif 'mesurer' in objective:
            self.specification['cognitiveProcess'] = 'measurement_comparison'
        elif 'créer' in objective or 'fabriquer' in objective:
            self.specification['cognitiveProcess'] = 'creative_production'
        elif 'explorer' in objective or 'découvrir' in objective:
            self.specification['cognitiveProcess'] = 'exploration_discovery'
        elif 'observer' in objective:
            self.specification['cognitiveProcess'] = 'observation_analysis'
        elif 'pratiquer' in objective or 'répéter' in objective:
            self.specification['cognitiveProcess'] = 'practice_automaticity'
        elif 'résoudre' in objective:
            self.specification['cognitiveProcess'] = 'problem_solving'
        else:
            self.specification['cognitiveProcess'] = 'general_learning'
        
        # Identify unique aspects
        if 'progression' in self.current_lesson:
            progression = self.current_lesson['progression']
            # Extract what makes this lesson unique from its progression description
            unique_match = re.search(r'but\s+([^.]+)', progression)
            if unique_match:
                self.specification['uniqueAspects'] = unique_match.group(1).strip()
    
    def _extract_activities(self):
        """Extract actual activities from lesson structure"""
        
        activities = []
        
        # Check for three-part lesson structure
        if 'mindsOn' in self.current_lesson:
            if 'activity' in self.current_lesson['mindsOn']:
                activities.append(f"Minds On: {self.current_lesson['mindsOn']['activity']}")
                
        if 'action' in self.current_lesson:
            if 'activity' in self.current_lesson['action']:
                activities.append(f"Action: {self.current_lesson['action']['activity']}")
            elif 'activities' in self.current_lesson['action']:
                for act in self.current_lesson['action']['activities']:
                    activities.append(f"Action: {act}")
                    
        if 'consolidation' in self.current_lesson:
            if 'activity' in self.current_lesson['consolidation']:
                activities.append(f"Consolidation: {self.current_lesson['consolidation']['activity']}")
        
        # Also check for activity descriptions in other fields
        if 'activities' in self.current_lesson:
            activities.extend(self.current_lesson['activities'])
            
        self.specification['actualActivities'] = activities
    
    def _determine_material_needs(self):
        """Determine specific materials based on actual activities"""
        
        materials = {
            "primary": [],
            "quantities": {},
            "rationale": {},
            "preparation": []
        }
        
        # Analyze each activity for material needs
        for activity in self.specification['actualActivities']:
            activity_lower = activity.lower()
            
            # COUNTING/MATH ACTIVITIES
            if 'compter' in activity_lower or 'dénombrer' in activity_lower:
                if 'doigts' in activity_lower or 'mains' in activity_lower:
                    # Using fingers/hands - no materials needed
                    materials['primary'].append("Mains des élèves (aucun matériel)")
                elif 'objets' in activity_lower and 'classe' in activity_lower:
                    # Counting classroom objects
                    materials['primary'].append("Objets de la classe (crayons, livres, chaises)")
                    materials['rationale']['Objets de la classe'] = "Utilise l'environnement immédiat, gratuit"
                elif 'regrouper' in activity_lower or 'grouper' in activity_lower:
                    # Grouping activities need sortable items
                    materials['primary'].append("Collection de boutons du matériel de math")
                    materials['quantities']['boutons'] = "60 (pour groupes de 2,3,4,5)"
                    materials['rationale']['boutons'] = "Permettent regroupement flexible"
                else:
                    # General counting
                    materials['primary'].append("Jetons de comptage du kit de math")
                    materials['quantities']['jetons'] = "30 par élève"
                    
            # MEASUREMENT ACTIVITIES
            elif 'mesurer' in activity_lower:
                if 'trombones' in activity_lower:
                    materials['primary'].append("Trombones de bureau")
                    materials['quantities']['trombones'] = "50 par paire d'élèves"
                elif 'cubes' in activity_lower:
                    materials['primary'].append("Cubes emboîtables du kit de math")
                    materials['quantities']['cubes'] = "20 par élève"
                elif 'pas' in activity_lower:
                    materials['primary'].append("Pieds des élèves (aucun matériel)")
                else:
                    materials['primary'].append("Objets non-standards (gommes, crayons)")
                    
            # ART/CREATIVE ACTIVITIES
            elif 'imprimer' in activity_lower or 'impression' in activity_lower:
                if 'légumes' in activity_lower or 'pomme' in activity_lower:
                    materials['primary'].append("Pommes de terre de la cafétéria (coupées)")
                    materials['quantities']['pommes de terre'] = "5 (coupées en moitiés)"
                    materials['preparation'].append("Demander 5 pommes de terre à la cafétéria la veille")
                elif 'feuilles' in activity_lower or 'nature' in activity_lower:
                    materials['primary'].append("Feuilles ramassées dans la cour d'école")
                    materials['preparation'].append("Ramasser feuilles avec élèves durant récréation précédente")
                elif 'éponges' in activity_lower:
                    materials['primary'].append("Éponges de nettoyage découpées")
                    materials['quantities']['éponges'] = "3 éponges découpées en formes"
                    materials['preparation'].append("Découper éponges en formes géométriques")
                else:
                    materials['primary'].append("Tampons en mousse du matériel d'art")
                    
            # EXPLORATION/OBSERVATION
            elif 'observer' in activity_lower or 'explorer' in activity_lower:
                if 'texture' in activity_lower:
                    materials['primary'].append("Collection de textures (papier, tissu, carton)")
                    materials['preparation'].append("Collecter échantillons de textures variées")
                elif 'couleur' in activity_lower:
                    materials['primary'].append("Objets colorés de la classe")
                elif 'forme' in activity_lower:
                    materials['primary'].append("Blocs de formes géométriques")
                else:
                    materials['primary'].append("Objets variés pour exploration")
                    
            # WRITING/DRAWING
            elif 'écrire' in activity_lower or 'dessiner' in activity_lower:
                materials['primary'].append("Papier et crayons")
                materials['quantities']['papier'] = "1 feuille par élève"
                materials['quantities']['crayons'] = "Boîte de crayons de classe"
                
            # MUSIC/RHYTHM
            elif 'rythme' in activity_lower or 'musique' in activity_lower:
                materials['primary'].append("Instruments de percussion simples (maracas maison)")
                materials['preparation'].append("Contenants avec riz/haricots secs de cafétéria")
                
        self.specification['materialNeeds'] = materials
    
    def _calculate_quantities(self):
        """Calculate appropriate quantities for class of 25"""
        
        # Default class size
        class_size = 25
        
        # Adjust quantities based on activity type
        if self.specification['cognitiveProcess'] == 'counting_enumeration':
            # Need enough for each student to count to target number
            if 'jusqu\'à 10' in self.specification['specificObjective']:
                base_quantity = 15  # Extra for dropping/losing
            elif 'jusqu\'à 20' in self.specification['specificObjective']:
                base_quantity = 25
            else:
                base_quantity = 10
                
            # Adjust for individual vs group work
            if 'paires' in str(self.specification['actualActivities']):
                total = base_quantity * 13  # For pairs
            else:
                total = base_quantity * class_size
                
            self.specification['materialNeeds']['quantities']['base'] = total
            
        elif self.specification['cognitiveProcess'] == 'creative_production':
            # Art materials - usually shared
            self.specification['materialNeeds']['quantities']['shared'] = "Matériel partagé par tables de 4"
            
        # Add buffer for breakage/loss (only for non-consumables)
        for item, quantity in self.specification['materialNeeds']['quantities'].items():
            if isinstance(quantity, int):
                self.specification['materialNeeds']['quantities'][item] = int(quantity * 1.1)
    
    def save_specification(self, output_path: str):
        """Save the material specification to file"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.specification, f, ensure_ascii=False, indent=2)
    
    def validate_no_parent_donations(self) -> bool:
        """Ensure no materials require parent donations"""
        
        forbidden_terms = ['parent', 'donation', 'apporter', 'maison', 'demander aux parents']
        
        spec_string = json.dumps(self.specification, ensure_ascii=False).lower()
        
        for term in forbidden_terms:
            if term in spec_string:
                return False
                
        return True

def main():
    """Process a lesson file"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python agent-1-lesson-comprehension.py <lesson_file.json>")
        sys.exit(1)
    
    lesson_file = sys.argv[1]
    
    # Load lesson data
    with open(lesson_file, 'r', encoding='utf-8') as f:
        lesson_data = json.load(f)
    
    # Create agent and analyze
    agent = LessonComprehensionAgent()
    specification = agent.analyze_lesson(lesson_data)
    
    # Validate no parent donations
    if not agent.validate_no_parent_donations():
        print("ERROR: Materials require parent donations!")
        sys.exit(1)
    
    # Save specification
    output_file = str(lesson_file).replace('.json', '-spec.json')
    agent.save_specification(output_file)
    
    print(f"Material specification saved to: {output_file}")
    print(json.dumps(specification, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()