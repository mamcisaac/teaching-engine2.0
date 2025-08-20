#!/usr/bin/env npx tsx

/**
 * FIX REMAINING EXPECTATION MAPPINGS
 * 
 * Complete the Arts and Health/FPS expectation mapping with correct codes
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CORRECTED EXPECTATION MAPPING
const ARTS_EXPECTATIONS = {
  "AV1": { units: [1, 2, 10], progression: "Recognize visual environment value" },
  "AV2": { units: [3, 4, 5], progression: "Use art to communicate ideas/feelings" }, 
  "AV3": { units: [6, 7, 8], progression: "Use variety of tools and techniques" },
  "AV4": { units: [9, 10], progression: "Recognize art's cultural value" }
}

const FPS_EXPECTATIONS = {
  "FPS1": { units: [1, 6], progression: "Personal health practices" },
  "FPS2": { units: [2, 3], progression: "Safe and responsible practices" },
  "FPS3": { units: [3, 4], progression: "Healthy relationship behaviors" },
  "FPS4": { units: [4, 5], progression: "Understanding personal skills and abilities" }
}

async function fixRemainingExpectations() {
  console.log('🎯 FIXING REMAINING EXPECTATION MAPPINGS')
  console.log('=======================================\n')

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' },
      include: {
        longRangePlans: {
          include: {
            unitPlans: { orderBy: { startDate: 'asc' } }
          }
        }
      }
    })

    if (!emily) throw new Error('Emily not found')

    // Fix Arts expectations
    await fixArtsExpectations(emily)
    
    // Fix Health/FPS expectations  
    await fixFPSExpectations(emily)

    console.log('\n✅ ALL EXPECTATION MAPPINGS COMPLETE!')

  } catch (error) {
    console.error('💥 Fix failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function fixArtsExpectations(emily: any) {
  console.log('🎨 FIXING ARTS EXPECTATIONS (CORRECTED)')
  console.log('=======================================')
  
  const artsLRP = emily.longRangePlans.find((lrp: any) => lrp.subject === 'Arts visuels')
  if (!artsLRP) throw new Error('Arts LRP not found')
  
  // Get all Arts expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    where: { 
      subject: 'Arts visuels',
      grade: 1 
    }
  })
  
  console.log(`Found ${expectations.length} Arts expectations to map`)
  
  // Map expectations to existing units
  for (const [code, mapping] of Object.entries(ARTS_EXPECTATIONS)) {
    const expectation = expectations.find(exp => exp.code === code)
    if (!expectation) {
      console.log(`⚠️ Expectation ${code} not found in database`)
      continue
    }
    
    for (const unitIndex of mapping.units) {
      const unit = artsLRP.unitPlans[unitIndex - 1] // 0-based index
      if (unit) {
        // Check if already mapped
        const existing = await prisma.unitPlanExpectation.findFirst({
          where: {
            unitPlanId: unit.id,
            expectationId: expectation.id
          }
        })
        
        if (!existing) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: expectation.id
            }
          })
          console.log(`✅ Mapped ${code} to Unit ${unitIndex}: ${unit.title}`)
        }
      }
    }
  }
  
  console.log('✅ Arts expectation mapping complete\n')
}

async function fixFPSExpectations(emily: any) {
  console.log('🏥 FIXING HEALTH/FPS EXPECTATIONS (CORRECTED)')
  console.log('=============================================')
  
  const fpsLRP = emily.longRangePlans.find((lrp: any) => lrp.subject === 'Formation personnelle et sociale')
  if (!fpsLRP) throw new Error('FPS LRP not found')
  
  // Get all FPS expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    where: { 
      subject: 'Formation personnelle et sociale',
      grade: 1 
    }
  })
  
  console.log(`Found ${expectations.length} Health/FPS expectations to map`)
  
  // Map expectations to existing units
  for (const [code, mapping] of Object.entries(FPS_EXPECTATIONS)) {
    const expectation = expectations.find(exp => exp.code === code)
    if (!expectation) {
      console.log(`⚠️ Expectation ${code} not found in database`)
      continue
    }
    
    for (const unitIndex of mapping.units) {
      const unit = fpsLRP.unitPlans[unitIndex - 1] // 0-based index
      if (unit) {
        // Check if already mapped
        const existing = await prisma.unitPlanExpectation.findFirst({
          where: {
            unitPlanId: unit.id,
            expectationId: expectation.id
          }
        })
        
        if (!existing) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: expectation.id
            }
          })
          console.log(`✅ Mapped ${code} to Unit ${unitIndex}: ${unit.title}`)
        }
      }
    }
  }
  
  console.log('✅ Health/FPS expectation mapping complete\n')
}

// Execute the fix
fixRemainingExpectations()
  .then(() => {
    console.log('\n🏆 REMAINING EXPECTATION MAPPINGS COMPLETE!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  })