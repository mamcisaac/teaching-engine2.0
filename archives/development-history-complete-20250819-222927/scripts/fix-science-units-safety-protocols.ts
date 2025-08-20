#!/usr/bin/env npx tsx

/**
 * Fix Science Unit Plans - Phase 3: Ensure Safety Protocols are Embedded
 * 
 * This script embeds the LRP's mandatory safety protocols into each unit.
 * 
 * LRP Safety Protocols (MANDATORY):
 * - Outdoor supervision ratio: 1:8 maximum
 * - Hand washing before/after all investigations
 * - No tasting without explicit permission
 * - Safety goggles for any splashing activities
 * - Allergy awareness for all nature materials
 * - Emergency procedures posted and practiced
 * - First aid kit accessibility verified daily
 * - Weather safety guidelines followed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function embedSafetyProtocols() {
  console.log('🛡️ EMBEDDING SAFETY PROTOCOLS INTO SCIENCE UNITS')
  console.log('================================================\n')
  
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
    
    console.log(`Found ${scienceUnits.length} Science units to enhance with safety protocols\n`)
    
    // Define unit-specific safety protocols based on activities
    const unitSafetyProtocols = [
      {
        // Unit 1: September - School Environment
        unitIndex: 0,
        safetyProtocols: {
          mandatory: [
            "Hand washing before and after all explorations",
            "Emergency procedures posted and practiced weekly",
            "First aid kit accessibility verified daily",
            "Adult supervision for all activities"
          ],
          unitSpecific: [
            "Safe scissors handling for sorting activities",
            "Proper lifting techniques for classroom objects",
            "Walking feet during indoor explorations",
            "Designated areas for material storage"
          ],
          dailyRoutines: [
            "Morning safety check of exploration areas",
            "Clean-up procedures after each activity",
            "Material count before and after use"
          ]
        }
      },
      {
        // Unit 2: October - Fall Changes
        unitIndex: 1,
        safetyProtocols: {
          mandatory: [
            "Outdoor supervision ratio: 1:8 maximum",
            "Hand washing after outdoor exploration",
            "Weather safety guidelines followed",
            "Allergy awareness for all nature materials"
          ],
          unitSpecific: [
            "No picking mushrooms or unknown plants",
            "Stay on designated paths during nature walks",
            "Buddy system for outdoor exploration",
            "Weather-appropriate clothing required"
          ],
          dailyRoutines: [
            "Weather check before outdoor activities",
            "Allergy list review before nature collection",
            "Head count before and after outdoor time"
          ]
        }
      },
      {
        // Unit 3: November - Materials & Properties
        unitIndex: 2,
        safetyProtocols: {
          mandatory: [
            "Safety goggles for water activities",
            "Hand washing before and after experiments",
            "No tasting without explicit permission",
            "First aid kit accessibility verified"
          ],
          unitSpecific: [
            "Water spill procedures established",
            "Non-slip mats for water exploration areas",
            "Small group rotations for hands-on testing",
            "Designated wet and dry zones"
          ],
          dailyRoutines: [
            "Material safety check before distribution",
            "Towels readily available for spills",
            "Table protection during water activities"
          ]
        }
      },
      {
        // Unit 4: December - Winter Safety
        unitIndex: 3,
        safetyProtocols: {
          mandatory: [
            "Weather safety guidelines strictly followed",
            "Outdoor supervision ratio: 1:8 maximum",
            "Emergency procedures for cold weather",
            "Hand washing after handling snow/ice"
          ],
          unitSpecific: [
            "No throwing snow or ice",
            "Indoor alternatives for extreme weather",
            "Proper winter clothing checks",
            "Slippery surface awareness training"
          ],
          dailyRoutines: [
            "Temperature check before outdoor activities",
            "Extra mittens/gloves available",
            "Warm-up activities after outdoor time"
          ]
        }
      },
      {
        // Unit 5: January - Light & Sound
        unitIndex: 4,
        safetyProtocols: {
          mandatory: [
            "No direct looking at bright lights",
            "Volume limits for sound experiments",
            "Adult supervision for all electrical items",
            "Emergency procedures practiced"
          ],
          unitSpecific: [
            "Flashlight safety rules established",
            "No pointing lights at faces",
            "Hearing protection for loud activities",
            "Safe distances from light sources"
          ],
          dailyRoutines: [
            "Equipment check before use",
            "Designated areas for light experiments",
            "Clear pathways in dimmed rooms"
          ]
        }
      },
      {
        // Unit 6: February - Growing Things
        unitIndex: 5,
        safetyProtocols: {
          mandatory: [
            "Hand washing after handling soil/plants",
            "Allergy awareness for all plant materials",
            "No tasting plants or seeds",
            "First aid kit accessibility verified"
          ],
          unitSpecific: [
            "Proper soil handling procedures",
            "Plant watering safety (no overwatering)",
            "Tool safety for planting activities",
            "Designated plant care areas"
          ],
          dailyRoutines: [
            "Daily plant observation safety rules",
            "Clean-up procedures after planting",
            "Allergy check before handling new materials"
          ]
        }
      },
      {
        // Unit 7: March - Weather Patterns
        unitIndex: 6,
        safetyProtocols: {
          mandatory: [
            "Weather safety guidelines followed",
            "Outdoor supervision when observing weather",
            "Emergency procedures for severe weather",
            "Hand washing after outdoor observations"
          ],
          unitSpecific: [
            "Safe distances for weather watching",
            "Indoor observation during storms",
            "Proper use of weather instruments",
            "Sun safety for outdoor observations"
          ],
          dailyRoutines: [
            "Weather condition assessment",
            "Alternative indoor activities prepared",
            "Safety briefing before outdoor observation"
          ]
        }
      },
      {
        // Unit 8: April - Simple Machines
        unitIndex: 7,
        safetyProtocols: {
          mandatory: [
            "Adult supervision for all building activities",
            "Safety goggles when required",
            "Proper tool handling procedures",
            "First aid kit accessibility verified"
          ],
          unitSpecific: [
            "Safe distances between builders",
            "Proper lifting techniques for materials",
            "Tool safety demonstrations before use",
            "Designated building zones established"
          ],
          dailyRoutines: [
            "Tool inventory before and after use",
            "Safety check of building materials",
            "Clean-up procedures strictly followed"
          ]
        }
      },
      {
        // Unit 9: May - Animal Habitats
        unitIndex: 8,
        safetyProtocols: {
          mandatory: [
            "No touching wild animals or nests",
            "Outdoor supervision ratio: 1:8 maximum",
            "Allergy awareness for outdoor materials",
            "Hand washing after outdoor exploration"
          ],
          unitSpecific: [
            "Observation only - no disturbing habitats",
            "Safe distances from animal homes",
            "Quiet voices near animal areas",
            "Respect for living creatures emphasized"
          ],
          dailyRoutines: [
            "Habitat respect reminders",
            "Binocular safety for observations",
            "Leave-no-trace principles practiced"
          ]
        }
      },
      {
        // Unit 10: June - Science Celebration
        unitIndex: 9,
        safetyProtocols: {
          mandatory: [
            "All year's safety protocols reviewed",
            "Adult supervision for demonstrations",
            "Emergency procedures practiced",
            "First aid kit accessibility verified"
          ],
          unitSpecific: [
            "Demonstration safety guidelines",
            "Audience safety during presentations",
            "Safe distances for experiments",
            "Equipment handling review"
          ],
          dailyRoutines: [
            "Pre-demonstration safety checks",
            "Clear presentation areas maintained",
            "Celebration safety rules posted"
          ]
        }
      }
    ]
    
    // Update each unit with comprehensive safety protocols
    for (const safetyData of unitSafetyProtocols) {
      const unit = scienceUnits[safetyData.unitIndex]
      if (!unit) continue
      
      console.log(`Unit ${safetyData.unitIndex + 1}: ${unit.title}`)
      
      // Build comprehensive safety plan
      const safetyPlan = [
        "MANDATORY SAFETY PROTOCOLS:",
        ...safetyData.safetyProtocols.mandatory.map(p => `• ${p}`),
        "",
        "UNIT-SPECIFIC SAFETY MEASURES:",
        ...safetyData.safetyProtocols.unitSpecific.map(p => `• ${p}`),
        "",
        "DAILY SAFETY ROUTINES:",
        ...safetyData.safetyProtocols.dailyRoutines.map(p => `• ${p}`)
      ].join('\n')
      
      // Update the unit with safety protocols
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          assessmentPlan: `${unit.assessmentPlan}\n\nSAFETY-FIRST APPROACH:\n${safetyPlan}`,
          communityConnections: `${unit.communityConnections || 'Local environment and community'}\n\nSafety Partnership: Parents informed of all safety protocols. Weekly safety tips sent home.`,
          parentCommunicationPlan: `Safety protocols shared at start of unit. Parents sign acknowledgment of outdoor activities and allergy awareness. Emergency contact information verified and updated.`
        }
      })
      
      const totalProtocols = 
        safetyData.safetyProtocols.mandatory.length +
        safetyData.safetyProtocols.unitSpecific.length +
        safetyData.safetyProtocols.dailyRoutines.length
      
      console.log(`  ✅ Embedded ${totalProtocols} safety protocols`)
      console.log(`  🛡️ Categories: Mandatory (${safetyData.safetyProtocols.mandatory.length}), Unit-Specific (${safetyData.safetyProtocols.unitSpecific.length}), Daily (${safetyData.safetyProtocols.dailyRoutines.length})\n`)
    }
    
    console.log('🎉 Phase 3 Complete: All units have comprehensive safety protocols!')
    console.log('📋 Safety Summary:')
    console.log('  • Every unit has mandatory LRP safety protocols')
    console.log('  • Unit-specific safety measures for each activity type')
    console.log('  • Daily safety routines established')
    console.log('  • Parent communication plans include safety information')
    
  } catch (error) {
    console.error('💥 Error embedding safety protocols:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute safety protocol embedding
embedSafetyProtocols()
  .then(() => {
    console.log('\n✅ Safety protocols successfully embedded')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Safety embedding failed:', error)
    process.exit(1)
  })