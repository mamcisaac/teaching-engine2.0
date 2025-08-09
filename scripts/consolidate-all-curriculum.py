#!/usr/bin/env python3
"""
Consolidate ALL curriculum expectations for PEI Grade 1
Separate French Immersion from English Stream
"""

import json
from pathlib import Path

# All verified curriculum expectations
ALL_EXPECTATIONS = {
    "french_immersion": {
        "Français langue première": [
            # From pei_rafs_triangulation.txt
            {"code": "1CO.O", "description": "Différencier à l'oral les éléments reliés à la conscience phonologique", "source": "pei_rafs_triangulation.txt"},
            {"code": "1CO.2", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension littérale de messages oraux simples provenant de diverses sources en faisant preuve d'ouverture et de respect", "source": "pei_rafs_triangulation.txt"},
            {"code": "1CO.5", "description": "S'exprimer dans diverses situations de communication orale simples spontanées ou préparées en faisant preuve de respect envers son public", "source": "pei_rafs_triangulation.txt"},
            {"code": "1L.2", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension littérale de divers textes simples y compris des textes numérisés", "source": "pei_rafs_triangulation.txt"},
            {"code": "1L.3", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension interprétative de divers textes simples y compris des textes numérisés", "source": "pei_rafs_triangulation.txt"},
            {"code": "1L.4", "description": "Utiliser un système d'activités stratégiques pour accéder à une compréhension analytico-critique de divers textes simples y compris des textes numérisés", "source": "pei_rafs_triangulation.txt"},
            {"code": "1É.2", "description": "Développer des compétences liées aux traits d'écriture pour créer une variété de textes simples de différents genres", "source": "pei_rafs_triangulation.txt"},
        ],
        "Mathématiques": [
            # From eelc_mathfi_1.txt
            {"code": "1.N1", "description": "Énoncer la suite des nombres de 0 à 100 en comptant un par un et par ordre croissant et décroissant, entre deux nombres donnés", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N2", "description": "Reconnaître du premier coup d'œil des arrangements familiers de 1 à 10 objets (ou points) et les nommer", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N3", "description": "Démontrer une compréhension de la notion du comptage", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N4", "description": "Représenter et décrire les nombres jusqu'à 20, de façon concrète, imagée et symbolique", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N5", "description": "Comparer des ensembles comportant jusqu'à 20 éléments pour résoudre des problèmes", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N6", "description": "Estimer des quantités jusqu'à 20 en utilisant des référents", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N7", "description": "Démontrer, de façon concrète et imagée, comment un nombre peut être représenté par différentes décompositions", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N8", "description": "Identifier le nombre, jusqu'à 20, qui est un de plus, deux de plus, un de moins et deux de moins qu'un nombre donné", "source": "eelc_mathfi_1.txt"},
            {"code": "1.N9", "description": "Démontrer une compréhension de l'addition de nombres dont les solutions ne dépassent pas 20 et les faits de soustraction correspondants", "source": "eelc_mathfi_1.txt"},
            {"code": "1.RR1", "description": "Démontrer une compréhension de la notion de régularité répétitive en identifiant, reproduisant, prolongeant et créant des régularités", "source": "eelc_mathfi_1.txt"},
            {"code": "1.RR2", "description": "Convertir une régularité répétitive d'un mode de représentation à un autre", "source": "eelc_mathfi_1.txt"},
            {"code": "1.RR3", "description": "Décrire l'égalité en termes d'équilibre et l'inégalité en termes de déséquilibre", "source": "eelc_mathfi_1.txt"},
            {"code": "1.RR4", "description": "Noter le nombre d'objets dans un ensemble donné comme étant équivalent au nombre d'objets dans un autre ensemble donné", "source": "eelc_mathfi_1.txt"},
            {"code": "1.FE1", "description": "Démontrer une compréhension de la notion de mesure comme processus de comparaison en identifiant des caractéristiques qui peuvent être comparées", "source": "eelc_mathfi_1.txt"},
            {"code": "1.FE2", "description": "Trier des objets 3-D et des figures 2-D et expliquer la règle utilisée", "source": "eelc_mathfi_1.txt"},
            {"code": "1.FE3", "description": "Reproduire des figures 2-D composées et des objets 3-D composés", "source": "eelc_mathfi_1.txt"},
            {"code": "1.FE4", "description": "Comparer des figures 2-D à des parties d'objets 3-D observés dans l'environnement", "source": "eelc_mathfi_1.txt"},
        ],
        "Sciences de la nature": [
            # From pei_tableaux_cumulatifs.txt
            {"code": "1.1.1", "description": "Distinguer les caractéristiques des êtres vivants (plantes et animaux; incluant les humains)", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1.1.2", "description": "Évaluer l'impact des activités humaines sur l'environnement naturel", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1.2.1", "description": "Examiner différentes utilisations de l'énergie (à la maison, à l'école et dans la communauté) afin de suggérer des façons de réduire sa consommation énergétique", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1.3.1", "description": "Analyser les changements quotidiens et saisonniers dans l'environnement", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1.3.2", "description": "Expliquer comment les changements dans le cycle des jours et des saisons ont un effet sur les êtres vivants", "source": "pei_tableaux_cumulatifs.txt"},
        ],
        "Sciences humaines": [
            # From pei_tableaux_cumulatifs.txt
            {"code": "1C.1", "description": "Démontrer sa compréhension de ses droits et ses responsabilités dans sa famille et dans son école", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1C.2", "description": "Démontrer des aptitudes, en tant que citoyen numérique", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1ICC.1", "description": "Décrire l'unicité des personnes et la diversité des langues et des modes de vie de sa famille et des familles de la classe", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1LT.1", "description": "Préciser la localisation de points de repère et de lieux importants à l'aide d'outils cartographiques, tels la carte géographique, le plan et le globe terrestre", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1LT.2", "description": "Organiser les événements marquants de sa vie dans le temps", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1PA.1", "description": "Appliquer le processus de prise de décision, de résolution de conflits et d'élaboration de règlements", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "1ER.1", "description": "Démontrer sa compréhension de ses besoins et ses désirs et ceux des autres", "source": "pei_tableaux_cumulatifs.txt"},
        ],
        "Arts visuels": [
            # From pei_tableaux_cumulatifs.txt
            {"code": "AV1", "description": "Reconnaître la valeur de son environnement visuel", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "AV2", "description": "Utiliser la création artistique afin de communiquer des idées ou des sentiments", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "AV3", "description": "Utiliser une variété d'outils, de matériaux, de styles et de techniques pour créer ses propres oeuvres d'art", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "AV4", "description": "Reconnaître la valeur de l'art en tant qu'élément de notre culture, de notre patrimoine et de notre environnement", "source": "pei_tableaux_cumulatifs.txt"},
        ],
        "Formation personnelle et sociale": [
            # From pei_tableaux_cumulatifs.txt
            {"code": "FPS1", "description": "Démontrer sa compréhension de pratiques favorisant une bonne santé personnelle", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "FPS2", "description": "Démontrer sa compréhension de pratiques sécuritaires et responsables", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "FPS3", "description": "Adopter des comportements qui encouragent des relations saines et harmonieuses", "source": "pei_tableaux_cumulatifs.txt"},
            {"code": "FPS4", "description": "Démontrer sa compréhension de ses compétences et aptitudes personnelles", "source": "pei_tableaux_cumulatifs.txt"},
        ],
        "Éducation physique": [
            # French PE if taught in French - need to check edphys_fr chunks
            # For now, keeping PE in English stream
        ]
    },
    "english_stream": {
        "Science": [
            # From eelc_science_1 chunks
            {"code": "SP-1", "description": "Share their own observations and ideas in a variety of ways", "source": "eelc_science_1_chunk_4.txt"},
            {"code": "PS-1", "description": "Describe a wide range of materials using their senses", "source": "eelc_science_1_chunk_4.txt"},
            {"code": "PS-2", "description": "Evaluate the suitability of materials for a specific purpose", "source": "eelc_science_1_chunk_4.txt"},
            {"code": "PS-3", "description": "Create a model or toy from scrap material", "source": "eelc_science_1_chunk_4.txt"},
            {"code": "LS-1", "description": "Distinguish between characteristics that make plants and animals unique", "source": "eelc_science_1_chunk_4.txt"},
            {"code": "LS-2", "description": "Classify the characteristics and needs of living things", "source": "eelc_science_1_chunk_4.txt"},
            {"code": "ESS-1", "description": "Analyze daily and seasonal changes in the environment", "source": "eelc_science_1_chunk_4.txt"},
            {"code": "ESS-2", "description": "Evaluate the characteristics of the four seasons", "source": "eelc_science_1_chunk_5.txt"},
        ],
        "Social Studies": [
            # From eelc_socialstudies_1 chunks
            {"code": "1.1.1", "description": "Demonstrate an understanding of the importance of interactions between people", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.1.2", "description": "Demonstrate an understanding of the similarity and diversity of social and cultural groups", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.1.3", "description": "Demonstrate an understanding that people within groups have rights and responsibilities", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.2.1", "description": "Recognize that environments have natural and constructed features", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.2.2", "description": "Describe how people depend upon and interact with different natural environments", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.2.3", "description": "Take age-appropriate action to practise responsible behaviour in caring for the environment", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.3.1", "description": "Demonstrate an understanding that signs, symbols, direction, and scale are used to represent landmarks and locations", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.3.2", "description": "Demonstrate an understanding that the way people live in their community evolves over time", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.3.3", "description": "Demonstrate an understanding that Aboriginal peoples' relationship with place has changed over time", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.3.4", "description": "Explain how interactions between communities have changed over time", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.4.1", "description": "Recognize that all people have needs and wants", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.4.2", "description": "Demonstrate an understanding of the factors that influence how needs and wants are met", "source": "eelc_socialstudies_1_chunk_4.txt"},
            {"code": "1.4.3", "description": "Demonstrate an understanding of how communities depend on each other for the exchange of goods and services", "source": "eelc_socialstudies_1_chunk_4.txt"},
        ],
        "Visual Arts": [
            # From eelc_visart_1 chunks
            {"code": "FC1.1", "description": "Develop an understanding of the elements and principles of art and design", "source": "eelc_visart_1_chunk_9.txt"},
            {"code": "CP1.1", "description": "Create two and three-dimensional works of art that express feelings and ideas inspired by personal experiences", "source": "eelc_visart_1_chunk_9.txt"},
            {"code": "CP1.2", "description": "Demonstrate an understanding of composition, using principles of art and design to create narrative art works or art works on a theme or topic", "source": "eelc_visart_1_chunk_9.txt"},
            {"code": "CP1.3", "description": "Use the elements of art and design in artworks to communicate ideas, messages, and understandings", "source": "eelc_visart_1_chunk_9.txt"},
            {"code": "CP1.4", "description": "Use a variety of materials, tools, and techniques to determine solutions to design challenges", "source": "eelc_visart_1_chunk_9.txt"},
            {"code": "RRA1.1", "description": "Express personal feelings and ideas about art experiences and images", "source": "eelc_visart_1_chunk_10.txt"},
            {"code": "RRA1.2", "description": "Explain how elements and principles of art and design are used to communicate meaning or understanding in their own and others' art work", "source": "eelc_visart_1_chunk_10.txt"},
            {"code": "RRA1.3", "description": "Demonstrate an awareness of the meaning of signs and symbols encountered in their daily lives and in works of art", "source": "eelc_visart_1_chunk_10.txt"},
            {"code": "RRA1.4", "description": "Identify and document their strengths, their interests, and areas for improvement as creators of art", "source": "eelc_visart_1_chunk_10.txt"},
            {"code": "EC1.1", "description": "Identify and describe a variety of visual art forms they see in their home, at school, in the community, and in visual arts experiences", "source": "eelc_visart_1_chunk_11.txt"},
            {"code": "EC1.2", "description": "Demonstrate an awareness of a variety of works of art and artistic traditions from diverse communities, times, and places", "source": "eelc_visart_1_chunk_11.txt"},
        ],
        "Music": [
            # From k3music chunks
            {"code": "ME1", "description": "Demonstrate the elements of music through musical play", "source": "k3music_chunk.txt"},
            {"code": "MA1.1", "description": "Demonstrate proper technique playing pitched and non-pitched percussion instruments", "source": "k3music_chunk.txt"},
            {"code": "MA1.2", "description": "Demonstrate their voice in a variety of contexts through musical play", "source": "k3music_chunk.txt"},
            {"code": "CCC1", "description": "Demonstrate an understanding of diverse musical genres, styles, and cultural contexts and connections through musical play", "source": "k3music_chunk.txt"},
            {"code": "SP1", "description": "Perform musical pieces for a variety of audiences", "source": "k3music_chunk.txt"},
            {"code": "RRA1", "description": "Refine live and recorded performances using the creative musical process", "source": "k3music_chunk.txt"},
        ],
        "Physical Education": [
            # From phys_ed_curriculum.txt
            {"code": "1.1", "description": "Health-Related Fitness", "source": "phys_ed_curriculum.txt"},
            {"code": "1.2", "description": "Active Living", "source": "phys_ed_curriculum.txt"},
            {"code": "1.3", "description": "Locomotor Skills", "source": "phys_ed_curriculum.txt"},
            {"code": "1.4", "description": "Non-locomotor Skills", "source": "phys_ed_curriculum.txt"},
            {"code": "1.5", "description": "Manipulative Skills", "source": "phys_ed_curriculum.txt"},
            {"code": "1.6", "description": "Movement Variables", "source": "phys_ed_curriculum.txt"},
            {"code": "1.7", "description": "Rhythmical Movement", "source": "phys_ed_curriculum.txt"},
            {"code": "1.8", "description": "Play Strategies and Skills", "source": "phys_ed_curriculum.txt"},
            {"code": "1.9", "description": "Safety and Co-operation", "source": "phys_ed_curriculum.txt"},
            {"code": "1.10", "description": "Relationships", "source": "phys_ed_curriculum.txt"},
        ],
        "Health Education": [
            # From health_curriculum.txt - Wellness Choices
            {"code": "W-1.1", "description": "Describe the health benefits of physical activity", "source": "health_curriculum.txt"},
            {"code": "W-1.2", "description": "Demonstrate positive hygiene and health care habits", "source": "health_curriculum.txt"},
            {"code": "W-1.3", "description": "Identify the specific physical changes that occur during early childhood", "source": "health_curriculum.txt"},
            {"code": "W-1.4", "description": "Identify physical characteristics that make themselves both similar to and different from others", "source": "health_curriculum.txt"},
            {"code": "W-1.5", "description": "Recognize the importance of basic healthy nutritional choices to well-being of self", "source": "health_curriculum.txt"},
            {"code": "W-1.6", "description": "Identify symbols and safety rules for hazardous household products", "source": "health_curriculum.txt"},
            {"code": "W-1.7", "description": "Describe actions to use in unsafe or abusive situations", "source": "health_curriculum.txt"},
            {"code": "W-1.8", "description": "Describe fire safety behaviors and burn injury prevention", "source": "health_curriculum.txt"},
            {"code": "W-1.9", "description": "Describe appropriate safety behaviors in and around a school building and on and around a school playground", "source": "health_curriculum.txt"},
            {"code": "W-1.10", "description": "Demonstrate how to seek emergency help using 911", "source": "health_curriculum.txt"},
            {"code": "W-1.11", "description": "Describe appropriate behavior around domestic and wild animals", "source": "health_curriculum.txt"},
            {"code": "W-1.12", "description": "Demonstrate a beginning understanding of what rabies is and what to do if bitten or scratched by an animal", "source": "health_curriculum.txt"},
            {"code": "W-1.13", "description": "Give examples of animals that sometimes carry rabies", "source": "health_curriculum.txt"},
            {"code": "W-1.14", "description": "Describe actions of a responsible pet owner", "source": "health_curriculum.txt"},
            # Relationship Choices
            {"code": "R-1.1", "description": "Recognize and demonstrate various ways to express feelings", "source": "health_curriculum.txt"},
            {"code": "R-1.2", "description": "Identify physiological responses to feelings", "source": "health_curriculum.txt"},
            {"code": "R-1.3", "description": "Identify positive and negative feelings associated with stress/change", "source": "health_curriculum.txt"},
            {"code": "R-1.4", "description": "Compare and contrast positive and negative nonverbal communication and associated feelings", "source": "health_curriculum.txt"},
            {"code": "R-1.5", "description": "Identify characteristics of being a good friend", "source": "health_curriculum.txt"},
            {"code": "R-1.6", "description": "Explain how personal behaviors and attitudes can influence the feelings and actions of others", "source": "health_curriculum.txt"},
            {"code": "R-1.7", "description": "Demonstrate age appropriate ways to resolve conflict with limited assistance", "source": "health_curriculum.txt"},
            {"code": "R-1.8", "description": "Work cooperatively with a partner", "source": "health_curriculum.txt"},
            {"code": "R-1.9", "description": "Recognize and accept individual differences within groups and families", "source": "health_curriculum.txt"},
        ]
    }
}

def main():
    """Create complete curriculum database"""
    
    # Count expectations
    french_total = sum(len(exps) for exps in ALL_EXPECTATIONS["french_immersion"].values())
    english_total = sum(len(exps) for exps in ALL_EXPECTATIONS["english_stream"].values())
    
    # Create output structure
    output = {
        "metadata": {
            "title": "PEI Grade 1 Complete Curriculum - Final Extraction",
            "grade": 1,
            "province": "Prince Edward Island",
            "extraction_date": "2025-08-09",
            "version": "FINAL",
            "total_expectations": french_total + english_total,
            "french_immersion_total": french_total,
            "english_stream_total": english_total,
            "notes": "Complete extraction from all available PEI curriculum documents"
        },
        "french_immersion": ALL_EXPECTATIONS["french_immersion"],
        "english_stream": ALL_EXPECTATIONS["english_stream"],
        "statistics": {
            "by_subject": {},
            "by_stream": {
                "french_immersion": french_total,
                "english_stream": english_total
            }
        }
    }
    
    # Calculate statistics
    for stream_name, stream_data in [("french_immersion", ALL_EXPECTATIONS["french_immersion"]),
                                      ("english_stream", ALL_EXPECTATIONS["english_stream"])]:
        for subject, expectations in stream_data.items():
            if expectations:  # Only count if not empty
                full_subject_name = f"{subject} ({stream_name})"
                output["statistics"]["by_subject"][full_subject_name] = len(expectations)
    
    # Save to file
    output_file = Path("/Users/michaelmcisaac/Github/teaching-engine2.0/curriculum/PEI_GRADE1_COMPLETE_FINAL_2025.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Complete curriculum database created!")
    print(f"Total expectations: {french_total + english_total}")
    print(f"  French Immersion: {french_total}")
    print(f"  English Stream: {english_total}")
    print(f"\nSaved to: {output_file}")
    
    # Print breakdown
    print("\n📊 Breakdown by Subject:")
    print("\nFrench Immersion:")
    for subject, exps in ALL_EXPECTATIONS["french_immersion"].items():
        if exps:
            print(f"  {subject}: {len(exps)} expectations")
    
    print("\nEnglish Stream:")
    for subject, exps in ALL_EXPECTATIONS["english_stream"].items():
        if exps:
            print(f"  {subject}: {len(exps)} expectations")

if __name__ == "__main__":
    main()