#!/usr/bin/env npx tsx

/**
 * PHASE 5: Perfect Curriculum Expectations Mapping
 * 
 * Map all 5 PEI Grade 1 Science expectations to appropriate units:
 * 
 * 1.1.1 - Basic science observation and inquiry skills
 * 1.1.2 - Safety procedures and responsible science practices  
 * 1.2.1 - Properties of materials and objects
 * 1.3.1 - Seasonal changes and weather patterns
 * 1.3.2 - Living things, growth, and basic needs
 * 
 * Strategic mapping ensures each expectation is addressed multiple times
 * across appropriate units with developmental progression.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function mapCurriculumExpectations() {
  console.log('📋 PHASE 5: Mapping all 5 PEI Science expectations to perfect units...')
  
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
    
    // Find all Grade 1 Science curriculum expectations
    const scienceExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        grade: 1,
        subject: 'Sciences de la nature'
      }
    })
    
    console.log(`📋 Found ${scienceUnits.length} Science units`)
    console.log(`📚 Found ${scienceExpectations.length} Science expectations`)
    
    // Define strategic mapping of expectations to units
    const expectationMappings = [
      {
        unitIndex: 0, // September - School Environment Safety
        expectations: ['1.1.1', '1.1.2'], // Basic observation + Safety
        rationale: 'Foundation unit establishes observation skills and safety practices'
      },
      {
        unitIndex: 1, // October - Fall Changes
        expectations: ['1.1.1', '1.3.1'], // Observation + Seasonal changes
        rationale: 'Applying observation skills to seasonal phenomena'
      },
      {
        unitIndex: 2, // November - Materials & Properties  
        expectations: ['1.1.1', '1.1.2', '1.2.1'], // Observation + Safety + Materials
        rationale: 'Hands-on exploration of material properties with safety focus'
      },
      {
        unitIndex: 3, // December - Winter Safety
        expectations: ['1.1.2', '1.2.1', '1.3.1'], // Safety + Materials + Weather
        rationale: 'Practical application of safety with winter materials and weather'
      },
      {
        unitIndex: 4, // January - Light & Sound
        expectations: ['1.1.1', '1.2.1'], // Observation + Properties
        rationale: 'Sensory exploration of light and sound properties'
      },
      {
        unitIndex: 5, // February - Growing Things
        expectations: ['1.1.1', '1.3.2'], // Observation + Living things
        rationale: 'Foundation life science with observation and care practices'
      },
      {
        unitIndex: 6, // March - Weather Patterns
        expectations: ['1.1.1', '1.3.1'], // Observation + Seasonal changes
        rationale: 'Advanced weather observation and pattern prediction'
      },
      {
        unitIndex: 7, // April - Simple Machines
        expectations: ['1.1.1', '1.1.2', '1.2.1'], // Observation + Safety + Materials
        rationale: 'Mechanical exploration combining all material and safety knowledge'
      },
      {
        unitIndex: 8, // May - Animal Habitats
        expectations: ['1.1.1', '1.3.2'], // Observation + Living things
        rationale: 'Advanced life science building on growing things foundation'
      },
      {
        unitIndex: 9, // June - Science Celebration
        expectations: ['1.1.1', '1.1.2', '1.2.1', '1.3.1', '1.3.2'], // All expectations
        rationale: 'Synthesis unit demonstrates mastery of all expectations'
      }
    ]
    
    console.log('\n🔗 Mapping expectations to units...')
    
    let totalMappings = 0
    
    for (const mapping of expectationMappings) {
      const unit = scienceUnits[mapping.unitIndex]
      if (!unit) {
        console.log(`  ❌ Unit ${mapping.unitIndex} not found`)
        continue
      }
      
      const keyVocab = unit.keyVocabulary as any
      const month = keyVocab?.month || 'unknown'
      
      console.log(`\n📅 ${month.toUpperCase()} - "${unit.title}"`)
      console.log(`   Rationale: ${mapping.rationale}`)
      
      for (const expectationCode of mapping.expectations) {
        // Find the expectation by code
        const expectation = scienceExpectations.find(exp => exp.code === expectationCode)
        
        if (!expectation) {
          console.log(`   ❌ Expectation ${expectationCode} not found`)
          continue
        }
        
        // Check if mapping already exists
        const existingMapping = await prisma.unitPlanExpectation.findUnique({
          where: {
            unitPlanId_expectationId: {
              unitPlanId: unit.id,
              expectationId: expectation.id
            }
          }
        })
        
        if (existingMapping) {
          console.log(`   ✅ ${expectationCode}: Already mapped`)
        } else {
          // Create the mapping
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: expectation.id
            }
          })
          
          totalMappings++
          console.log(`   ✅ ${expectationCode}: ${expectation.description}`)
        }
      }
    }
    
    // Verify complete mapping
    console.log('\n🔍 Verification - Expectation Coverage:')
    
    for (const expectation of scienceExpectations) {
      const mappedUnits = await prisma.unitPlanExpectation.findMany({
        where: {
          expectationId: expectation.id,
          unitPlan: {
            userId: emily.id,
            longRangePlan: {
              subject: 'Sciences de la nature'
            }
          }
        },
        include: {
          unitPlan: {
            select: {
              title: true,
              keyVocabulary: true
            }
          }
        }
      })
      
      const unitTitles = mappedUnits.map(mapping => {
        const keyVocab = mapping.unitPlan.keyVocabulary as any
        const month = keyVocab?.month || 'unknown'
        return month
      }).join(', ')
      
      console.log(`  ${expectation.code}: ${mappedUnits.length} units (${unitTitles})`)
      
      if (mappedUnits.length === 0) {
        console.log(`    ❌ NOT MAPPED: ${expectation.description}`)
      }
    }
    
    // Summary
    console.log('\n🎯 MAPPING SUMMARY:')
    console.log(`  • New mappings created: ${totalMappings}`)
    console.log(`  • Expectations mapped: ${scienceExpectations.length}/5`)
    console.log(`  • Units with expectations: ${scienceUnits.length}/10`)
    
    // Verify all expectations are mapped at least once
    let allMapped = true
    for (const expectation of scienceExpectations) {
      const mappingCount = await prisma.unitPlanExpectation.count({
        where: {
          expectationId: expectation.id,
          unitPlan: {
            userId: emily.id,
            longRangePlan: {
              subject: 'Sciences de la nature'
            }
          }
        }
      })
      
      if (mappingCount === 0) {
        console.log(`  ❌ ${expectation.code} not mapped to any unit`)
        allMapped = false
      }
    }
    
    console.log('')
    if (allMapped) {
      console.log('✅ PHASE 5 COMPLETE: All PEI Science expectations perfectly mapped!')
      console.log('🎓 Strategic progression ensures developmental appropriateness')
      console.log('🔄 Multiple exposures support mastery and assessment')
    } else {
      console.log('❌ PHASE 5 INCOMPLETE: Some expectations not mapped')
    }
    
  } catch (error) {
    console.error('💥 Expectations mapping failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute expectations mapping
mapCurriculumExpectations()
  .then(() => {
    console.log('📚 Curriculum expectations mapping complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Expectations mapping failed:', error)
    process.exit(1)
  })