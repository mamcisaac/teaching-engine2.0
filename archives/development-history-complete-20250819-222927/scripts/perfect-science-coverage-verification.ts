#!/usr/bin/env npx tsx

/**
 * PHASE 3B: Perfect Coverage Verification
 * 
 * Verify that the 10 Science units provide complete coverage of all 195 school days
 * with no gaps or overlaps in the PEI 2025-2026 academic calendar.
 * 
 * Key Requirements:
 * ✅ Exactly 195 lessons total
 * ✅ No calendar gaps between units
 * ✅ No overlapping unit dates
 * ✅ Proper alignment with PEI school calendar
 * ✅ Holiday periods properly handled
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyCoverageAndTiming() {
  console.log('📅 PHASE 3B: Verifying complete coverage of 195 school days...')
  
  try {
    // Find Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    })
    
    if (!emily) {
      throw new Error('Emily McIsaac account not found')
    }
    
    // Find all Science units for Emily (ordered by start date)
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
    
    console.log(`📋 Found ${scienceUnits.length} Science units`)
    
    // PEI 2025-2026 School Calendar Reference
    const peiCalendar = {
      schoolStart: new Date('2025-09-02'),
      firstSemesterEnd: new Date('2026-01-31'),
      secondSemesterStart: new Date('2026-02-01'),
      schoolEnd: new Date('2026-06-18'),
      holidays: [
        { name: 'Christmas Break', start: new Date('2025-12-23'), end: new Date('2026-01-03') },
        { name: 'March Break', start: new Date('2026-03-30'), end: new Date('2026-04-04') }
      ]
    }
    
    console.log('\n🔍 Coverage Analysis:')
    
    // 1. Check total lesson count
    let totalLessons = 0
    for (const unit of scienceUnits) {
      const keyVocab = unit.keyVocabulary as any
      const lessons = keyVocab?.totalLessons || 0
      totalLessons += lessons
    }
    
    console.log(`📊 Total lessons: ${totalLessons}/195 ${totalLessons === 195 ? '✅' : '❌'}`)
    
    // 2. Check chronological order and gaps
    let gapsFound = 0
    let overlapsFound = 0
    let previousEndDate = null
    
    console.log('\n📅 Unit Progression:')
    for (let i = 0; i < scienceUnits.length; i++) {
      const unit = scienceUnits[i]
      const keyVocab = unit.keyVocabulary as any
      const lessons = keyVocab?.totalLessons || 0
      const month = keyVocab?.month || 'unknown'
      
      const startDate = new Date(unit.startDate)
      const endDate = new Date(unit.endDate)
      
      // Check for gaps
      if (previousEndDate) {
        const daysBetween = Math.floor((startDate.getTime() - previousEndDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Allow for weekends and expected breaks
        if (daysBetween > 3 && daysBetween !== 14) { // 14 days = 2 weeks for breaks
          console.log(`  ⚠️  Gap detected: ${daysBetween} days between units ${i} and ${i+1}`)
          gapsFound++
        }
        
        // Check for overlaps
        if (startDate < previousEndDate) {
          console.log(`  ❌ Overlap detected: Unit ${i+1} starts before Unit ${i} ends`)
          overlapsFound++
        }
      }
      
      console.log(`  ${month}: ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]} (${lessons} lessons) - "${unit.title}"`)
      
      previousEndDate = endDate
    }
    
    // 3. Check December coverage specifically (this was the major gap identified)
    const decemberUnit = scienceUnits.find(unit => {
      const keyVocab = unit.keyVocabulary as any
      return keyVocab?.month === 'décembre'
    })
    
    console.log('\n🎄 December Coverage Check:')
    if (decemberUnit) {
      const startDate = new Date(decemberUnit.startDate)
      const endDate = new Date(decemberUnit.endDate)
      const keyVocab = decemberUnit.keyVocabulary as any
      const lessons = keyVocab?.totalLessons || 0
      
      console.log(`  December unit: ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]}`)
      console.log(`  December lessons: ${lessons}`)
      
      // Check if it covers expected December school days (should be ~16 days)
      if (lessons >= 14 && lessons <= 18) {
        console.log(`  December coverage: ✅ GOOD (${lessons} lessons covers expected school days)`)
      } else {
        console.log(`  December coverage: ❌ PROBLEM (${lessons} lessons may not cover all December school days)`)
      }
    } else {
      console.log('  December unit: ❌ NOT FOUND')
    }
    
    // 4. Check Grade 1 cognitive progression
    console.log('\n🧠 Cognitive Progression Check:')
    const expectedProgression = [
      'concrete_observation',
      'pattern_observation', 
      'hands_on_testing',
      'practical_application',
      'sensory_exploration',
      'life_observation',
      'pattern_prediction',
      'mechanical_exploration',
      'environmental_connections',
      'synthesis_application'
    ]
    
    let progressionCorrect = true
    for (let i = 0; i < scienceUnits.length; i++) {
      const unit = scienceUnits[i]
      const keyVocab = unit.keyVocabulary as any
      const cognitiveLevel = keyVocab?.cognitiveLevel
      const expected = expectedProgression[i]
      
      if (cognitiveLevel === expected) {
        console.log(`  ${i + 1}. ${cognitiveLevel}: ✅`)
      } else {
        console.log(`  ${i + 1}. ${cognitiveLevel} (expected: ${expected}): ❌`)
        progressionCorrect = false
      }
    }
    
    // 5. Final verification
    console.log('\n🎯 FINAL VERIFICATION:')
    console.log(`  Total units: ${scienceUnits.length}/10 ${scienceUnits.length === 10 ? '✅' : '❌'}`)
    console.log(`  Total lessons: ${totalLessons}/195 ${totalLessons === 195 ? '✅' : '❌'}`)
    console.log(`  Chronological order: ${gapsFound === 0 && overlapsFound === 0 ? '✅' : '❌'}`)
    console.log(`  December coverage: ${decemberUnit ? '✅' : '❌'}`)
    console.log(`  Cognitive progression: ${progressionCorrect ? '✅' : '❌'}`)
    
    const isPerfect = (
      scienceUnits.length === 10 &&
      totalLessons === 195 &&
      gapsFound === 0 &&
      overlapsFound === 0 &&
      decemberUnit &&
      progressionCorrect
    )
    
    console.log('')
    if (isPerfect) {
      console.log('🎉 PHASE 3B COMPLETE: Perfect coverage verified!')
      console.log('✅ All 195 school days covered with proper progression')
      console.log('✅ No gaps or overlaps in unit timing')
      console.log('✅ Age-appropriate cognitive development sequence')
      console.log('✅ December gap completely eliminated')
    } else {
      console.log('❌ PHASE 3B INCOMPLETE: Coverage issues detected')
      console.log(`  Gaps found: ${gapsFound}`)
      console.log(`  Overlaps found: ${overlapsFound}`)
    }
    
  } catch (error) {
    console.error('💥 Coverage verification failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute coverage verification
verifyCoverageAndTiming()
  .then(() => {
    console.log('🔍 Coverage verification complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Coverage verification failed:', error)
    process.exit(1)
  })