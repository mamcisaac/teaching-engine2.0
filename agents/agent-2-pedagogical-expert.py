#!/usr/bin/env python3
"""
Agent 2: Grade 1 Pedagogical Expert
Purpose: Apply developmental appropriateness and best practices
No parent donations - focuses on school-available materials only
"""

import json
from typing import Dict, List, Any, Optional
import sys

class PedagogicalExpertAgent:
    """Applies Grade 1 developmental best practices to material specifications"""
    
    def __init__(self):
        self.specification = {}
        self.enhanced_spec = {}
        
        # Grade 1 developmental characteristics
        self.grade1_profile = {
            "age_range": "6-7 years",
            "attention_span": "15-20 minutes",
            "cognitive_stage": "concrete_operational",
            "fine_motor": "developing",
            "safety_requirements": {
                "min_size": "3cm diameter",
                "no_sharp_edges": True,
                "non_toxic": True,
                "washable": True
            },
            "social_development": "parallel_to_cooperative_play",
            "learning_styles": ["visual", "kinesthetic", "auditory"]
        }
    
    def enhance_specification(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance material specification with pedagogical best practices"""
        
        self.specification = spec
        self.enhanced_spec = spec.copy()
        
        # Add developmental appropriateness check
        self.enhanced_spec['developmentalCheck'] = self._check_developmental_appropriateness()
        
        # Add safety verification
        self.enhanced_spec['safetyVerification'] = self._verify_safety()
        
        # Add differentiation options
        self.enhanced_spec['differentiationOptions'] = self._create_differentiation()
        
        # Add multi-sensory supports
        self.enhanced_spec['multiSensorySupports'] = self._add_multisensory()
        
        # Add inclusion supports
        self.enhanced_spec['inclusionSupports'] = self._add_inclusion_supports()
        
        # Add social learning opportunities
        self.enhanced_spec['socialLearning'] = self._add_social_learning()
        
        # Add Indigenous perspectives where appropriate
        self.enhanced_spec['indigenousPerspectives'] = self._add_indigenous_perspectives()
        
        return self.enhanced_spec
    
    def _check_developmental_appropriateness(self) -> Dict[str, Any]:
        """Check if materials are developmentally appropriate"""
        
        checks = {
            "ageAppropriate": True,
            "concreteManipulatives": False,
            "attentionSpanConsidered": False,
            "fineMotorAppropriate": True,
            "issues": []
        }
        
        # Check for concrete manipulatives
        materials = self.specification.get('materialNeeds', {}).get('primary', [])
        for material in materials:
            if any(word in material.lower() for word in ['objets', 'cubes', 'jetons', 'blocs', 'boutons']):
                checks['concreteManipulatives'] = True
                break
        
        # Check attention span consideration
        if 'quantities' in self.specification.get('materialNeeds', {}):
            checks['attentionSpanConsidered'] = True
        
        # Identify potential issues
        cognitive_process = self.specification.get('cognitiveProcess', '')
        if cognitive_process == 'abstract_reasoning':
            checks['issues'].append("Trop abstrait pour 6-7 ans - ajouter supports concrets")
            checks['ageAppropriate'] = False
        
        return checks
    
    def _verify_safety(self) -> Dict[str, Any]:
        """Verify safety of all materials"""
        
        safety = {
            "verified": True,
            "hazards": [],
            "modifications": []
        }
        
        materials = self.specification.get('materialNeeds', {}).get('primary', [])
        
        for material in materials:
            material_lower = material.lower()
            
            # Check for small parts
            if any(word in material_lower for word in ['perles', 'billes', 'petits']):
                safety['hazards'].append(f"Risque d'étouffement: {material}")
                safety['modifications'].append(f"Remplacer {material} par version plus grande (>3cm)")
                safety['verified'] = False
            
            # Check for sharp items
            if any(word in material_lower for word in ['ciseaux', 'aiguilles', 'épingles']):
                safety['hazards'].append(f"Objet tranchant: {material}")
                safety['modifications'].append(f"Utiliser ciseaux à bouts ronds sous supervision")
            
            # Check for allergens (if food items)
            if any(word in material_lower for word in ['arachides', 'noix', 'latex']):
                safety['hazards'].append(f"Allergène potentiel: {material}")
                safety['modifications'].append(f"Éviter {material}, utiliser alternative sans allergène")
                safety['verified'] = False
        
        return safety
    
    def _create_differentiation(self) -> Dict[str, List[str]]:
        """Create differentiation options for diverse learners"""
        
        differentiation = {
            "forStruggling": [],
            "onLevel": [],
            "forAdvanced": [],
            "forEAL": []  # English as Additional Language in French Immersion
        }
        
        cognitive_process = self.specification.get('cognitiveProcess', '')
        
        # Based on cognitive process, provide appropriate differentiation
        if cognitive_process == 'counting_enumeration':
            differentiation['forStruggling'] = [
                "Commencer avec quantités plus petites (1-5)",
                "Utiliser ligne de nombres visuelle",
                "Compter avec l'enseignant d'abord",
                "Objets plus gros et colorés"
            ]
            differentiation['onLevel'] = [
                "Quantités standards selon la leçon",
                "Travail en paires pour vérification",
                "Utilisation de la feuille de travail"
            ]
            differentiation['forAdvanced'] = [
                "Compter par bonds de 2",
                "Créer leurs propres problèmes",
                "Aider les pairs",
                "Défis supplémentaires avec nombres plus grands"
            ]
            differentiation['forEAL'] = [
                "Cartes visuelles pour chaque nombre",
                "Gestes pour compter",
                "Répétition avec partenaire francophone"
            ]
            
        elif cognitive_process == 'creative_production':
            differentiation['forStruggling'] = [
                "Modèles à suivre",
                "Étapes simplifiées avec images",
                "Aide individuelle au début",
                "Choix limités de matériaux"
            ]
            differentiation['onLevel'] = [
                "Instructions standards",
                "Liberté créative avec structure",
                "Partage avec la classe"
            ]
            differentiation['forAdvanced'] = [
                "Techniques additionnelles",
                "Projets plus complexes",
                "Création de tutoriels pour pairs",
                "Exploration de nouveaux matériaux"
            ]
            differentiation['forEAL'] = [
                "Démonstrations visuelles",
                "Vocabulaire illustré affiché",
                "Partenaire pour traduction au besoin"
            ]
            
        elif cognitive_process == 'exploration_discovery':
            differentiation['forStruggling'] = [
                "Exploration guidée avec questions",
                "Moins d'objets à explorer",
                "Plus de temps",
                "Journal d'images au lieu de mots"
            ]
            differentiation['onLevel'] = [
                "Exploration semi-structurée",
                "Questions ouvertes",
                "Journal d'observation"
            ]
            differentiation['forAdvanced'] = [
                "Hypothèses avant exploration",
                "Comparaisons complexes",
                "Présentation de découvertes",
                "Questions d'investigation supplémentaires"
            ]
            differentiation['forEAL'] = [
                "Mots-clés avec images",
                "Dessins acceptés pour observations",
                "Discussion en petit groupe d'abord"
            ]
        
        return differentiation
    
    def _add_multisensory(self) -> Dict[str, List[str]]:
        """Add multi-sensory learning supports"""
        
        supports = {
            "visual": [],
            "kinesthetic": [],
            "auditory": []
        }
        
        lesson_title = self.specification.get('lessonTitle', '')
        
        # Visual supports
        supports['visual'] = [
            "Tableau d'ancrage avec images",
            "Codes de couleur pour organisation",
            "Démonstration visuelle étape par étape"
        ]
        
        # Kinesthetic supports
        supports['kinesthetic'] = [
            "Manipulation directe des matériaux",
            "Mouvements corporels intégrés",
            "Stations de travail pratique"
        ]
        
        # Auditory supports
        supports['auditory'] = [
            "Comptines ou chansons liées au concept",
            "Instructions verbales claires",
            "Répétition chorale des mots-clés"
        ]
        
        # Add specific supports based on cognitive process
        cognitive_process = self.specification.get('cognitiveProcess', '')
        
        if cognitive_process == 'counting_enumeration':
            supports['auditory'].append("Chanson des nombres 1-10")
            supports['kinesthetic'].append("Sauter en comptant")
            supports['visual'].append("Ligne de nombres murale")
            
        elif cognitive_process == 'creative_production':
            supports['visual'].append("Exemples de projets finis")
            supports['kinesthetic'].append("Explorer textures avant création")
            supports['auditory'].append("Musique calme pendant création")
        
        return supports
    
    def _add_inclusion_supports(self) -> Dict[str, Any]:
        """Add supports for inclusive education"""
        
        inclusion = {
            "mobilitySupports": [
                "Matériaux accessibles à hauteur de fauteuil roulant",
                "Espaces de circulation larges",
                "Options pour travail assis ou debout"
            ],
            "visionSupports": [
                "Objets avec textures distinctes",
                "Matériaux de couleurs contrastées",
                "Grosses polices pour étiquettes"
            ],
            "hearingSupports": [
                "Instructions visuelles claires",
                "Gestes et signaux visuels",
                "Position face à la classe pour lecture labiale"
            ],
            "cognitiveSupports": [
                "Instructions en petites étapes",
                "Répétition et pratique supplémentaire",
                "Supports visuels permanents"
            ],
            "sensorySupports": [
                "Espace calme disponible",
                "Options de matériaux non-texturés",
                "Niveau sonore contrôlé"
            ]
        }
        
        return inclusion
    
    def _add_social_learning(self) -> Dict[str, List[str]]:
        """Add social learning opportunities"""
        
        social = {
            "pairWork": [],
            "smallGroup": [],
            "wholeClass": []
        }
        
        # Determine appropriate social configurations
        cognitive_process = self.specification.get('cognitiveProcess', '')
        
        if cognitive_process in ['counting_enumeration', 'measurement_comparison']:
            social['pairWork'] = [
                "Vérification mutuelle des comptages",
                "Comparaison des mesures",
                "Tour de rôle pour manipulation"
            ]
            social['smallGroup'] = [
                "Stations de comptage rotatives",
                "Jeux de math en équipes de 4"
            ]
            social['wholeClass'] = [
                "Comptage collectif",
                "Partage de stratégies"
            ]
            
        elif cognitive_process == 'creative_production':
            social['pairWork'] = [
                "Partage de matériaux",
                "Feedback constructif sur créations"
            ]
            social['smallGroup'] = [
                "Tables de création collaborative",
                "Projet de groupe"
            ]
            social['wholeClass'] = [
                "Galerie de classe",
                "Présentation des œuvres"
            ]
        
        return social
    
    def _add_indigenous_perspectives(self) -> Dict[str, Any]:
        """Add Indigenous perspectives where appropriate"""
        
        perspectives = {
            "relevant": False,
            "connections": [],
            "resources": []
        }
        
        lesson_title = self.specification.get('lessonTitle', '').lower()
        cognitive_process = self.specification.get('cognitiveProcess', '')
        
        # Check for natural connections
        if any(word in lesson_title for word in ['nature', 'saisons', 'animaux', 'plantes', 'terre']):
            perspectives['relevant'] = True
            perspectives['connections'] = [
                "Savoirs traditionnels Mi'kmaq sur la nature",
                "Cycles saisonniers selon traditions autochtones",
                "Respect de la Terre Mère"
            ]
            perspectives['resources'] = [
                "Inviter un Aîné Mi'kmaq (coordonner avec école)",
                "Utiliser matériaux naturels locaux",
                "Histoires traditionnelles appropriées"
            ]
            
        elif 'motif' in lesson_title or 'pattern' in lesson_title:
            perspectives['relevant'] = True
            perspectives['connections'] = [
                "Motifs traditionnels Mi'kmaq",
                "Art perlé autochtone",
                "Signification des motifs"
            ]
            perspectives['resources'] = [
                "Images de l'art Mi'kmaq (bibliothèque)",
                "Exemples de vannerie traditionnelle"
            ]
            
        elif cognitive_process == 'counting_enumeration':
            perspectives['relevant'] = True
            perspectives['connections'] = [
                "Systèmes de comptage traditionnels",
                "Utilisation de matériaux naturels pour compter"
            ]
            perspectives['resources'] = [
                "Coquillages ou pierres pour compter",
                "Histoires avec nombres (Seven Sacred Teachings adaptées)"
            ]
        
        return perspectives
    
    def save_enhanced_specification(self, output_path: str):
        """Save the enhanced specification"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.enhanced_spec, f, ensure_ascii=False, indent=2)
    
    def generate_report(self) -> str:
        """Generate a report of enhancements made"""
        
        report = []
        report.append("=== PEDAGOGICAL ENHANCEMENT REPORT ===\n")
        report.append(f"Lesson: {self.specification.get('lessonTitle', 'Unknown')}\n")
        report.append(f"Objective: {self.specification.get('specificObjective', 'Unknown')}\n\n")
        
        # Developmental check
        dev_check = self.enhanced_spec.get('developmentalCheck', {})
        report.append("DEVELOPMENTAL APPROPRIATENESS:\n")
        report.append(f"  ✓ Age appropriate: {dev_check.get('ageAppropriate', False)}\n")
        report.append(f"  ✓ Concrete manipulatives: {dev_check.get('concreteManipulatives', False)}\n")
        if dev_check.get('issues'):
            report.append(f"  ⚠ Issues: {', '.join(dev_check['issues'])}\n")
        
        # Safety check
        safety = self.enhanced_spec.get('safetyVerification', {})
        report.append("\nSAFETY VERIFICATION:\n")
        report.append(f"  ✓ Verified safe: {safety.get('verified', False)}\n")
        if safety.get('hazards'):
            report.append(f"  ⚠ Hazards: {', '.join(safety['hazards'])}\n")
        
        # Differentiation
        diff = self.enhanced_spec.get('differentiationOptions', {})
        report.append("\nDIFFERENTIATION PROVIDED:\n")
        report.append(f"  • For struggling: {len(diff.get('forStruggling', []))} strategies\n")
        report.append(f"  • On level: {len(diff.get('onLevel', []))} strategies\n")
        report.append(f"  • For advanced: {len(diff.get('forAdvanced', []))} strategies\n")
        report.append(f"  • For EAL: {len(diff.get('forEAL', []))} strategies\n")
        
        # Indigenous perspectives
        indigenous = self.enhanced_spec.get('indigenousPerspectives', {})
        if indigenous.get('relevant'):
            report.append("\nINDIGENOUS PERSPECTIVES:\n")
            report.append(f"  ✓ Connections identified: {len(indigenous.get('connections', []))}\n")
        
        return ''.join(report)

def main():
    """Process a specification file"""
    
    if len(sys.argv) < 2:
        print("Usage: python agent-2-pedagogical-expert.py <spec_file.json>")
        sys.exit(1)
    
    spec_file = sys.argv[1]
    
    # Load specification
    with open(spec_file, 'r', encoding='utf-8') as f:
        specification = json.load(f)
    
    # Create agent and enhance
    agent = PedagogicalExpertAgent()
    enhanced = agent.enhance_specification(specification)
    
    # Save enhanced specification  
    output_file = str(spec_file).replace('.json', '-enhanced.json')
    agent.save_enhanced_specification(output_file)
    
    # Print report
    print(agent.generate_report())
    print(f"\nEnhanced specification saved to: {output_file}")

if __name__ == "__main__":
    main()