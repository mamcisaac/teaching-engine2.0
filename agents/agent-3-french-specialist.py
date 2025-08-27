#!/usr/bin/env python3
"""
Agent 3: French Immersion Specialist
Purpose: Ensure authentic Canadian French and language support
Focus on PEI Acadian French context
"""

import json
import re
from typing import Dict, List, Any, Tuple
import sys

class FrenchImmersionSpecialist:
    """Ensures authentic Canadian French and proper immersion supports"""
    
    def __init__(self):
        self.enhanced_spec = {}
        self.language_enhanced = {}
        
        # Canadian French vs European French distinctions
        self.canadian_french = {
            # School supplies
            "blocks": "blocs",  # not "briques"
            "beads": "perles",  # not "billes"
            "markers": "marqueurs",  # not "feutres"
            "eraser": "gomme à effacer",  # not "gomme"
            "pencil case": "étui à crayons",  # not "trousse"
            "binder": "cartable",  # not "classeur"
            "tape": "ruban adhésif",  # not "scotch"
            "stapler": "agrafeuse",  # not "agrafeuse" (same but pronunciation differs)
            
            # Math terms
            "pattern": "régularité",  # not "motif" in math context
            "number line": "droite numérique",  # not "ligne des nombres"
            "counting": "dénombrement",  # formal, or "comptage" informal
            "shape": "forme",  # same but usage differs
            
            # General classroom
            "recess": "récréation",  # not "pause"
            "lunch": "dîner",  # not "déjeuner" 
            "breakfast": "déjeuner",  # not "petit-déjeuner"
            "supper": "souper",  # not "dîner"
            "weekend": "fin de semaine",  # not "week-end"
            "email": "courriel",  # not "email" or "mail"
            "computer": "ordinateur",  # same but important
            "shopping": "magasinage",  # not "shopping"
        }
        
        # PEI/Acadian specific vocabulary
        self.acadian_terms = {
            "potato": "patate",  # more common than "pomme de terre" in Acadia
            "lobster": "homard",  # important for PEI
            "beach": "plage",  # with local pronunciation
            "oyster": "huître",  # PEI context
            "mussel": "moule",  # PEI seafood
            "lighthouse": "phare",  # common PEI landmark
            "red sand": "sable rouge",  # PEI specific
            "Island": "l'Île",  # referring to PEI
        }
        
        # Grade 1 appropriate vocabulary
        self.grade1_vocabulary = {
            "numbers": ["zéro", "un", "deux", "trois", "quatre", "cinq", 
                       "six", "sept", "huit", "neuf", "dix"],
            "colors": ["rouge", "bleu", "jaune", "vert", "orange", "violet",
                      "rose", "noir", "blanc", "brun", "gris"],
            "shapes": ["cercle", "carré", "triangle", "rectangle", "ovale"],
            "sizes": ["grand", "petit", "moyen", "gros", "mince"],
            "positions": ["sur", "sous", "dans", "devant", "derrière", "à côté de"],
            "actions": ["couper", "coller", "dessiner", "colorier", "compter",
                       "toucher", "regarder", "écouter", "parler", "écrire"]
        }
    
    def enhance_with_french_support(self, enhanced_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Add French immersion supports to the specification"""
        
        self.enhanced_spec = enhanced_spec
        self.language_enhanced = enhanced_spec.copy()
        
        # Verify and correct French terminology
        self.language_enhanced['frenchVerification'] = self._verify_french_terms()
        
        # Add visual vocabulary supports
        self.language_enhanced['visualVocabulary'] = self._create_visual_vocabulary()
        
        # Add language scaffolding
        self.language_enhanced['languageScaffolding'] = self._add_language_scaffolding()
        
        # Add oral language supports
        self.language_enhanced['oralSupports'] = self._add_oral_supports()
        
        # Add cultural connections
        self.language_enhanced['culturalConnections'] = self._add_cultural_connections()
        
        # Add TPR (Total Physical Response) elements
        self.language_enhanced['tprElements'] = self._add_tpr_elements()
        
        # Add French labels for materials
        self.language_enhanced['materialLabels'] = self._create_material_labels()
        
        return self.language_enhanced
    
    def _verify_french_terms(self) -> Dict[str, Any]:
        """Verify all French terms are Canadian French"""
        
        verification = {
            "allTermsVerified": True,
            "corrections": [],
            "warnings": []
        }
        
        # Get all text from the specification
        spec_string = json.dumps(self.enhanced_spec, ensure_ascii=False)
        
        # Check for European French terms
        european_terms = {
            "week-end": "fin de semaine",
            "shopping": "magasinage",
            "parking": "stationnement",
            "email": "courriel",
            "petit-déjeuner": "déjeuner",
            "déjeuner": "dîner (for lunch)",
            "dîner": "souper (for dinner)",
            "scotch": "ruban adhésif",
            "feutres": "marqueurs",
            "trousse": "étui à crayons",
            "billes": "perles (for beads)",
            "briques": "blocs (for blocks)"
        }
        
        for euro_term, canadian_term in european_terms.items():
            if euro_term.lower() in spec_string.lower():
                verification['corrections'].append(
                    f"Remplacer '{euro_term}' par '{canadian_term}' (français canadien)"
                )
                verification['allTermsVerified'] = False
        
        # Check for anglicisms
        anglicisms = ["fun", "cool", "okay", "bye", "sorry", "please"]
        for anglicism in anglicisms:
            # Use word boundaries to avoid false positives
            if re.search(r'\b' + anglicism + r'\b', spec_string, re.IGNORECASE):
                verification['warnings'].append(
                    f"Anglicisme détecté: '{anglicism}'"
                )
        
        return verification
    
    def _create_visual_vocabulary(self) -> List[Dict[str, str]]:
        """Create visual vocabulary cards for the lesson"""
        
        visual_vocab = []
        
        # Extract key vocabulary from the lesson
        lesson_title = self.enhanced_spec.get('lessonTitle', '').lower()
        cognitive_process = self.enhanced_spec.get('cognitiveProcess', '')
        
        # Add vocabulary based on cognitive process
        if cognitive_process == 'counting_enumeration':
            for num in self.grade1_vocabulary['numbers']:
                visual_vocab.append({
                    "word": num,
                    "visual": f"Carte avec le chiffre et {num} points",
                    "gesture": f"Montrer {num} doigts"
                })
            visual_vocab.append({
                "word": "compter",
                "visual": "Image d'enfant qui compte des objets",
                "gesture": "Pointer chaque objet en comptant"
            })
            
        elif cognitive_process == 'creative_production':
            art_words = ["créer", "dessiner", "colorier", "découper", "coller"]
            for word in art_words:
                visual_vocab.append({
                    "word": word,
                    "visual": f"Photo d'enfant qui fait l'action: {word}",
                    "gesture": f"Mimer l'action de {word}"
                })
            
        elif cognitive_process == 'measurement_comparison':
            measure_words = ["long", "court", "grand", "petit", "mesurer", "comparer"]
            for word in measure_words:
                visual_vocab.append({
                    "word": word,
                    "visual": f"Image montrant le concept: {word}",
                    "gesture": f"Geste des mains pour montrer {word}"
                })
        
        # Add lesson-specific vocabulary
        if 'motif' in lesson_title or 'pattern' in lesson_title:
            visual_vocab.append({
                "word": "régularité",
                "visual": "Exemples visuels de patterns AB, AAB, ABC",
                "gesture": "Taper le rythme du pattern"
            })
            
        return visual_vocab
    
    def _add_language_scaffolding(self) -> Dict[str, List[str]]:
        """Add language scaffolding strategies"""
        
        scaffolding = {
            "sentenceStarters": [],
            "keyPhrases": [],
            "questionFrames": [],
            "responseFrames": []
        }
        
        cognitive_process = self.enhanced_spec.get('cognitiveProcess', '')
        
        if cognitive_process == 'counting_enumeration':
            scaffolding['sentenceStarters'] = [
                "J'ai compté...",
                "Il y a...",
                "Je vois..."
            ]
            scaffolding['keyPhrases'] = [
                "un de plus",
                "un de moins", 
                "combien en tout",
                "le même nombre"
            ]
            scaffolding['questionFrames'] = [
                "Combien de ___ vois-tu?",
                "Est-ce qu'il y a plus de ___ ou de ___?"
            ]
            scaffolding['responseFrames'] = [
                "Il y a ___ [objets].",
                "J'ai trouvé ___ [objets]."
            ]
            
        elif cognitive_process == 'creative_production':
            scaffolding['sentenceStarters'] = [
                "J'ai créé...",
                "J'ai utilisé...",
                "Mon projet montre..."
            ]
            scaffolding['keyPhrases'] = [
                "d'abord... ensuite... enfin",
                "j'ai besoin de",
                "je vais faire"
            ]
            scaffolding['questionFrames'] = [
                "Qu'est-ce que tu as fait?",
                "Comment as-tu créé ___?"
            ]
            scaffolding['responseFrames'] = [
                "J'ai utilisé ___ pour ___.",
                "D'abord j'ai ___, ensuite j'ai ___."
            ]
            
        elif cognitive_process == 'exploration_discovery':
            scaffolding['sentenceStarters'] = [
                "J'ai découvert que...",
                "J'ai observé...",
                "J'ai remarqué..."
            ]
            scaffolding['keyPhrases'] = [
                "je pense que",
                "peut-être",
                "parce que"
            ]
            scaffolding['questionFrames'] = [
                "Qu'est-ce qui se passe quand...?",
                "Pourquoi penses-tu que...?"
            ]
            scaffolding['responseFrames'] = [
                "Quand ___, alors ___.",
                "Je pense que ___ parce que ___."
            ]
        
        return scaffolding
    
    def _add_oral_supports(self) -> Dict[str, List[str]]:
        """Add oral language supports"""
        
        oral = {
            "songs": [],
            "rhymes": [],
            "chants": [],
            "games": []
        }
        
        cognitive_process = self.enhanced_spec.get('cognitiveProcess', '')
        lesson_title = self.enhanced_spec.get('lessonTitle', '').lower()
        
        if cognitive_process == 'counting_enumeration' or 'nombre' in lesson_title:
            oral['songs'] = [
                "Un, deux, trois, nous irons au bois",
                "Violette à bicyclette (comptine pour compter)",
                "Les chiffres de 1 à 10 (sur l'air de Frère Jacques)"
            ]
            oral['rhymes'] = [
                "Un et un font deux, deux et deux font quatre...",
                "Pomme de reinette et pomme d'api"
            ]
            oral['chants'] = [
                "Comptons ensemble: un, deux, trois...",
                "Qui peut compter jusqu'à dix?"
            ]
            oral['games'] = [
                "Jean dit: montre-moi ___ doigts",
                "Le téléphone des nombres (chuchoter un nombre)"
            ]
            
        elif 'couleur' in lesson_title:
            oral['songs'] = [
                "Arc-en-ciel (chanson des couleurs)",
                "Rouge, jaune, vert (sur l'air de Head and Shoulders)"
            ]
            oral['chants'] = [
                "Quelle est ta couleur préférée?",
                "Je vois quelque chose de [couleur]"
            ]
            oral['games'] = [
                "Touche quelque chose de bleu!",
                "Le détective des couleurs"
            ]
            
        elif 'saison' in lesson_title or 'automne' in lesson_title:
            oral['songs'] = [
                "L'automne est arrivé",
                "Les feuilles tombent"
            ]
            oral['rhymes'] = [
                "Septembre, octobre, novembre, c'est l'automne"
            ]
        
        return oral
    
    def _add_cultural_connections(self) -> Dict[str, Any]:
        """Add French Canadian and Acadian cultural connections"""
        
        cultural = {
            "acadianConnections": [],
            "quebecoisConnections": [],
            "peiContext": [],
            "culturalMaterials": []
        }
        
        lesson_title = self.enhanced_spec.get('lessonTitle', '').lower()
        
        # Add PEI-specific connections
        if any(word in lesson_title for word in ['nature', 'plage', 'saison']):
            cultural['peiContext'] = [
                "Référence aux plages de sable rouge de l'Île",
                "Les saisons distinctes de l'Île-du-Prince-Édouard",
                "La pêche au homard (saison printanière)"
            ]
            cultural['culturalMaterials'] = [
                "Photos des phares de l'Île",
                "Coquillages des plages locales",
                "Sable rouge (avec permission)"
            ]
            
        # Acadian connections
        if any(word in lesson_title for word in ['musique', 'chanson', 'fête']):
            cultural['acadianConnections'] = [
                "Musique traditionnelle acadienne",
                "Le 15 août - Fête nationale de l'Acadie",
                "Le tintamarre (tradition acadienne)"
            ]
            cultural['culturalMaterials'] = [
                "Drapeau acadien (étoile jaune)",
                "Instruments simples (cuillères, tambourins)"
            ]
            
        # Food/cooking connections
        if any(word in lesson_title for word in ['cuisine', 'aliment', 'manger']):
            cultural['acadianConnections'] = [
                "Fricot acadien",
                "Poutine râpée",
                "Pets de sœur (dessert traditionnel)"
            ]
            cultural['peiContext'] = [
                "Pommes de terre de l'Île (renommées)",
                "Moules de Malpeque"
            ]
        
        return cultural
    
    def _add_tpr_elements(self) -> List[Dict[str, str]]:
        """Add Total Physical Response elements"""
        
        tpr = []
        
        cognitive_process = self.enhanced_spec.get('cognitiveProcess', '')
        
        if cognitive_process == 'counting_enumeration':
            tpr.extend([
                {"command": "Lève ___ doigts", "action": "Montrer le nombre avec les doigts"},
                {"command": "Saute ___ fois", "action": "Sauter en comptant"},
                {"command": "Tape des mains ___ fois", "action": "Applaudir en comptant"},
                {"command": "Fais ___ pas", "action": "Marcher en comptant"}
            ])
            
        elif cognitive_process == 'creative_production':
            tpr.extend([
                {"command": "Mime découper", "action": "Geste de ciseaux"},
                {"command": "Mime coller", "action": "Geste d'appliquer la colle"},
                {"command": "Mime dessiner", "action": "Geste de tenir un crayon"},
                {"command": "Mime mélanger", "action": "Geste circulaire"}
            ])
            
        elif cognitive_process == 'exploration_discovery':
            tpr.extend([
                {"command": "Cherche avec tes yeux", "action": "Main au-dessus des yeux"},
                {"command": "Touche doucement", "action": "Geste délicat"},
                {"command": "Regarde de près", "action": "Se pencher pour observer"},
                {"command": "Écoute bien", "action": "Main à l'oreille"}
            ])
        
        # Add general classroom TPR
        tpr.extend([
            {"command": "Assieds-toi", "action": "S'asseoir"},
            {"command": "Lève-toi", "action": "Se lever"},
            {"command": "Viens ici", "action": "Approcher"},
            {"command": "Retourne à ta place", "action": "Retourner"},
            {"command": "Regarde-moi", "action": "Contact visuel"},
            {"command": "Écoute", "action": "Main à l'oreille"}
        ])
        
        return tpr
    
    def _create_material_labels(self) -> List[Dict[str, str]]:
        """Create French labels for all materials"""
        
        labels = []
        
        # Get materials from specification
        materials = self.enhanced_spec.get('materialNeeds', {}).get('primary', [])
        
        for material in materials:
            # Extract key items and create proper French labels
            if 'cubes' in material.lower():
                labels.append({
                    "item": "Storage bin for cubes",
                    "label": "CUBES DE MATH",
                    "additionalInfo": "Image de cubes"
                })
            elif 'jetons' in material.lower():
                labels.append({
                    "item": "Counter container",
                    "label": "JETONS DE COMPTAGE",
                    "additionalInfo": "Image de jetons"
                })
            elif 'crayons' in material.lower():
                labels.append({
                    "item": "Pencil holder",
                    "label": "CRAYONS",
                    "additionalInfo": "Code couleur par type"
                })
            elif 'papier' in material.lower():
                labels.append({
                    "item": "Paper tray",
                    "label": "PAPIER",
                    "additionalInfo": "Blanc / Couleur"
                })
            elif 'colle' in material.lower():
                labels.append({
                    "item": "Glue basket",
                    "label": "COLLE",
                    "additionalInfo": "Bâtons de colle"
                })
            elif 'peinture' in material.lower():
                labels.append({
                    "item": "Paint station",
                    "label": "PEINTURE",
                    "additionalInfo": "Laver les pinceaux après"
                })
        
        # Add general classroom labels
        labels.extend([
            {"item": "Clean-up station", "label": "NETTOYAGE", "additionalInfo": "Éponges et papier"},
            {"item": "Finished work", "label": "TRAVAIL TERMINÉ", "additionalInfo": ""},
            {"item": "Work in progress", "label": "EN COURS", "additionalInfo": "Ne pas toucher"},
            {"item": "Recycling", "label": "RECYCLAGE", "additionalInfo": "Papier seulement"}
        ])
        
        return labels
    
    def generate_french_report(self) -> str:
        """Generate a report on French language enhancements"""
        
        report = []
        report.append("=== RAPPORT D'AMÉLIORATION LINGUISTIQUE ===\n")
        report.append(f"Leçon: {self.enhanced_spec.get('lessonTitle', 'Inconnue')}\n\n")
        
        # French verification
        verification = self.language_enhanced.get('frenchVerification', {})
        report.append("VÉRIFICATION DU FRANÇAIS:\n")
        if verification.get('allTermsVerified'):
            report.append("  ✓ Tous les termes sont en français canadien\n")
        else:
            report.append("  ⚠ Corrections nécessaires:\n")
            for correction in verification.get('corrections', []):
                report.append(f"    • {correction}\n")
        
        # Visual vocabulary
        visual = self.language_enhanced.get('visualVocabulary', [])
        report.append(f"\nVOCABULAIRE VISUEL:\n")
        report.append(f"  • {len(visual)} cartes visuelles créées\n")
        
        # Scaffolding
        scaffolding = self.language_enhanced.get('languageScaffolding', {})
        report.append(f"\nÉCHAFAUDAGE LINGUISTIQUE:\n")
        report.append(f"  • Amorces de phrases: {len(scaffolding.get('sentenceStarters', []))}\n")
        report.append(f"  • Phrases clés: {len(scaffolding.get('keyPhrases', []))}\n")
        
        # Oral supports
        oral = self.language_enhanced.get('oralSupports', {})
        report.append(f"\nSUPPORTS ORAUX:\n")
        report.append(f"  • Chansons: {len(oral.get('songs', []))}\n")
        report.append(f"  • Comptines: {len(oral.get('rhymes', []))}\n")
        report.append(f"  • Jeux: {len(oral.get('games', []))}\n")
        
        # Cultural connections
        cultural = self.language_enhanced.get('culturalConnections', {})
        report.append(f"\nCONNEXIONS CULTURELLES:\n")
        if cultural.get('acadianConnections'):
            report.append(f"  • Connexions acadiennes: {len(cultural['acadianConnections'])}\n")
        if cultural.get('peiContext'):
            report.append(f"  • Contexte de l'Î.-P.-É.: {len(cultural['peiContext'])}\n")
        
        # TPR
        tpr = self.language_enhanced.get('tprElements', [])
        report.append(f"\nRÉPONSE PHYSIQUE TOTALE (TPR):\n")
        report.append(f"  • {len(tpr)} commandes avec gestes\n")
        
        return ''.join(report)
    
    def save_language_enhanced(self, output_path: str):
        """Save the language-enhanced specification"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.language_enhanced, f, ensure_ascii=False, indent=2)

def main():
    """Process an enhanced specification file"""
    
    if len(sys.argv) < 2:
        print("Usage: python agent-3-french-specialist.py <enhanced_file.json>")
        sys.exit(1)
    
    enhanced_file = sys.argv[1]
    
    # Load enhanced specification
    with open(enhanced_file, 'r', encoding='utf-8') as f:
        enhanced_spec = json.load(f)
    
    # Create agent and add French support
    agent = FrenchImmersionSpecialist()
    language_enhanced = agent.enhance_with_french_support(enhanced_spec)
    
    # Save language-enhanced specification
    output_file = str(enhanced_file).replace('.json', '-french.json')
    agent.save_language_enhanced(output_file)
    
    # Print report
    print(agent.generate_french_report())
    print(f"\nSpécification avec supports linguistiques sauvegardée: {output_file}")

if __name__ == "__main__":
    main()