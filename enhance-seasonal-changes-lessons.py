#!/usr/bin/env python3
"""
Comprehensive Enhancement Script for Seasonal Changes Science Unit
Enhances all 20 lessons with required components for Grade 1 French Immersion
"""

import json
import sys
from pathlib import Path

def enhance_lesson_components(lesson, lesson_num):
    """Enhanced each lesson with all required components"""
    
    # Decision points based on lesson number
    if lesson_num <= 5:
        decision_point_count = 3
    elif lesson_num <= 15:
        decision_point_count = 2
    else:
        decision_point_count = 1

    # Materials for 20-25 students, school-available
    materials_by_section = {
        "opening": [
            "Cartes visuelles du vocabulaire (25)",
            "Tableau d'affichage (1)",
            "Marqueurs de couleur (4)"
        ],
        "main": [
            "Matériaux de manipulation (25 ensembles)",
            "Feuilles d'activité (25)",
            "Crayons de couleur (25 ensembles)",
            "Matériaux d'expérience selon l'activité",
            "Tableau de classe (1)",
            "Loupes (10 à partager)"
        ],
        "closing": [
            "Tableau de synthèse (1)",
            "Autocollants de réussite (25)",
            "Matériel de présentation (selon activité)"
        ]
    }

    # Visual supports
    visual_supports = {
        "opening": "Cartes visuelles du vocabulaire de la leçon, pictogrammes d'appui, affichage de référence",
        "main": "Guides visuels étape par étape, cartes de consignes illustrées, supports d'observation",
        "closing": "Tableau de synthèse visuel, cartes de réflexion, affichage des apprentissages"
    }

    # Decision points based on common Grade 1 scenarios
    decision_points_templates = [
        "Si les élèves ont des difficultés de compréhension : utiliser plus de supports visuels et gestuelle",
        "Si l'activité prend plus de temps que prévu : ajuster en gardant l'essentiel",
        "Si certains élèves terminent rapidement : fournir extension ou rôle d'aide",
        "Si les élèves sont très excités : utiliser signal de calme et recentrer",
        "Si du matériel manque : adapter avec alternatives disponibles en classe",
        "Si la météo ne permet pas l'activité extérieure : adapter pour intérieur"
    ]

    # Enhance each section of the lesson
    sections = ['opening', 'main', 'closing']
    
    for section in sections:
        if section in lesson:
            # Materials
            if not lesson[section].get('materials') or lesson[section]['materials'] == []:
                lesson[section]['materials'] = materials_by_section[section]
            
            # Visual supports
            if not lesson[section].get('visualSupports') or lesson[section]['visualSupports'] == "":
                lesson[section]['visualSupports'] = visual_supports[section]
            
            # Decision points
            if not lesson[section].get('decisionPoints') or lesson[section]['decisionPoints'] == []:
                points_needed = min(decision_point_count, len(decision_points_templates))
                lesson[section]['decisionPoints'] = decision_points_templates[:points_needed]
                decision_point_count -= points_needed
                if decision_point_count <= 0:
                    break

    # Troubleshooting
    if not lesson.get('troubleshooting', {}).get('ifStrugglingWith'):
        lesson['troubleshooting'] = {
            "ifStrugglingWith": f"comprendre les concepts de la leçon {lesson_num} sur les changements saisonniers",
            "then": "utiliser plus de supports visuels concrets, répéter avec gestes, simplifier le vocabulaire, permettre travail en pairs, utiliser exemples de leur expérience quotidienne"
        }

    # Differentiation
    if not lesson.get('differentiation', {}).get('forStruggling') or lesson['differentiation']['forStruggling'] == []:
        lesson['differentiation'] = {
            "forStruggling": [
                "Fournir supports visuels supplémentaires et aide individuelle",
                "Simplifier le vocabulaire à l'essentiel",
                "Permettre travail en équipe avec pairs plus forts",
                "Utiliser gestes et manipulation concrète"
            ],
            "forAdvanced": [
                "Encourager questions approfondies et hypothèses",
                "Proposer extensions créatives ou explorations additionnelles",
                "Inviter à aider autres élèves et expliquer concepts",
                "Introduire vocabulaire plus complexe si approprié"
            ],
            "forELL": [
                "Cartes visuelles bilingues disponibles",
                "Répétition fréquente avec gestes supportifs",
                "Permettre expression en L1 puis traduction",
                "Vocabulaire essentiel écrit avec pictogrammes"
            ],
            "forIEP": [
                "Adapter selon objectifs individuels du PEI",
                "Modifier matériaux selon besoins spécifiques",
                "Permettre réponses alternatives (oral, gestuel, choix multiple)",
                "Fournir supports sensoriels au besoin"
            ]
        }

    # Assessment criteria
    if not lesson.get('assessmentCriteria', {}).get('observable') or lesson['assessmentCriteria']['observable'] == []:
        lesson['assessmentCriteria'] = {
            "observable": [
                f"Démontre compréhension des concepts clés de la leçon {lesson_num}",
                "Utilise appropriément le vocabulaire de la leçon",
                "Participe activement aux activités d'apprentissage",
                "Peut expliquer ou montrer ce qui a été appris"
            ],
            "checkpoints": [
                "Observation directe pendant les activités",
                "Vérification des productions d'élèves (dessins, réponses)",
                "Écoute des explications et discussions",
                "Documentation des progrès individuels"
            ]
        }

    return lesson

def enhance_seasonal_changes_unit():
    """Main function to enhance the seasonal changes unit"""
    
    file_path = Path("generated-lessons/sciences/changements-saisonniers-full.json")
    
    if not file_path.exists():
        print(f"Error: File {file_path} not found!")
        return False
    
    # Load the unit
    with open(file_path, 'r', encoding='utf-8') as f:
        unit_data = json.load(f)
    
    print(f"Enhancing {len(unit_data['lessons'])} lessons in seasonal changes unit...")
    
    # Enhance each lesson
    for i, lesson in enumerate(unit_data['lessons']):
        lesson_num = lesson.get('lessonNumber', i + 1)
        print(f"  Enhancing lesson {lesson_num}: {lesson.get('title', 'Untitled')}")
        unit_data['lessons'][i] = enhance_lesson_components(lesson, lesson_num)
    
    # Update metadata
    unit_data['metadata']['lastUpdated'] = "2025-08-27T21:00:00.000Z"
    unit_data['metadata']['status'] = "enhanced"
    
    # Save the enhanced unit
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(unit_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Successfully enhanced all {len(unit_data['lessons'])} lessons!")
    print("✅ All lessons now include:")
    print("   - Materials for 20-25 students")
    print("   - Visual supports")
    print("   - Decision points (2-3 for L1-5, 1-2 for L6-15, 0-1 for L16-20)")
    print("   - 4-category differentiation")
    print("   - Assessment criteria")
    print("   - Troubleshooting guidance")
    
    return True

if __name__ == "__main__":
    success = enhance_seasonal_changes_unit()
    sys.exit(0 if success else 1)