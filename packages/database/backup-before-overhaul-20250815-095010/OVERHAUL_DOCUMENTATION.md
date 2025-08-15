# System Overhaul Documentation

**Date:** August 15, 2025  
**Backup Time:** 09:50:10  

## Current Broken State (Backed Up)

### Problems Identified:
1. **Concurrent Scheduling**: 6 units all start Sept 4 (should be rotation)
2. **Excessive Unit Lengths**: Units range 2-9 weeks (should be 2-3 weeks max)
3. **Massive Over-Coverage**: 
   - Science: 156 lessons (needs 50) = 312% coverage
   - Arts: 96 lessons (needs 30) = 320% coverage
   - Health: 96 lessons (needs 30) = 320% coverage
   - Social Studies: 84 lessons (needs 30) = 280% coverage
4. **Under-Coverage in Core**:
   - French: 172 lessons (needs 195) = -23 lessons
   - Math: 180 lessons (needs 195) = -15 lessons

### Current Inventory:
- **Total Lessons:** 784
- **Total Units:** 40
- **Unit Problems:** 22 units over 4 weeks long

## Planned Changes

### New Structure:
- **Total Lessons:** 530 (down from 784)
- **Total Units:** 23 (down from 40)
- **Unit Length:** 2-3 weeks maximum
- **Teaching Model:** Rotation (not concurrent)

### Lesson Redistribution:
| Subject | Current | Target | Action |
|---------|---------|--------|--------|
| French | 172 | 195 | Add 23 |
| Math | 180 | 195 | Add 15 |
| Science | 156 | 50 | Remove 106 |
| Social Studies | 84 | 30 | Remove 54 |
| Arts | 96 | 30 | Remove 66 |
| Health | 96 | 30 | Remove 66 |
| **TOTAL** | **784** | **530** | **Remove 254** |

### Unit Restructuring:
- Delete all 40 existing units
- Create 23 new rotation-based units
- Proper 2-3 week cycles
- Sequential, not concurrent

## Backup Contents
- `database-backup.db`: Complete database with 784 lessons and 40 units
- This documentation file

## Recovery Instructions
If needed to restore:
```bash
cp backup-before-overhaul-20250815-095010/database-backup.db prisma/dev.db
```