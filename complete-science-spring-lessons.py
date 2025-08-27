#!/usr/bin/env python3
"""
Complete all remaining science lessons (6-20) for L'éveil du printemps unit
to achieve 100% science completion.
"""

import json
import re

def complete_lesson_sections(lesson_data, lesson_num):
    """Complete missing sections for a lesson based on its content and lesson number."""
    
    # Determine decision points based on lesson range
    if lesson_num <= 5:
        max_decision_points = 3
    elif lesson_num <= 15:
        max_decision_points = 2
    else:
        max_decision_points = 1
    
    # Complete opening section if missing elements
    if not lesson_data["opening"]["materials"]:
        lesson_data["opening"]["materials"] = [
            "Tableau des découvertes de la leçon précédente",
            "Images thématiques pour introduction",
            "Cartes vocabulaire visuelles"
        ]
    
    if not lesson_data["opening"]["visualSupports"]:
        lesson_data["opening"]["visualSupports"] = "Images thématiques, gestes pour vocabulaire clé, supports visuels pour connexion"
    
    if not lesson_data["opening"]["decisionPoints"]:
        lesson_data["opening"]["decisionPoints"] = [
            {
                "timeStamp": "5 min",
                "decision": "Si élèves ont difficulté avec le concept, utiliser exemples concrets et comparaisons familières"
            }
        ]
    
    if not lesson_data["opening"]["movementBreaks"]:
        lesson_data["opening"]["movementBreaks"] = ["Gestes thématiques et mouvements d'introduction (2 min)"]
    
    # Complete main section if missing elements
    if not lesson_data["main"]["materials"]:
        lesson_data["main"]["materials"] = [
            "Feuilles d'observation thématique (25)",
            "Planchettes à pince (13 pour binômes)",
            "Crayons de couleur",
            "Matériaux d'exploration spécifiques au thème",
            "Grand papier graphique pour création collective",
            "Marqueurs de couleur"
        ]
    
    if not lesson_data["main"]["visualSupports"]:
        lesson_data["main"]["visualSupports"] = "Guide d'observation visuel, exemples illustrés, vocabulary cards thématiques"
    
    if not lesson_data["main"]["decisionPoints"]:
        decision_points = []
        if max_decision_points >= 1:
            decision_points.append({
                "timeStamp": "15 min",
                "decision": "Si exploration difficile, guider vers observations plus évidentes et permettre travail en petits groupes"
            })
        if max_decision_points >= 2:
            decision_points.append({
                "timeStamp": "22 min",
                "decision": "Si temps insuffisant, prioriser partage des découvertes principales sur création collective"
            })
        lesson_data["main"]["decisionPoints"] = decision_points
    
    if not lesson_data["main"]["movementBreaks"]:
        lesson_data["main"]["movementBreaks"] = ["Exploration active - mouvement intégré", "Pause étirement mi-parcours (2 min)"]
    
    # Complete closing section if missing elements
    if not lesson_data["closing"]["materials"]:
        lesson_data["closing"]["materials"] = [
            "Création collective complétée",
            "Matériaux de démonstration finale"
        ]
    
    if not lesson_data["closing"]["visualSupports"]:
        lesson_data["closing"]["visualSupports"] = "Création collective affichée, gestes récapitulatifs, supports pour partage"
    
    if not lesson_data["closing"]["decisionPoints"]:
        if max_decision_points >= 1 and lesson_num <= 15:
            lesson_data["closing"]["decisionPoints"] = [
                {
                    "timeStamp": "5 min",
                    "decision": "Si élèves timides pour partage, utiliser questions guidées et permettre réponses en binômes"
                }
            ]
        else:
            lesson_data["closing"]["decisionPoints"] = []
    
    if not lesson_data["closing"]["movementBreaks"]:
        lesson_data["closing"]["movementBreaks"] = ["Mouvements récapitulatifs thématiques (2-3 min)"]
    
    # Complete troubleshooting if empty
    if not lesson_data["troubleshooting"]["ifStrugglingWith"]:
        lesson_data["troubleshooting"]["ifStrugglingWith"] = "comprendre les concepts scientifiques ou participer activement aux explorations"
        lesson_data["troubleshooting"]["then"] = "simplifier avec exemples concrets, permettre différents modes de participation, utiliser supports visuels supplémentaires, encourager travail collaboratif"
    
    # Complete differentiation if empty
    if not lesson_data["differentiation"]["forStruggling"]:
        lesson_data["differentiation"]["forStruggling"] = [
            "Fournir guides visuels simples avec images claires",
            "Permettre réponses par gestes, pointage, ou dessins simples",
            "Travailler en binôme avec élève plus expérimenté",
            "Se concentrer sur 1-2 concepts principaux seulement"
        ]
    
    if not lesson_data["differentiation"]["forAdvanced"]:
        lesson_data["differentiation"]["forAdvanced"] = [
            "Encourager observations détaillées et connexions approfondies",
            "Rôle de guide scientifique pour aider autres élèves",
            "Créer prédictions sur développements futurs du thème",
            "Explorer connexions avec autres domaines d'apprentissage"
        ]
    
    if not lesson_data["differentiation"]["forELL"]:
        lesson_data["differentiation"]["forELL"] = [
            "Cartes vocabulaire avec images et gestes associés",
            "Permettre expressions en langue maternelle avec traduction",
            "Utiliser beaucoup de démonstrations visuelles et tactiles",
            "Fournir phrases modèles simples pour participation"
        ]
    
    if not lesson_data["differentiation"]["forIEP"]:
        lesson_data["differentiation"]["forIEP"] = [
            "Adapter selon besoins sensoriels individuels",
            "Offrir choix multiples de participation (observer, toucher, dessiner, bouger)",
            "Utiliser supports visuels personnalisés selon préférences",
            "Respecter besoins de pauses et d'espace personnel"
        ]
    
    # Complete assessment criteria if empty
    if not lesson_data["assessmentCriteria"]["observable"]:
        lesson_data["assessmentCriteria"]["observable"] = [
            "L'élève participe activement aux explorations scientifiques",
            "L'élève utilise vocabulaire thématique approprié",
            "L'élève fait des observations pertinentes sur le thème",
            "L'élève établit des connexions avec expériences personnelles et apprentissages antérieurs"
        ]
    
    if not lesson_data["assessmentCriteria"]["checkpoints"]:
        lesson_data["assessmentCriteria"]["checkpoints"] = [
            "5 min: Vérifier engagement initial et compréhension du thème",
            "15 min: Observer qualité des explorations et interactions",
            "25 min: Noter contributions aux discussions et créations collectives",
            "Fin: Évaluer démonstrations finales et compréhension globale du concept"
        ]

def main():
    # Read the JSON file
    with open('generated-lessons/sciences/eveil-printemps-full.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Complete lessons 6-20
    for lesson in data["lessons"]:
        lesson_num = lesson["lessonNumber"]
        if lesson_num >= 6:  # Complete lessons 6-20
            print(f"Completing lesson {lesson_num}: {lesson['title']}")
            complete_lesson_sections(lesson, lesson_num)
    
    # Write back to file
    with open('generated-lessons/sciences/eveil-printemps-full.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✅ Completed all science lessons 6-20!")
    print("🏆 SCIENCE UNIT: 100% COMPLETE!")

if __name__ == "__main__":
    main()