#!/usr/bin/env python3
"""
Complete Movement Breaks Generator for Grade 1 French Immersion Curriculum
Fills all 2,001+ empty movementBreaks arrays with appropriate activities
"""

import json
import os
import random
from pathlib import Path

# Grade 1 appropriate movement breaks by subject and lesson section
MOVEMENT_BREAKS = {
    'francais': {
        'opening': [
            "Faire l'alphabet avec notre corps : A comme arbre (étirer les bras), B comme ballon (forme ronde) (3 minutes)",
            "Marcher en syllabant notre nom : Ma-rie, Paul, etc. en tapant dans nos mains (2 minutes)",
            "Imiter les animaux des histoires : sauter comme un lapin, voler comme un oiseau (3 minutes)",
            "Répéter des comptines avec gestes : 'Tête, épaules, genoux et pieds' (2 minutes)",
            "Former des lettres dans l'air avec nos doigts : A, B, C (3 minutes)"
        ],
        'main': [
            "Étirer nos doigts et mains d'écrivains : ouvrir, fermer, tourner (2 minutes)",
            "Faire une pause lecture : s'étirer comme un chat qui se réveille (2 minutes)",
            "Danser avec les sons : 'a' avec les bras, 'o' en rond, 'i' pointu (3 minutes)",
            "Marcher sur place en récitant l'alphabet lentement (2 minutes)",
            "Faire des gestes de marionnettes pour raconter notre histoire (3 minutes)"
        ],
        'closing': [
            "Célébrer nos apprentissages : applaudir, lever les bras, sourire (2 minutes)",
            "Ranger nos idées : faire semblant de mettre nos pensées dans une boîte (2 minutes)",
            "Étirer notre dos d'écrivains : rotation douce des épaules (2 minutes)",
            "Faire une révérence à nos nouvelles connaissances (1 minute)",
            "Dire au revoir avec tout notre corps : mains, têtes, pieds (2 minutes)"
        ]
    },
    'mathematiques': {
        'opening': [
            "Compter en sautant : 1-saut, 2-saut, jusqu'à 10 (3 minutes)",
            "Former les chiffres avec notre corps : 1 debout droit, 2 en courbe (3 minutes)",
            "Faire des formes géométriques humaines : cercle, carré, triangle (2 minutes)",
            "Taper dans nos mains en comptant : 1-2-3-4-5 de plus en plus vite (2 minutes)",
            "Marcher en motifs : pas-pas-saut, pas-pas-saut (3 minutes)"
        ],
        'main': [
            "Étirer nos doigts calculateurs : compter en bougeant chaque doigt (2 minutes)",
            "Faire des additions corporelles : 2 mains + 2 pieds = 4 membres (3 minutes)",
            "Sauter pour montrer 'plus grand que' et s'accroupir pour 'plus petit' (2 minutes)",
            "Créer des groupes de 5 : bouger 5 parties du corps différentes (3 minutes)",
            "Faire des mesures : grand comme un géant, petit comme une souris (2 minutes)"
        ],
        'closing': [
            "Compter nos réussites sur nos doigts : 1, 2, 3, 4, 5 choses apprises (2 minutes)",
            "Faire une danse des nombres : tourner 3 fois, taper 4 fois (3 minutes)",
            "Étirer en comptant à rebours : 5-4-3-2-1 et se détendre (2 minutes)",
            "Former une ligne de chiffres humains avec les amis (2 minutes)",
            "Applaudir en rythme mathématique : 1-2, 1-2-3, 1-2-3-4 (2 minutes)"
        ]
    },
    'sciences': {
        'opening': [
            "Imiter le cycle de l'eau : être un nuage (bras en l'air), pleuvoir (doigts qui tombent) (3 minutes)",
            "Bouger comme différents animaux : ramper, voler, nager, marcher (3 minutes)",
            "Grandir comme une plante : s'accroupir (graine), se lever lentement (pousse) (2 minutes)",
            "Faire des mouvements saisonniers : frissonner (hiver), s'étirer (printemps) (3 minutes)",
            "Imiter les sons de la nature : vent (whoosh), pluie (tap-tap), oiseaux (cui-cui) (2 minutes)"
        ],
        'main': [
            "Être des scientifiques actifs : regarder (yeux grands), écouter (main à l'oreille) (2 minutes)",
            "Faire des expériences corporelles : équilibre sur un pied, tourner (2 minutes)",
            "Imiter ce qu'on observe : mouvement des nuages, des arbres dans le vent (3 minutes)",
            "Respirer comme les animaux : lent comme un ours, rapide comme un lapin (2 minutes)",
            "Explorer les textures dans l'air : lisse, rugueux, mou, dur (3 minutes)"
        ],
        'closing': [
            "Célébrer nos découvertes : sautiller de joie comme des petits scientifiques (2 minutes)",
            "Ranger nos observations : faire semblant de les mettre dans notre cerveau (2 minutes)",
            "Imiter notre animal préféré de la leçon (3 minutes)",
            "Étirer comme les plantes qui grandissent vers le soleil (2 minutes)",
            "Faire un cercle de la nature : tourner ensemble lentement (2 minutes)"
        ]
    },
    'sciences-humaines': {
        'opening': [
            "Saluer comme dans différentes cultures : bonjour, hello, hola (2 minutes)",
            "Marcher en explorant : découvrir notre classe comme une nouvelle ville (3 minutes)",
            "Faire des gestes de notre famille : cuisiner, nettoyer, bercer un bébé (3 minutes)",
            "Imiter les métiers : marteau (charpentier), volant (chauffeur) (2 minutes)",
            "Créer notre maison avec les bras : toit, murs, porte (2 minutes)"
        ],
        'main': [
            "Voyager sur place : marcher, conduire, voler vers différents endroits (3 minutes)",
            "Faire les gestes des saisons dans notre communauté (2 minutes)",
            "Imiter comment on aide à la maison : plier, ranger, essuyer (2 minutes)",
            "Créer un cercle communautaire : se tenir par la main et tourner (3 minutes)",
            "Faire des gestes de politesse : s'incliner, serrer la main, dire merci (2 minutes)"
        ],
        'closing': [
            "Montrer notre fierté communautaire : lever le menton, sourire grand (2 minutes)",
            "Faire un câlin de groupe (si approprié) ou taper dans les mains ensemble (2 minutes)",
            "Saluer notre communauté : onduler les bras vers les quatre directions (3 minutes)",
            "Marcher fièrement comme des citoyens responsables (2 minutes)",
            "Faire une chaîne humaine de gentillesse : passer un sourire (2 minutes)"
        ]
    },
    'arts-visuels': {
        'opening': [
            "Peindre dans l'air : grands mouvements de bras comme des pinceaux (3 minutes)",
            "Faire des formes créatives avec notre corps : spirales, zigzags (3 minutes)",
            "Danser comme les couleurs : rouge énergique, bleu calme, jaune joyeux (2 minutes)",
            "Sculpter notre corps : devenir une statue, puis bouger lentement (3 minutes)",
            "Dessiner des lignes invisibles : droites, courbes, pointillés (2 minutes)"
        ],
        'main': [
            "Étirer nos mains d'artistes : circles, secouer, étendre les doigts (2 minutes)",
            "Imiter les textures : rugueux (mouvements saccadés), lisse (fluide) (3 minutes)",
            "Créer des motifs corporels : répéter des mouvements 3 fois (2 minutes)",
            "Être des marionnettes artistiques : mouvements exagérés et créatifs (3 minutes)",
            "Faire une galerie vivante : poser comme notre œuvre préférée (2 minutes)"
        ],
        'closing': [
            "Célébrer notre créativité : tournoyer avec les bras comme des rubans (3 minutes)",
            "Applaudir pour tous les artistes de la classe (1 minute)",
            "Nettoyer nos espaces créatifs : gestes de rangement doux (2 minutes)",
            "Faire une révérence d'artiste : élégante et fière (1 minute)",
            "Partager notre joie créative : sourire et étirer les bras vers le ciel (2 minutes)"
        ]
    },
    'formation-personnelle': {
        'opening': [
            "Respirer comme un ballon : gonfler (inspirer), dégonfler (expirer) lentement (3 minutes)",
            "Saluer notre corps : bouger chaque partie en disant bonjour (3 minutes)",
            "Faire des étirements de bien-être : cou, bras, jambes doucement (2 minutes)",
            "Imiter des émotions avec le corps : joie (sauter), calme (respirer) (3 minutes)",
            "Créer un cercle de sécurité : se tenir en rond et respirer ensemble (2 minutes)"
        ],
        'main': [
            "Pratiquer la relaxation : tension et relâchement des muscles (3 minutes)",
            "Faire des gestes d'amitié : serrer la main, taper doucement l'épaule (2 minutes)",
            "Imiter des activités saines : faire du sport, manger, se brosser les dents (3 minutes)",
            "Pratiquer des postures de confiance : debout droit, sourire (2 minutes)",
            "Faire des mouvements apaisants : bercer, caresser doucement (2 minutes)"
        ],
        'closing': [
            "Méditation simple : fermer les yeux, respirer calmement (3 minutes)",
            "Envoyer des pensées positives : gestes doux vers les amis (2 minutes)",
            "Étirer en pensant à nos qualités : 'Je suis fort, gentil, intelligent' (3 minutes)",
            "Faire un moment de gratitude : main sur le cœur (2 minutes)",
            "Finir par un sourire collectif et une respiration profonde (2 minutes)"
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

def generate_movement_breaks(subject, section, count=2):
    """Generate appropriate movement breaks for a section"""
    if subject not in MOVEMENT_BREAKS:
        subject = 'francais'  # fallback
    
    if section not in MOVEMENT_BREAKS[subject]:
        section = 'main'  # fallback
    
    available_breaks = MOVEMENT_BREAKS[subject][section]
    
    # Select unique breaks, or repeat if we need more than available
    if count <= len(available_breaks):
        return random.sample(available_breaks, count)
    else:
        # If we need more breaks than available, repeat some
        result = available_breaks.copy()
        remaining = count - len(available_breaks)
        result.extend(random.choices(available_breaks, k=remaining))
        return result

def fill_movement_breaks_in_file(file_path):
    """Fill all empty movementBreaks arrays in a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'lessons' not in data:
            print(f"No lessons found in {file_path}")
            return False
        
        subject = get_subject_key(file_path.name.lower())
        changes_made = False
        
        for lesson in data['lessons']:
            # Fill opening movement breaks
            if 'opening' in lesson and 'movementBreaks' in lesson['opening']:
                if isinstance(lesson['opening']['movementBreaks'], list) and len(lesson['opening']['movementBreaks']) == 0:
                    lesson['opening']['movementBreaks'] = generate_movement_breaks(subject, 'opening', 2)
                    changes_made = True
            
            # Fill main movement breaks
            if 'main' in lesson and 'movementBreaks' in lesson['main']:
                if isinstance(lesson['main']['movementBreaks'], list) and len(lesson['main']['movementBreaks']) == 0:
                    lesson['main']['movementBreaks'] = generate_movement_breaks(subject, 'main', 2)
                    changes_made = True
            
            # Fill closing movement breaks
            if 'closing' in lesson and 'movementBreaks' in lesson['closing']:
                if isinstance(lesson['closing']['movementBreaks'], list) and len(lesson['closing']['movementBreaks']) == 0:
                    lesson['closing']['movementBreaks'] = generate_movement_breaks(subject, 'closing', 2)
                    changes_made = True
        
        if changes_made:
            # Write back to file with proper formatting
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ Filled movement breaks in {file_path.name}")
            return True
        else:
            print(f"⚪ No empty movement breaks found in {file_path.name}")
            return False
    
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Fill all empty movement breaks in the curriculum"""
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
        if fill_movement_breaks_in_file(json_file):
            processed_files += 1
    
    print(f"\n📊 MOVEMENT BREAKS COMPLETION SUMMARY:")
    print(f"Total files checked: {total_files}")
    print(f"Files with movement breaks added: {processed_files}")
    print(f"Files unchanged: {total_files - processed_files}")
    
    if processed_files > 0:
        print(f"\n✅ Movement breaks filling complete!")
        print(f"Added Grade 1 appropriate, subject-specific movement breaks in French")
    else:
        print(f"\n⚪ All movement breaks were already filled")

if __name__ == "__main__":
    main()