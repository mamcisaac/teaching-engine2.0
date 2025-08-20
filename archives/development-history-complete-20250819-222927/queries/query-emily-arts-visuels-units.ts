#!/usr/bin/env tsx

import { PrismaClient } from '@teaching-engine/database'

const prisma = new PrismaClient()

async function queryEmilyArtsVisuelsUnits() {
  try {
    console.log('🎨 Querying Arts visuels Unit Plans for Emily McIsaac (User ID 23)...\n')
    
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
    
    // Get all Arts visuels unit plans for Emily with comprehensive data
    const artsUnits = await prisma.unitPlan.findMany({
      where: {
        userId: 23,
        longRangePlan: {
          subject: 'Arts visuels'
        }
      },
      include: {
        longRangePlan: {
          select: {
            id: true,
            title: true,
            subject: true,
            grade: true,
            description: true
          }
        },
        expectations: {
          include: {
            expectation: {
              select: {
                id: true,
                code: true,
                title: true,
                subject: true,
                description: true
              }
            }
          }
        },
        resources: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            url: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            title: true,
            date: true,
            duration: true,
            description: true,
            materials: true,
            activities: true,
            assessmentCriteria: true,
            differentiationStrategies: true,
            frenchVocabulary: true
          }
        }
      },
      orderBy: [
        {
          startDate: 'asc'
        }
      ]
    })
    
    console.log(`🎨 Found ${artsUnits.length} Arts visuels unit plans for Emily\n`)
    
    if (artsUnits.length === 0) {
      console.log('No Arts visuels unit plans found for this user.')
      return
    }
    
    // Display detailed information for each Arts visuels unit
    console.log('🎨 ARTS VISUELS UNIT PLANS - DETAILED ANALYSIS:')
    console.log('=' + '='.repeat(80))
    
    artsUnits.forEach((unit, index) => {
      console.log(`\n🎨 UNIT ${index + 1}: ${unit.title}`)
      console.log('─'.repeat(60))
      console.log(`📅 Period: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`)
      console.log(`⏰ Estimated Hours: ${unit.estimatedHours || 'Not specified'}`)
      console.log(`📚 LRP: ${unit.longRangePlan.title}`)
      console.log(`📖 Curriculum Expectations: ${unit.expectations.length}`)
      console.log(`📝 Lesson Plans: ${unit.lessonPlans.length}`)
      console.log(`📋 Resources: ${unit.resources.length}`)
      
      // Unit Description
      if (unit.description) {
        console.log(`\n📋 DESCRIPTION:`)
        console.log(unit.description)
      }
      
      // Big Ideas
      if (unit.bigIdeas) {
        console.log(`\n💡 BIG IDEAS:`)
        console.log(unit.bigIdeas)
      }
      
      // Essential Questions
      if (unit.essentialQuestions) {
        console.log(`\n❓ ESSENTIAL QUESTIONS:`)
        try {
          const questions = JSON.parse(unit.essentialQuestions as string)
          if (Array.isArray(questions)) {
            questions.forEach((q, i) => console.log(`   ${i + 1}. ${q}`))
          } else {
            console.log(unit.essentialQuestions)
          }
        } catch (e) {
          console.log(unit.essentialQuestions)
        }
      }
      
      // Curriculum Expectations
      if (unit.expectations.length > 0) {
        console.log(`\n📖 CURRICULUM EXPECTATIONS:`)
        unit.expectations.forEach(exp => {
          console.log(`   • ${exp.expectation.code}: ${exp.expectation.title}`)
        })
      }
      
      // Assessment Plan
      if (unit.assessmentPlan) {
        console.log(`\n📊 ASSESSMENT PLAN:`)
        console.log(unit.assessmentPlan)
      }
      
      // Success Criteria
      if (unit.successCriteria) {
        console.log(`\n🎯 SUCCESS CRITERIA:`)
        console.log(unit.successCriteria)
      }
      
      // Differentiation Strategies
      if (unit.differentiationStrategies) {
        console.log(`\n🔄 DIFFERENTIATION STRATEGIES:`)
        console.log(unit.differentiationStrategies)
      }
      
      // Cross-Curricular Connections
      if (unit.crossCurricularConnections) {
        console.log(`\n🔗 CROSS-CURRICULAR CONNECTIONS:`)
        console.log(unit.crossCurricularConnections)
      }
      
      // Culminating Task
      if (unit.culminatingTask) {
        console.log(`\n🏆 CULMINATING TASK:`)
        console.log(unit.culminatingTask)
      }
      
      // Key Vocabulary
      if (unit.keyVocabulary) {
        console.log(`\n📝 KEY VOCABULARY:`)
        console.log(unit.keyVocabulary)
      }
      
      // Materials and Safety
      if (unit.technologyIntegration) {
        console.log(`\n💻 TECHNOLOGY INTEGRATION:`)
        console.log(unit.technologyIntegration)
      }
      
      // Social Justice Connections
      if (unit.socialJusticeConnections) {
        console.log(`\n⚖️ SOCIAL JUSTICE CONNECTIONS:`)
        console.log(unit.socialJusticeConnections)
      }
      
      // Community Connections
      if (unit.communityConnections) {
        console.log(`\n🌍 COMMUNITY CONNECTIONS:`)
        console.log(unit.communityConnections)
      }
      
      // Resources
      if (unit.resources.length > 0) {
        console.log(`\n📋 RESOURCES:`)
        unit.resources.forEach(resource => {
          console.log(`   • ${resource.title} (${resource.type})`)
          if (resource.description) console.log(`     ${resource.description}`)
          if (resource.url) console.log(`     🔗 ${resource.url}`)
        })
      }
      
      // Lesson Plans Summary
      if (unit.lessonPlans.length > 0) {
        console.log(`\n📝 LESSON PLANS (${unit.lessonPlans.length} total):`)
        unit.lessonPlans.forEach((lesson, i) => {
          console.log(`   ${i + 1}. ${lesson.title}`)
          console.log(`      📅 ${lesson.date ? lesson.date.toLocaleDateString() : 'No date set'}`)
          console.log(`      ⏰ Duration: ${lesson.duration || 'Not specified'} minutes`)
          
          // Show materials for arts safety review
          if (lesson.materials) {
            try {
              const materials = JSON.parse(lesson.materials as string)
              if (Array.isArray(materials) && materials.length > 0) {
                console.log(`      🎨 Materials: ${materials.slice(0, 3).join(', ')}${materials.length > 3 ? ', ...' : ''}`)
              }
            } catch (e) {
              console.log(`      🎨 Materials: ${lesson.materials.substring(0, 100)}...`)
            }
          }
          
          // Show French vocabulary development
          if (lesson.frenchVocabulary) {
            try {
              const vocab = JSON.parse(lesson.frenchVocabulary as string)
              if (Array.isArray(vocab) && vocab.length > 0) {
                console.log(`      🇫🇷 French Vocab: ${vocab.slice(0, 3).join(', ')}${vocab.length > 3 ? ', ...' : ''}`)
              }
            } catch (e) {
              // Handle as string
              console.log(`      🇫🇷 French Vocab: ${lesson.frenchVocabulary.substring(0, 50)}...`)
            }
          }
        })
      }
      
      console.log('\n' + '='.repeat(80))
    })
    
    // Export detailed data for critical review
    const exportData = artsUnits.map(unit => ({
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
        subject: exp.expectation.subject,
        description: exp.expectation.description
      })),
      lessonPlanDetails: unit.lessonPlans.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        date: lesson.date,
        duration: lesson.duration,
        description: lesson.description,
        materials: lesson.materials,
        activities: lesson.activities,
        assessmentCriteria: lesson.assessmentCriteria,
        differentiationStrategies: lesson.differentiationStrategies,
        frenchVocabulary: lesson.frenchVocabulary
      })),
      resources: unit.resources
    }))
    
    // Write to file for critical review analysis
    const fs = await import('fs')
    await fs.promises.writeFile(
      '/Users/michaelmcisaac/Github/teaching-engine2.0/emily-arts-visuels-units-export.json',
      JSON.stringify(exportData, null, 2)
    )
    
    console.log('\n💾 Arts visuels unit data exported to: emily-arts-visuels-units-export.json')
    
    // Summary statistics
    console.log('\n📈 ARTS VISUELS SUMMARY STATISTICS:')
    console.log('=' + '='.repeat(50))
    console.log(`Total Arts Units: ${artsUnits.length}`)
    
    const totalLessons = artsUnits.reduce((sum, unit) => sum + unit.lessonPlans.length, 0)
    const totalExpectations = artsUnits.reduce((sum, unit) => sum + unit.expectations.length, 0)
    const totalHours = artsUnits.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0)
    
    console.log(`Total Arts Lessons: ${totalLessons}`)
    console.log(`Total Arts Expectations: ${totalExpectations}`)
    console.log(`Total Estimated Hours: ${totalHours}`)
    
    // Check for rotation block timing (96 lessons expected)
    console.log(`\n🔄 ROTATION BLOCK ANALYSIS:`)
    console.log(`Current Total Lessons: ${totalLessons}`)
    console.log(`Expected for Rotation: 96 lessons`)
    console.log(`Status: ${totalLessons === 96 ? '✅ PERFECT MATCH' : totalLessons > 96 ? '⚠️ OVER by ' + (totalLessons - 96) : '❌ SHORT by ' + (96 - totalLessons)}`)
    
    return exportData
    
  } catch (error) {
    console.error('❌ Error querying Arts visuels units:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the query
queryEmilyArtsVisuelsUnits()