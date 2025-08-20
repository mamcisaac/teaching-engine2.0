#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getDetailedScienceInfo() {
  console.log('🔍 DETAILED SCIENCE LRP AND CURRICULUM ANALYSIS')
  console.log('===============================================\n')
  
  try {
    // Get Emily's Science LRP with all related data
    const scienceLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23,
        subject: 'Sciences de la nature'
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        unitPlans: {
          include: {
            expectations: {
              include: {
                expectation: true
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    })

    if (!scienceLRP) {
      console.log('❌ No Science LRP found')
      return
    }

    // Display LRP Details
    console.log('📋 LONG RANGE PLAN DETAILS')
    console.log('==========================')
    console.log(`Title: ${scienceLRP.title}`)
    console.log(`Description: ${scienceLRP.description || 'No description'}`)
    console.log(`Monthly Themes: ${scienceLRP.monthlyThemes ? JSON.stringify(scienceLRP.monthlyThemes, null, 2) : 'None'}`)
    console.log('')

    // Display All Curriculum Expectations
    console.log('📚 CURRICULUM EXPECTATIONS (5 total)')
    console.log('====================================')
    scienceLRP.expectations.forEach((exp, index) => {
      const expectation = exp.expectation
      console.log(`${index + 1}. CODE: ${expectation.code}`)
      console.log(`   STRAND: ${expectation.strand}`)
      console.log(`   DESCRIPTION: ${expectation.description}`)
      console.log(`   SPECIFIC: ${expectation.specificExpectation}`)
      console.log('')
    })

    // Display Unit Plans with Expectations
    console.log('📖 UNIT PLANS WITH EXPECTATION MAPPING')
    console.log('======================================')
    scienceLRP.unitPlans.forEach((unit, index) => {
      console.log(`UNIT ${index + 1}: ${unit.title}`)
      console.log(`Dates: ${unit.startDate.toISOString().split('T')[0]} → ${unit.endDate.toISOString().split('T')[0]}`)
      console.log(`Description: ${unit.description || 'No description'}`)
      console.log(`Big Ideas: ${unit.bigIdeas || 'None'}`)
      console.log(`Expectations Mapped: ${unit.expectations.length}`)
      
      if (unit.expectations.length > 0) {
        unit.expectations.forEach(exp => {
          console.log(`  - ${exp.expectation.code}: ${exp.expectation.specificExpectation}`)
        })
      }
      console.log('')
    })

    // Summary Analysis
    console.log('📊 ALIGNMENT ANALYSIS')
    console.log('=====================')
    console.log(`LRP Focus: ${scienceLRP.description}`)
    console.log(`Total Expectations in LRP: ${scienceLRP.expectations.length}`)
    console.log(`Total Units: ${scienceLRP.unitPlans.length}`)
    
    // Check expectation distribution
    const expectationUsage = {}
    scienceLRP.unitPlans.forEach(unit => {
      unit.expectations.forEach(exp => {
        const code = exp.expectation.code
        expectationUsage[code] = (expectationUsage[code] || 0) + 1
      })
    })
    
    console.log('\nExpectation Distribution Across Units:')
    Object.entries(expectationUsage).forEach(([code, count]) => {
      console.log(`  ${code}: Used in ${count} unit(s)`)
    })

    // Check for unused expectations
    const allExpectationCodes = scienceLRP.expectations.map(exp => exp.expectation.code)
    const usedExpectationCodes = Object.keys(expectationUsage)
    const unusedExpectations = allExpectationCodes.filter(code => !usedExpectationCodes.includes(code))
    
    if (unusedExpectations.length > 0) {
      console.log(`\n⚠️ UNUSED EXPECTATIONS: ${unusedExpectations.join(', ')}`)
    } else {
      console.log('\n✅ ALL EXPECTATIONS MAPPED TO UNITS')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getDetailedScienceInfo()