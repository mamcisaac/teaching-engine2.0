#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeCurrentUnits() {
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    })
    
    if (!emily) {
      console.log('Emily not found')
      return
    }
    
    const scienceUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    })
    
    console.log('CURRENT SCIENCE UNITS ANALYSIS')
    console.log('===============================')
    console.log(`Total units: ${scienceUnits.length}`)
    
    for (const unit of scienceUnits) {
      const startDate = new Date(unit.startDate)
      const endDate = new Date(unit.endDate)
      const keyVocab = unit.keyVocabulary as any
      
      // Calculate actual school days between dates
      let schoolDays = 0
      const current = new Date(startDate)
      while (current <= endDate) {
        const dayOfWeek = current.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
          schoolDays++
        }
        current.setDate(current.getDate() + 1)
      }
      
      console.log(`\n${scienceUnits.indexOf(unit) + 1}. ${unit.title}`)
      console.log(`   Dates: ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]}`)
      console.log(`   Calendar days: ${Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1}`)
      console.log(`   School days (M-F): ${schoolDays}`)
      console.log(`   Claimed lessons: ${keyVocab?.totalLessons || unit.estimatedHours}`)
      console.log(`   Match? ${schoolDays === (keyVocab?.totalLessons || unit.estimatedHours) ? '✅' : `❌ (${schoolDays - (keyVocab?.totalLessons || unit.estimatedHours)} difference)`}`)
      console.log(`   Expectations: ${unit.expectations.map(e => e.expectation.code).join(', ')}`)
    }
    
    // Check for gaps
    console.log('\nGAP ANALYSIS:')
    for (let i = 0; i < scienceUnits.length - 1; i++) {
      const current = scienceUnits[i]
      const next = scienceUnits[i + 1]
      const currentEnd = new Date(current.endDate)
      const nextStart = new Date(next.startDate)
      
      const gapDays = Math.floor((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24)) - 1
      
      if (gapDays > 0) {
        console.log(`Gap between units ${i+1} and ${i+2}: ${gapDays} days`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeCurrentUnits()