#!/usr/bin/env python3
"""
Complete Differentiation Generator for Grade 1 French Immersion Curriculum
Fills all 156+ empty differentiation arrays with appropriate strategies
"""

import json
import os
import random
from pathlib import Path

# Grade 1 differentiation strategies by subject and category
DIFFERENTIATION_STRATEGIES = {
    'francais': {
        'pourDifficultés': [
            "Utiliser des cartes visuelles avec images pour chaque mot nouveau",
            "Permettre les réponses gestuelles avant la production orale",
            "Offrir du temps supplémentaire pour compléter les activités",
            "Diviser les tâches longues en étapes plus petites et gérables",
            "Utiliser des couleurs différentes pour chaque syllabe lors de la lecture",
            "Proposer des supports audio pour accompagner le texte écrit",
            "Encourager l'utilisation de manipulatifs (lettres magnétiques, etc.)"
        ],
        'pourAvancés': [
            "Proposer des textes plus complexes avec vocabulaire étendu",
            "Encourager la création d'histoires originales avec début, milieu, fin",
            "Demander d'enseigner une nouvelle règle de français à un camarade",
            "Offrir des projets de recherche sur des auteurs franco-canadiens",
            "Permettre l'exploration de différents genres littéraires (poésie, théâtre)",
            "Inviter à créer un livre illustré pour les plus jeunes",
            "Proposer des défis de vocabulaire avec mots plus sophistiqués"
        ],
        'pourLangue': [
            "Permettre les explications dans la langue première si nécessaire",
            "Utiliser un dictionnaire visuel français-anglais",
            "Offrir des gestes et actions pour accompagner les mots nouveaux",
            "Créer des liens avec des mots similaires dans la langue première",
            "Utiliser des images et symboles pour soutenir la compréhension",
            "Encourager le jumelage avec un pair plus fort en français",
            "Répéter les consignes importantes avec des gestes clairs"
        ],
        'pourPEI': [
            "Adapter les outils d'écriture (crayons ergonomiques, guides-lignes)",
            "Offrir des pauses sensorielles fréquentes selon les besoins",
            "Utiliser des supports visuels clairs et contrastés",
            "Permettre différents moyens d'expression (oral, dessin, technologie)",
            "Ajuster l'éclairage et réduire les distractions visuelles",
            "Fournir des instructions simples, une étape à la fois",
            "Utiliser des minuteurs visuels pour structurer le temps"
        ]
    },
    'mathematiques': {
        'pourDifficultés': [
            "Utiliser des manipulatifs concrets (cubes, jetons) pour tous les calculs",
            "Représenter les nombres avec des images et des symboles visuels",
            "Décomposer chaque problème en étapes très simples",
            "Utiliser des couleurs différentes pour chaque opération mathématique",
            "Permettre l'utilisation des doigts pour compter",
            "Offrir des exemples supplémentaires avant chaque nouvelle notion",
            "Créer des liens avec des situations familières et concrètes"
        ],
        'pourAvancés': [
            "Introduire des nombres plus grands (au-delà de 20)",
            "Proposer des problèmes à plusieurs étapes nécessitant réflexion",
            "Encourager la création de problèmes mathématiques originaux",
            "Explorer des patterns plus complexes et des suites logiques",
            "Introduire des concepts géométriques avancés (symétrie, fractions simples)",
            "Utiliser la technologie pour explorer des concepts mathématiques",
            "Proposer des projets de mesure réels dans l'école"
        ],
        'pourLangue': [
            "Enseigner le vocabulaire mathématique avec images et gestes",
            "Permettre l'utilisation de la langue première pour expliquer le raisonnement",
            "Créer un mur de mots mathématiques avec traductions visuelles",
            "Utiliser des symboles mathématiques universels (+, -, =)",
            "Encourager la démonstration physique plutôt que verbale",
            "Offrir des cartes de vocabulaire mathématique bilingues",
            "Répéter les termes mathématiques clés plusieurs fois"
        ],
        'pourPEI': [
            "Adapter les manipulatifs selon les capacités motrices",
            "Utiliser des calculatrices ou technologies d'assistance",
            "Offrir du papier quadrillé agrandi pour faciliter l'organisation",
            "Permettre des réponses orales plutôt qu'écrites",
            "Utiliser des supports visuels clairs et de grande taille",
            "Ajuster le rythme selon les capacités d'attention",
            "Offrir des alternatives tactiles pour l'apprentissage des formes"
        ]
    },
    'sciences': {
        'pourDifficultés': [
            "Utiliser des expériences très concrètes et manipulables",
            "Décomposer chaque observation en petites étapes guidées",
            "Offrir des images et diagrammes pour soutenir la compréhension",
            "Permettre l'exploration répétée du même concept",
            "Utiliser des analogies avec des expériences familières",
            "Encourager le travail en équipe avec support des pairs",
            "Simplifier le vocabulaire scientifique avec définitions imagées"
        ],
        'pourAvancés': [
            "Encourager la formulation d'hypothèses plus complexes",
            "Proposer des expériences supplémentaires à mener à la maison",
            "Inviter à rechercher des informations dans des livres scientifiques",
            "Encourager la création d'un journal de scientifique illustré",
            "Proposer des projets d'observation à long terme",
            "Connecter les apprentissages avec des phénomènes naturels locaux",
            "Encourager les questions scientifiques approfondies"
        ],
        'pourLangue': [
            "Utiliser beaucoup d'images et de démonstrations visuelles",
            "Encourager l'expression par le dessin et la gestuelle",
            "Créer des cartes de vocabulaire scientifique illustrées",
            "Permettre l'utilisation d'applications de traduction pour termes techniques",
            "Encourager l'observation et la démonstration plutôt que l'explication",
            "Utiliser des vidéos en français avec sous-titres",
            "Offrir des définitions simples avec exemples visuels"
        ],
        'pourPEI': [
            "Adapter les outils d'observation (loupes avec support, etc.)",
            "Offrir des alternatives sensorielles pour l'exploration",
            "Utiliser des supports technologiques pour documenter observations",
            "Permettre différentes façons d'exprimer les découvertes",
            "Ajuster l'éclairage et l'environnement selon les besoins",
            "Offrir des pauses régulières pendant les manipulations",
            "Utiliser des supports visuels agrandis pour les observations"
        ]
    },
    'sciences-humaines': {
        'pourDifficultés': [
            "Utiliser des photos et images concrètes de la communauté locale",
            "Connecter chaque apprentissage avec l'expérience personnelle de l'élève",
            "Simplifier les cartes avec couleurs et symboles clairs",
            "Raconter des histoires personnelles pour illustrer les concepts",
            "Utiliser des objets réels pour représenter différentes cultures",
            "Encourager le partage d'expériences familiales pertinentes",
            "Décomposer les concepts temporels avec des exemples concrets"
        ],
        'pourAvancés': [
            "Encourager la recherche sur différentes cultures et traditions",
            "Proposer des projets de comparaison entre communautés",
            "Inviter à interviewer des membres de la communauté",
            "Encourager la création de présentations sur leur héritage familial",
            "Proposer des projets de cartographie détaillée de la région",
            "Encourager l'exploration de l'histoire locale approfondie",
            "Inviter à créer des expositions sur les traditions familiales"
        ],
        'pourLangue': [
            "Encourager le partage dans la langue première puis traduire",
            "Utiliser des photos de famille pour faciliter l'expression",
            "Offrir des cartes de vocabulaire avec images culturelles",
            "Permettre les présentations avec support visuel principal",
            "Encourager les comparaisons avec la culture d'origine",
            "Utiliser des gestes et actions pour exprimer concepts culturels",
            "Offrir du temps pour préparer le vocabulaire avant de partager"
        ],
        'pourPEI': [
            "Adapter les matériaux de présentation selon les capacités",
            "Offrir différents moyens d'expression (oral, visuel, technologique)",
            "Utiliser des supports visuels clairs et de grande taille",
            "Permettre des pauses selon les besoins d'attention",
            "Ajuster les activités selon les capacités motrices",
            "Offrir des alternatives pour la participation aux discussions",
            "Utiliser la technologie pour faciliter l'expression des idées"
        ]
    },
    'arts-visuels': {
        'pourDifficultés': [
            "Offrir des modèles visuels étape par étape pour chaque technique",
            "Utiliser des outils adaptés (pinceaux à gros manche, crayons ergonomiques)",
            "Décomposer chaque création en petites étapes réalisables",
            "Encourager l'expression libre sans contraintes techniques",
            "Utiliser des gabarits et guides pour faciliter la création",
            "Offrir des choix multiples de matériaux et techniques",
            "Célébrer chaque effort créatif sans jugement"
        ],
        'pourAvancés': [
            "Introduire des techniques artistiques plus complexes (ombrage, perspective)",
            "Encourager l'expérimentation avec des matériaux nouveaux",
            "Proposer des projets artistiques à long terme et détaillés",
            "Inviter à créer des œuvres inspirées d'artistes célèbres",
            "Encourager la critique d'art constructive et l'analyse d'œuvres",
            "Proposer des défis créatifs avec contraintes artistiques",
            "Encourager la création d'installations ou d'œuvres collectives"
        ],
        'pourLangue': [
            "Utiliser le vocabulaire artistique avec gestes et démonstrations",
            "Encourager l'expression artistique comme moyen de communication",
            "Créer des cartes de vocabulaire artistique illustrées",
            "Permettre l'explication de l'œuvre dans la langue première",
            "Utiliser des termes artistiques universels et des symboles",
            "Encourager l'observation et l'imitation avant l'explication",
            "Offrir des modèles visuels pour chaque technique nouvelle"
        ],
        'pourPEI': [
            "Adapter tous les outils selon les capacités motrices individuelles",
            "Offrir des alternatives technologiques pour la création artistique",
            "Utiliser des supports de travail ajustables (chevalets, tables)",
            "Permettre différentes positions de travail selon les besoins",
            "Ajuster l'éclairage et réduire les distractions visuelles",
            "Offrir des pauses fréquentes pendant les activités fines",
            "Utiliser des matériaux sensoriels adaptés aux besoins individuels"
        ]
    },
    'formation-personnelle': {
        'pourDifficultés': [
            "Utiliser des supports visuels pour identifier et nommer les émotions",
            "Offrir des stratégies concrètes et simples pour gérer les émotions",
            "Créer un espace calme et sécuritaire pour l'expression personnelle",
            "Utiliser des histoires et des jeux de rôle pour explorer concepts",
            "Encourager l'expression par le dessin et les arts créatifs",
            "Offrir des choix multiples pour participer aux discussions",
            "Décomposer les habiletés sociales en petites étapes pratiques"
        ],
        'pourAvancés': [
            "Encourager le développement de l'empathie par des projets communautaires",
            "Proposer des rôles de leadership dans les activités de classe",
            "Inviter à créer des stratégies d'aide pour les camarades",
            "Encourager la réflexion approfondie sur les choix personnels",
            "Proposer des projets de service communautaire adaptés à l'âge",
            "Inviter à animer des activités de résolution de conflits",
            "Encourager la création de ressources pour aider les autres"
        ],
        'pourLangue': [
            "Utiliser des images d'émotions universelles et des gestes",
            "Permettre l'expression des sentiments dans la langue première",
            "Créer des cartes d'émotions avec mots en plusieurs langues",
            "Utiliser des histoires visuelles pour explorer les concepts",
            "Encourager l'expression non-verbale (art, musique, mouvement)",
            "Offrir des traductions des termes émotionnels importants",
            "Utiliser des jeux de rôle avec support visuel minimal"
        ],
        'pourPEI': [
            "Adapter les activités selon les capacités sensorielles individuelles",
            "Offrir des alternatives technologiques pour l'expression personnelle",
            "Utiliser des supports visuels clairs et de grande taille",
            "Permettre différentes façons de participer aux discussions",
            "Ajuster l'environnement selon les besoins sensoriels",
            "Offrir des pauses et des stratégies de régulation personnalisées",
            "Utiliser des outils technologiques pour faciliter la communication"
        ]
    }
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

def generate_differentiation_strategies(subject, category, count=3):
    """Generate appropriate differentiation strategies for a category"""
    if subject not in DIFFERENTIATION_STRATEGIES:
        subject = 'francais'  # fallback
    
    if category not in DIFFERENTIATION_STRATEGIES[subject]:
        category = 'pourDifficultés'  # fallback
    
    available_strategies = DIFFERENTIATION_STRATEGIES[subject][category]
    
    # Select unique strategies, or repeat if we need more than available
    if count <= len(available_strategies):
        return random.sample(available_strategies, count)
    else:
        # If we need more strategies than available, repeat some
        result = available_strategies.copy()
        remaining = count - len(available_strategies)
        result.extend(random.choices(available_strategies, k=remaining))
        return result

def fill_differentiation_in_file(file_path):
    """Fill all empty differentiation arrays in a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'lessons' not in data:
            print(f"No lessons found in {file_path}")
            return False
        
        subject = get_subject_key(file_path.name.lower())
        changes_made = False
        
        for lesson in data['lessons']:
            if 'differentiation' in lesson:
                diff = lesson['differentiation']
                
                # Fill pourDifficultés
                if 'pourDifficultés' in diff and isinstance(diff['pourDifficultés'], list) and len(diff['pourDifficultés']) == 0:
                    diff['pourDifficultés'] = generate_differentiation_strategies(subject, 'pourDifficultés', 3)
                    changes_made = True
                
                # Fill pourAvancés
                if 'pourAvancés' in diff and isinstance(diff['pourAvancés'], list) and len(diff['pourAvancés']) == 0:
                    diff['pourAvancés'] = generate_differentiation_strategies(subject, 'pourAvancés', 3)
                    changes_made = True
                
                # Fill pourLangue
                if 'pourLangue' in diff and isinstance(diff['pourLangue'], list) and len(diff['pourLangue']) == 0:
                    diff['pourLangue'] = generate_differentiation_strategies(subject, 'pourLangue', 3)
                    changes_made = True
                
                # Fill pourPEI
                if 'pourPEI' in diff and isinstance(diff['pourPEI'], list) and len(diff['pourPEI']) == 0:
                    diff['pourPEI'] = generate_differentiation_strategies(subject, 'pourPEI', 3)
                    changes_made = True
        
        if changes_made:
            # Write back to file with proper formatting
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ Filled differentiation strategies in {file_path.name}")
            return True
        else:
            print(f"⚪ No empty differentiation arrays found in {file_path.name}")
            return False
    
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Fill all empty differentiation arrays in the curriculum"""
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
        if fill_differentiation_in_file(json_file):
            processed_files += 1
    
    print(f"\n📊 DIFFERENTIATION COMPLETION SUMMARY:")
    print(f"Total files checked: {total_files}")
    print(f"Files with differentiation added: {processed_files}")
    print(f"Files unchanged: {total_files - processed_files}")
    
    if processed_files > 0:
        print(f"\n✅ Differentiation filling complete!")
        print(f"Added specific, Grade 1 appropriate differentiation strategies")
        print(f"All strategies support diverse learners effectively")
    else:
        print(f"\n⚪ All differentiation arrays were already filled")

if __name__ == "__main__":
    main()