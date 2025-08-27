#!/usr/bin/env python3
"""
Fix ALL remaining template materials across the entire project
Handles arts-visuels, unit lessons, and sciences-humaines files
"""
import json
import os
import re

def get_materials_for_arts_activity(activity_description):
    """Return appropriate materials for arts-visuels activities"""
    activity = activity_description.lower()
    
    # Printing/stamping activities
    if 'imprimer' in activity or 'tampon' in activity or 'motif' in activity or 'estampe' in activity:
        return {
            "required": [{
                "item": "Tampons et matériel d'impression variés",
                "quantity": "15-20 tampons différentes formes/textures",
                "preparation": "Préparer encre lavable, éponges, objets texturés pour impressions",
                "alternatives": [
                    "Légumes coupés pour estampes (pommes de terre, céleri)",
                    "Éponges découpées en formes diverses",
                    "Feuilles et objets naturels pour impressions"
                ]
            }, {
                "item": "Encre ou peinture lavable pour impressions",
                "quantity": "6 couleurs dans plateaux peu profonds",
                "preparation": "Verser peinture dans assiettes, préparer stations de travail",
                "alternatives": [
                    "Peinture tempera diluée",
                    "Encre à base d'eau colorée",
                    "Peinture aux doigts épaisse"
                ]
            }],
            "optional": [{
                "item": "Papier spécial pour impressions",
                "quantity": "50 feuilles papier épais ou cartonné",
                "purpose": "Pour meilleure absorption et résultats durables"
            }]
        }
    
    # Texture exploration activities
    elif 'texture' in activity or 'matériaux' in activity or 'toucher' in activity or 'tactile' in activity:
        return {
            "required": [{
                "item": "Collection de matériaux texturés variés",
                "quantity": "30-40 échantillons différentes textures",
                "preparation": "Rassembler tissu, papier sablé, fourrure, écorce, mousse, métal, etc.",
                "alternatives": [
                    "Échantillons de matériaux de construction",
                    "Tissus et textiles variés de la maison",
                    "Objets naturels avec textures intéressantes"
                ]
            }, {
                "item": "Boîtes sensorielles pour exploration tactile",
                "quantity": "6-8 boîtes avec couvercles troués",
                "preparation": "Percer trous pour mains, placer matériaux mystères à l'intérieur",
                "alternatives": [
                    "Sacs en tissu opaque avec objets",
                    "Boîtes de mouchoirs modifiées",
                    "Chaussettes propres comme sacs mystères"
                ]
            }],
            "optional": [{
                "item": "Loupes pour examiner textures en détail",
                "quantity": "8-10 loupes simples",
                "purpose": "Pour observation scientifique des surfaces et motifs"
            }]
        }
    
    # 3D sculpture/construction activities
    elif '3d' in activity or 'sculpture' in activity or 'construction' in activity or 'modeler' in activity:
        return {
            "required": [{
                "item": "Matériaux de modelage et construction 3D",
                "quantity": "Pâte à modeler pour 25 élèves + matériaux recyclés",
                "preparation": "Diviser pâte en portions, collecter boîtes, tubes, contenants propres",
                "alternatives": [
                    "Argile auto-durcissante ou pâte à sel maison",
                    "Papier mâché avec journaux et colle",
                    "Matériaux naturels (branches, pierres, coquillages)"
                ]
            }, {
                "item": "Outils de sculpture simples et sécuritaires",
                "quantity": "Sets d'outils plastique pour modelage",
                "preparation": "Vérifier sécurité, organiser par stations de travail",
                "alternatives": [
                    "Ustensiles de cuisine en plastique",
                    "Bâtonnets et cure-dents pour détails",
                    "Rouleaux et emporte-pièces simples"
                ]
            }],
            "optional": [{
                "item": "Supports pour séchage des sculptures",
                "quantity": "Plateaux ou étagères dédiées",
                "purpose": "Pour permettre séchage sécuritaire des œuvres 3D"
            }]
        }
    
    # Color mixing/painting activities
    elif 'couleur' in activity or 'peinture' in activity or 'mélange' in activity or 'peindre' in activity:
        return {
            "required": [{
                "item": "Peinture tempera couleurs primaires",
                "quantity": "Rouge, jaune, bleu en grandes bouteilles + blanc",
                "preparation": "Préparer palettes avec couleurs de base, eau pour rinçage",
                "alternatives": [
                    "Aquarelles en godets avec pinceaux",
                    "Crayons aquarellables pour effet peinture",
                    "Peinture aux doigts pour exploration sensorielle"
                ]
            }, {
                "item": "Pinceaux de tailles variées",
                "quantity": "50 pinceaux (fins, moyens, larges)",
                "preparation": "Organiser par taille, préparer contenants d'eau par table",
                "alternatives": [
                    "Éponges découpées pour application",
                    "Cotons-tiges pour détails fins",
                    "Rouleaux en mousse pour grandes surfaces"
                ]
            }],
            "optional": [{
                "item": "Tabliers ou chemises de protection",
                "quantity": "25 protections pour vêtements",
                "purpose": "Pour protéger vêtements pendant activités salissantes"
            }]
        }
    
    # Line and shape activities
    elif 'ligne' in activity or 'forme' in activity or 'dessiner' in activity or 'tracer' in activity:
        return {
            "required": [{
                "item": "Matériel de dessin varié pour exploration",
                "quantity": "Crayons, marqueurs, craies, pastels pour 25 élèves",
                "preparation": "Organiser par type, vérifier fonctionnement, distribuer contenants",
                "alternatives": [
                    "Crayons de cire épais pour petites mains",
                    "Craies de trottoir pour travail grand format",
                    "Bâtons et sable pour tracer dehors"
                ]
            }, {
                "item": "Papiers de formats et textures variés",
                "quantity": "100 feuilles diverses tailles/textures",
                "preparation": "Couper formats variés, organiser par type",
                "alternatives": [
                    "Papier journal pour pratique",
                    "Carton recyclé pour support rigide",
                    "Tableau effaçable pour exploration répétée"
                ]
            }],
            "optional": [{
                "item": "Règles et gabarits de formes",
                "quantity": "15 sets de formes géométriques",
                "purpose": "Pour guider tracé précis et exploration géométrique"
            }]
        }
    
    # Gallery/exhibition activities
    elif 'galerie' in activity or 'exposition' in activity or 'présenter' in activity or 'afficher' in activity:
        return {
            "required": [{
                "item": "Matériel d'affichage pour galerie",
                "quantity": "Corde, pinces, ruban adhésif, punaises",
                "preparation": "Installer système d'accrochage sécuritaire à hauteur des enfants",
                "alternatives": [
                    "Tableaux d'affichage mobiles",
                    "Ruban de masquage sur murs",
                    "Chevalets simples en carton"
                ]
            }, {
                "item": "Étiquettes et cartons pour titres d'œuvres",
                "quantity": "30 cartons blancs + marqueurs",
                "preparation": "Préparer modèle d'étiquette avec nom artiste et titre",
                "alternatives": [
                    "Post-it grand format",
                    "Étiquettes autocollantes",
                    "Cartes index avec support"
                ]
            }],
            "optional": [{
                "item": "Cadres simples ou passe-partout",
                "quantity": "10-15 cadres réutilisables",
                "purpose": "Pour valoriser et protéger œuvres sélectionnées"
            }]
        }
    
    # Default for arts activities
    else:
        return {
            "required": [{
                "item": "Matériel artistique de base adapté",
                "quantity": "Fournitures selon activité artistique spécifique",
                "preparation": "Organiser matériel par stations, vérifier sécurité et quantités",
                "alternatives": [
                    "Matériaux recyclés créatifs",
                    "Fournitures naturelles (feuilles, branches, pierres)",
                    "Matériel maison économique"
                ]
            }],
            "optional": [{
                "item": "Inspiration visuelle et exemples",
                "quantity": "Images d'artistes ou œuvres similaires",
                "purpose": "Pour inspirer créativité et montrer possibilités"
            }]
        }

def get_materials_for_sciences_humaines_activity(activity_description):
    """Return appropriate materials for sciences-humaines activities"""
    activity = activity_description.lower()
    
    # Community/neighborhood activities
    if 'communaut' in activity or 'quartier' in activity or 'voisin' in activity:
        return {
            "required": [{
                "item": "Photos et cartes du quartier local",
                "quantity": "15-20 images de lieux familiers",
                "preparation": "Photographier école, parc, magasins, services locaux",
                "alternatives": [
                    "Dessins simples des bâtiments importants",
                    "Plan du quartier avec photos collées",
                    "Visite virtuelle Google Street View"
                ]
            }],
            "optional": [{
                "item": "Maquette simple du quartier",
                "quantity": "Matériaux pour construction 3D",
                "purpose": "Pour visualisation spatiale et orientation"
            }]
        }
    
    # Family activities
    elif 'famille' in activity or 'parent' in activity or 'maison' in activity or 'foyer' in activity:
        return {
            "required": [{
                "item": "Cadres photos pour portraits de famille",
                "quantity": "25 cadres simples en carton",
                "preparation": "Demander photos famille à l'avance ou dessins",
                "alternatives": [
                    "Papier pour dessiner famille",
                    "Magazines pour créer collage famille",
                    "Pâte à modeler pour figurines famille"
                ]
            }],
            "optional": [{
                "item": "Arbre généalogique simplifié",
                "quantity": "Modèle grand format pour classe",
                "purpose": "Pour comprendre relations familiales"
            }]
        }
    
    # Celebration/tradition activities
    elif 'célébr' in activity or 'tradition' in activity or 'fête' in activity or 'hiver' in activity:
        return {
            "required": [{
                "item": "Objets et symboles de célébrations diverses",
                "quantity": "10-15 items représentant différentes fêtes",
                "preparation": "Rassembler décorations, images, objets symboliques respectueux",
                "alternatives": [
                    "Images de célébrations diverses",
                    "Livres illustrés sur les fêtes",
                    "Vidéos courtes de traditions"
                ]
            }],
            "optional": [{
                "item": "Matériel pour créer décorations",
                "quantity": "Papier, ciseaux, colle, brillants",
                "purpose": "Pour activité créative liée aux célébrations"
            }]
        }
    
    # School/classroom activities
    elif 'école' in activity or 'classe' in activity or 'salle' in activity:
        return {
            "required": [{
                "item": "Plan de l'école avec photos",
                "quantity": "1 grand plan + photos des salles",
                "preparation": "Créer plan simple avec lieux importants marqués",
                "alternatives": [
                    "Visite guidée de l'école",
                    "Photos numériques sur tablette",
                    "Dessins des différentes salles"
                ]
            }],
            "optional": [{
                "item": "Badges ou passes visiteur",
                "quantity": "25 badges temporaires",
                "purpose": "Pour jeu de rôle exploration école"
            }]
        }
    
    # Default for sciences-humaines
    else:
        return {
            "required": [{
                "item": "Support visuel pour concept social",
                "quantity": "Images ou objets selon thème spécifique",
                "preparation": "Sélectionner matériel culturellement approprié et inclusif",
                "alternatives": [
                    "Livres illustrés sur le thème",
                    "Photos de situations sociales",
                    "Objets concrets du quotidien"
                ]
            }],
            "optional": [{
                "item": "Matériel d'exploration sociale",
                "quantity": "Selon activité spécifique",
                "purpose": "Pour enrichir compréhension du monde social"
            }]
        }

def get_materials_for_french_activity(activity_description):
    """Return appropriate materials for French language learning activities"""
    activity = activity_description.lower()
    
    # Greeting activities
    if 'greeting' in activity or 'bonjour' in activity or 'salut' in activity:
        return {
            "required": [{
                "item": "Marionnette ou mascotte de classe",
                "quantity": "1 personnage attachant pour salutations",
                "preparation": "Créer personnalité, voix distinctive, routine de salutation",
                "alternatives": [
                    "Peluche classe avec nom français",
                    "Chapeau spécial pour salutations",
                    "Bâton de parole décoré"
                ]
            }],
            "optional": [{
                "item": "Affiche routines de salutations",
                "quantity": "1 affiche illustrée",
                "purpose": "Pour référence visuelle des expressions"
            }]
        }
    
    # Song/music activities
    elif 'chanson' in activity or 'chant' in activity or 'musique' in activity:
        return {
            "required": [{
                "item": "Enregistrement chanson française adaptée",
                "quantity": "1-2 chansons simples et répétitives",
                "preparation": "Apprendre paroles, créer gestes, préparer audio",
                "alternatives": [
                    "Chanson enseignée sans musique",
                    "Comptine avec mouvements",
                    "Rap ou rythme créé en classe"
                ]
            }],
            "optional": [{
                "item": "Instruments rythmiques simples",
                "quantity": "10-15 maracas, tambourins",
                "purpose": "Pour accompagnement musical participatif"
            }]
        }
    
    # Story/book activities
    elif 'histoire' in activity or 'livre' in activity or 'conte' in activity:
        return {
            "required": [{
                "item": "Album jeunesse en français",
                "quantity": "1 livre grand format illustré",
                "preparation": "Pratiquer lecture expressive, préparer questions",
                "alternatives": [
                    "Histoire racontée avec images",
                    "Kamishibaï fait maison",
                    "Histoire numérique projetée"
                ]
            }],
            "optional": [{
                "item": "Accessoires pour théâtralisation",
                "quantity": "Objets ou costumes simples",
                "purpose": "Pour rendre histoire vivante et interactive"
            }]
        }
    
    # Vocabulary/word activities
    elif 'vocabulaire' in activity or 'mot' in activity or 'étiquette' in activity:
        return {
            "required": [{
                "item": "Cartes vocabulaire illustrées",
                "quantity": "20-30 cartes thématiques",
                "preparation": "Sélectionner mots fréquents, images claires",
                "alternatives": [
                    "Objets réels étiquetés",
                    "Photos avec mots",
                    "Dessins au tableau"
                ]
            }],
            "optional": [{
                "item": "Pochettes de rangement vocabulaire",
                "quantity": "5-6 pochettes par thème",
                "purpose": "Pour organisation et révision systématique"
            }]
        }
    
    # Default French materials
    else:
        return {
            "required": [{
                "item": "Support linguistique français adapté",
                "quantity": "Matériel selon objectif linguistique",
                "preparation": "Adapter au niveau débutant, immersion progressive",
                "alternatives": [
                    "Visuels et gestes pour compréhension",
                    "Objets concrets pour contexte",
                    "Supports numériques interactifs"
                ]
            }],
            "optional": [{
                "item": "Aide-mémoire visuel français",
                "quantity": "Affiches ou cartes référence",
                "purpose": "Pour soutien autonome des élèves"
            }]
        }

def get_materials_for_math_activity(activity_description):
    """Return appropriate materials for mathematics activities"""
    activity = activity_description.lower()
    
    # Counting/number activities
    if 'compt' in activity or 'nombre' in activity or 'chiffre' in activity or 'count' in activity:
        return {
            "required": [{
                "item": "Matériel de manipulation pour comptage",
                "quantity": "200+ objets (cubes, jetons, boutons)",
                "preparation": "Organiser en contenants, préparer par groupes de 10",
                "alternatives": [
                    "Haricots secs ou pâtes",
                    "Petits jouets ou figurines",
                    "Pierres ou coquillages"
                ]
            }],
            "optional": [{
                "item": "Bandes numériques et tableaux",
                "quantity": "25 bandes 0-20",
                "purpose": "Pour référence visuelle et suivi"
            }]
        }
    
    # Shape/geometry activities
    elif 'forme' in activity or 'géométr' in activity or 'shape' in activity:
        return {
            "required": [{
                "item": "Formes géométriques manipulables",
                "quantity": "100+ formes variées en plastique/bois",
                "preparation": "Trier par forme et taille, vérifier sécurité",
                "alternatives": [
                    "Formes découpées en carton",
                    "Objets quotidiens (boîtes, balles)",
                    "Formes en pâte à modeler"
                ]
            }],
            "optional": [{
                "item": "Géoplans et élastiques",
                "quantity": "12 géoplans avec élastiques",
                "purpose": "Pour création et exploration de formes"
            }]
        }
    
    # Measurement activities
    elif 'mesur' in activity or 'long' in activity or 'taille' in activity:
        return {
            "required": [{
                "item": "Outils de mesure non-standard",
                "quantity": "Cubes, trombones, mains, pieds en papier",
                "preparation": "Préparer unités de mesure identiques",
                "alternatives": [
                    "Bâtonnets de popsicle",
                    "Blocs unifix",
                    "Cordes ou rubans"
                ]
            }],
            "optional": [{
                "item": "Règles et rubans à mesurer",
                "quantity": "Pour démonstration seulement",
                "purpose": "Pour introduire outils standard"
            }]
        }
    
    # Pattern activities
    elif 'régularité' in activity or 'pattern' in activity or 'suite' in activity:
        return {
            "required": [{
                "item": "Matériel pour créer des suites",
                "quantity": "Formes, couleurs, objets variés",
                "preparation": "Organiser par attributs, préparer exemples",
                "alternatives": [
                    "Autocollants en motifs",
                    "Perles et cordes",
                    "Tampons et encre"
                ]
            }],
            "optional": [{
                "item": "Cartes de suites à compléter",
                "quantity": "20 cartes plastifiées",
                "purpose": "Pour pratique autonome"
            }]
        }
    
    # Default math materials
    else:
        return {
            "required": [{
                "item": "Matériel mathématique concret",
                "quantity": "Manipulatifs adaptés au concept",
                "preparation": "Organiser pour exploration mathématique",
                "alternatives": [
                    "Objets quotidiens pour compter",
                    "Matériel naturel trié",
                    "Matériel créé par élèves"
                ]
            }],
            "optional": [{
                "item": "Support visuel mathématique",
                "quantity": "Affiches ou référentiels",
                "purpose": "Pour consolidation conceptuelle"
            }]
        }

def get_materials_for_science_activity(activity_description):
    """Return appropriate materials for science activities"""
    activity = activity_description.lower()
    
    # Observation activities
    if 'observ' in activity or 'regard' in activity or 'examin' in activity:
        return {
            "required": [{
                "item": "Loupes d'observation scientifique",
                "quantity": "12-15 loupes incassables",
                "preparation": "Nettoyer, attacher cordons, démontrer usage",
                "alternatives": [
                    "Verres grossissants simples",
                    "Bocaux transparents pour observation",
                    "Microscope numérique sur tablette"
                ]
            }],
            "optional": [{
                "item": "Carnets de scientifique",
                "quantity": "25 carnets avec sections",
                "purpose": "Pour dessins et notes d'observation"
            }]
        }
    
    # Weather/season activities
    elif 'météo' in activity or 'saison' in activity or 'temps' in activity:
        return {
            "required": [{
                "item": "Station météo simple classe",
                "quantity": "Thermomètre, pluviomètre maison",
                "preparation": "Installer à hauteur enfants, créer tableau suivi",
                "alternatives": [
                    "Images météo à classer",
                    "Symboles météo magnétiques",
                    "Application météo sur tablette"
                ]
            }],
            "optional": [{
                "item": "Vêtements saisonniers miniatures",
                "quantity": "Pour activités de tri",
                "purpose": "Pour associer météo et habillement"
            }]
        }
    
    # Living things activities
    elif 'vivant' in activity or 'plante' in activity or 'animal' in activity:
        return {
            "required": [{
                "item": "Spécimens vivants ou modèles",
                "quantity": "Plantes classe, images animaux",
                "preparation": "Préparer habitat approprié, guides observation",
                "alternatives": [
                    "Photos haute résolution",
                    "Vidéos documentaires courtes",
                    "Modèles plastique réalistes"
                ]
            }],
            "optional": [{
                "item": "Matériel de soin plantes/animaux",
                "quantity": "Arrosoirs, nourriture, outils",
                "purpose": "Pour responsabilisation et routine"
            }]
        }
    
    # Matter/materials activities
    elif 'matière' in activity or 'matériau' in activity or 'propriété' in activity:
        return {
            "required": [{
                "item": "Collection de matériaux variés",
                "quantity": "20+ échantillons différents",
                "preparation": "Rassembler bois, métal, plastique, tissu, etc.",
                "alternatives": [
                    "Objets quotidiens variés",
                    "Échantillons naturels",
                    "Kit de matériaux préparé"
                ]
            }],
            "optional": [{
                "item": "Outils test simple (aimants, eau)",
                "quantity": "Pour tester propriétés",
                "purpose": "Pour exploration propriétés physiques"
            }]
        }
    
    # Default science materials
    else:
        return {
            "required": [{
                "item": "Matériel investigation scientifique",
                "quantity": "Outils exploration adaptés Grade 1",
                "preparation": "Vérifier sécurité, préparer protocole simple",
                "alternatives": [
                    "Matériel quotidien pour expériences",
                    "Ressources naturelles locales",
                    "Démonstrations enseignant"
                ]
            }],
            "optional": [{
                "item": "Journal de bord scientifique",
                "quantity": "Support pour documentation",
                "purpose": "Pour développer démarche scientifique"
            }]
        }

def has_template_materials(materials_section):
    """Check if a materials section has template materials"""
    if not materials_section or 'required' not in materials_section:
        return False
        
    for item in materials_section.get('required', []):
        if (item.get('item') == 'Matériel de base pour l\'activité' or 
            'Matériel alternatif' in str(item.get('alternatives', []))):
            return True
    return False

def fix_design_file_templates(filename):
    """Fix templates in design files with opening/main/closing structure"""
    print(f"\nProcessing design file: {filename}")
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error in {filename}: {e}")
        return 0
    
    fixed_count = 0
    
    # Determine subject from filename
    subject = "unknown"
    if 'arts-visuels' in filename:
        subject = "arts"
    elif 'sciences-humaines' in filename:
        subject = "sciences-humaines"
    elif 'francais' in filename or 'french' in filename:
        subject = "french"
    elif 'math' in filename:
        subject = "math"
    elif 'science' in filename:
        subject = "science"
    
    # Process lessons array if it exists
    if 'lessons' in data and isinstance(data['lessons'], list):
        for lesson in data['lessons']:
            # Fix opening materials
            if 'opening' in lesson and 'activity' in lesson['opening']:
                if has_template_materials(lesson['opening'].get('materials', {})):
                    activity_desc = lesson['opening'].get('activity', '')
                    if subject == "arts":
                        lesson['opening']['materials'] = get_materials_for_arts_activity(activity_desc)
                    elif subject == "sciences-humaines":
                        lesson['opening']['materials'] = get_materials_for_sciences_humaines_activity(activity_desc)
                    elif subject == "french":
                        lesson['opening']['materials'] = get_materials_for_french_activity(activity_desc)
                    elif subject == "math":
                        lesson['opening']['materials'] = get_materials_for_math_activity(activity_desc)
                    elif subject == "science":
                        lesson['opening']['materials'] = get_materials_for_science_activity(activity_desc)
                    fixed_count += 1
            
            # Fix main materials
            if 'main' in lesson and 'activities' in lesson['main']:
                if has_template_materials(lesson['main'].get('materials', {})):
                    # Combine all activities for context
                    activity_desc = ' '.join(lesson['main'].get('activities', []))
                    if subject == "arts":
                        lesson['main']['materials'] = get_materials_for_arts_activity(activity_desc)
                    elif subject == "sciences-humaines":
                        lesson['main']['materials'] = get_materials_for_sciences_humaines_activity(activity_desc)
                    elif subject == "french":
                        lesson['main']['materials'] = get_materials_for_french_activity(activity_desc)
                    elif subject == "math":
                        lesson['main']['materials'] = get_materials_for_math_activity(activity_desc)
                    elif subject == "science":
                        lesson['main']['materials'] = get_materials_for_science_activity(activity_desc)
                    fixed_count += 1
            
            # Fix closing materials
            if 'closing' in lesson and 'activity' in lesson['closing']:
                if has_template_materials(lesson['closing'].get('materials', {})):
                    activity_desc = lesson['closing'].get('activity', '')
                    if subject == "arts":
                        lesson['closing']['materials'] = get_materials_for_arts_activity(activity_desc)
                    elif subject == "sciences-humaines":
                        lesson['closing']['materials'] = get_materials_for_sciences_humaines_activity(activity_desc)
                    elif subject == "french":
                        lesson['closing']['materials'] = get_materials_for_french_activity(activity_desc)
                    elif subject == "math":
                        lesson['closing']['materials'] = get_materials_for_math_activity(activity_desc)
                    elif subject == "science":
                        lesson['closing']['materials'] = get_materials_for_science_activity(activity_desc)
                    fixed_count += 1
    
    # Save the fixed file
    if fixed_count > 0:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Fixed {fixed_count} template material sections")
    else:
        print(f"ℹ️ No templates found to fix")
    
    return fixed_count

def fix_unit_lesson_templates(filename):
    """Fix templates in unit lesson files with mindsOn/action/consolidation structure"""
    print(f"\nProcessing unit lesson file: {filename}")
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error in {filename}: {e}")
        return 0
    
    fixed_count = 0
    
    # Determine subject from filename
    subject = "unknown"
    if 'french' in filename:
        subject = "french"
    elif 'math' in filename:
        subject = "math"
    elif 'science' in filename:
        subject = "science"
    
    # Process each lesson in the array
    for lesson in data:
        # Fix mindsOn materials
        if 'mindsOn' in lesson and 'activity' in lesson['mindsOn']:
            if has_template_materials(lesson['mindsOn'].get('materials', {})):
                activity_desc = lesson['mindsOn'].get('activity', '')
                if subject == "french":
                    lesson['mindsOn']['materials'] = get_materials_for_french_activity(activity_desc)
                elif subject == "math":
                    lesson['mindsOn']['materials'] = get_materials_for_math_activity(activity_desc)
                elif subject == "science":
                    lesson['mindsOn']['materials'] = get_materials_for_science_activity(activity_desc)
                fixed_count += 1
        
        # Fix action materials
        if 'action' in lesson and 'activities' in lesson['action']:
            if has_template_materials(lesson['action'].get('materials', {})):
                # Combine all activities for context
                activity_desc = ' '.join(lesson['action'].get('activities', []))
                if subject == "french":
                    lesson['action']['materials'] = get_materials_for_french_activity(activity_desc)
                elif subject == "math":
                    lesson['action']['materials'] = get_materials_for_math_activity(activity_desc)
                elif subject == "science":
                    lesson['action']['materials'] = get_materials_for_science_activity(activity_desc)
                fixed_count += 1
        
        # Fix consolidation materials
        if 'consolidation' in lesson and 'activity' in lesson['consolidation']:
            if has_template_materials(lesson['consolidation'].get('materials', {})):
                activity_desc = lesson['consolidation'].get('activity', '')
                if subject == "french":
                    lesson['consolidation']['materials'] = get_materials_for_french_activity(activity_desc)
                elif subject == "math":
                    lesson['consolidation']['materials'] = get_materials_for_math_activity(activity_desc)
                elif subject == "science":
                    lesson['consolidation']['materials'] = get_materials_for_science_activity(activity_desc)
                fixed_count += 1
    
    # Save the fixed file
    if fixed_count > 0:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Fixed {fixed_count} template material sections")
    else:
        print(f"ℹ️ No templates found to fix")
    
    return fixed_count

def main():
    """Main function to fix all remaining templates"""
    print("="*60)
    print("🔧 FIXING ALL REMAINING TEMPLATE MATERIALS")
    print("="*60)
    
    total_fixed = 0
    
    # Fix arts-visuels design files
    print("\n📎 Processing Arts-Visuels Design Files...")
    arts_files = [
        'generated-lessons/arts-visuels/impression-motifs-design.json',
        'generated-lessons/arts-visuels/textures-materiaux-design.json'
    ]
    for filename in arts_files:
        if os.path.exists(filename):
            fixed = fix_design_file_templates(filename)
            total_fixed += fixed
        else:
            print(f"⚠️ File not found: {filename}")
    
    # Fix sciences-humaines design file
    print("\n📚 Processing Sciences-Humaines Design File...")
    sh_file = 'generated-lessons/sciences-humaines/celebrations-traditions-hivernales-design.json'
    if os.path.exists(sh_file):
        fixed = fix_design_file_templates(sh_file)
        total_fixed += fixed
    
    # Fix unit lesson files
    print("\n📝 Processing Unit Lesson Files...")
    unit_files = [
        'generated-lessons/french/french-unit-lessons.json',
        'generated-lessons/math/math-unit-lessons.json',
        'generated-lessons/math/math-unit-IMPROVED.json',
        'generated-lessons/science/science-unit-lessons.json'
    ]
    for filename in unit_files:
        if os.path.exists(filename):
            fixed = fix_unit_lesson_templates(filename)
            total_fixed += fixed
        else:
            print(f"⚠️ File not found: {filename}")
    
    # Final summary
    print("\n" + "="*60)
    print(f"🎉 COMPLETE! Fixed {total_fixed} template material sections")
    print("="*60)
    
    # Verify remaining templates
    print("\n📊 Verifying remaining templates...")
    os.system('grep -c "Matériel de base pour l\'activité" generated-lessons/*/*.json | grep -v ":0$" | wc -l')

if __name__ == "__main__":
    main()