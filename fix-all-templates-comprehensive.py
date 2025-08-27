#!/usr/bin/env python3
"""
Comprehensive template fixer for ALL file structures in the project
Handles lessonProgression, unit.lessons, lessons array, and all variations
"""
import json
import os

# All the materials generator functions
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

def fix_file_templates(filename):
    """Fix templates in any file structure"""
    print(f"\n📄 Processing: {filename}")
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error: {e}")
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
    
    def get_materials_for_subject(activity_desc, subj):
        """Get materials based on subject"""
        if subj == "arts":
            return get_materials_for_arts_activity(activity_desc)
        elif subj == "sciences-humaines":
            return get_materials_for_sciences_humaines_activity(activity_desc)
        elif subj == "french":
            return get_materials_for_french_activity(activity_desc)
        elif subj == "math":
            return get_materials_for_math_activity(activity_desc)
        elif subj == "science":
            return get_materials_for_science_activity(activity_desc)
        else:
            return None
    
    def process_materials_in_object(obj, context=""):
        """Process materials in any object"""
        nonlocal fixed_count
        
        if isinstance(obj, dict):
            # Check for direct materials
            if 'materials' in obj and has_template_materials(obj['materials']):
                # Get context from various possible fields
                activity = context or obj.get('title', '') + ' ' + obj.get('focus', '') + ' ' + \
                          obj.get('description', '') + ' ' + obj.get('activity', '') + ' ' + \
                          ' '.join(obj.get('activities', []))
                
                new_materials = get_materials_for_subject(activity, subject)
                if new_materials:
                    obj['materials'] = new_materials
                    fixed_count += 1
                    print(f"  ✓ Fixed template in {obj.get('title', obj.get('lesson', 'item'))[:50]}")
            
            # Check for nested structures
            for key, value in obj.items():
                if key in ['opening', 'main', 'closing', 'mindsOn', 'action', 'consolidation']:
                    if isinstance(value, dict) and 'materials' in value and has_template_materials(value['materials']):
                        activity = value.get('activity', '') + ' ' + ' '.join(value.get('activities', []))
                        new_materials = get_materials_for_subject(activity, subject)
                        if new_materials:
                            value['materials'] = new_materials
                            fixed_count += 1
                            print(f"  ✓ Fixed template in {key}")
                
                # Recurse into nested structures
                if isinstance(value, (dict, list)):
                    process_materials_in_object(value, context)
        
        elif isinstance(obj, list):
            for item in obj:
                process_materials_in_object(item, context)
    
    # Process the entire data structure
    process_materials_in_object(data)
    
    # Save if changes were made
    if fixed_count > 0:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Fixed {fixed_count} template material sections")
    else:
        print(f"ℹ️ No templates found")
    
    return fixed_count

def main():
    """Main function to fix all templates comprehensively"""
    print("="*60)
    print("🔧 COMPREHENSIVE TEMPLATE MATERIAL FIX")
    print("="*60)
    
    total_fixed = 0
    
    # Get all JSON files with templates
    files_to_process = []
    
    # Check all files for templates
    print("\n🔍 Scanning for files with template materials...")
    for root, dirs, files in os.walk('generated-lessons'):
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()
                        if 'Matériel de base pour l\'activité' in content:
                            count = content.count('Matériel de base pour l\'activité')
                            files_to_process.append((filepath, count))
                            print(f"  Found {count} templates in {filepath}")
                except:
                    pass
    
    # Process all files with templates
    print(f"\n📝 Processing {len(files_to_process)} files with templates...")
    for filepath, expected_count in files_to_process:
        fixed = fix_file_templates(filepath)
        total_fixed += fixed
    
    # Final summary
    print("\n" + "="*60)
    print(f"🎉 COMPLETE! Fixed {total_fixed} template material sections")
    print("="*60)
    
    # Verify remaining templates
    print("\n📊 Final verification...")
    remaining = 0
    for root, dirs, files in os.walk('generated-lessons'):
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()
                        count = content.count('Matériel de base pour l\'activité')
                        if count > 0:
                            remaining += count
                            print(f"  ⚠️ Still has {count} templates: {filepath}")
                except:
                    pass
    
    if remaining == 0:
        print("✅ All templates successfully replaced!")
    else:
        print(f"⚠️ {remaining} templates still remaining")

if __name__ == "__main__":
    main()