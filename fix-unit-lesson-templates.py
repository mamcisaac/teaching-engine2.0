#!/usr/bin/env python3
"""
Fix template materials in unit lesson files (french, math, science)
These files have mindsOn/action/consolidation structure instead of opening/main/closing
"""
import json

def get_materials_for_french_activity(activity_description):
    """Return appropriate materials for French language learning activities"""
    activity = activity_description.lower()
    
    # Greeting activities
    if 'greeting' in activity or 'bonjour' in activity or 'hello' in activity:
        return {
            "required": [{
                "item": "Marionnette Pierre pour salutations",
                "quantity": "1 marionnette colorée avec personnalité attachante",
                "preparation": "Pratiquer voix de Pierre, préparer mini-dialogues simples",
                "alternatives": [
                    "Peluche ou poupée comme personnage français",
                    "Masque simple pour transformation enseignant",
                    "Images grand format de personnages saluant"
                ]
            }],
            "optional": [{
                "item": "Cartes visuelles salutations avec gestes",
                "quantity": "6-8 cartes montrant bonjour, au revoir, bonsoir",
                "purpose": "Pour renforcer vocabulaire et gestes associés aux salutations"
            }]
        }
    
    # Puppet show activities
    elif 'puppet' in activity or 'marionnette' in activity or 'character' in activity:
        return {
            "required": [{
                "item": "Collection de marionnettes françaises simples",
                "quantity": "3-4 marionnettes différents types (animaux, personnages)",
                "preparation": "Créer personnalité et voix unique pour chaque marionnette",
                "alternatives": [
                    "Marionnettes chaussettes fait-maison",
                    "Figurines avec voix différentes",
                    "Dessins animés avec bâtonnets"
                ]
            }],
            "optional": [{
                "item": "Petit théâtre ou rideau simple",
                "quantity": "1 espace délimité pour spectacle",
                "purpose": "Pour créer atmosphère théâtrale et capter attention"
            }]
        }
    
    # Mirror practice activities  
    elif 'mirror' in activity or 'miroir' in activity or 'facial' in activity:
        return {
            "required": [{
                "item": "Miroirs individuels incassables",
                "quantity": "25 petits miroirs sécuritaires",
                "preparation": "Vérifier sécurité, nettoyer surfaces, distribuer avec précaution",
                "alternatives": [
                    "Miroirs plastique ou métallisés",
                    "Activité en partenaires face-à-face",
                    "Grande glace de classe pour démonstration"
                ]
            }],
            "optional": [{
                "item": "Cartes d'expressions faciales",
                "quantity": "10-15 cartes montrant émotions diverses",
                "purpose": "Pour guider practice des expressions et du vocabulaire émotionnel"
            }]
        }
    
    # Vocabulary/word activities
    elif 'word' in activity or 'vocabulary' in activity or 'mot' in activity:
        return {
            "required": [{
                "item": "Cartes-mots illustrées bilingues",
                "quantity": "20-30 cartes avec image et mot français",
                "preparation": "Sélectionner vocabulaire approprié Grade 1, images claires et attrayantes",
                "alternatives": [
                    "Cartes fait-maison avec dessins",
                    "Images projetées avec mots",
                    "Objets réels avec étiquettes françaises"
                ]
            }],
            "optional": [{
                "item": "Sac mystère avec objets de vocabulaire",
                "quantity": "1 sac avec 8-10 objets familiers",
                "purpose": "Pour apprentissage tactile et révision vocabulaire"
            }]
        }
    
    # Song/music activities
    elif 'song' in activity or 'chanson' in activity or 'music' in activity or 'chant' in activity:
        return {
            "required": [{
                "item": "Enregistrement chanson française simple",
                "quantity": "1 chanson répétitive avec gestes",
                "preparation": "Apprendre chanson, créer gestes simples, pratiquer rythme",
                "alternatives": [
                    "Chanson enseignée a cappella",
                    "Comptine française traditionnelle",
                    "Création chanson classe sur mélodie connue"
                ]
            }],
            "optional": [{
                "item": "Instruments simples pour accompagnement",
                "quantity": "8-10 instruments percussion simples",
                "purpose": "Pour enrichir expérience musicale et engager kinesthésique"
            }]
        }
    
    # Reading/story activities
    elif 'story' in activity or 'book' in activity or 'read' in activity or 'histoire' in activity:
        return {
            "required": [{
                "item": "Livre d'images français niveau débutant",
                "quantity": "1 livre grand format avec images claires",
                "preparation": "Pratiquer lecture expressive, identifier vocabulaire clé",
                "alternatives": [
                    "Histoire créée par l'enseignant avec dessins",
                    "Séquence d'images pour narration",
                    "Livre numérique projeté"
                ]
            }],
            "optional": [{
                "item": "Accessoires pour animation histoire",
                "quantity": "Objets ou costumes simples selon histoire",
                "purpose": "Pour rendre histoire interactive et mémorable"
            }]
        }
    
    # Game activities
    elif 'game' in activity or 'jeu' in activity or 'play' in activity:
        return {
            "required": [{
                "item": "Matériel de jeu linguistique simple",
                "quantity": "Cartes, dés, ou objets selon type de jeu",
                "preparation": "Expliquer règles en français simple, préparer démonstration",
                "alternatives": [
                    "Adaptation jeu traditionnel en français",
                    "Jeu de mouvement avec vocabulaire",
                    "Jeu de cartes fait-maison"
                ]
            }],
            "optional": [{
                "item": "Récompenses ou encouragements visuels",
                "quantity": "Autocollants ou tampons français",
                "purpose": "Pour motiver participation et célébrer efforts"
            }]
        }
    
    # Default for French activities
    else:
        return {
            "required": [{
                "item": "Support visuel pour apprentissage français",
                "quantity": "Matériel adapté à l'activité française spécifique",
                "preparation": "Préparer selon besoins linguistiques de l'activité",
                "alternatives": [
                    "Images et cartes visuelles appropriées",
                    "Objets concrets avec étiquettes françaises",
                    "Ressources audio-visuelles françaises"
                ]
            }],
            "optional": [{
                "item": "Matériel d'enrichissement linguistique",
                "quantity": "Selon niveau et intérêts des élèves",
                "purpose": "Pour approfondir immersion française"
            }]
        }

def get_materials_for_math_activity(activity_description):
    """Return appropriate materials for mathematics activities"""
    activity = activity_description.lower()
    
    if 'count' in activity or 'number' in activity or 'nombre' in activity:
        return {
            "required": [{
                "item": "Cubes de comptage colorés",
                "quantity": "200 cubes (8 de chaque couleur par élève)",
                "preparation": "Organiser par couleurs, distribuer dans petits contenants",
                "alternatives": [
                    "Jetons ou boutons pour comptage",
                    "Haricots secs ou pâtes pour compter",
                    "Bâtonnets de comptage en bois"
                ]
            }],
            "optional": [{
                "item": "Cadres de dix pour structure numérique",
                "quantity": "25 cadres plastifiés",
                "purpose": "Pour développer sens du nombre et structure de base 10"
            }]
        }
    
    elif 'shape' in activity or 'forme' in activity or 'géométrie' in activity:
        return {
            "required": [{
                "item": "Formes géométriques manipulables",
                "quantity": "50 formes variées (cercles, carrés, triangles, rectangles)",
                "preparation": "Séparer par types, vérifier sécurité des bords",
                "alternatives": [
                    "Formes découpées en carton coloré",
                    "Blocs de construction géométriques",
                    "Formes naturelles ou objets du quotidien"
                ]
            }],
            "optional": [{
                "item": "Tapis ou géoplans pour création formes",
                "quantity": "6-8 surfaces de travail",
                "purpose": "Pour exploration spatiale et création de motifs"
            }]
        }
    
    else:
        return {
            "required": [{
                "item": "Matériel de mathématiques manipulable",
                "quantity": "Matériel concret pour exploration mathématique",
                "preparation": "Organiser pour manipulation facile et sécuritaire",
                "alternatives": [
                    "Objets du quotidien pour compter/mesurer",
                    "Matériel naturel (pierres, feuilles)",
                    "Matériel de construction simple"
                ]
            }],
            "optional": [{
                "item": "Support visuel mathématique",
                "quantity": "Selon activité spécifique",
                "purpose": "Pour renforcer compréhension conceptuelle"
            }]
        }

def get_materials_for_science_activity(activity_description):
    """Return appropriate materials for science activities"""
    activity = activity_description.lower()
    
    if 'observe' in activity or 'look' in activity or 'explorer' in activity:
        return {
            "required": [{
                "item": "Loupes d'investigation scientifique",
                "quantity": "8-12 loupes sécuritaires pour partager",
                "preparation": "Nettoyer lentilles, vérifier sécurité, attacher cordons",
                "alternatives": [
                    "Verres grossissants simples",
                    "Lunettes de lecture pour grossissement",
                    "Observation directe avec yeux seulement"
                ]
            }],
            "optional": [{
                "item": "Carnets d'observation scientifique",
                "quantity": "25 carnets avec pages pré-structurées",
                "purpose": "Pour documenter observations et développer démarche scientifique"
            }]
        }
    
    else:
        return {
            "required": [{
                "item": "Matériel d'exploration scientifique sécuritaire",
                "quantity": "Outils adaptés à l'investigation Grade 1",
                "preparation": "Vérifier sécurité, organiser pour accès facile",
                "alternatives": [
                    "Objets de la nature pour exploration",
                    "Matériel sensoriel sécuritaire",
                    "Outils d'observation simples"
                ]
            }],
            "optional": [{
                "item": "Support documentation scientifique",
                "quantity": "Selon besoins d'investigation",
                "purpose": "Pour enrichir exploration et questionnement"
            }]
        }

def has_template_materials(materials_section):
    """Check if a materials section has template materials"""
    if not materials_section or 'required' not in materials_section:
        return False
        
    for item in materials_section['required']:
        if (item.get('item') == 'Matériel de base pour l\'activité' or 
            'Matériel alternatif' in str(item.get('alternatives', []))):
            return True
    return False

def fix_unit_lesson_templates(filename):
    """Fix template materials in unit lesson files"""
    print(f"Processing {filename}...")
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error in {filename}: {e}")
        return 0
    
    fixed_count = 0
    subject = "unknown"
    
    # Determine subject from filename
    if 'french' in filename:
        subject = "french"
    elif 'math' in filename:
        subject = "math" 
    elif 'science' in filename:
        subject = "science"
    
    # Fix each lesson
    for lesson in data:
        # Fix mindsOn materials
        if 'mindsOn' in lesson and 'activity' in lesson['mindsOn']:
            if has_template_materials(lesson['mindsOn'].get('materials', {})):
                if subject == "french":
                    lesson['mindsOn']['materials'] = get_materials_for_french_activity(lesson['mindsOn']['activity'])
                elif subject == "math":
                    lesson['mindsOn']['materials'] = get_materials_for_math_activity(lesson['mindsOn']['activity'])
                elif subject == "science":
                    lesson['mindsOn']['materials'] = get_materials_for_science_activity(lesson['mindsOn']['activity'])
                fixed_count += 1
        
        # Fix action materials
        if 'action' in lesson and 'activities' in lesson['action']:
            if has_template_materials(lesson['action'].get('materials', {})):
                activity_text = ' '.join(lesson['action']['activities'])
                if subject == "french":
                    lesson['action']['materials'] = get_materials_for_french_activity(activity_text)
                elif subject == "math":
                    lesson['action']['materials'] = get_materials_for_math_activity(activity_text)
                elif subject == "science":
                    lesson['action']['materials'] = get_materials_for_science_activity(activity_text)
                fixed_count += 1
                
        # Fix consolidation materials
        if 'consolidation' in lesson and 'activity' in lesson['consolidation']:
            if has_template_materials(lesson['consolidation'].get('materials', {})):
                if subject == "french":
                    lesson['consolidation']['materials'] = get_materials_for_french_activity(lesson['consolidation']['activity'])
                elif subject == "math":
                    lesson['consolidation']['materials'] = get_materials_for_math_activity(lesson['consolidation']['activity'])
                elif subject == "science":
                    lesson['consolidation']['materials'] = get_materials_for_science_activity(lesson['consolidation']['activity'])
                fixed_count += 1
    
    # Save the fixed file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Fixed {fixed_count} template material sections in {filename}")
    return fixed_count

# Process all unit lesson files
unit_files = [
    'generated-lessons/french/french-unit-lessons.json',
    'generated-lessons/math/math-unit-lessons.json', 
    'generated-lessons/math/math-unit-IMPROVED.json',
    'generated-lessons/science/science-unit-lessons.json'
]

total_fixed = 0
for filename in unit_files:
    try:
        fixed = fix_unit_lesson_templates(filename)
        total_fixed += fixed
    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")

print(f"\n🎉 TOTAL FIXED: {total_fixed} template material sections across all unit lesson files")
print("Unit lesson files now have subject-specific materials!")