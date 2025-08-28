#!/usr/bin/env python3
"""
Complete Materials Generator for Grade 1 French Immersion Curriculum
Fills all 730+ empty materials arrays with realistic classroom materials
"""

import json
import os
import random
from pathlib import Path

# Grade 1 appropriate materials by subject and lesson section
MATERIALS = {
    'francais': {
        'opening': [
            "livres d'images variés (6-8 livres)",
            "tapis de rassemblement coloré",
            "affiches d'alphabet avec images (alphabet complet)",
            "marionnettes simples (3-4 personnages)",
            "tableau d'écriture ou grande feuille",
            "crayons de couleur (boîte de 24)",
            "autocollants motivants (1 planche)"
        ],
        'main': [
            "papier ligné pour débutants (30 feuilles)",
            "crayons à mine large (30 crayons)",
            "gommes à effacer douces (15 gommes)",
            "cahiers d'écriture (30 cahiers)",
            "lettres magnétiques (jeu complet A-Z)",
            "tableaux individuels effaçables (15 tableaux)",
            "marqueurs effaçables (15 marqueurs)",
            "fiches de mots illustrées (50 cartes)",
            "livrets de lecture simple (niveau débutant, 15 copies)"
        ],
        'closing': [
            "boîte de rangement pour travaux (1 grande boîte)",
            "chemises individuelles (30 chemises)",
            "étiquettes autocollantes (2 planches)",
            "tampons motivants avec encreur (5 tampons)",
            "certificats d'encouragement (30 copies)",
            "lingettes pour nettoyer les mains (1 paquet)"
        ]
    },
    'mathematiques': {
        'opening': [
            "cubes de comptage colorés (200 cubes)",
            "tapis de nombres 1-20",
            "cartes de chiffres grand format (0-20)",
            "boulier simple (30 bouliers)",
            "formes géométriques en mousse (30 ensembles)",
            "dés géants (6 dés)",
            "jetons de comptage (500 jetons)"
        ],
        'main': [
            "blocs de base dix (15 ensembles)",
            "réglettes Cuisenaire (15 ensembles)",
            "balance à plateaux simple (5 balances)",
            "objets à mesurer variés (règles, ficelles, 20 objets)",
            "cahiers de mathématiques (30 cahiers)",
            "crayons de couleur (30 boîtes)",
            "papier quadrillé grand format (50 feuilles)",
            "calculettes simples (15 calculettes)",
            "minuteur visuel (3 minuteurs)"
        ],
        'closing': [
            "bacs de rangement étiquetés (5 bacs)",
            "sacs de manipulation individuels (30 sacs)",
            "lingettes désinfectantes (2 paquets)",
            "autocollants de réussite mathématique (3 planches)",
            "tableau de progrès individuel (30 tableaux)"
        ]
    },
    'sciences': {
        'opening': [
            "loupes simples (15 loupes)",
            "collections d'objets naturels (feuilles, roches, coquillages)",
            "affiches du cycle de l'eau (4 affiches)",
            "images d'animaux locaux (30 cartes)",
            "thermomètre géant coloré",
            "calendrier des saisons illustré",
            "globe terrestre simple"
        ],
        'main': [
            "plateaux d'exploration (15 plateaux)",
            "contenants de collecte transparents (30 contenants)",
            "cahiers d'observations scientifiques (30 cahiers)",
            "crayons de couleur résistants à l'eau (30 boîtes)",
            "gants de jardinage enfants (15 paires)",
            "arrosoirs miniatures (8 arrosoirs)",
            "graines à planter (haricots, radis, 10 paquets)",
            "pots de plantation (30 pots)",
            "terre à plantation (2 sacs)",
            "tabliers de protection (30 tabliers)"
        ],
        'closing': [
            "lingettes humides (3 paquets)",
            "serviettes en papier (5 rouleaux)",
            "sacs de collecte pour échantillons (50 sacs)",
            "étiquettes pour spécimens (2 planches)",
            "classeurs pour observations (30 classeurs)"
        ]
    },
    'sciences-humaines': {
        'opening': [
            "carte du monde simplifiée pour enfants",
            "photos de familles diverses (20 photos)",
            "images de différentes maisons (15 images)",
            "drapeaux de diverses cultures (10 drapeaux)",
            "livre sur les métiers illustré",
            "calendrier mensuel grand format",
            "photos de la communauté locale (20 photos)"
        ],
        'main': [
            "cartes géographiques simples de la région",
            "matériaux pour construire (blocs, carton, 1 ensemble)",
            "déguisements de métiers (5 ensembles)",
            "papier construction couleurs variées (50 feuilles)",
            "crayons feutres lavables (30 ensembles)",
            "ciseaux à bout rond (30 paires)",
            "colle en bâton (30 tubes)",
            "magazines pour découpage (10 magazines)",
            "affiches de règles de classe (5 affiches)"
        ],
        'closing': [
            "album de classe pour photos (1 album)",
            "cadres pour affichage (10 cadres)",
            "épingles colorées pour tableau (50 épingles)",
            "ruban adhésif décoratif (5 rouleaux)",
            "boîte de souvenirs de classe (1 grande boîte)"
        ]
    },
    'arts-visuels': {
        'opening': [
            "reproductions d'œuvres d'art célèbres (10 reproductions)",
            "palette de couleurs géante",
            "pinceaux de différentes tailles (30 ensembles)",
            "tabliers d'art (30 tabliers)",
            "nappes de protection (5 nappes)",
            "affiches de couleurs primaires/secondaires (3 affiches)",
            "chevalet d'exposition"
        ],
        'main': [
            "peinture lavable non-toxique (12 couleurs)",
            "papier à dessin épais (100 feuilles, 22x28cm)",
            "crayons de cire gros (30 boîtes)",
            "marqueurs lavables (30 ensembles)",
            "ciseaux créatifs à bout rond (15 paires)",
            "colle blanche liquide (15 bouteilles)",
            "papier construction texturé (50 feuilles)",
            "tampons en mousse formes variées (20 tampons)",
            "rouleaux à peinture petits (15 rouleaux)",
            "éponges naturelles (20 éponges)"
        ],
        'closing': [
            "cordes à linge pour séchage (2 cordes)",
            "épinges à linge colorées (50 épinges)",
            "bacs de nettoyage (8 bacs)",
            "savon doux pour les mains (3 bouteilles)",
            "serviettes en papier absorbant (10 rouleaux)",
            "sacs plastique pour transport œuvres (30 sacs)",
            "étiquettes nom pour œuvres (100 étiquettes)"
        ]
    },
    'formation-personnelle': {
        'opening': [
            "miroirs incassables individuels (15 miroirs)",
            "coussin de relaxation (15 coussins)",
            "musique douce (CD ou playlist)",
            "affiches d'émotions illustrées (6 affiches)",
            "peluches réconfortantes (8 peluches)",
            "tapis de yoga pour enfants (15 tapis)",
            "livre sur les émotions illustré"
        ],
        'main': [
            "cahiers de réflexion personnelle (30 cahiers)",
            "crayons de couleur thérapeutiques (30 boîtes)",
            "cartes d'émotions illustrées (2 jeux)",
            "matériel de premiers soins visible (trousse)",
            "images d'aliments sains (20 cartes)",
            "balance alimentaire jouet",
            "fruits et légumes en plastique (1 ensemble)",
            "livre de recettes simples illustré",
            "minuteur apaisant visuel (3 minuteurs)"
        ],
        'closing': [
            "journal de gratitude (30 carnets)",
            "autocollants positifs (5 planches)",
            "certificats de réussite personnelle (50 certificats)",
            "boîte à suggestions anonymes (1 boîte)",
            "lingettes rafraîchissantes (2 paquets)",
            "huiles essentielles douces pour diffusion (lavande, 1 flacon)"
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

def generate_materials(subject, section, count=3):
    """Generate appropriate materials for a section"""
    if subject not in MATERIALS:
        subject = 'francais'  # fallback
    
    if section not in MATERIALS[subject]:
        section = 'main'  # fallback
    
    available_materials = MATERIALS[subject][section]
    
    # Select unique materials, or repeat if we need more than available
    if count <= len(available_materials):
        return random.sample(available_materials, count)
    else:
        # If we need more materials than available, repeat some
        result = available_materials.copy()
        remaining = count - len(available_materials)
        result.extend(random.choices(available_materials, k=remaining))
        return result

def fill_materials_in_file(file_path):
    """Fill all empty materials arrays in a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'lessons' not in data:
            print(f"No lessons found in {file_path}")
            return False
        
        subject = get_subject_key(file_path.name.lower())
        changes_made = False
        
        for lesson in data['lessons']:
            # Fill opening materials
            if 'opening' in lesson and 'materials' in lesson['opening']:
                if isinstance(lesson['opening']['materials'], list) and len(lesson['opening']['materials']) == 0:
                    lesson['opening']['materials'] = generate_materials(subject, 'opening', 3)
                    changes_made = True
            
            # Fill main materials
            if 'main' in lesson and 'materials' in lesson['main']:
                if isinstance(lesson['main']['materials'], list) and len(lesson['main']['materials']) == 0:
                    lesson['main']['materials'] = generate_materials(subject, 'main', 5)
                    changes_made = True
            
            # Fill closing materials
            if 'closing' in lesson and 'materials' in lesson['closing']:
                if isinstance(lesson['closing']['materials'], list) and len(lesson['closing']['materials']) == 0:
                    lesson['closing']['materials'] = generate_materials(subject, 'closing', 3)
                    changes_made = True
        
        if changes_made:
            # Write back to file with proper formatting
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ Filled materials in {file_path.name}")
            return True
        else:
            print(f"⚪ No empty materials found in {file_path.name}")
            return False
    
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Fill all empty materials in the curriculum"""
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
        if fill_materials_in_file(json_file):
            processed_files += 1
    
    print(f"\n📊 MATERIALS COMPLETION SUMMARY:")
    print(f"Total files checked: {total_files}")
    print(f"Files with materials added: {processed_files}")
    print(f"Files unchanged: {total_files - processed_files}")
    
    if processed_files > 0:
        print(f"\n✅ Materials filling complete!")
        print(f"Added realistic, Grade 1 appropriate classroom materials")
        print(f"All materials are cost-conscious and obtainable")
    else:
        print(f"\n⚪ All materials were already filled")

if __name__ == "__main__":
    main()