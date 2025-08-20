#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyArtsVisuelsUnitsCriticalReview() {
  try {
    console.log('🎨 CRITICAL REVIEW: Arts visuels Unit Plans for Emily McIsaac (User ID 23)...\n')
    
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
    
    console.log(`🎨 Found ${artsUnits.length} Arts visuels unit plans for Emily\n`)
    
    if (artsUnits.length === 0) {
      console.log('No Arts visuels unit plans found for this user.')
      return { totalUnits: 0, totalLessons: 0, criticalIssues: [] }
    }
    
    // Critical Analysis Variables
    let criticalIssues: string[] = []
    let totalLessons = 0
    let unitsData: any[] = []
    
    // Display detailed information for each Arts visuels unit
    console.log('🎨 ARTS VISUELS UNIT PLANS - CRITICAL PEDAGOGICAL REVIEW:')
    console.log('=' + '='.repeat(80))
    
    artsUnits.forEach((unit, index) => {
      const unitLessons = unit.lessonPlans.length
      totalLessons += unitLessons
      
      console.log(`\n🎨 UNIT ${index + 1}: ${unit.title}`)
      console.log('─'.repeat(60))
      console.log(`📅 Period: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`)
      console.log(`⏰ Estimated Hours: ${unit.estimatedHours || 'Not specified'}`)
      console.log(`📚 LRP: ${unit.longRangePlan.title}`)
      console.log(`📖 Curriculum Expectations: ${unit.expectations.length}`)
      console.log(`📝 Lesson Plans: ${unitLessons}`)
      
      // CRITICAL ISSUE: Check curriculum expectations
      if (unit.expectations.length === 0) {
        criticalIssues.push(`Unit "${unit.title}" has NO curriculum expectations`)
      }
      
      // CRITICAL ISSUE: Check lesson count for Grade 1 Arts
      if (unitLessons === 0) {
        criticalIssues.push(`Unit "${unit.title}" has NO lesson plans`)
      } else if (unitLessons < 8) {
        criticalIssues.push(`Unit "${unit.title}" has only ${unitLessons} lessons (may be too short for meaningful arts development)`)
      }
      
      // Unit Description
      if (unit.description) {
        console.log(`\n📋 DESCRIPTION:`)
        console.log(unit.description)
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks description`)
      }
      
      // Big Ideas Analysis
      if (unit.bigIdeas) {
        console.log(`\n💡 BIG IDEAS:`)
        console.log(unit.bigIdeas)
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Big Ideas`)
      }
      
      // Essential Questions Analysis
      if (unit.essentialQuestions) {
        console.log(`\n❓ ESSENTIAL QUESTIONS:`)
        try {
          const questions = JSON.parse(unit.essentialQuestions as string)
          if (Array.isArray(questions)) {
            questions.forEach((q, i) => console.log(`   ${i + 1}. ${q}`))
            
            // Check for age-appropriate arts questions
            const ageAppropriate = questions.some(q => 
              q.toLowerCase().includes('create') || 
              q.toLowerCase().includes('explore') ||
              q.toLowerCase().includes('feel') ||
              q.toLowerCase().includes('see') ||
              q.toLowerCase().includes('color') ||
              q.toLowerCase().includes('shape')
            )
            if (!ageAppropriate) {
              criticalIssues.push(`Unit "${unit.title}" essential questions may not be age-appropriate for Grade 1`)
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
        
        // Check for appropriate arts expectations
        const hasCreativeProcess = unit.expectations.some(exp => 
          exp.expectation.title.toLowerCase().includes('creative') ||
          exp.expectation.title.toLowerCase().includes('explore') ||
          exp.expectation.title.toLowerCase().includes('express')
        )
        if (!hasCreativeProcess) {
          criticalIssues.push(`Unit "${unit.title}" may lack creative process expectations`)
        }
      }
      
      // Assessment Plan Analysis
      if (unit.assessmentPlan) {
        console.log(`\n📊 ASSESSMENT PLAN:`)
        console.log(unit.assessmentPlan)
        
        // Check for process vs product focus
        const processOriented = unit.assessmentPlan.toLowerCase().includes('process') ||
                              unit.assessmentPlan.toLowerCase().includes('effort') ||
                              unit.assessmentPlan.toLowerCase().includes('exploration') ||
                              unit.assessmentPlan.toLowerCase().includes('growth')
        if (!processOriented) {
          criticalIssues.push(`Unit "${unit.title}" assessment may overemphasize product over process`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Assessment Plan`)
      }
      
      // Differentiation Analysis
      if (unit.differentiationStrategies) {
        console.log(`\n🔄 DIFFERENTIATION STRATEGIES:`)
        console.log(unit.differentiationStrategies)
        
        // Check for developmental appropriateness
        const grade1Appropriate = unit.differentiationStrategies.toLowerCase().includes('choice') ||
                                 unit.differentiationStrategies.toLowerCase().includes('sensory') ||
                                 unit.differentiationStrategies.toLowerCase().includes('fine motor') ||
                                 unit.differentiationStrategies.toLowerCase().includes('cleanup')
        if (!grade1Appropriate) {
          criticalIssues.push(`Unit "${unit.title}" differentiation may not address Grade 1 developmental needs`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Differentiation Strategies`)
      }
      
      // Culminating Task Analysis
      if (unit.culminatingTask) {
        console.log(`\n🏆 CULMINATING TASK:`)
        console.log(unit.culminatingTask)
        
        // Check for celebration of creativity
        const celebratesCreativity = unit.culminatingTask.toLowerCase().includes('gallery') ||
                                   unit.culminatingTask.toLowerCase().includes('celebration') ||
                                   unit.culminatingTask.toLowerCase().includes('share') ||
                                   unit.culminatingTask.toLowerCase().includes('showcase')
        if (!celebratesCreativity) {
          criticalIssues.push(`Unit "${unit.title}" culminating task may not celebrate student creativity`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Culminating Task`)
      }
      
      // Key Vocabulary Analysis
      if (unit.keyVocabulary) {
        console.log(`\n📝 KEY VOCABULARY:`)
        console.log(unit.keyVocabulary)
        
        // Check for French arts vocabulary
        const hasFrenchTerms = unit.keyVocabulary.toLowerCase().includes('couleur') ||
                              unit.keyVocabulary.toLowerCase().includes('forme') ||
                              unit.keyVocabulary.toLowerCase().includes('ligne') ||
                              unit.keyVocabulary.toLowerCase().includes('texture')
        if (!hasFrenchTerms) {
          criticalIssues.push(`Unit "${unit.title}" may lack French arts vocabulary development`)
        }
      } else {
        criticalIssues.push(`Unit "${unit.title}" lacks Key Vocabulary`)
      }
      
      // Lesson Plans Analysis
      if (unit.lessonPlans.length > 0) {
        console.log(`\n📝 LESSON PLANS CRITICAL ANALYSIS (${unit.lessonPlans.length} total):`)
        
        let materialsIssues = 0
        let assessmentIssues = 0
        let durationIssues = 0
        
        unit.lessonPlans.forEach((lesson, i) => {
          console.log(`   ${i + 1}. ${lesson.title}`)
          console.log(`      📅 ${lesson.date ? lesson.date.toLocaleDateString() : 'No date set'}`)
          console.log(`      ⏰ Duration: ${lesson.duration || 'Not specified'} minutes`)
          
          // Check duration appropriateness for Grade 1
          if (lesson.duration && lesson.duration > 45) {
            durationIssues++
          }
          
          // Materials Safety Analysis
          if (lesson.materials) {
            try {
              const materials = JSON.parse(lesson.materials as string)
              if (Array.isArray(materials) && materials.length > 0) {
                console.log(`      🎨 Materials: ${materials.slice(0, 3).join(', ')}${materials.length > 3 ? ', ...' : ''}`)
                
                // Check for unsafe materials
                const unsafeMaterials = materials.some((material: string) => 
                  material.toLowerCase().includes('scissors') ||
                  material.toLowerCase().includes('knife') ||
                  material.toLowerCase().includes('stapler') ||
                  material.toLowerCase().includes('spray')
                )
                
                if (unsafeMaterials) {
                  criticalIssues.push(`Lesson "${lesson.title}" may contain unsafe materials for Grade 1`)
                }
              } else {
                materialsIssues++
              }
            } catch (e) {
              if (lesson.materials && lesson.materials.length > 10) {
                console.log(`      🎨 Materials: ${lesson.materials.substring(0, 100)}...`)
              } else {
                materialsIssues++
              }
            }
          } else {
            materialsIssues++
          }
          
          // Assessment Analysis
          if (!lesson.assessmentNotes || lesson.assessmentNotes === 'Not specified') {
            assessmentIssues++
          }
          
          // Note: Differentiation field not available in current database schema
          // differentiationIssues tracking disabled
          
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
        
        // Note: Differentiation analysis disabled due to schema limitations
        
        if (durationIssues > 0) {
          criticalIssues.push(`Unit "${unit.title}" has ${durationIssues} lessons that may be too long for Grade 1 (>45 mins)`)
        }
      }
      
      // Store unit data for export
      unitsData.push({
        id: unit.id,
        title: unit.title,
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
    console.log(`Current Total Arts Lessons: ${totalLessons}`)
    console.log(`Expected for Rotation: 96 lessons`)
    
    if (totalLessons === 96) {
      console.log(`✅ PERFECT MATCH: Arts timing is correct for rotation blocks`)
    } else if (totalLessons > 96) {
      console.log(`⚠️ OVER by ${totalLessons - 96} lessons - May cause scheduling conflicts`)
      criticalIssues.push(`Arts has ${totalLessons - 96} excess lessons that may cause scheduling issues`)
    } else {
      console.log(`❌ SHORT by ${96 - totalLessons} lessons - Insufficient arts instruction`)
      criticalIssues.push(`Arts is missing ${96 - totalLessons} lessons, compromising creative development`)
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
    
    // EXPECTED UNITS CHECK
    const expectedUnits = [
      'Discovering Art in Our World',
      'Colors and Feelings', 
      'Winter Celebrations Through Art',
      'Textures and Patterns',
      'Stories in Art',
      'Our Art Gallery'
    ]
    
    console.log('\n📋 EXPECTED UNITS ANALYSIS:')
    console.log('=' + '='.repeat(50))
    console.log(`Found Units: ${artsUnits.length}`)
    console.log(`Expected Units: 6`)
    
    if (artsUnits.length < 6) {
      criticalIssues.push(`Only ${artsUnits.length} arts units found, expected 6 for comprehensive Grade 1 arts program`)
    }
    
    // Export for critical review document
    const reviewData = {
      totalUnits: artsUnits.length,
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
      '/Users/michaelmcisaac/Github/teaching-engine2.0/emily-arts-visuels-critical-review-data.json',
      JSON.stringify(reviewData, null, 2)
    )
    
    console.log('\n💾 Critical review data exported to: emily-arts-visuels-critical-review-data.json')
    
    return reviewData
    
  } catch (error) {
    console.error('❌ Error in critical review:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the critical review
queryEmilyArtsVisuelsUnitsCriticalReview()
  .then(data => {
    console.log('\n✅ Critical review completed successfully')
    console.log(`📊 Final Summary: ${data.totalUnits} units, ${data.totalLessons} lessons, ${data.criticalIssues.length} critical issues`)
  })
  .catch(error => {
    console.error('❌ Critical review failed:', error)
    process.exit(1)
  })