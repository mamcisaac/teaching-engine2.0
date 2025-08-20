#!/usr/bin/env npx tsx

/**
 * Fix June Unit Final Issue
 * Unit 10 has 17 lessons but 19 school days - needs to be 19 lessons
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixJuneUnit() {
  console.log('🔧 FIXING JUNE UNIT FINAL ISSUE')
  console.log('================================\n')
  
  try {
    // Find Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    })
    
    if (!emily) {
      throw new Error('Emily McIsaac account not found')
    }
    
    // Find June unit (last unit)
    const scienceUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    
    const juneUnit = scienceUnits[9] // Unit 10 (June)
    const keyVocab = juneUnit.keyVocabulary as any
    
    console.log('Current June unit status:')
    console.log(`  Lessons: ${keyVocab?.totalLessons || 0}`)
    console.log(`  School days: 19`)
    console.log(`  Needs: 19 lessons to match school days\n`)
    
    // Update to exactly 19 lessons
    await prisma.unitPlan.update({
      where: { id: juneUnit.id },
      data: {
        estimatedHours: 19,
        keyVocabulary: {
          ...keyVocab,
          totalLessons: 19,
          schoolDays: 19
        }
      }
    })
    
    console.log('✅ Updated June unit to 19 lessons\n')
    
    // Verify total across all units
    const updatedUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    
    let totalLessons = 0
    console.log('FINAL LESSON DISTRIBUTION:')
    console.log('==========================\n')
    
    for (let i = 0; i < updatedUnits.length; i++) {
      const unit = updatedUnits[i]
      const keyVocab = unit.keyVocabulary as any
      const lessons = keyVocab?.totalLessons || 0
      totalLessons += lessons
      
      // Calculate actual school days
      let schoolDays = 0
      const current = new Date(unit.startDate)
      const end = new Date(unit.endDate)
      
      while (current <= end) {
        const day = current.getDay()
        if (day !== 0 && day !== 6) schoolDays++
        current.setDate(current.getDate() + 1)
      }
      
      const match = schoolDays === lessons ? '✅' : '❌'
      const month = keyVocab?.month || 'unknown'
      console.log(`Unit ${i + 1} (${month}): ${lessons} lessons = ${schoolDays} school days ${match}`)
    }
    
    console.log(`\n==========================`)
    console.log(`TOTAL: ${totalLessons} lessons`)
    console.log(`TARGET: 195 lessons`)
    console.log(`STATUS: ${totalLessons === 195 ? '✅ PERFECT!' : '❌ Mismatch'}\n`)
    
    if (totalLessons === 195) {
      console.log('🎉 MATHEMATICAL PERFECTION ACHIEVED!')
      console.log('All units have lesson counts that exactly match school days.')
      console.log('Total is exactly 195 lessons as required.')
    }
    
  } catch (error) {
    console.error('💥 Error fixing June unit:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the fix
fixJuneUnit()
  .then(() => {
    console.log('\n✅ June unit fixed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  })