#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyFPSUnitsCriticalReview() {
  try {
    console.log('🌟 CRITICAL REVIEW: FPS/Health Unit Plans for Emily McIsaac (User ID 23)...\n')
    
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
    
    // Get all FPS/Health unit plans for Emily with comprehensive data
    const fpsUnits = await prisma.unitPlan.findMany({
      where: {
        userId: 23,
        longRangePlan: {
          OR: [
            { subject: 'Formation personnelle et sociale' },
            { subject: 'Éducation à la santé' }
          ]
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
        lessonPlans: {
          select: {
            id: true,
            title: true,
            date: true,
            duration: true,
            materials: true,
            mindsOn: true,
            action: true,
            consolidation: true,
            assessmentNotes: true,
            learningGoals: true,
            grade: true,
            subject: true
          }
        }
      },
      orderBy: [
        {
          startDate: 'asc'
        }
      ]
    })
    
    console.log(`🌟 Found ${fpsUnits.length} FPS/Health unit plans for Emily\n`)
    
    if (fpsUnits.length === 0) {
      console.log('No FPS/Health unit plans found for this user.')
      return { totalUnits: 0, totalLessons: 0, criticalIssues: [] }
    }
    
    // Critical Analysis Variables
    let criticalIssues: string[] = []
    let totalLessons = 0
    let unitsData: any[] = []
    
    // Display detailed information for each FPS/Health unit
    console.log('🌟 FPS/HEALTH UNIT PLANS - CRITICAL PEDAGOGICAL REVIEW:')
    console.log('=' + '='.repeat(80))
    
    fpsUnits.forEach((unit, index) => {
      const unitLessons = unit.lessonPlans.length
      totalLessons += unitLessons
      
      console.log(`\n🌟 UNIT ${index + 1}: ${unit.title}`)
      console.log('─'.repeat(60))
      console.log(`📅 Period: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`)
      console.log(`⏰ Estimated Hours: ${unit.estimatedHours || 'Not specified'}`)
      console.log(`📚 LRP: ${unit.longRangePlan.title} (${unit.longRangePlan.subject})`)
      console.log(`📖 Curriculum Expectations: ${unit.expectations.length}`)
      console.log(`📝 Lesson Plans: ${unitLessons}`)
      
      // CRITICAL ISSUE: Check curriculum expectations
      if (unit.expectations.length === 0) {
        criticalIssues.push(`Unit "${unit.title}" has NO curriculum expectations`)
      }
      
      // CRITICAL ISSUE: Check lesson count for Grade 1 FPS/Health
      if (unitLessons === 0) {
        criticalIssues.push(`Unit "${unit.title}" has NO lesson plans`)
      } else if (unitLessons < 6) {
        criticalIssues.push(`Unit "${unit.title}" has only ${unitLessons} lessons (may be too short for meaningful health/wellbeing development)`)
      }
      
      // Unit Description
      if (unit.description) {
        console.log(`\n📋 DESCRIPTION:`)
        console.log(unit.description)
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks description`)
      }
      
      // Big Ideas Analysis - Focus on health/wellbeing concepts
      if (unit.bigIdeas) {
        console.log(`\n💡 BIG IDEAS:`)
        console.log(unit.bigIdeas)
        
        // Check for age-appropriate health concepts
        const healthAppropriate = unit.bigIdeas.toLowerCase().includes('safe') ||
                                 unit.bigIdeas.toLowerCase().includes('healthy') ||
                                 unit.bigIdeas.toLowerCase().includes('feeling') ||
                                 unit.bigIdeas.toLowerCase().includes('body') ||
                                 unit.bigIdeas.toLowerCase().includes('emotion') ||
                                 unit.bigIdeas.toLowerCase().includes('friendship')
        if (!healthAppropriate) {
          criticalIssues.push(`Unit "${unit.title}" Big Ideas may not focus on Grade 1 health/wellbeing concepts`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Big Ideas`)
      }
      
      // Essential Questions Analysis - Grade 1 FPS focus
      if (unit.essentialQuestions) {
        console.log(`\n❓ ESSENTIAL QUESTIONS:`)
        try {
          const questions = JSON.parse(unit.essentialQuestions as string)
          if (Array.isArray(questions)) {
            questions.forEach((q, i) => console.log(`   ${i + 1}. ${q}`))
            
            // Check for age-appropriate FPS questions for 6-year-olds
            const ageAppropriate = questions.some(q => 
              q.toLowerCase().includes('feel') || 
              q.toLowerCase().includes('safe') ||
              q.toLowerCase().includes('friend') ||
              q.toLowerCase().includes('help') ||
              q.toLowerCase().includes('body') ||
              q.toLowerCase().includes('grow') ||
              q.toLowerCase().includes('family')
            )
            if (!ageAppropriate) {
              criticalIssues.push(`Unit "${unit.title}" essential questions may be too abstract for Grade 1 (6-year-olds)`)
            }
            
            // Check for overly complex emotional concepts
            const tooComplex = questions.some(q =>
              q.toLowerCase().includes('analyze') ||
              q.toLowerCase().includes('evaluate') ||
              q.toLowerCase().includes('compare') ||
              q.toLowerCase().includes('synthesize')
            )
            if (tooComplex) {
              criticalIssues.push(`Unit "${unit.title}" has essential questions beyond Grade 1 cognitive development`)
            }
          } else {
            console.log(unit.essentialQuestions)
          }
        } catch (e) {
          console.log(unit.essentialQuestions)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Essential Questions`)
      }
      
      // Curriculum Expectations Analysis
      if (unit.expectations.length > 0) {
        console.log(`\n📖 CURRICULUM EXPECTATIONS:`)
        unit.expectations.forEach(exp => {
          console.log(`   • ${exp.expectation.code}: ${exp.expectation.title}`)
        })
        
        // Check for appropriate FPS/Health expectations
        const hasWellbeingFocus = unit.expectations.some(exp => 
          exp.expectation.title.toLowerCase().includes('healthy') ||
          exp.expectation.title.toLowerCase().includes('safe') ||
          exp.expectation.title.toLowerCase().includes('emotional') ||
          exp.expectation.title.toLowerCase().includes('social') ||
          exp.expectation.title.toLowerCase().includes('physical') ||
          exp.expectation.title.toLowerCase().includes('mental')
        )
        if (!hasWellbeingFocus) {
          criticalIssues.push(`Unit "${unit.title}" may lack core health/wellbeing expectations`)
        }
      }
      
      // Assessment Plan Analysis - Process over product for Grade 1
      if (unit.assessmentPlan) {
        console.log(`\n📊 ASSESSMENT PLAN:`)
        console.log(unit.assessmentPlan)
        
        // Check for developmentally appropriate assessment for 6-year-olds
        const grade1Appropriate = unit.assessmentPlan.toLowerCase().includes('observation') ||
                                 unit.assessmentPlan.toLowerCase().includes('conversation') ||
                                 unit.assessmentPlan.toLowerCase().includes('drawing') ||
                                 unit.assessmentPlan.toLowerCase().includes('demonstrate') ||
                                 unit.assessmentPlan.toLowerCase().includes('show') ||
                                 unit.assessmentPlan.toLowerCase().includes('play')
        if (!grade1Appropriate) {
          criticalIssues.push(`Unit "${unit.title}" assessment may not be developmentally appropriate for Grade 1`)
        }
        
        // Check for written assessment overemphasis
        const tooWritten = unit.assessmentPlan.toLowerCase().includes('write') ||
                          unit.assessmentPlan.toLowerCase().includes('test') ||
                          unit.assessmentPlan.toLowerCase().includes('quiz') ||
                          unit.assessmentPlan.toLowerCase().includes('essay')
        if (tooWritten) {
          criticalIssues.push(`Unit "${unit.title}" assessment may overemphasize written work for Grade 1`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Assessment Plan`)
      }
      
      // Differentiation Analysis - Grade 1 developmental needs
      if (unit.differentiationStrategies) {
        console.log(`\n🔄 DIFFERENTIATION STRATEGIES:`)
        console.log(unit.differentiationStrategies)
        
        // Check for Grade 1 specific supports
        const grade1Supports = unit.differentiationStrategies.toLowerCase().includes('visual') ||
                              unit.differentiationStrategies.toLowerCase().includes('peer') ||
                              unit.differentiationStrategies.toLowerCase().includes('choice') ||
                              unit.differentiationStrategies.toLowerCase().includes('movement') ||
                              unit.differentiationStrategies.toLowerCase().includes('concrete') ||
                              unit.differentiationStrategies.toLowerCase().includes('hands-on')
        if (!grade1Supports) {
          criticalIssues.push(`Unit "${unit.title}" differentiation may not address Grade 1 learning needs`)
        }
        
        // Check for emotional support strategies
        const emotionalSupport = unit.differentiationStrategies.toLowerCase().includes('comfort') ||
                               unit.differentiationStrategies.toLowerCase().includes('calming') ||
                               unit.differentiationStrategies.toLowerCase().includes('safe space') ||
                               unit.differentiationStrategies.toLowerCase().includes('emotion')
        if (!emotionalSupport && unit.longRangePlan.subject === 'Formation personnelle et sociale') {
          criticalIssues.push(`Unit "${unit.title}" may lack emotional support strategies for sensitive FPS content`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Differentiation Strategies`)
      }
      
      // Culminating Task Analysis - Age-appropriate celebration
      if (unit.culminatingTask) {
        console.log(`\n🏆 CULMINATING TASK:`)
        console.log(unit.culminatingTask)
        
        // Check for Grade 1 appropriate culmination
        const grade1Appropriate = unit.culminatingTask.toLowerCase().includes('share') ||
                                 unit.culminatingTask.toLowerCase().includes('show') ||
                                 unit.culminatingTask.toLowerCase().includes('demonstrate') ||
                                 unit.culminatingTask.toLowerCase().includes('celebration') ||
                                 unit.culminatingTask.toLowerCase().includes('family') ||
                                 unit.culminatingTask.toLowerCase().includes('circle')
        if (!grade1Appropriate) {
          criticalIssues.push(`Unit "${unit.title}" culminating task may not be appropriate for Grade 1`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Culminating Task`)
      }
      
      // Key Vocabulary Analysis - French health vocabulary
      if (unit.keyVocabulary) {
        console.log(`\n📝 KEY VOCABULARY:`)
        console.log(unit.keyVocabulary)
        
        // Check for French health/wellbeing terms
        const hasFrenchHealthTerms = unit.keyVocabulary.toLowerCase().includes('santé') ||
                                   unit.keyVocabulary.toLowerCase().includes('sécurité') ||
                                   unit.keyVocabulary.toLowerCase().includes('sentiment') ||
                                   unit.keyVocabulary.toLowerCase().includes('émotion') ||
                                   unit.keyVocabulary.toLowerCase().includes('corps') ||
                                   unit.keyVocabulary.toLowerCase().includes('ami')
        if (!hasFrenchHealthTerms) {
          criticalIssues.push(`Unit "${unit.title}" may lack French health/wellbeing vocabulary development`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Key Vocabulary`)
      }
      
      // Indigenous Perspectives Analysis
      if (unit.indigenousPerspectives) {
        console.log(`\n🪶 INDIGENOUS PERSPECTIVES:`)
        console.log(unit.indigenousPerspectives)
        
        // Check for authentic integration
        const authenticIntegration = unit.indigenousPerspectives.toLowerCase().includes('seven sacred') ||
                                   unit.indigenousPerspectives.toLowerCase().includes('teaching') ||
                                   unit.indigenousPerspectives.toLowerCase().includes('elder') ||
                                   unit.indigenousPerspectives.toLowerCase().includes('community')
        if (!authenticIntegration) {
          criticalIssues.push(`Unit "${unit.title}" Indigenous perspectives may lack authentic integration`)
        }
      }
      
      // Lesson Plans Analysis - Focus on safety and developmental appropriateness
      if (unit.lessonPlans.length > 0) {
        console.log(`\n📝 LESSON PLANS CRITICAL ANALYSIS (${unit.lessonPlans.length} total):`)
        
        let materialsIssues = 0
        let assessmentIssues = 0
        let durationIssues = 0
        let safetyIssues = 0
        
        unit.lessonPlans.forEach((lesson, i) => {
          console.log(`   ${i + 1}. ${lesson.title}`)
          console.log(`      📅 ${lesson.date ? lesson.date.toLocaleDateString() : 'No date set'}`)
          console.log(`      ⏰ Duration: ${lesson.duration || 'Not specified'} minutes`)
          
          // Check duration appropriateness for Grade 1 FPS (max 30-40 mins)
          if (lesson.duration && lesson.duration > 40) {
            durationIssues++
            criticalIssues.push(`Lesson "${lesson.title}" duration (${lesson.duration} mins) exceeds Grade 1 attention span`)
          }
          
          // Materials Safety Analysis - Critical for health activities
          if (lesson.materials) {
            try {
              const materials = JSON.parse(lesson.materials as string)
              if (Array.isArray(materials) && materials.length > 0) {
                console.log(`      🛡️ Materials: ${materials.slice(0, 3).join(', ')}${materials.length > 3 ? ', ...' : ''}`)
                
                // Check for unsafe or inappropriate materials for health lessons
                const potentiallyUnsafe = materials.some((material: string) => 
                  material.toLowerCase().includes('personal') ||
                  material.toLowerCase().includes('private') ||
                  material.toLowerCase().includes('body parts') ||
                  material.toLowerCase().includes('touching')
                )
                
                if (potentiallyUnsafe) {
                  safetyIssues++
                  criticalIssues.push(`Lesson "${lesson.title}" materials may require careful safety/sensitivity protocols`)
                }
              } else {
                materialsIssues++
              }
            } catch (e) {
              if (lesson.materials && lesson.materials.length > 10) {
                console.log(`      🛡️ Materials: ${lesson.materials.substring(0, 100)}...`)
              } else {
                materialsIssues++
              }
            }
          } else {
            materialsIssues++
          }
          
          // Assessment Analysis - Must be process-focused for Grade 1
          if (!lesson.assessmentNotes || lesson.assessmentNotes === 'Not specified') {
            assessmentIssues++
          } else {
            // Check for Grade 1 appropriate assessment
            const processOriented = lesson.assessmentNotes.toLowerCase().includes('observe') ||
                                  lesson.assessmentNotes.toLowerCase().includes('listen') ||
                                  lesson.assessmentNotes.toLowerCase().includes('conversation') ||
                                  lesson.assessmentNotes.toLowerCase().includes('anecdotal')
            if (!processOriented) {
              criticalIssues.push(`Lesson "${lesson.title}" assessment may not be process-oriented for Grade 1`)
            }
          }
          
          // Learning Goals Analysis for FPS appropriateness
          if (lesson.learningGoals) {
            const ageAppropriate = lesson.learningGoals.toLowerCase().includes('identify') ||
                                  lesson.learningGoals.toLowerCase().includes('recognize') ||
                                  lesson.learningGoals.toLowerCase().includes('demonstrate') ||
                                  lesson.learningGoals.toLowerCase().includes('express')
            if (!ageAppropriate) {
              criticalIssues.push(`Lesson "${lesson.title}" learning goals may be too complex for Grade 1`)
            }
          }
          
          // Grade and Subject Check
          if (lesson.grade && lesson.subject) {
            console.log(`      📚 Grade ${lesson.grade} ${lesson.subject}`)
          }
        })
        
        // Unit-level lesson issues
        if (materialsIssues > unitLessons * 0.3) {
          criticalIssues.push(`Unit "${unit.title}" has ${materialsIssues} lessons with insufficient materials specification`)
        }
        
        if (assessmentIssues > unitLessons * 0.2) {
          criticalIssues.push(`Unit "${unit.title}" has ${assessmentIssues} lessons with insufficient assessment`)
        }
        
        if (safetyIssues > 0) {
          criticalIssues.push(`Unit "${unit.title}" has ${safetyIssues} lessons requiring enhanced safety protocols`)
        }
      }
      
      // Store unit data for export
      unitsData.push({
        id: unit.id,
        title: unit.title,
        subject: unit.longRangePlan.subject,
        startDate: unit.startDate,
        endDate: unit.endDate,
        estimatedHours: unit.estimatedHours,
        description: unit.description,
        bigIdeas: unit.bigIdeas,
        essentialQuestions: unit.essentialQuestions,
        assessmentPlan: unit.assessmentPlan,
        differentiationStrategies: unit.differentiationStrategies,
        culminatingTask: unit.culminatingTask,
        keyVocabulary: unit.keyVocabulary,
        indigenousPerspectives: unit.indigenousPerspectives,
        expectationsCount: unit.expectations.length,
        lessonPlansCount: unit.lessonPlans.length,
        curriculumExpectations: unit.expectations.map(exp => ({
          code: exp.expectation.code,
          title: exp.expectation.title
        })),
        lessonPlanTitles: unit.lessonPlans.map(lesson => lesson.title)
      })
      
      console.log('\n' + '='.repeat(80))
    })
    
    // ROTATION BLOCK ANALYSIS
    console.log('\n🔄 ROTATION BLOCK CRITICAL ANALYSIS:')
    console.log('=' + '='.repeat(50))
    console.log(`Current Total FPS/Health Lessons: ${totalLessons}`)
    console.log(`Expected for Rotation: 96 lessons`)
    
    if (totalLessons === 96) {
      console.log(`✅ PERFECT MATCH: FPS/Health timing is correct for rotation blocks`)
    } else if (totalLessons > 96) {
      console.log(`⚠️ OVER by ${totalLessons - 96} lessons - May cause scheduling conflicts`)
      criticalIssues.push(`FPS/Health has ${totalLessons - 96} excess lessons that may cause scheduling issues`)
    } else {
      console.log(`❌ SHORT by ${96 - totalLessons} lessons - Insufficient health/wellbeing instruction`)
      criticalIssues.push(`FPS/Health is missing ${96 - totalLessons} lessons, compromising wellbeing development`)
    }
    
    // CRITICAL ISSUES SUMMARY
    console.log('\n🚨 CRITICAL ISSUES SUMMARY:')
    console.log('=' + '='.repeat(50))
    console.log(`Total Critical Issues Identified: ${criticalIssues.length}`)
    
    if (criticalIssues.length === 0) {
      console.log('✅ NO CRITICAL ISSUES FOUND - Units meet high pedagogical standards')
    } else {
      console.log('\n🔍 Issues by Category:')
      criticalIssues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`)
      })
    }
    
    // EXPECTED UNITS CHECK for FPS/Health
    const expectedFPSUnits = [
      'Our School Environment',
      'Healthy Bodies, Healthy Minds',
      'Emotions and Feelings', 
      'Safety at Home and School',
      'Growing and Changing',
      'Community Helpers and Safety'
    ]
    
    console.log('\n📋 EXPECTED UNITS ANALYSIS:')
    console.log('=' + '='.repeat(50))
    console.log(`Found Units: ${fpsUnits.length}`)
    console.log(`Expected Units: 6`)
    
    if (fpsUnits.length < 6) {
      criticalIssues.push(`Only ${fpsUnits.length} FPS/Health units found, expected 6 for comprehensive Grade 1 health program`)
    }
    
    // Export for critical review document
    const reviewData = {
      totalUnits: fpsUnits.length,
      totalLessons: totalLessons,
      expectedLessons: 96,
      criticalIssues: criticalIssues,
      unitsData: unitsData,
      rotationStatus: totalLessons === 96 ? 'PERFECT' : totalLessons > 96 ? 'OVER' : 'SHORT',
      rotationDifference: Math.abs(totalLessons - 96)
    }
    
    // Write detailed data to file
    const fs = await import('fs')
    await fs.promises.writeFile(
      '/Users/michaelmcisaac/Github/teaching-engine2.0/emily-fps-critical-review-data.json',
      JSON.stringify(reviewData, null, 2)
    )
    
    console.log('\n💾 Critical review data exported to: emily-fps-critical-review-data.json')
    
    return reviewData
    
  } catch (error) {
    console.error('❌ Error in critical review:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the critical review
queryEmilyFPSUnitsCriticalReview()
  .then(data => {
    console.log('\n✅ Critical review completed successfully')
    console.log(`📊 Final Summary: ${data.totalUnits} units, ${data.totalLessons} lessons, ${data.criticalIssues.length} critical issues`)
  })
  .catch(error => {
    console.error('❌ Critical review failed:', error)
    process.exit(1)
  })