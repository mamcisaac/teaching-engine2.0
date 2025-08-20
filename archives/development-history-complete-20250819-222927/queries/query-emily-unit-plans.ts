#!/usr/bin/env tsx

import { PrismaClient } from '@teaching-engine/database'

const prisma = new PrismaClient()

async function queryEmilyUnitPlans() {
  try {
    console.log('🔍 Querying all Unit Plans for Emily McIsaac (User ID 23)...\n')
    
    // First, verify Emily exists
    const emily = await prisma.user.findUnique({
      where: { id: 23 },
      select: { id: true, name: true, email: true }
    })
    
    if (!emily) {
      console.log('❌ User with ID 23 not found!')
      return
    }
    
    console.log(`✅ Found user: ${emily.name} (${emily.email})\n`)
    
    // Get all unit plans for Emily with related data
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: 23
      },
      include: {
        longRangePlan: {
          select: {
            id: true,
            title: true,
            subject: true,
            grade: true
          }
        },
        expectations: {
          include: {
            expectation: {
              select: {
                id: true,
                code: true,
                title: true,
                subject: true
              }
            }
          }
        },
        resources: true,
        lessonPlans: {
          select: {
            id: true,
            title: true,
            date: true,
            duration: true
          }
        }
      },
      orderBy: [
        {
          longRangePlan: {
            subject: 'asc'
          }
        },
        {
          startDate: 'asc'
        }
      ]
    })
    
    console.log(`📊 Found ${unitPlans.length} unit plans for Emily\n`)
    
    if (unitPlans.length === 0) {
      console.log('No unit plans found for this user.')
      return
    }
    
    // Group by subject
    const unitsBySubject = unitPlans.reduce((acc, unit) => {
      const subject = unit.longRangePlan.subject
      if (!acc[subject]) {
        acc[subject] = []
      }
      acc[subject].push(unit)
      return acc
    }, {} as Record<string, typeof unitPlans>)
    
    // Display summary by subject
    console.log('📋 UNIT PLANS BY SUBJECT:')
    console.log('=' + '='.repeat(50))
    
    for (const [subject, units] of Object.entries(unitsBySubject)) {
      console.log(`\n${subject}: ${units.length} units`)
      
      units.forEach((unit, index) => {
        console.log(`  ${index + 1}. ${unit.title}`)
        console.log(`     📅 ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`)
        console.log(`     📚 LRP: ${unit.longRangePlan.title}`)
        console.log(`     📖 ${unit.expectations.length} curriculum expectations`)
        console.log(`     📝 ${unit.lessonPlans.length} lesson plans`)
        
        // Show essential questions if they exist
        if (unit.essentialQuestions) {
          try {
            const questions = JSON.parse(unit.essentialQuestions as string)
            if (Array.isArray(questions) && questions.length > 0) {
              console.log(`     ❓ Essential Questions: ${questions.length}`)
              questions.slice(0, 2).forEach(q => console.log(`        • ${q}`))
              if (questions.length > 2) console.log(`        ... and ${questions.length - 2} more`)
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
        
        // Show big ideas if they exist
        if (unit.bigIdeas) {
          const bigIdeas = unit.bigIdeas.length > 100 ? 
            unit.bigIdeas.substring(0, 100) + '...' : 
            unit.bigIdeas
          console.log(`     💡 Big Ideas: ${bigIdeas}`)
        }
        
        console.log('')
      })
    }
    
    // Export detailed data for analysis
    const exportData = unitPlans.map(unit => ({
      id: unit.id,
      title: unit.title,
      subject: unit.longRangePlan.subject,
      longRangePlan: unit.longRangePlan.title,
      startDate: unit.startDate,
      endDate: unit.endDate,
      estimatedHours: unit.estimatedHours,
      description: unit.description,
      bigIdeas: unit.bigIdeas,
      essentialQuestions: unit.essentialQuestions,
      assessmentPlan: unit.assessmentPlan,
      successCriteria: unit.successCriteria,
      crossCurricularConnections: unit.crossCurricularConnections,
      culminatingTask: unit.culminatingTask,
      differentiationStrategies: unit.differentiationStrategies,
      priorKnowledge: unit.priorKnowledge,
      keyVocabulary: unit.keyVocabulary,
      learningSkills: unit.learningSkills,
      parentCommunicationPlan: unit.parentCommunicationPlan,
      fieldTripsAndGuestSpeakers: unit.fieldTripsAndGuestSpeakers,
      socialJusticeConnections: unit.socialJusticeConnections,
      technologyIntegration: unit.technologyIntegration,
      communityConnections: unit.communityConnections,
      expectationsCount: unit.expectations.length,
      lessonPlansCount: unit.lessonPlans.length,
      resourcesCount: unit.resources.length,
      curriculumExpectations: unit.expectations.map(exp => ({
        code: exp.expectation.code,
        title: exp.expectation.title,
        subject: exp.expectation.subject
      }))
    }))
    
    // Write to file for detailed analysis
    const fs = await import('fs')
    await fs.promises.writeFile(
      '/Users/michaelmcisaac/Github/teaching-engine2.0/emily-unit-plans-export.json',
      JSON.stringify(exportData, null, 2)
    )
    
    console.log('\n💾 Detailed unit plan data exported to: emily-unit-plans-export.json')
    console.log('\n📈 SUMMARY STATISTICS:')
    console.log('=' + '='.repeat(50))
    console.log(`Total Units: ${unitPlans.length}`)
    console.log(`Subjects: ${Object.keys(unitsBySubject).length}`)
    
    Object.entries(unitsBySubject).forEach(([subject, units]) => {
      console.log(`${subject}: ${units.length} units`)
    })
    
    const totalLessons = unitPlans.reduce((sum, unit) => sum + unit.lessonPlans.length, 0)
    const totalExpectations = unitPlans.reduce((sum, unit) => sum + unit.expectations.length, 0)
    
    console.log(`\nTotal Lesson Plans: ${totalLessons}`)
    console.log(`Total Curriculum Expectations: ${totalExpectations}`)
    
  } catch (error) {
    console.error('❌ Error querying unit plans:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the query
queryEmilyUnitPlans()