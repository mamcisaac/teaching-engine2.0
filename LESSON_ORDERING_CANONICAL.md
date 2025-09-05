# 📚 CANONICAL LESSON ORDERING WITHIN UNITS

## ⚠️ CRITICAL: Lesson Order Must Be Preserved

**Last Updated:** January 5, 2025
**Status:** IMPLEMENTED - All 970 lessons have explicit ordering

---

## 🎯 Implementation Summary

### Database Changes Made
1. **Added `lessonNumber` field** to ETFOLessonPlan table
2. **Created unique constraint** on (unitPlanId, lessonNumber) to prevent duplicates
3. **Added index** for performance on lesson retrieval
4. **Assigned sequential numbers** to all 970 lessons based on pedagogical order

### API Updates
- Repository now orders lessons by: unitPlanId → lessonNumber → createdAt
- Ensures consistent lesson sequence across all API calls

---

## 📋 LESSON SEQUENCES BY UNIT

### Français (Immersion) - 199 Lessons Total

#### Unit: Bienvenue (19 lessons)
1. Bonjour, mes amis!
2. Je m'appelle...
3. Les couleurs magiques
4. Mes premiers nombres
5. Ma famille française
6. Les animaux amusants
7. Les objets de classe
8. J'aime et je n'aime pas
9. Les actions quotidiennes
10. Les saisons et météo
11. Mes émotions en français
12. Notre routine française
13. Ma petite présentation
14. Jeux et chansons françaises
15. Histoires et images
16. Art et créativité française
17. Cuisiner et goûter
18. Musique et mouvement
19. Notre célébration française

#### Unit: Histoires d'automne (20 lessons)
[Continues with full sequence...]

### Mathématiques - 197 Lessons Total

#### Unit: Nombres 0-10 (20 lessons)
1. Découvrir les nombres dans notre monde
2. Compter avec nos doigts
3. Représenter les nombres 0-3
4. Explorer les nombres 4 et 5
5. Jeux de nombres 0-5
6. Compter vers l'avant et vers l'arrière
7. Découvrir les nombres 6 et 7
8. Mesurer avec les nombres
9. Explorer les nombres 8 et 9
10. Le nombre magique 10
11. Régularités avec les nombres
12. Comparer les nombres
13. Écrire les nombres 0-10
14. Portfolio de nombres - évaluation
15. Jeux de nombres amusants
16. Art mathématique avec les nombres
17. Chansons et rythmes des nombres
18. Enquête sur les nombres dans l'école
19. Histoires de nombres créatives
20. Célébration des mathématiques

#### Unit: Nombres 11-20 (20 lessons)
1. Découverte des nombres 11 et 12
2. Explorer 13, 14 et 15
3. Nombres 16, 17, 18, 19
4. Le nombre 20 et la deuxième dizaine
5. Révision et consolidation 11-20
6. Compter par bonds de 10
7. Représenter les nombres avec dizaines et unités
8. Comparer les nombres 11-20
9. Patterns et régularités avec 11-20
10. Introduction à l'addition simple avec des nombres teen
11. Résolution de problèmes avec 11-20
12. Jeux mathématiques avec 11-20
13. Estimation avec les nombres 11-20
14. Nombres ordinaux jusqu'à 20
15. Évaluation formative et consolidation
16. Introduction aux nombres 21-25
17. Exploration libre: nombres jusqu'à 30
18. Projet: Collection et comptage
19. Partage et célébration des apprentissages
20. Réflexion et planification future

### Sciences de la nature - 199 Lessons Total

#### Unit: Petits scientifiques (20 lessons)
1. Bienvenue dans le monde scientifique
2. Les cinq sens explorateurs
3. Observer comme un scientifique
4. Questions et curiosités
5. Mon premier carnet de science
[Continues...]

### Arts visuels - 181 Lessons Total

#### Unit: Premiers pas artistiques (19 lessons)
1. Découverte de l'atelier d'art
2. Les outils d'artiste
3. Exploration libre avec crayons
4. Les formes dans l'art
[Continues...]

### Sciences humaines - 96 Lessons Total

#### Unit: Moi et mon école (20 lessons)
1. Bienvenue à l'école
2. Notre salle de classe
3. Les règles de vie
4. Mes nouveaux amis
[Continues...]

### Formation personnelle et sociale - 98 Lessons Total

#### Unit: Corps et sécurité (20 lessons)
1. Mon corps précieux
2. Les parties de mon corps
3. Comment je bouge
4. La sécurité à l'école
[Continues...]

---

## 🔍 Verification Queries

### Check lesson ordering for any unit:
```sql
SELECT lessonNumber, titleFr 
FROM ETFOLessonPlan 
WHERE unitPlanId = (SELECT id FROM UnitPlan WHERE titleFr = 'bienvenue')
ORDER BY lessonNumber;
```

### Verify all lessons have numbers:
```sql
SELECT COUNT(*) as total_lessons,
       COUNT(lessonNumber) as numbered_lessons,
       COUNT(DISTINCT unitPlanId || '-' || lessonNumber) as unique_numbers
FROM ETFOLessonPlan;
-- Should return: 970, 970, 970
```

### Find any duplicate lesson numbers:
```sql
SELECT unitPlanId, lessonNumber, COUNT(*) as count
FROM ETFOLessonPlan
WHERE lessonNumber IS NOT NULL
GROUP BY unitPlanId, lessonNumber
HAVING COUNT(*) > 1;
-- Should return: 0 rows
```

---

## 🛠️ Maintenance Scripts

### Re-assign lesson numbers if needed:
```bash
python3 scripts/assign-lesson-numbers.py
```

### Backup lesson ordering:
```bash
sqlite3 /path/to/dev.db ".mode csv" ".headers on" \
  "SELECT id, unitPlanId, lessonNumber, titleFr FROM ETFOLessonPlan ORDER BY unitPlanId, lessonNumber" \
  > lesson_order_backup.csv
```

---

## ⚠️ CRITICAL RULES

1. **NEVER** change lessonNumber without pedagogical review
2. **NEVER** allow duplicate lesson numbers within a unit
3. **ALWAYS** maintain sequential numbering (1, 2, 3... no gaps)
4. **ALWAYS** order API results by lessonNumber when displaying lessons
5. **NEVER** delete lessons without renumbering remaining lessons

---

## 📝 Change Log

- **2025-01-05:** Initial implementation - assigned lesson numbers to all 970 lessons
- **2025-01-05:** Removed 13 orphan lessons without valid unit associations
- **2025-01-05:** Created unique constraint to prevent future duplicates