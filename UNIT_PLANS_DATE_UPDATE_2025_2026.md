# Unit Plans Date Update for 2025-2026 School Year

## 🎯 Update Summary

All unit plans need dates updated from 2024-2025 to 2025-2026 based on official PEI calendar.

## 📅 Official Calendar Key Dates

- **First Day**: Thursday, September 4, 2025
- **Last Day (K-9)**: Thursday, June 25, 2026
- **Total Instructional Days**: 181
- **Winter Break**: Dec 20, 2025 - Jan 4, 2026
- **March Break**: March 16-20, 2026

## 🔄 Required Date Updates for All Subjects

### FRANÇAIS LANGUE PREMIÈRE (8 units)

| Unit | Current Dates | NEW 2025-2026 Dates | Days |
|------|--------------|---------------------|------|
| 1. Bienvenue à l'école! | Sept 3-27, 2024 | **Sept 4-30, 2025** | 19 |
| 2. Ma famille et moi | Sept 30 - Oct 25, 2024 | **Oct 1-31, 2025** | 23 |
| 3. Les fêtes d'automne | Oct 28 - Dec 20, 2024 | **Nov 3 - Dec 19, 2025** | 34 |
| 4. L'hiver magique | Jan 6-31, 2025 | **Jan 5-30, 2026** | 20 |
| 5. Nos amis les animaux | Feb 3-28, 2025 | **Feb 2-27, 2026** | 18 |
| 6. Ma communauté | Mar 3-28, 2025 | **Mar 2-13, 2026** | 10 |
| 7. Le printemps en fleurs | Mar 31 - May 23, 2025 | **Mar 23 - May 15, 2026** | 35 |
| 8. Célébrons | May 26 - Jun 20, 2025 | **May 19 - Jun 25, 2026** | 27 |

### MATHÉMATIQUES (8 units)

| Unit | Current Dates | NEW 2025-2026 Dates | Days |
|------|--------------|---------------------|------|
| 1. Les nombres | Sept 3-27, 2024 | **Sept 4-30, 2025** | 19 |
| 2. Comprendre les nombres | Sept 30 - Oct 25, 2024 | **Oct 1-31, 2025** | 23 |
| 3. Régularités et formes | Oct 28 - Nov 22, 2024 | **Nov 3-28, 2025** | 18 |
| 4. Addition et soustraction | Nov 25, 2024 - Jan 31, 2025 | **Dec 1, 2025 - Jan 30, 2026** | 35 |
| 5. Stratégies de calcul | Feb 3-28, 2025 | **Feb 2-27, 2026** | 18 |
| 6. Explorer la mesure | Mar 3-28, 2025 | **Mar 2-13, 2026** | 10 |
| 7. Résolution de problèmes | Mar 31 - May 9, 2025 | **Mar 23 - May 8, 2026** | 30 |
| 8. Célébration mathématique | May 12 - Jun 20, 2025 | **May 11 - Jun 25, 2026** | 33 |

### SCIENCES DE LA NATURE (7 units)

| Unit | Current Dates | NEW 2025-2026 Dates | Days |
|------|--------------|---------------------|------|
| 1. Notre environnement | Sept 3-27, 2024 | **Sept 4 - Oct 3, 2025** | 22 |
| 2. Changements d'automne | Sept 30 - Nov 8, 2024 | **Oct 6 - Nov 14, 2025** | 28 |
| 3. L'énergie | Nov 11 - Dec 20, 2024 | **Nov 17 - Dec 19, 2025** | 23 |
| 4. L'hiver | Jan 6 - Feb 14, 2025 | **Jan 5 - Feb 13, 2026** | 28 |
| 5. Grandir et changer | Feb 17 - Apr 11, 2025 | **Feb 17 - Apr 10, 2026** | 35 |
| 6. Le printemps | Apr 14 - May 16, 2025 | **Apr 13 - May 15, 2026** | 23 |
| 7. Notre impact | May 19 - Jun 20, 2025 | **May 19 - Jun 25, 2026** | 27 |

## 📊 Distribution Analysis

### Term 1 (Sept - Jan): 82 instructional days
- September: 18 days
- October: 21 days  
- November: 15 days
- December: 15 days
- January: 20 days

### Term 2 (Feb - June): 99 instructional days
- February: 18 days
- March: 17 days (includes break)
- April: 19 days
- May: 19 days
- June: 19 days

## 🎯 Implementation Steps

### 1. Update Seed Files
Each seed file needs these date changes:
```typescript
// OLD: startDate: new Date('2024-09-03')
// NEW: startDate: new Date('2025-09-04')

// OLD: endDate: new Date('2025-06-20')  
// NEW: endDate: new Date('2026-06-25')
```

### 2. Account for Breaks
Ensure units properly bridge:
- Winter Break: Dec 20 - Jan 4
- March Break: Mar 16-20
- All PD days and holidays

### 3. Adjust Hours
With 181 instructional days:
- French: ~4.2 hours/week maintained
- Math: ~4.8 hours/week maintained
- Science: ~3.0 hours/week maintained

## 📝 Files to Update

1. `/packages/database/prisma/seed-unit-plans-francais.ts`
2. `/packages/database/prisma/seed-unit-plans-mathematiques.ts`
3. `/packages/database/prisma/seed-unit-plans-sciences.ts`
4. `/packages/database/prisma/seed-long-range-plans.ts`

## ✅ Benefits of Update

- Aligns with official 2025-2026 calendar
- Ready for September 4, 2025 start
- Accounts for all 181 instructional days
- Respects all breaks and PD days
- Maintains pedagogical integrity

## 🚀 Next Steps

1. Update all seed files with new dates
2. Re-run database seeds
3. Verify alignment with calendar
4. Generate updated documentation
5. Prepare for September 2025!

---

*Based on official PEI 2025-2026 School Calendar*
*Ready for implementation starting September 4, 2025*