#!/usr/bin/env python3
"""
Create CORRECT French Immersion Grade 1 Curriculum
Only includes subjects/expectations for French Immersion students
Excludes all English stream content
"""

import json
from pathlib import Path

# Complete French Immersion Curriculum
FRENCH_IMMERSION_CURRICULUM = {
    "metadata": {
        "title": "PEI Grade 1 French Immersion Curriculum - Complete and Correct",
        "program": "French Immersion",
        "grade": 1,
        "province": "Prince Edward Island",
        "extraction_date": "2025-08-09",
        "version": "FINAL_CORRECTED",
        "important_note": "This contains ONLY expectations for French Immersion students. English stream content is excluded.",
        "language_notes": {
            "taught_in_french": ["Français", "Mathématiques", "Sciences", "Sciences humaines", "Arts visuels", "FPS", "Éducation physique"],
            "possibly_in_english": ["Music (only English curriculum available)"],
            "not_applicable": ["English Language Arts", "English Science", "English Social Studies", "English Health"]
        }
    },
    
    "taught_in_french": {
        "Français langue première": [
            # Communication orale (7 expectations)
            {"code": "1CO.0", "description": "Différencier à l'oral les éléments reliés à la conscience phonologique", "source": "eelc_frenchimmersion_1_chunk_7.txt"},
            {"code": "1CO.1", "description": "Gérer son écoute pour répondre à ses besoins d'information et de divertissement", "source": "eelc_frenchimmersion_1_chunk_7.txt"},
            {"code": "1CO.2", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension littérale de messages oraux simples provenant de diverses sources, en faisant preuve d'ouverture et de respect", "source": "eelc_frenchimmersion_1_chunk_7.txt"},
            {"code": "1CO.3", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension interprétative de messages oraux simples provenant de diverses sources, en faisant preuve d'ouverture et de respect", "source": "eelc_frenchimmersion_1_chunk_7.txt"},
            {"code": "1CO.4", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension analytico-critique de messages oraux simples provenant de diverses sources, en faisant preuve d'ouverture et de respect", "source": "eelc_frenchimmersion_1_chunk_7.txt"},
            {"code": "1CO.5", "description": "S'exprimer dans diverses situations de communication orale simples, spontanées ou préparées, en faisant preuve de respect envers son public", "source": "eelc_frenchimmersion_1_chunk_7.txt"},
            {"code": "1CO.6", "description": "Réfléchir à ses compétences en tant que locuteur et interlocuteur", "source": "eelc_frenchimmersion_1_chunk_8.txt"},
            
            # Lecture (5 expectations)
            {"code": "1L.1", "description": "Planifier sa lecture pour répondre à ses besoins d'information et de divertissement", "source": "eelc_frenchimmersion_1_chunk_8.txt"},
            {"code": "1L.2", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension littérale de divers textes simples, y compris des textes numérisés", "source": "eelc_frenchimmersion_1_chunk_8.txt"},
            {"code": "1L.3", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension interprétative de divers textes simples, y compris des textes numérisés", "source": "eelc_frenchimmersion_1_chunk_9.txt"},
            {"code": "1L.4", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension analytico-critique de divers textes simples, y compris des textes numérisés", "source": "eelc_frenchimmersion_1_chunk_9.txt"},
            {"code": "1L.5", "description": "Réfléchir à ses compétences en tant que lecteur", "source": "eelc_frenchimmersion_1_chunk_9.txt"},
            
            # Écriture (3 expectations)
            {"code": "1É.1", "description": "Développer des compétences liées au processus de l'écriture", "source": "eelc_frenchimmersion_1_chunk_10.txt"},
            {"code": "1É.2", "description": "Développer des compétences liées aux traits d'écriture pour créer une variété de textes simples de différents genres (sous forme imprimée et numérique)", "source": "eelc_frenchimmersion_1_chunk_10.txt"},
            {"code": "1É.3", "description": "Réfléchir à ses compétences en tant que scripteur", "source": "eelc_frenchimmersion_1_chunk_10.txt"}
        ],
        
        "Mathématiques": [
            # Le nombre (9 expectations)
            {"code": "1.N1", "description": "Énoncer la suite des nombres de 0 à 100 en comptant un par un et par ordre croissant et décroissant, entre deux nombres donnés", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N2", "description": "Reconnaître du premier coup d'œil des arrangements familiers de 1 à 10 objets (ou points) et les nommer", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N3", "description": "Démontrer une compréhension de la notion du comptage", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N4", "description": "Représenter et décrire les nombres jusqu'à 20, de façon concrète, imagée et symbolique", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N5", "description": "Comparer des ensembles comportant jusqu'à 20 éléments pour résoudre des problèmes", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N6", "description": "Estimer des quantités jusqu'à 20 en utilisant des référents", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N7", "description": "Démontrer, de façon concrète et imagée, comment un nombre peut être représenté par différentes décompositions", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N8", "description": "Identifier le nombre, jusqu'à 20, qui est un de plus, deux de plus, un de moins et deux de moins qu'un nombre donné", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N9", "description": "Démontrer une compréhension de l'addition de nombres dont les solutions ne dépassent pas 20 et les faits de soustraction correspondants", "source": "eelc_mathfi_1.txt"},
            
            # Régularités et relations (4 expectations)
            {"code": "1.RR1", "description": "Démontrer une compréhension de la notion de régularité répétitive en identifiant, reproduisant, prolongeant et créant des régularités", "source": "eelc_mathfi_1.txt"},
            {"code": "1.RR2", "description": "Convertir une régularité répétitive d'un mode de représentation à un autre", "source": "eelc_mathfi_1.txt"},
            {"code": "1.RR3", "description": "Décrire l'égalité en termes d'équilibre et l'inégalité en termes de déséquilibre", "source": "eelc_mathfi_1.txt"},
            {"code": "1.RR4", "description": "Noter le nombre d'objets dans un ensemble donné comme étant équivalent au nombre d'objets dans un autre ensemble donné", "source": "eelc_mathfi_1.txt"},
            
            # Forme et espace (4 expectations)
            {"code": "1.FE1", "description": "Démontrer une compréhension de la notion de mesure comme processus de comparaison en identifiant des caractéristiques qui peuvent être comparées", "source": "eelc_mathfi_1.txt"},
            {"code": "1.FE2", "description": "Trier des objets 3-D et des figures 2-D et expliquer la règle utilisée", "source": "eelc_mathfi_1.txt"},
            {"code": "1.FE3", "description": "Reproduire des figures 2-D composées et des objets 3-D composés", "source": "eelc_mathfi_1.txt"},
            {"code": "1.FE4", "description": "Comparer des figures 2-D à des parties d'objets 3-D observés dans l'environnement", "source": "eelc_mathfi_1.txt"}
        ],
        
        "Sciences de la nature": [
            {"code": "1.1.1", "description": "Distinguer les caractéristiques des êtres vivants (plantes et animaux; incluant les humains)", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1.1.2", "description": "Évaluer l'impact des activités humaines sur l'environnement naturel", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1.2.1", "description": "Examiner différentes utilisations de l'énergie (à la maison, à l'école et dans la communauté) afin de suggérer des façons de réduire sa consommation énergétique", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1.3.1", "description": "Analyser les changements quotidiens et saisonniers dans l'environnement", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1.3.2", "description": "Expliquer comment les changements dans le cycle des jours et des saisons ont un effet sur les êtres vivants", "source": "pei_tableaux_cumulatifs.txt"}
        ],
        
        "Sciences humaines": [
            {"code": "1C.1", "description": "Démontrer sa compréhension de ses droits et ses responsabilités dans sa famille et dans son école", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1C.2", "description": "Démontrer des aptitudes, en tant que citoyen numérique", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1ICC.1", "description": "Décrire l'unicité des personnes et la diversité des langues et des modes de vie de sa famille et des familles de la classe", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1LT.1", "description": "Préciser la localisation de points de repère et de lieux importants à l'aide d'outils cartographiques, tels la carte géographique, le plan et le globe terrestre", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1LT.2", "description": "Organiser les événements marquants de sa vie dans le temps", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1PA.1", "description": "Appliquer le processus de prise de décision, de résolution de conflits et d'élaboration de règlements", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1ER.1", "description": "Démontrer sa compréhension de ses besoins et ses désirs et ceux des autres", "source": "pei_tableaux_cumulatifs.txt"}
        ],
        
        "Arts visuels": [
            {"code": "AV1", "description": "Reconnaître la valeur de son environnement visuel", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "AV2", "description": "Utiliser la création artistique afin de communiquer des idées ou des sentiments", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "AV3", "description": "Utiliser une variété d'outils, de matériaux, de styles et de techniques pour créer ses propres oeuvres d'art", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "AV4", "description": "Reconnaître la valeur de l'art en tant qu'élément de notre culture, de notre patrimoine et de notre environnement", "source": "pei_tableaux_cumulatifs.txt"}
        ],
        
        "Formation personnelle et sociale": [
            {"code": "FPS1", "description": "Démontrer sa compréhension de pratiques favorisant une bonne santé personnelle", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "FPS2", "description": "Démontrer sa compréhension de pratiques sécuritaires et responsables", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "FPS3", "description": "Adopter des comportements qui encouragent des relations saines et harmonieuses", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "FPS4", "description": "Démontrer sa compréhension de ses compétences et aptitudes personnelles", "source": "pei_tableaux_cumulatifs.txt"}
        ],
        
        "Éducation physique": [
            # Environnement physique et naturel
            {"code": "1.1", "description": "Coordonner différentes parties du corps dans l'adoption des postures et dans l'exécution d'actions corporels", "source": "edphys_fr_chunk_5.txt", "strand": "Attitude posturale"},
            {"code": "1.2", "description": "Ajuster son corps et les différentes parties de son corps dans la réalisation de mouvements et d'actions ainsi que dans l'adoption de posture", "source": "edphys_fr_chunk_5.txt", "strand": "Attitude posturale"},
            {"code": "1.3", "description": "Effectuer divers modes de déplacement en maintenant ou en variant son allure", "source": "edphys_fr_chunk_5.txt", "strand": "Locomotion"},
            {"code": "1.4", "description": "Effectuer divers modes de déplacements sur et sous des surfaces fixes ou varier à des hauteurs variables tout en maintenant son équilibre", "source": "edphys_fr_chunk_5.txt", "strand": "Locomotion"},
            {"code": "1.5", "description": "Enchaîner divers modes de déplacement en rapport avec des obstacles de dimensions et de formes variées", "source": "edphys_fr_chunk_5.txt", "strand": "Locomotion"},
            {"code": "1.6", "description": "Coordonner ses actions locomotrices à l'aide d'objets véhiculés", "source": "edphys_fr_chunk_5.txt", "strand": "Locomotion"},
            {"code": "1.7", "description": "Coordonner ses actions dans la manipulation d'objets", "source": "edphys_fr_chunk_5.txt", "strand": "Manipulation"},
            {"code": "1.8", "description": "Coordonner ses actions dans la projection d'objets", "source": "edphys_fr_chunk_5.txt", "strand": "Manipulation"},
            {"code": "1.9", "description": "Synchroniser à l'objet lors de la réception", "source": "edphys_fr_chunk_5.txt", "strand": "Manipulation"},
            
            # Environnement social
            {"code": "2.1", "description": "S'ajuster à un partenaire ou à plusieurs en vue d'accomplir une tâche commune", "source": "edphys_fr_chunk_6.txt", "strand": "Coopération"},
            {"code": "2.3", "description": "Réagir aux actions d'un opposant", "source": "edphys_fr_chunk_6.txt", "strand": "Opposition"},
            {"code": "2.4", "description": "Réagir aux actions des coéquipiers et des adversaires", "source": "edphys_fr_chunk_6.txt", "strand": "Coopération-Opposition"},
            {"code": "2.6", "description": "Créer des idées ou exprimer des faits en exploitant différentes séquences de mouvements seul ou en groupe", "source": "edphys_fr_chunk_6.txt", "strand": "Expression"},
            
            # Environnement personnel et intérieur
            {"code": "3.1", "description": "Connaître certains effets de l'activité physique sur le fonctionnement de son corps", "source": "edphys_fr_chunk_6.txt", "strand": "Effort physique"},
            {"code": "3.2", "description": "Mettre en pratique et en évidence certains effets de l'activité physique sur le fonctionnement de son corps", "source": "edphys_fr_chunk_6.txt", "strand": "Effort physique"}
        ]
    },
    
    "possibly_taught_in_english": {
        "Music": [
            # Only English curriculum available - may be taught in English even in French Immersion
            {"code": "ME1", "description": "Demonstrate the elements of music through musical play", "source": "k3music_chunk.txt", "language_note": "Only English curriculum available"},
            {"code": "MA1.1", "description": "Demonstrate proper technique playing pitched and non-pitched percussion instruments", "source": "k3music_chunk.txt"},
            {"code": "MA1.2", "description": "Demonstrate their voice in a variety of contexts through musical play", "source": "k3music_chunk.txt"},
            {"code": "CCC1", "description": "Demonstrate an understanding of diverse musical genres, styles, and cultural contexts and connections through musical play", "source": "k3music_chunk.txt"},
            {"code": "SP1", "description": "Perform musical pieces for a variety of audiences", "source": "k3music_chunk.txt"},
            {"code": "RRA1", "description": "Refine live and recorded performances using the creative musical process", "source": "k3music_chunk.txt"}
        ]
    },
    
    "NOT_for_french_immersion": {
        "note": "The following are English stream subjects that French Immersion students do NOT take",
        "english_language_arts": "French Immersion students take Français langue première instead",
        "english_science": "French Immersion students take Sciences de la nature in French",
        "english_social_studies": "French Immersion students take Sciences humaines in French",
        "english_health": "French Immersion students take Formation personnelle et sociale in French",
        "english_visual_arts": "French Immersion students take Arts visuels in French"
    }
}

def main():
    """Create correct French Immersion curriculum database"""
    
    # Count expectations
    taught_in_french_total = sum(len(exps) for exps in FRENCH_IMMERSION_CURRICULUM["taught_in_french"].values())
    possibly_english_total = sum(len(exps) for exps in FRENCH_IMMERSION_CURRICULUM["possibly_taught_in_english"].values())
    
    # Add statistics to metadata
    FRENCH_IMMERSION_CURRICULUM["metadata"]["statistics"] = {
        "total_expectations": taught_in_french_total + possibly_english_total,
        "taught_in_french": taught_in_french_total,
        "possibly_in_english": possibly_english_total,
        "by_subject": {
            "Français langue première": 15,
            "Mathématiques": 17,
            "Sciences de la nature": 5,
            "Sciences humaines": 7,
            "Arts visuels": 4,
            "Formation personnelle et sociale": 4,
            "Éducation physique": 15,
            "Music (possibly English)": 6
        }
    }
    
    # Save to file
    output_file = Path("/Users/michaelmcisaac/Github/teaching-engine2.0/curriculum/PEI_GRADE1_FRENCH_IMMERSION_ONLY.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(FRENCH_IMMERSION_CURRICULUM, f, ensure_ascii=False, indent=2)
    
    print("✅ French Immersion Curriculum Database Created!")
    print(f"Total expectations for Emily: {taught_in_french_total + possibly_english_total}")
    print(f"  Taught in French: {taught_in_french_total}")
    print(f"  Possibly in English (Music): {possibly_english_total}")
    print(f"\nSaved to: {output_file}")
    
    # Print breakdown
    print("\n📊 Complete Breakdown for Emily:")
    print("\nSubjects Taught in French:")
    for subject in FRENCH_IMMERSION_CURRICULUM["taught_in_french"]:
        count = len(FRENCH_IMMERSION_CURRICULUM["taught_in_french"][subject])
        print(f"  {subject}: {count} expectations")
    
    print("\nSubjects Possibly in English:")
    for subject in FRENCH_IMMERSION_CURRICULUM["possibly_taught_in_english"]:
        count = len(FRENCH_IMMERSION_CURRICULUM["possibly_taught_in_english"][subject])
        print(f"  {subject}: {count} expectations")

if __name__ == "__main__":
    main()