#!/usr/bin/env npx tsx

/**
 * Fix Science Unit Plans - Phase 2: Align LRP Measurable Goals
 * 
 * This script distributes the LRP's specific measurable goals across units
 * to ensure all goals are met throughout the year.
 * 
 * LRP Goals to distribute:
 * - Document 10 seasonal changes
 * - Classify 20 objects as living/non-living
 * - Identify 5 basic needs of living things
 * - Name 3 energy sources
 * - Predict outcomes of 5 experiments
 * - Use 30 French science vocabulary words
 * - Ask testable questions
 * - Record observations
 * - Identify 5 ways humans impact environment
 * - Demonstrate 10 safety procedures
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function alignLRPGoals() {
  console.log('🎯 ALIGNING LRP MEASURABLE GOALS ACROSS SCIENCE UNITS')
  console.log('=====================================================\n')
  
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
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    })
    
    console.log(`Found ${scienceUnits.length} Science units to enhance with LRP goals\n`)
    
    // Define how LRP goals are distributed across units
    const unitGoalDistribution = [
      {
        // Unit 1: September - School Environment
        unitIndex: 0,
        lrpGoals: {
          seasonalChanges: 0,
          livingNonLiving: 5, // Start classifying classroom objects
          basicNeeds: 0,
          energySources: 0,
          experiments: 0,
          vocabulary: 3, // vivant, non-vivant, observer
          humanImpact: 1, // Classroom care
          safetyProcedures: 3  // Basic classroom safety, hand washing, material handling
        },
        focusAreas: [
          "Introduction to observation skills",
          "Basic safety procedures",
          "Living vs non-living introduction"
        ]
      },
      {
        // Unit 2: October - Fall Changes
        unitIndex: 1,
        lrpGoals: {
          seasonalChanges: 3, // Document fall changes
          livingNonLiving: 5, // Outdoor objects
          basicNeeds: 0,
          energySources: 0,
          experiments: 0,
          vocabulary: 3, // automne, feuille, changement
          humanImpact: 1, // Leaf collection impact
          safetyProcedures: 2  // Outdoor safety, weather appropriate dress
        },
        focusAreas: [
          "Seasonal observation and documentation",
          "Outdoor exploration safety",
          "Nature collection ethics"
        ]
      },
      {
        // Unit 3: November - Materials & Properties
        unitIndex: 2,
        lrpGoals: {
          seasonalChanges: 0,
          livingNonLiving: 0,
          basicNeeds: 0,
          energySources: 0,
          experiments: 1, // Sink/float experiment
          vocabulary: 3, // dur, mou, flotter
          humanImpact: 0,
          safetyProcedures: 2  // Material handling, goggles for water activities
        },
        focusAreas: [
          "Hands-on material exploration",
          "Simple predictions and testing",
          "Safety with materials and water"
        ]
      },
      {
        // Unit 4: December - Winter Safety
        unitIndex: 3,
        lrpGoals: {
          seasonalChanges: 3, // Document winter changes
          livingNonLiving: 0,
          basicNeeds: 0,
          energySources: 1, // Heat as energy source
          experiments: 0,
          vocabulary: 3, // hiver, glace, sécurité
          humanImpact: 1, // Salt on ice impact
          safetyProcedures: 2  // Winter outdoor safety, ice safety
        },
        focusAreas: [
          "Winter weather documentation",
          "Practical safety applications",
          "Energy for warmth"
        ]
      },
      {
        // Unit 5: January - Light & Sound
        unitIndex: 4,
        lrpGoals: {
          seasonalChanges: 0,
          livingNonLiving: 0,
          basicNeeds: 0,
          energySources: 2, // Light and electricity as energy
          experiments: 1, // Shadow experiment
          vocabulary: 3, // lumière, son, ombre
          humanImpact: 0,
          safetyProcedures: 1  // Eye safety with bright lights
        },
        focusAreas: [
          "Sensory exploration",
          "Energy in daily life",
          "Simple cause and effect"
        ]
      },
      {
        // Unit 6: February - Growing Things
        unitIndex: 5,
        lrpGoals: {
          seasonalChanges: 0,
          livingNonLiving: 5, // Seeds, plants classification
          basicNeeds: 5, // All 5 basic needs (water, light, air, food, space)
          energySources: 0,
          experiments: 1, // Plant growth experiment
          vocabulary: 3, // plante, grandir, besoin
          humanImpact: 1, // Plant care responsibility
          safetyProcedures: 0
        },
        focusAreas: [
          "Life science foundations",
          "Basic needs of living things",
          "Responsibility and care"
        ]
      },
      {
        // Unit 7: March - Weather Patterns
        unitIndex: 6,
        lrpGoals: {
          seasonalChanges: 2, // Spring changes beginning
          livingNonLiving: 0,
          basicNeeds: 0,
          energySources: 0,
          experiments: 1, // Weather prediction test
          vocabulary: 3, // météo, nuage, pluie
          humanImpact: 0,
          safetyProcedures: 0
        },
        focusAreas: [
          "Pattern recognition",
          "Data collection and recording",
          "Prediction skills"
        ]
      },
      {
        // Unit 8: April - Simple Machines
        unitIndex: 7,
        lrpGoals: {
          seasonalChanges: 0,
          livingNonLiving: 0,
          basicNeeds: 0,
          energySources: 0,
          experiments: 1, // Ramp experiment
          vocabulary: 3, // machine, pousser, tirer
          humanImpact: 0,
          safetyProcedures: 2  // Tool safety, building safety
        },
        focusAreas: [
          "Mechanical exploration",
          "Problem solving",
          "Safe tool use"
        ]
      },
      {
        // Unit 9: May - Animal Habitats
        unitIndex: 8,
        lrpGoals: {
          seasonalChanges: 2, // Spring in full bloom
          livingNonLiving: 5, // Animals and habitat features
          basicNeeds: 0, // Review through animal needs
          energySources: 0,
          experiments: 0,
          vocabulary: 3, // habitat, animal, maison
          humanImpact: 1, // Habitat protection
          safetyProcedures: 0
        },
        focusAreas: [
          "Environmental connections",
          "Animal observation",
          "Habitat respect"
        ]
      },
      {
        // Unit 10: June - Science Celebration
        unitIndex: 9,
        lrpGoals: {
          seasonalChanges: 0,
          livingNonLiving: 0,
          basicNeeds: 0,
          energySources: 0,
          experiments: 0,
          vocabulary: 3, // Review vocabulary
          humanImpact: 0,
          safetyProcedures: 0
        },
        focusAreas: [
          "Year review and synthesis",
          "Science fair demonstrations",
          "Celebration of learning"
        ]
      }
    ]
    
    // Calculate totals to verify distribution
    const totals = {
      seasonalChanges: 0,
      livingNonLiving: 0,
      basicNeeds: 0,
      energySources: 0,
      experiments: 0,
      vocabulary: 0,
      humanImpact: 0,
      safetyProcedures: 0
    }
    
    unitGoalDistribution.forEach(unit => {
      Object.keys(unit.lrpGoals).forEach(key => {
        totals[key] += unit.lrpGoals[key]
      })
    })
    
    console.log('LRP GOALS DISTRIBUTION SUMMARY:')
    console.log(`  Seasonal Changes: ${totals.seasonalChanges}/10`)
    console.log(`  Living/Non-Living: ${totals.livingNonLiving}/20`)
    console.log(`  Basic Needs: ${totals.basicNeeds}/5`)
    console.log(`  Energy Sources: ${totals.energySources}/3`)
    console.log(`  Experiments: ${totals.experiments}/5`)
    console.log(`  Vocabulary: ${totals.vocabulary}/30`)
    console.log(`  Human Impact: ${totals.humanImpact}/5`)
    console.log(`  Safety Procedures: ${totals.safetyProcedures}/10`)
    console.log('')
    
    // Update each unit with enhanced descriptions including LRP goals
    for (const goalData of unitGoalDistribution) {
      const unit = scienceUnits[goalData.unitIndex]
      if (!unit) continue
      
      const keyVocab = unit.keyVocabulary as any
      const month = keyVocab?.month || 'unknown'
      
      console.log(`Updating Unit ${goalData.unitIndex + 1}: ${unit.title}`)
      
      // Build enhanced success criteria based on LRP goals
      const successCriteria = []
      
      if (goalData.lrpGoals.seasonalChanges > 0) {
        successCriteria.push(`Document ${goalData.lrpGoals.seasonalChanges} seasonal changes through scientific drawings`)
      }
      if (goalData.lrpGoals.livingNonLiving > 0) {
        successCriteria.push(`Classify ${goalData.lrpGoals.livingNonLiving} objects as living or non-living`)
      }
      if (goalData.lrpGoals.basicNeeds > 0) {
        successCriteria.push(`Identify all 5 basic needs of living things (water, light, air, food, space)`)
      }
      if (goalData.lrpGoals.energySources > 0) {
        successCriteria.push(`Name and explore ${goalData.lrpGoals.energySources} energy source(s) in daily environment`)
      }
      if (goalData.lrpGoals.experiments > 0) {
        successCriteria.push(`Predict and test outcome of ${goalData.lrpGoals.experiments} experiment(s)`)
      }
      if (goalData.lrpGoals.vocabulary > 0) {
        successCriteria.push(`Use ${goalData.lrpGoals.vocabulary} new French science vocabulary words in context`)
      }
      if (goalData.lrpGoals.humanImpact > 0) {
        successCriteria.push(`Identify ${goalData.lrpGoals.humanImpact} way(s) humans impact the environment`)
      }
      if (goalData.lrpGoals.safetyProcedures > 0) {
        successCriteria.push(`Demonstrate ${goalData.lrpGoals.safetyProcedures} safety procedures correctly`)
      }
      
      // Add universal criteria
      successCriteria.push('Ask testable questions about observations')
      successCriteria.push('Record observations using pictures, numbers, and words')
      
      // Update the unit
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          successCriteria: successCriteria,
          keyVocabulary: {
            ...keyVocab,
            lrpGoals: goalData.lrpGoals,
            focusAreas: goalData.focusAreas
          },
          performanceIndicators: goalData.focusAreas
        }
      })
      
      console.log(`  ✅ Enhanced with ${successCriteria.length} success criteria`)
      console.log(`  📊 Goals: ${Object.values(goalData.lrpGoals).filter(v => v > 0).length} LRP goals addressed\n`)
    }
    
    console.log('🎉 Phase 2 Complete: All units aligned with LRP measurable goals!')
    
  } catch (error) {
    console.error('💥 Error aligning LRP goals:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the alignment
alignLRPGoals()
  .then(() => {
    console.log('✅ LRP goals alignment complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Alignment failed:', error)
    process.exit(1)
  })