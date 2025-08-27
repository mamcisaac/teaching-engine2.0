#!/usr/bin/env python3
"""Extract lesson titles and activities to create perfect materials mapping"""

import json
import re

# Read the amities file
with open('generated-lessons/formation-personnelle/amities-full.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== AMITIES UNIT - ALL LESSONS ===\n")
print("Total lessons:", data.get('totalLessons', 'Unknown'))
print("\nLesson Details:\n")

lessons = data.get('lessons', [])
for lesson in lessons:
    num = lesson.get('lessonNumber', '?')
    title = lesson.get('title', 'No title')
    goal = lesson.get('oneGoal', 'No goal')
    
    # Get activity descriptions
    opening_activity = lesson.get('opening', {}).get('activity', 'No activity')
    main_activity = lesson.get('main', {}).get('activity', 'No activity')
    closing_activity = lesson.get('closing', {}).get('activity', 'No activity')
    
    print(f"Lesson {num}: {title}")
    print(f"  Goal: {goal}")
    print(f"  Opening: {opening_activity[:100]}..." if len(opening_activity) > 100 else f"  Opening: {opening_activity}")
    print(f"  Main: {main_activity[:100]}..." if len(main_activity) > 100 else f"  Main: {main_activity}")
    print(f"  Closing: {closing_activity[:100]}..." if len(closing_activity) > 100 else f"  Closing: {closing_activity}")
    print()

print("\n=== MATERIALS NEEDED BASED ON ACTIVITIES ===\n")

# Map lessons to appropriate materials
materials_map = {
    1: {
        "title": "Qu'est-ce qu'un ami?",
        "opening": ["Photos d'amitiés diverses", "Chanson 'Bonjour mes amis' avec paroles"],
        "main": ["Cartes pictogrammes 'gentil/partager'", "Marionnettes pour jeux de rôle", "Papier et crayons pour dessiner ami"],
        "closing": ["Cartes 'Un ami c'est...' à compléter", "Engagement collectif affiché"]
    },
    2: {
        "title": "Mes qualités d'ami",
        "opening": ["Miroirs individuels incassables", "Cartes qualités positives"],
        "main": ["Photos d'actions positives", "Certificats qualités à personnaliser"],
        "closing": ["Livre classe 'Nos qualités'", "Autocollants reconnaissance"]
    },
    3: {
        "title": "Comment faire des amis",
        "opening": ["Cartes stratégies sociales illustrées", "Marionnette timide"],
        "main": ["Jeux brise-glace (ballon des noms, trouve quelqu'un qui...)", "Cartes conversation"],
        "closing": ["Badges 'Nouvel ami' à échanger", "Affiche stratégies classe"]
    },
    4: {
        "title": "Partager c'est important",
        "opening": ["15 jouets attrayants (moins qu'élèves)", "Scénario de non-partage"],
        "main": ["Minuteur visuel pour tours", "Jetons de partage", "Bac de partage classe"],
        "closing": ["Tableau célébration du partage", "Certificats partageur étoile"]
    },
    5: {
        "title": "Jouer ensemble",
        "opening": ["Parachute coopératif 3.5m", "Musique pour jeux"],
        "main": ["Jeux société coopératifs (Le Verger, Max le Chat)", "Matériel construction collective"],
        "closing": ["Ballon de gratitude", "Photos équipes réussites"]
    }
}

for lesson_num, materials in materials_map.items():
    print(f"Lesson {lesson_num}: {materials['title']}")
    print(f"  Opening needs: {', '.join(materials['opening'])}")
    print(f"  Main needs: {', '.join(materials['main'])}")
    print(f"  Closing needs: {', '.join(materials['closing'])}")
    print()