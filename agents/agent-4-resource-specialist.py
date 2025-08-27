#!/usr/bin/env python3
"""
Agent 4: Resource Availability Specialist
Purpose: Ensure materials are obtainable in PEI schools
NO parent donations - all materials must be school-provided or free
"""

import json
from typing import Dict, List, Any, Optional, Tuple
import sys

class ResourceAvailabilitySpecialist:
    """Ensures all materials are realistically obtainable in PEI schools"""
    
    def __init__(self):
        self.language_enhanced = {}
        self.practical_spec = {}
        
        # Standard PEI elementary classroom supplies
        self.standard_classroom = {
            # Basic supplies (always available)
            "papier": {"cost": 0, "source": "classroom", "quantity": "unlimited"},
            "crayons": {"cost": 0, "source": "classroom", "quantity": "class set"},
            "crayons de couleur": {"cost": 0, "source": "classroom", "quantity": "class set"},
            "gommes à effacer": {"cost": 0, "source": "classroom", "quantity": "class set"},
            "colle en bâton": {"cost": 0, "source": "classroom", "quantity": "25+"},
            "ciseaux": {"cost": 0, "source": "classroom", "quantity": "25 pairs"},
            "règles": {"cost": 0, "source": "classroom", "quantity": "25"},
            
            # Math manipulatives (standard kit)
            "cubes emboîtables": {"cost": 0, "source": "math kit", "quantity": "500+"},
            "jetons de comptage": {"cost": 0, "source": "math kit", "quantity": "500+"},
            "blocs de base 10": {"cost": 0, "source": "math kit", "quantity": "1 set"},
            "dés": {"cost": 0, "source": "math kit", "quantity": "30"},
            "cartes de nombres": {"cost": 0, "source": "math kit", "quantity": "1 set"},
            "droite numérique": {"cost": 0, "source": "math kit", "quantity": "wall display"},
            "formes géométriques": {"cost": 0, "source": "math kit", "quantity": "1 set"},
            "horloge de démonstration": {"cost": 0, "source": "math kit", "quantity": "1"},
            "balance": {"cost": 0, "source": "math kit", "quantity": "2-3"},
            "réglettes Cuisenaire": {"cost": 0, "source": "math kit", "quantity": "6 sets"},
            
            # Art supplies (basic)
            "peinture tempera": {"cost": 0, "source": "art closet", "quantity": "basic colors"},
            "pinceaux": {"cost": 0, "source": "art closet", "quantity": "class set"},
            "papier construction": {"cost": 0, "source": "art closet", "quantity": "varied colors"},
            "marqueurs": {"cost": 0, "source": "art closet", "quantity": "10 sets"},
            
            # Technology
            "iPads": {"cost": 0, "source": "tech cart", "quantity": "10-15"},
            "chromebooks": {"cost": 0, "source": "tech cart", "quantity": "class set"},
            "casques d'écoute": {"cost": 0, "source": "tech cart", "quantity": "class set"},
        }
        
        # PEI suppliers and approximate costs
        self.pei_suppliers = {
            "Indigo Charlottetown": {
                "available": ["books", "basic supplies", "games", "puzzles"],
                "delivery": "in-store or online",
                "budget_friendly": True
            },
            "Staples Charlottetown": {
                "available": ["office supplies", "basic art supplies", "organization"],
                "delivery": "in-store or online", 
                "budget_friendly": True
            },
            "Walmart Summerside/Charlottetown": {
                "available": ["basic supplies", "storage", "crafts"],
                "delivery": "in-store",
                "budget_friendly": True
            },
            "Dollarama": {
                "available": ["basic supplies", "storage bins", "seasonal items"],
                "delivery": "in-store only",
                "budget_friendly": True
            },
            "School Board Supplier (Spectrum Educational)": {
                "available": ["educational materials", "manipulatives", "French resources"],
                "delivery": "school delivery",
                "budget_friendly": False  # More expensive but school-funded
            },
            "Michael's Charlottetown": {
                "available": ["craft supplies", "seasonal crafts", "storage"],
                "delivery": "in-store",
                "budget_friendly": False
            }
        }
        
        # Free/recycled materials available without parent donations
        self.free_materials = {
            # From school cafeteria
            "pommes de terre": "cafeteria leftovers for printing",
            "contenants yogourt": "cafeteria recycling for sorting",
            "boîtes de céréales": "cafeteria recycling for crafts",
            "serviettes en papier": "cafeteria extras",
            
            # From school grounds
            "feuilles": "collected from school yard",
            "branches": "collected from school yard",
            "cailloux": "collected from school yard",
            "sable": "from school sandbox",
            
            # From school recycling
            "papier brouillon": "one-sided copies from office",
            "magazines": "old magazines from library",
            "journaux": "newspapers from staff room",
            "carton": "cardboard from deliveries",
            "bouteilles plastique": "from recycling bin",
            
            # From other classrooms
            "matériel partagé": "coordinate with other Grade 1 teachers",
            "rotation de ressources": "weekly rotation system",
            
            # From school events
            "décorations usagées": "after school events",
            "nappes en papier": "after school lunches"
        }
        
        # Budget limits per lesson type
        self.budget_limits = {
            "regular_lesson": 10,  # Regular lessons max $10
            "special_project": 30,  # Special projects max $30
            "consumables_only": 5,  # Consumable materials max $5
            "no_cost": 0  # Many lessons should cost nothing
        }
    
    def verify_availability(self, language_enhanced: Dict[str, Any]) -> Dict[str, Any]:
        """Verify and provide practical alternatives for all materials"""
        
        self.language_enhanced = language_enhanced
        self.practical_spec = language_enhanced.copy()
        
        # Analyze current materials
        self.practical_spec['availabilityAnalysis'] = self._analyze_availability()
        
        # Provide practical alternatives
        self.practical_spec['practicalAlternatives'] = self._provide_alternatives()
        
        # Calculate costs
        self.practical_spec['costAnalysis'] = self._calculate_costs()
        
        # Create supply list with sources
        self.practical_spec['supplyList'] = self._create_supply_list()
        
        # Add preparation timeline
        self.practical_spec['preparationTimeline'] = self._create_prep_timeline()
        
        # Add storage solutions
        self.practical_spec['storageSolutions'] = self._add_storage_solutions()
        
        # Add sharing strategies
        self.practical_spec['sharingStrategies'] = self._add_sharing_strategies()
        
        return self.practical_spec
    
    def _analyze_availability(self) -> Dict[str, Any]:
        """Analyze availability of requested materials"""
        
        analysis = {
            "immediatelyAvailable": [],
            "requiresPurchase": [],
            "requiresPreparation": [],
            "notRealistic": [],
            "alternativesNeeded": []
        }
        
        materials = self.language_enhanced.get('materialNeeds', {}).get('primary', [])
        
        for material in materials:
            material_lower = material.lower()
            
            # Check if immediately available in classroom
            immediately_available = False
            for item in self.standard_classroom:
                if item in material_lower:
                    analysis['immediatelyAvailable'].append({
                        "item": material,
                        "source": self.standard_classroom[item]['source'],
                        "quantity": self.standard_classroom[item]['quantity']
                    })
                    immediately_available = True
                    break
            
            if not immediately_available:
                # Check if it's a free material
                for free_item in self.free_materials:
                    if free_item in material_lower:
                        analysis['requiresPreparation'].append({
                            "item": material,
                            "preparation": self.free_materials[free_item]
                        })
                        immediately_available = True
                        break
            
            if not immediately_available:
                # Needs purchase or alternative
                if any(luxury in material_lower for luxury in ['iPad', 'ordinateur', 'tablette']):
                    analysis['immediatelyAvailable'].append({
                        "item": material,
                        "source": "tech cart (book in advance)"
                    })
                elif any(special in material_lower for special in ['spécial', 'unique', 'particulier']):
                    analysis['alternativesNeeded'].append(material)
                else:
                    analysis['requiresPurchase'].append(material)
        
        return analysis
    
    def _provide_alternatives(self) -> Dict[str, List[Dict[str, str]]]:
        """Provide three tiers of alternatives for each material need"""
        
        alternatives = {
            "ideal": [],
            "standard": [],
            "economy": []
        }
        
        cognitive_process = self.language_enhanced.get('cognitiveProcess', '')
        
        if cognitive_process == 'counting_enumeration':
            alternatives['ideal'] = [
                {
                    "item": "Cubes Unifix du kit de math",
                    "cost": "$0",
                    "source": "Kit de math de classe",
                    "quantity": "500+ disponibles"
                }
            ]
            alternatives['standard'] = [
                {
                    "item": "Jetons de comptage bicolores",
                    "cost": "$0",
                    "source": "Kit de math de classe",
                    "quantity": "500+ disponibles"
                }
            ]
            alternatives['economy'] = [
                {
                    "item": "Haricots secs de la cafétéria",
                    "cost": "$0",
                    "source": "Demander 2 tasses à la cafétéria",
                    "quantity": "~400 haricots"
                }
            ]
            
        elif cognitive_process == 'creative_production':
            alternatives['ideal'] = [
                {
                    "item": "Matériel d'art du placard d'art",
                    "cost": "$0",
                    "source": "Placard d'art de l'école",
                    "quantity": "Partager avec autres classes"
                }
            ]
            alternatives['standard'] = [
                {
                    "item": "Papier construction et colle",
                    "cost": "$0",
                    "source": "Fournitures de classe",
                    "quantity": "Stock régulier"
                }
            ]
            alternatives['economy'] = [
                {
                    "item": "Papier recyclé et matériaux récupérés",
                    "cost": "$0",
                    "source": "Bac de recyclage de l'école",
                    "quantity": "Illimité"
                }
            ]
            
        elif cognitive_process == 'measurement_comparison':
            alternatives['ideal'] = [
                {
                    "item": "Règles et rubans à mesurer",
                    "cost": "$0",
                    "source": "Fournitures de classe",
                    "quantity": "25 règles disponibles"
                }
            ]
            alternatives['standard'] = [
                {
                    "item": "Réglettes Cuisenaire",
                    "cost": "$0",
                    "source": "Kit de math",
                    "quantity": "6 ensembles"
                }
            ]
            alternatives['economy'] = [
                {
                    "item": "Trombones du bureau",
                    "cost": "$0",
                    "source": "Demander 2 boîtes au secrétariat",
                    "quantity": "200 trombones"
                }
            ]
        
        return alternatives
    
    def _calculate_costs(self) -> Dict[str, Any]:
        """Calculate realistic costs for the lesson"""
        
        costs = {
            "totalCost": 0,
            "breakdown": [],
            "fundingSource": "budget de classe",
            "costPerStudent": 0,
            "budgetStatus": "within budget"
        }
        
        # Analyze materials needed
        analysis = self.practical_spec.get('availabilityAnalysis', {})
        
        # Calculate costs for items requiring purchase
        for item in analysis.get('requiresPurchase', []):
            item_cost = self._estimate_item_cost(item)
            costs['breakdown'].append({
                "item": item,
                "estimatedCost": item_cost,
                "supplier": "Dollarama or Staples"
            })
            costs['totalCost'] += item_cost
        
        # Check budget
        lesson_type = self._determine_lesson_type()
        budget_limit = self.budget_limits[lesson_type]
        
        if costs['totalCost'] > budget_limit:
            costs['budgetStatus'] = f"OVER BUDGET: ${costs['totalCost']} > ${budget_limit} limit"
            costs['recommendation'] = "Use economy alternatives to reduce cost"
        
        # Calculate per-student cost
        costs['costPerStudent'] = round(costs['totalCost'] / 25, 2)
        
        return costs
    
    def _estimate_item_cost(self, item: str) -> float:
        """Estimate cost of an item based on typical prices"""
        
        item_lower = item.lower()
        
        # Common items and their approximate costs
        if 'tampons' in item_lower or 'stamps' in item_lower:
            return 15.00  # Set of stamps
        elif 'peinture' in item_lower and 'spéciale' in item_lower:
            return 20.00  # Special paint
        elif 'papier' in item_lower and 'spécial' in item_lower:
            return 10.00  # Special paper
        elif 'feutre' in item_lower or 'marqueur' in item_lower:
            return 8.00  # Markers if not available
        elif 'contenants' in item_lower:
            return 5.00  # Storage containers
        else:
            return 5.00  # Default estimate for unknown items
    
    def _determine_lesson_type(self) -> str:
        """Determine the type of lesson for budget purposes"""
        
        lesson_title = self.language_enhanced.get('lessonTitle', '').lower()
        
        if any(word in lesson_title for word in ['projet', 'exposition', 'présentation']):
            return 'special_project'
        elif any(word in lesson_title for word in ['révision', 'pratique', 'jeu']):
            return 'no_cost'
        elif any(word in lesson_title for word in ['art', 'création', 'fabrication']):
            return 'consumables_only'
        else:
            return 'regular_lesson'
    
    def _create_supply_list(self) -> List[Dict[str, str]]:
        """Create detailed supply list with sources"""
        
        supply_list = []
        
        # Add immediately available items
        analysis = self.practical_spec.get('availabilityAnalysis', {})
        
        for item_info in analysis.get('immediatelyAvailable', []):
            supply_list.append({
                "item": item_info['item'],
                "quantity": item_info.get('quantity', 'as needed'),
                "source": item_info['source'],
                "preparation": "Aucune - disponible immédiatement",
                "cost": "$0"
            })
        
        # Add items requiring preparation
        for item_info in analysis.get('requiresPreparation', []):
            supply_list.append({
                "item": item_info['item'],
                "quantity": "as needed",
                "source": "École",
                "preparation": item_info['preparation'],
                "cost": "$0"
            })
        
        # Add items to purchase
        for item in analysis.get('requiresPurchase', []):
            supply_list.append({
                "item": item,
                "quantity": "for class of 25",
                "source": "À acheter - Dollarama/Staples",
                "preparation": "Commander 1 semaine avant",
                "cost": f"${self._estimate_item_cost(item)}"
            })
        
        return supply_list
    
    def _create_prep_timeline(self) -> Dict[str, List[str]]:
        """Create preparation timeline for materials"""
        
        timeline = {
            "oneWeekBefore": [],
            "dayBefore": [],
            "morningOf": [],
            "duringPreviousClass": []
        }
        
        analysis = self.practical_spec.get('availabilityAnalysis', {})
        
        # Items needing advance preparation
        if analysis.get('requiresPurchase'):
            timeline['oneWeekBefore'].append("Commander/acheter matériel manquant")
            timeline['oneWeekBefore'].append("Confirmer réservation tech (si nécessaire)")
        
        # Day before preparations
        if analysis.get('requiresPreparation'):
            for item in analysis['requiresPreparation']:
                if 'cafétéria' in item.get('preparation', ''):
                    timeline['dayBefore'].append(f"Demander à la cafétéria: {item['item']}")
                elif 'ramasser' in item.get('preparation', ''):
                    timeline['dayBefore'].append(f"Ramasser: {item['item']}")
        
        # Morning preparations
        timeline['morningOf'] = [
            "Préparer stations de travail",
            "Organiser matériel par groupe",
            "Vérifier que tout fonctionne"
        ]
        
        # During previous class
        if any('feuilles' in str(item) for item in analysis.get('requiresPreparation', [])):
            timeline['duringPreviousClass'].append("Ramasser feuilles avec élèves durant récréation")
        
        return timeline
    
    def _add_storage_solutions(self) -> Dict[str, List[str]]:
        """Add storage solutions for materials"""
        
        storage = {
            "permanent": [],
            "temporary": [],
            "shared": []
        }
        
        cognitive_process = self.language_enhanced.get('cognitiveProcess', '')
        
        # Permanent storage needs
        storage['permanent'] = [
            "Bacs étiquetés en français pour matériel de math",
            "Étagère accessible pour fournitures de base",
            "Tiroirs pour papier et matériel d'écriture"
        ]
        
        # Temporary storage (project-based)
        if cognitive_process == 'creative_production':
            storage['temporary'] = [
                "Plateau de séchage pour projets d'art",
                "Boîtes à chaussures pour projets en cours",
                "Espace mural pour affichage temporaire"
            ]
        
        # Shared storage with other classes
        storage['shared'] = [
            "Chariot de math partagé (3 classes de 1ère)",
            "Placard d'art commun",
            "Armoire de sciences (rotation hebdomadaire)"
        ]
        
        return storage
    
    def _add_sharing_strategies(self) -> Dict[str, List[str]]:
        """Add strategies for sharing materials between classes"""
        
        sharing = {
            "withinGrade": [],
            "acrossGrades": [],
            "rotationSchedule": []
        }
        
        # Within grade level
        sharing['withinGrade'] = [
            "Coordonner avec 2 autres classes de 1ère année",
            "Partager matériel spécialisé (ex: balance)",
            "Achats groupés pour économiser"
        ]
        
        # Across grade levels
        sharing['acrossGrades'] = [
            "Emprunter de la maternelle (gros matériel)",
            "Partager avec 2e année (matériel avancé)",
            "Système de prêt avec bibliothèque"
        ]
        
        # Rotation schedule
        sharing['rotationSchedule'] = [
            "Lundi: Classe A utilise kit de sciences",
            "Mercredi: Classe B utilise kit de sciences",
            "Vendredi: Classe C utilise kit de sciences"
        ]
        
        return sharing
    
    def generate_availability_report(self) -> str:
        """Generate a report on material availability"""
        
        report = []
        report.append("=== RAPPORT DE DISPONIBILITÉ DES RESSOURCES ===\n")
        report.append(f"Leçon: {self.language_enhanced.get('lessonTitle', 'Inconnue')}\n\n")
        
        # Availability analysis
        analysis = self.practical_spec.get('availabilityAnalysis', {})
        report.append("ANALYSE DE DISPONIBILITÉ:\n")
        report.append(f"  ✓ Immédiatement disponible: {len(analysis.get('immediatelyAvailable', []))} items\n")
        report.append(f"  ⚠ Préparation requise: {len(analysis.get('requiresPreparation', []))} items\n")
        report.append(f"  $ Achat requis: {len(analysis.get('requiresPurchase', []))} items\n")
        
        # Cost analysis
        costs = self.practical_spec.get('costAnalysis', {})
        report.append(f"\nANALYSE DES COÛTS:\n")
        report.append(f"  Coût total: ${costs.get('totalCost', 0)}\n")
        report.append(f"  Par élève: ${costs.get('costPerStudent', 0)}\n")
        report.append(f"  Statut: {costs.get('budgetStatus', 'unknown')}\n")
        
        # Alternatives provided
        alts = self.practical_spec.get('practicalAlternatives', {})
        report.append(f"\nALTERNATIVES FOURNIES:\n")
        report.append(f"  • Option idéale: {len(alts.get('ideal', []))} items\n")
        report.append(f"  • Option standard: {len(alts.get('standard', []))} items\n")
        report.append(f"  • Option économique: {len(alts.get('economy', []))} items\n")
        
        # Preparation timeline
        timeline = self.practical_spec.get('preparationTimeline', {})
        report.append(f"\nCALENDRIER DE PRÉPARATION:\n")
        if timeline.get('oneWeekBefore'):
            report.append(f"  1 semaine avant: {len(timeline['oneWeekBefore'])} tâches\n")
        if timeline.get('dayBefore'):
            report.append(f"  Jour avant: {len(timeline['dayBefore'])} tâches\n")
        
        # Important note
        report.append(f"\n⚠️ RAPPEL: Aucune donation des parents requise\n")
        report.append("Tout le matériel provient de l'école ou est gratuit\n")
        
        return ''.join(report)
    
    def save_practical_specification(self, output_path: str):
        """Save the practical specification"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.practical_spec, f, ensure_ascii=False, indent=2)

def main():
    """Process a language-enhanced specification file"""
    
    if len(sys.argv) < 2:
        print("Usage: python agent-4-resource-specialist.py <french_file.json>")
        sys.exit(1)
    
    french_file = sys.argv[1]
    
    # Load French-enhanced specification
    with open(french_file, 'r', encoding='utf-8') as f:
        language_enhanced = json.load(f)
    
    # Create agent and verify availability
    agent = ResourceAvailabilitySpecialist()
    practical = agent.verify_availability(language_enhanced)
    
    # Save practical specification
    output_file = str(french_file).replace('.json', '-practical.json')
    agent.save_practical_specification(output_file)
    
    # Print report
    print(agent.generate_availability_report())
    print(f"\nSpécification pratique sauvegardée: {output_file}")

if __name__ == "__main__":
    main()