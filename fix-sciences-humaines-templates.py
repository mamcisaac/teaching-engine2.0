#!/usr/bin/env python3
"""
Fix template materials in sciences-humaines files with lesson-specific materials
Based on actual activities described in each lesson
"""
import json
import re

def get_materials_for_activity(activity_description):
    """Return appropriate materials based on the activity description"""
    activity = activity_description.lower()
    
    # Community observation activities
    if 'look out' in activity or 'observe' in activity or 'windows' in activity:
        return {
            "required": [{
                "item": "Jumelles d'observation simple pour exploration",
                "quantity": "6-8 paires pour partager en équipes",
                "preparation": "Nettoyer lentilles, vérifier sécurité, attacher cordons de sécurité",
                "alternatives": [
                    "Loupes pour observer détails de près",
                    "Cadres en carton pour focaliser observation",
                    "Rouleaux de papier toilette comme 'télescopes'"
                ]
            }],
            "optional": [{
                "item": "Carnet d'observation communautaire",
                "quantity": "25 carnets simples avec images",
                "purpose": "Pour dessiner ou noter ce qui est observé dans la communauté"
            }]
        }
    
    # Poster/map creation activities  
    elif 'poster' in activity or 'create' in activity or 'drawing' in activity or 'maps' in activity:
        return {
            "required": [{
                "item": "Cartes et images du quartier scolaire",
                "quantity": "8-10 images diverses de la communauté locale",
                "preparation": "Sélectionner photos du quartier, parcs, magasins, imprimer en grand format",
                "alternatives": [
                    "Images Google Street View imprimées du quartier",
                    "Dessins simples des lieux importants",
                    "Plans de quartier avec points marqués"
                ]
            }, {
                "item": "Matériel de création d'affiches",
                "quantity": "25 feuilles grand format + fournitures",
                "preparation": "Distribuer papier 11x17, organiser crayons, marqueurs, colle, ciseaux sécuritaires",
                "alternatives": [
                    "Papier construction avec magazines pour collage",
                    "Tableaux individuels pour dessiner",
                    "Création collaborative sur grand papier mural"
                ]
            }],
            "optional": [{
                "item": "Modèles de différents types de communautés",
                "quantity": "5-8 photos de quartiers variés",
                "purpose": "Pour montrer la diversité des communautés et inspirer créativité"
            }]
        }
    
    # Helper appreciation/recognition activities
    elif 'helper' in activity or 'appreciation' in activity or 'school person' in activity:
        return {
            "required": [{
                "item": "Photos des employés de l'école en action",
                "quantity": "6-8 photos montrant différents rôles",
                "preparation": "Demander permission, prendre photos de concierge, secrétaire, directeur, etc.",
                "alternatives": [
                    "Dessins représentant différents emplois scolaires",
                    "Cartes illustrées des rôles d'aidants",
                    "Marionnettes représentant employés école"
                ]
            }],
            "optional": [{
                "item": "Matériel pour cartes d'appréciation",
                "quantity": "25 cartes vierges + décoration",
                "purpose": "Pour créer cartes de remerciement aux aidants de l'école"
            }]
        }
    
    # Circle time/discussion activities
    elif 'circle' in activity or 'share' in activity or 'think' in activity:
        return {
            "required": [{
                "item": "Support visuel pour mot-vedette du jour",
                "quantity": "1 affiche grand format avec mot et images",
                "preparation": "Créer affiche colorée avec mot 'COMMUNAUTÉ' et illustrations connexes",
                "alternatives": [
                    "Écriture simple au tableau avec dessins",
                    "Cartes-mots plastifiées réutilisables",
                    "Projection numérique avec images"
                ]
            }],
            "optional": [{
                "item": "Objet de partage pour cercle",
                "quantity": "1 objet spécial (pierre lisse, peluche, etc.)",
                "purpose": "Pour indiquer le tour de parole et encourager écoute respectueuse"
            }]
        }
    
    # Book creation activities
    elif 'book' in activity or 'drawings' in activity or 'descriptions' in activity:
        return {
            "required": [{
                "item": "Matériel de création de livre individuel",
                "quantity": "25 livrets pré-assemblés + crayons",
                "preparation": "Agrafer 4-6 pages par livret, distribuer crayons de couleur variés",
                "alternatives": [
                    "Feuilles individuelles à assembler plus tard",
                    "Création d'un livre de classe collectif",
                    "Format numérique sur tablettes si disponible"
                ]
            }],
            "optional": [{
                "item": "Exemples de livres sur la communauté",
                "quantity": "3-5 livres d'images appropriés à l'âge",
                "purpose": "Pour inspirer et montrer différents styles de présentation"
            }]
        }
    
    # Default for other activities
    else:
        return {
            "required": [{
                "item": "Matériel d'exploration communautaire",
                "quantity": "Matériel adapté à l'activité spécifique",
                "preparation": "Préparer selon les besoins de l'activité décrite",
                "alternatives": [
                    "Images et supports visuels appropriés",
                    "Matériel de manipulation simple",
                    "Ressources de discussion guidée"
                ]
            }],
            "optional": [{
                "item": "Support d'enrichissement",
                "quantity": "Selon les besoins et disponibilité",
                "purpose": "Pour approfondir l'exploration du concept communautaire"
            }]
        }

def fix_template_materials(filename):
    """Fix all template materials in a sciences-humaines file"""
    print(f"Processing {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    fixed_count = 0
    
    for lesson in data['lessons']:
        # Fix opening materials
        if 'opening' in lesson and 'activity' in lesson['opening']:
            if has_template_materials(lesson['opening'].get('materials', {})):
                lesson['opening']['materials'] = get_materials_for_activity(lesson['opening']['activity'])
                fixed_count += 1
                
        # Fix main materials  
        if 'main' in lesson and 'activity' in lesson['main']:
            if has_template_materials(lesson['main'].get('materials', {})):
                lesson['main']['materials'] = get_materials_for_activity(lesson['main']['activity'])
                fixed_count += 1
                
        # Fix closing materials
        if 'closing' in lesson and 'activity' in lesson['closing']:
            if has_template_materials(lesson['closing'].get('materials', {})):
                lesson['closing']['materials'] = get_materials_for_activity(lesson['closing']['activity'])
                fixed_count += 1
    
    # Save the fixed file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Fixed {fixed_count} template material sections in {filename}")
    return fixed_count

def has_template_materials(materials_section):
    """Check if a materials section has template materials"""
    if not materials_section or 'required' not in materials_section:
        return False
        
    for item in materials_section['required']:
        if (item.get('item') == 'Matériel de base pour l\'activité' or 
            'Matériel alternatif' in str(item.get('alternatives', []))):
            return True
    return False

# Process all sciences-humaines files with template materials
files_to_fix = [
    'generated-lessons/sciences-humaines/notre-communaute-automnale-full.json',
    'generated-lessons/sciences-humaines/celebrations-traditions-hivernales-full.json', 
    'generated-lessons/sciences-humaines/ma-famille-et-mon-foyer-full.json',
    'generated-lessons/sciences-humaines/moi-et-mon-ecole-full.json',
    'generated-lessons/sciences-humaines/notre-quartier-et-voisinage-full.json'
]

total_fixed = 0
for filename in files_to_fix:
    try:
        fixed = fix_template_materials(filename)
        total_fixed += fixed
    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")

print(f"\n🎉 TOTAL FIXED: {total_fixed} template material sections across all sciences-humaines files")
print("All sciences-humaines files now have lesson-specific materials!")