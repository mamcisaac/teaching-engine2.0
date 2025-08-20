#!/usr/bin/env npx tsx

/**
 * LINK EXPECTATIONS TO UNITS - Database Relationship Fix
 * 
 * The perfect units have expectations in their descriptions but not 
 * properly linked in the database relationships. This script fixes that.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Expectation mapping based on the perfect unit design
const UNIT_EXPECTATION_MAPPING = [
  {
    unitNumber: 1,
    title: "École des petits scientifiques",
    expectations: ["1.1.1"] // Introduce living vs non-living
  },
  {
    unitNumber: 2, 
    title: "Matériaux dans notre environnement",
    expectations: ["1.1.2"] // Introduce human-environment interaction
  },
  {
    unitNumber: 3,
    title: "Changements d'automne autour de nous",
    expectations: ["1.3.1", "1.3.2", "1.2.1"] // Seasonal changes + effects + energy intro
  },
  {
    unitNumber: 4,
    title: "Lumière et chaleur en hiver", 
    expectations: ["1.2.1", "1.3.1", "1.3.2"] // Energy develop + winter changes + effects
  },
  {
    unitNumber: 5,
    title: "Croissance et besoins des vivants",
    expectations: ["1.1.1", "1.3.2"] // Living vs non-living develop + seasonal effects  
  },
  {
    unitNumber: 6,
    title: "Êtres vivants et non-vivants - experts",
    expectations: ["1.1.1"] // Living vs non-living consolidation
  },
  {
    unitNumber: 7,
    title: "Réveil du printemps",
    expectations: ["1.3.1", "1.3.2"] // Seasonal changes + effects development
  },
  {
    unitNumber: 8,
    title: "Notre responsabilité environnementale",
    expectations: ["1.1.2"] // Human-environment interaction development
  },
  {
    unitNumber: 9,
    title: "Protecteurs de l'environnement", 
    expectations: ["1.1.2"] // Human-environment interaction consolidation
  },
  {
    unitNumber: 10,
    title: "Célébration de notre année scientifique",
    expectations: ["1.1.1", "1.1.2", "1.2.1", "1.3.1", "1.3.2"] // Review all expectations
  }
]

async function linkExpectationsToUnits() {
  console.log('🔗 LINKING EXPECTATIONS TO UNITS - Database Relationship Fix')
  console.log('===========================================================\n')

  try {
    // Find Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    })

    if (!emily) {
      throw new Error('Emily McIsaac not found')
    }

    // Get all Science curriculum expectations
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Sciences de la nature',
        grade: 1
      }
    })

    if (allExpectations.length === 0) {
      throw new Error('No Science expectations found')
    }

    console.log('📚 AVAILABLE EXPECTATIONS')
    console.log('========================')
    allExpectations.forEach(exp => {
      console.log(`${exp.code}: ${exp.description}`)
    })
    console.log('')

    // Get all Science units in order
    const units = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      orderBy: { startDate: 'asc' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    })

    if (units.length !== 10) {
      throw new Error(`Expected 10 units, found ${units.length}`)
    }

    console.log('🔗 LINKING EXPECTATIONS TO UNITS')
    console.log('================================')

    // Link expectations to each unit
    for (let i = 0; i < units.length; i++) {
      const unit = units[i]
      const mapping = UNIT_EXPECTATION_MAPPING[i]

      console.log(`Unit ${mapping.unitNumber}: ${mapping.title}`)
      console.log(`  Current expectations: ${unit.expectations.length}`)

      // Clear existing expectations for this unit
      await prisma.unitPlanExpectation.deleteMany({
        where: {
          unitPlanId: unit.id
        }
      })

      // Link new expectations
      for (const expectationCode of mapping.expectations) {
        const expectation = allExpectations.find(exp => exp.code === expectationCode)
        
        if (expectation) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: expectation.id
            }
          })
          console.log(`    ✅ Linked ${expectationCode}: ${expectation.description.substring(0, 60)}...`)
        } else {
          console.log(`    ❌ Expectation ${expectationCode} not found`)
        }
      }
      console.log('')
    }

    console.log('✅ ALL EXPECTATIONS LINKED SUCCESSFULLY\n')

    // Verification
    console.log('🔍 VERIFICATION - Expectation Distribution')
    console.log('==========================================')

    const expectationUsage = {}
    
    for (const unit of units) {
      const updatedUnit = await prisma.unitPlan.findUnique({
        where: { id: unit.id },
        include: {
          expectations: {
            include: {
              expectation: true
            }
          }
        }
      })

      updatedUnit.expectations.forEach(exp => {
        const code = exp.expectation.code
        if (!expectationUsage[code]) {
          expectationUsage[code] = []
        }
        expectationUsage[code].push(updatedUnit.title)
      })
    }

    Object.entries(expectationUsage).forEach(([code, unitTitles]) => {
      console.log(`${code}: Used in ${unitTitles.length} units`)
      unitTitles.forEach(title => {
        console.log(`  - ${title}`)
      })
      console.log('')
    })

    // Check for unused expectations
    const usedCodes = Object.keys(expectationUsage)
    const allCodes = allExpectations.map(exp => exp.code)
    const unusedCodes = allCodes.filter(code => !usedCodes.includes(code))

    if (unusedCodes.length === 0) {
      console.log('🎯 PERFECT: All expectations are now properly mapped!')
    } else {
      console.log(`⚠️ Unused expectations: ${unusedCodes.join(', ')}`)
    }

  } catch (error) {
    console.error('💥 Expectation linking failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute expectation linking
linkExpectationsToUnits()
  .then(() => {
    console.log('\n🏆 EXPECTATION LINKING COMPLETE!')
    console.log('All Science units now have proper curriculum expectation relationships.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Expectation linking failed:', error)
    process.exit(1)
  })