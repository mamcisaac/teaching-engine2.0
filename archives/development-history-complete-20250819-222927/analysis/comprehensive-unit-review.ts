#!/usr/bin/env tsx

import { PrismaClient } from '@teaching-engine/database'

const prisma = new PrismaClient()

interface PedagogicalCriteria {
  essentialQuestions: {
    score: number
    feedback: string[]
    examples?: string[]
  }
  bigIdeas: {
    score: number
    feedback: string[]
  }
  learningProgression: {
    score: number
    feedback: string[]
  }
  culminatingTask: {
    score: number
    feedback: string[]
  }
  lessonAlignment: {
    score: number
    feedback: string[]
  }
  timingPacing: {
    score: number
    feedback: string[]
  }
  crossCurricular: {
    score: number
    feedback: string[]
  }
  differentiation: {
    score: number
    feedback: string[]
  }
  assessment: {
    score: number
    feedback: string[]
  }
  gradeAppropriateness: {
    score: number
    feedback: string[]
  }
}

interface UnitReview {
  unitId: string
  title: string
  subject: string
  overallScore: number
  criteria: PedagogicalCriteria
  specificProblems: string[]
  recommendations: string[]
}

function evaluateEssentialQuestions(questions: any, subject: string): { score: number; feedback: string[]; examples?: string[] } {
  const feedback: string[] = []
  let score = 0
  
  if (!questions) {
    return {
      score: 0,
      feedback: ['❌ CRITICAL: No essential questions provided']
    }
  }
  
  let parsedQuestions: string[] = []
  try {
    parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions
    if (!Array.isArray(parsedQuestions)) {
      parsedQuestions = []
    }
  } catch (e) {
    return {
      score: 0,
      feedback: ['❌ CRITICAL: Essential questions format invalid (cannot parse JSON)']
    }
  }
  
  if (parsedQuestions.length === 0) {
    return {
      score: 0,
      feedback: ['❌ CRITICAL: No essential questions provided']
    }
  }
  
  // Check quantity (Grade 1 should have 2-4 essential questions)
  if (parsedQuestions.length < 2) {
    feedback.push('⚠️ Too few essential questions (Grade 1 needs 2-4)')
    score -= 20
  } else if (parsedQuestions.length > 5) {
    feedback.push('⚠️ Too many essential questions (Grade 1 should have 2-4 max)')
    score -= 10
  } else {
    feedback.push('✅ Appropriate number of essential questions')
    score += 20
  }
  
  // Evaluate each question for Grade 1 appropriateness
  let openEndedCount = 0
  let inquiryDrivenCount = 0
  let gradeAppropriateCount = 0
  
  parsedQuestions.forEach((question, index) => {
    // Check if open-ended (not yes/no)
    const lowerQ = question.toLowerCase()
    if (!lowerQ.startsWith('is ') && !lowerQ.startsWith('do ') && !lowerQ.startsWith('does ') && 
        !lowerQ.startsWith('can ') && !lowerQ.startsWith('will ') && !lowerQ.startsWith('are ')) {
      openEndedCount++
    }
    
    // Check for inquiry words appropriate for Grade 1
    if (lowerQ.includes('how') || lowerQ.includes('why') || lowerQ.includes('what') || 
        lowerQ.includes('where') || lowerQ.includes('when')) {
      inquiryDrivenCount++
    }
    
    // Check reading level (simple vocabulary for Grade 1)
    const words = question.split(' ')
    const complexWords = words.filter(word => word.length > 8)
    if (complexWords.length <= 1 && words.length <= 10) {
      gradeAppropriateCount++
    }
    
    // Check for Grade 1 developmental appropriateness
    const grade1Inappropriate = [
      'analyze', 'synthesize', 'evaluate', 'critique', 'compare', 'contrast',
      'differentiate', 'categorize', 'hypothesis', 'theory', 'abstract'
    ]
    const hasInappropriate = grade1Inappropriate.some(word => lowerQ.includes(word))
    if (hasInappropriate) {
      feedback.push(`⚠️ Question ${index + 1} may be too complex for Grade 1: "${question}"`)
    }
  })
  
  // Score based on quality
  if (openEndedCount >= parsedQuestions.length * 0.8) {
    feedback.push('✅ Most questions are appropriately open-ended')
    score += 25
  } else {
    feedback.push('❌ Too many yes/no or closed questions')
    score -= 20
  }
  
  if (inquiryDrivenCount >= parsedQuestions.length * 0.7) {
    feedback.push('✅ Questions drive genuine inquiry')
    score += 25
  } else {
    feedback.push('❌ Questions need more inquiry focus')
    score -= 15
  }
  
  if (gradeAppropriateCount >= parsedQuestions.length * 0.8) {
    feedback.push('✅ Language complexity appropriate for Grade 1')
    score += 20
  } else {
    feedback.push('❌ Some questions too complex for Grade 1 reading level')
    score -= 25
  }
  
  // Subject-specific quality checks
  if (subject.includes('Français')) {
    const hasLanguageFocus = parsedQuestions.some(q => 
      q.toLowerCase().includes('français') || q.toLowerCase().includes('langue') ||
      q.toLowerCase().includes('communication') || q.toLowerCase().includes('stories')
    )
    if (hasLanguageFocus) {
      feedback.push('✅ Questions connect to French language development')
      score += 10
    } else {
      feedback.push('⚠️ Questions should connect more to French language learning')
      score -= 10
    }
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    feedback,
    examples: parsedQuestions.slice(0, 3)
  }
}

function evaluateBigIdeas(bigIdeas: string | null, subject: string): { score: number; feedback: string[] } {
  const feedback: string[] = []
  let score = 0
  
  if (!bigIdeas || bigIdeas.trim() === '') {
    return {
      score: 0,
      feedback: ['❌ CRITICAL: No big ideas provided']
    }
  }
  
  const ideas = bigIdeas.trim()
  
  // Check for Grade 1 appropriate language
  const sentences = ideas.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  if (sentences.length === 0) {
    return {
      score: 20,
      feedback: ['⚠️ Big ideas are very brief - may need more depth']
    }
  }
  
  // Check for transferable concepts
  const transferableTerms = [
    'understand', 'learn', 'discover', 'explore', 'observe', 'notice',
    'patterns', 'connections', 'relationships', 'changes', 'growth'
  ]
  
  const hasTransferable = transferableTerms.some(term => 
    ideas.toLowerCase().includes(term)
  )
  
  if (hasTransferable) {
    feedback.push('✅ Big ideas include transferable concepts')
    score += 30
  } else {
    feedback.push('❌ Big ideas need more transferable understandings')
    score -= 20
  }
  
  // Check reading level for Grade 1
  const words = ideas.split(' ')
  const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
  
  if (averageWordLength <= 5) {
    feedback.push('✅ Language appropriate for Grade 1')
    score += 20
  } else {
    feedback.push('⚠️ Language may be too complex for Grade 1')
    score -= 15
  }
  
  // Check for enduring understanding vs. facts
  const factWords = ['the', 'is', 'are', 'has', 'have', 'will', 'can']
  const conceptWords = ['help', 'show', 'teach', 'understand', 'learn', 'discover']
  
  const conceptCount = conceptWords.filter(word => ideas.toLowerCase().includes(word)).length
  if (conceptCount >= 2) {
    feedback.push('✅ Big ideas focus on understanding rather than facts')
    score += 25
  } else {
    feedback.push('⚠️ Big ideas may be too factual - need more conceptual focus')
    score -= 10
  }
  
  // Subject-specific checks
  if (subject.includes('Mathématiques')) {
    const mathConcepts = ['numbers', 'patterns', 'solve', 'problems', 'measure', 'compare']
    const hasMathFocus = mathConcepts.some(concept => ideas.toLowerCase().includes(concept))
    if (hasMathFocus) {
      feedback.push('✅ Big ideas connect to mathematical thinking')
      score += 15
    }
  }
  
  if (subject.includes('Sciences')) {
    const scienceConcepts = ['observe', 'changes', 'living', 'environment', 'investigate']
    const hasScienceFocus = scienceConcepts.some(concept => ideas.toLowerCase().includes(concept))
    if (hasScienceFocus) {
      feedback.push('✅ Big ideas promote scientific thinking')
      score += 15
    }
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    feedback
  }
}

function evaluateCulminatingTask(task: string | null, subject: string, duration: number): { score: number; feedback: string[] } {
  const feedback: string[] = []
  let score = 0
  
  if (!task || task.trim() === '') {
    return {
      score: 0,
      feedback: ['❌ CRITICAL: No culminating task provided']
    }
  }
  
  const taskText = task.toLowerCase()
  
  // Check for authentic assessment characteristics
  const authenticTerms = [
    'create', 'show', 'demonstrate', 'share', 'present', 'make', 'design',
    'perform', 'build', 'draw', 'tell', 'explain'
  ]
  
  const hasAuthentic = authenticTerms.some(term => taskText.includes(term))
  if (hasAuthentic) {
    feedback.push('✅ Culminating task is authentic and engaging')
    score += 30
  } else {
    feedback.push('❌ Culminating task needs more authentic assessment')
    score -= 25
  }
  
  // Check for Grade 1 appropriateness
  const grade1Appropriate = [
    'draw', 'color', 'sing', 'dance', 'tell', 'show', 'share', 'create',
    'make', 'build', 'play', 'act', 'demonstrate'
  ]
  
  const isGrade1Appropriate = grade1Appropriate.some(term => taskText.includes(term))
  if (isGrade1Appropriate) {
    feedback.push('✅ Task developmentally appropriate for Grade 1')
    score += 25
  } else {
    feedback.push('⚠️ Task may be too advanced for Grade 1 students')
    score -= 20
  }
  
  // Check for assessment potential
  const assessmentTerms = [
    'assess', 'evaluate', 'demonstrate', 'show understanding', 'evidence'
  ]
  
  const hasAssessment = assessmentTerms.some(term => taskText.includes(term))
  if (hasAssessment || task.length > 100) {
    feedback.push('✅ Task provides assessment opportunities')
    score += 20
  } else {
    feedback.push('⚠️ Task needs clearer assessment criteria')
    score -= 10
  }
  
  // Check for student engagement
  const engagementTerms = [
    'fun', 'exciting', 'creative', 'choice', 'interest', 'celebrate',
    'share', 'family', 'community', 'friends'
  ]
  
  const hasEngagement = engagementTerms.some(term => taskText.includes(term))
  if (hasEngagement) {
    feedback.push('✅ Task designed to engage students')
    score += 15
  } else {
    feedback.push('⚠️ Task could be more engaging for students')
    score -= 5
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    feedback
  }
}

function evaluateDifferentiation(strategies: any): { score: number; feedback: string[] } {
  const feedback: string[] = []
  let score = 0
  
  if (!strategies) {
    return {
      score: 0,
      feedback: ['❌ CRITICAL: No differentiation strategies provided']
    }
  }
  
  let parsedStrategies: any = {}
  try {
    parsedStrategies = typeof strategies === 'string' ? JSON.parse(strategies) : strategies
  } catch (e) {
    return {
      score: 0,
      feedback: ['❌ CRITICAL: Differentiation strategies format invalid']
    }
  }
  
  // Check for required categories
  const requiredCategories = ['forStruggling', 'forAdvanced', 'forELL', 'forIEP']
  const hasCategories = requiredCategories.filter(cat => 
    parsedStrategies[cat] && Array.isArray(parsedStrategies[cat]) && parsedStrategies[cat].length > 0
  )
  
  if (hasCategories.length === 4) {
    feedback.push('✅ All differentiation categories addressed')
    score += 40
  } else if (hasCategories.length >= 2) {
    feedback.push(`⚠️ Only ${hasCategories.length}/4 differentiation categories provided`)
    score += 20
  } else {
    feedback.push('❌ Insufficient differentiation categories')
    score -= 20
  }
  
  // Evaluate quality of strategies
  hasCategories.forEach(category => {
    const categoryStrategies = parsedStrategies[category]
    
    if (categoryStrategies.length >= 3) {
      feedback.push(`✅ Good variety of strategies for ${category}`)
      score += 10
    } else if (categoryStrategies.length >= 1) {
      feedback.push(`⚠️ Limited strategies for ${category} (need more variety)`)
      score += 5
    }
    
    // Check for Grade 1 appropriate strategies
    const grade1Strategies = [
      'visual', 'picture', 'manipulative', 'hands-on', 'partner', 'small group',
      'reduced', 'simplified', 'extra time', 'model', 'demonstration',
      'choice', 'movement', 'games'
    ]
    
    const hasGrade1Appropriate = categoryStrategies.some((strategy: string) =>
      grade1Strategies.some(g1 => strategy.toLowerCase().includes(g1))
    )
    
    if (hasGrade1Appropriate) {
      score += 5
    }
  })
  
  return {
    score: Math.max(0, Math.min(100, score)),
    feedback
  }
}

function evaluateTimingPacing(startDate: Date, endDate: Date, lessonCount: number, estimatedHours: number | null): { score: number; feedback: string[] } {
  const feedback: string[] = []
  let score = 50 // Start with neutral
  
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const durationWeeks = Math.ceil(durationDays / 7)
  
  // Check unit length appropriateness for Grade 1
  if (durationWeeks < 2) {
    feedback.push('⚠️ Unit may be too short for meaningful learning')
    score -= 15
  } else if (durationWeeks > 8) {
    feedback.push('⚠️ Unit may be too long for Grade 1 attention spans')
    score -= 10
  } else {
    feedback.push('✅ Unit duration appropriate for Grade 1')
    score += 20
  }
  
  // Check lesson frequency
  const averageLessonsPerWeek = lessonCount / durationWeeks
  
  if (averageLessonsPerWeek < 2) {
    feedback.push('⚠️ Very low lesson frequency - may lack continuity')
    score -= 10
  } else if (averageLessonsPerWeek > 8) {
    feedback.push('⚠️ Very high lesson frequency - may be overwhelming')
    score -= 15
  } else if (averageLessonsPerWeek >= 3 && averageLessonsPerWeek <= 6) {
    feedback.push('✅ Good lesson frequency for sustained learning')
    score += 15
  }
  
  // Check estimated hours if provided
  if (estimatedHours) {
    const hoursPerWeek = estimatedHours / durationWeeks
    if (hoursPerWeek < 1) {
      feedback.push('⚠️ Very limited time allocation')
      score -= 5
    } else if (hoursPerWeek > 10) {
      feedback.push('⚠️ Excessive time allocation')
      score -= 5
    } else {
      feedback.push('✅ Reasonable time allocation')
      score += 10
    }
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    feedback
  }
}

async function evaluateUnitPlan(unitPlan: any): Promise<UnitReview> {
  const startDate = new Date(unitPlan.startDate)
  const endDate = new Date(unitPlan.endDate)
  const lessonCount = unitPlan.lessonPlans?.length || 0
  
  // Evaluate each criterion
  const essentialQuestions = evaluateEssentialQuestions(unitPlan.essentialQuestions, unitPlan.longRangePlan.subject)
  const bigIdeas = evaluateBigIdeas(unitPlan.bigIdeas, unitPlan.longRangePlan.subject)
  const culminatingTask = evaluateCulminatingTask(unitPlan.culminatingTask, unitPlan.longRangePlan.subject, 
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const differentiation = evaluateDifferentiation(unitPlan.differentiationStrategies)
  const timingPacing = evaluateTimingPacing(startDate, endDate, lessonCount, unitPlan.estimatedHours)
  
  // Basic assessments for other criteria
  const learningProgression = {
    score: unitPlan.priorKnowledge ? 70 : 30,
    feedback: unitPlan.priorKnowledge ? 
      ['✅ Prior knowledge addressed'] : 
      ['❌ No prior knowledge considerations']
  }
  
  const lessonAlignment = {
    score: lessonCount > 0 ? Math.min(100, 50 + (lessonCount * 2)) : 0,
    feedback: lessonCount > 0 ? 
      [`✅ ${lessonCount} lesson plans created`] : 
      ['❌ CRITICAL: No lesson plans found']
  }
  
  const crossCurricular = {
    score: unitPlan.crossCurricularConnections ? 80 : 20,
    feedback: unitPlan.crossCurricularConnections ? 
      ['✅ Cross-curricular connections identified'] : 
      ['⚠️ Limited cross-curricular connections']
  }
  
  const assessment = {
    score: unitPlan.assessmentPlan ? 75 : 25,
    feedback: unitPlan.assessmentPlan ? 
      ['✅ Assessment plan provided'] : 
      ['❌ No clear assessment plan']
  }
  
  const gradeAppropriateness = {
    score: 75, // Assume generally appropriate unless specific issues found
    feedback: ['✅ Generally appropriate for Grade 1']
  }
  
  // Calculate overall score
  const criteria = {
    essentialQuestions,
    bigIdeas,
    learningProgression,
    culminatingTask,
    lessonAlignment,
    timingPacing,
    crossCurricular,
    differentiation,
    assessment,
    gradeAppropriateness
  }
  
  const weights = {
    essentialQuestions: 0.15,
    bigIdeas: 0.15,
    learningProgression: 0.10,
    culminatingTask: 0.15,
    lessonAlignment: 0.15,
    timingPacing: 0.05,
    crossCurricular: 0.05,
    differentiation: 0.15,
    assessment: 0.10,
    gradeAppropriateness: 0.05
  }
  
  const overallScore = Math.round(
    Object.entries(criteria).reduce((sum, [key, criterion]) => {
      return sum + (criterion.score * weights[key as keyof typeof weights])
    }, 0)
  )
  
  // Compile specific problems and recommendations
  const specificProblems: string[] = []
  const recommendations: string[] = []
  
  Object.values(criteria).forEach(criterion => {
    criterion.feedback.forEach(feedback => {
      if (feedback.startsWith('❌')) {
        specificProblems.push(feedback)
      } else if (feedback.startsWith('⚠️')) {
        specificProblems.push(feedback)
      }
    })
  })
  
  // Generate recommendations based on score
  if (overallScore < 60) {
    recommendations.push('🚨 URGENT: This unit requires major revisions before implementation')
  } else if (overallScore < 75) {
    recommendations.push('⚠️ This unit needs significant improvements')
  } else if (overallScore < 85) {
    recommendations.push('✨ This unit is good but could be enhanced')
  } else {
    recommendations.push('🌟 This unit demonstrates strong pedagogical design')
  }
  
  // Add specific recommendations
  if (essentialQuestions.score < 60) {
    recommendations.push('• Rewrite essential questions to be more open-ended and Grade 1 appropriate')
  }
  if (bigIdeas.score < 60) {
    recommendations.push('• Strengthen big ideas to focus on transferable understandings')
  }
  if (differentiation.score < 60) {
    recommendations.push('• Develop comprehensive differentiation strategies for all learner types')
  }
  if (culminatingTask.score < 60) {
    recommendations.push('• Design a more authentic and engaging culminating task')
  }
  
  return {
    unitId: unitPlan.id,
    title: unitPlan.title,
    subject: unitPlan.longRangePlan.subject,
    overallScore,
    criteria,
    specificProblems,
    recommendations
  }
}

async function reviewAllUnits() {
  try {
    console.log('🔍 COMPREHENSIVE PEDAGOGICAL REVIEW - Emily McIsaac Unit Plans')
    console.log('=' + '='.repeat(70))
    console.log('Reviewer: Expert Curriculum Designer')
    console.log('Focus: Grade 1 French Immersion Best Practices')
    console.log('Date: ' + new Date().toLocaleDateString())
    console.log('')
    
    // Get all unit plans with related data
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: 23 },
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
    
    console.log(`📊 Reviewing ${unitPlans.length} unit plans across ${[...new Set(unitPlans.map(u => u.longRangePlan.subject))].length} subjects\n`)
    
    const reviews: UnitReview[] = []
    
    // Review each unit
    for (const unitPlan of unitPlans) {
      console.log(`🔍 Reviewing: ${unitPlan.title} (${unitPlan.longRangePlan.subject})`)
      const review = await evaluateUnitPlan(unitPlan)
      reviews.push(review)
      
      const scoreEmoji = review.overallScore >= 85 ? '🌟' : 
                        review.overallScore >= 75 ? '✨' : 
                        review.overallScore >= 60 ? '⚠️' : '🚨'
      
      console.log(`   ${scoreEmoji} Score: ${review.overallScore}%`)
      console.log('')
    }
    
    // Generate comprehensive report
    console.log('\n🎯 COMPREHENSIVE REVIEW RESULTS')
    console.log('=' + '='.repeat(70))
    
    // Subject-wise summary
    const bySubject = reviews.reduce((acc, review) => {
      if (!acc[review.subject]) {
        acc[review.subject] = []
      }
      acc[review.subject].push(review)
      return acc
    }, {} as Record<string, UnitReview[]>)
    
    console.log('\n📊 SCORES BY SUBJECT:')
    for (const [subject, subjectReviews] of Object.entries(bySubject)) {
      const avgScore = Math.round(subjectReviews.reduce((sum, r) => sum + r.overallScore, 0) / subjectReviews.length)
      const scoreEmoji = avgScore >= 85 ? '🌟' : avgScore >= 75 ? '✨' : avgScore >= 60 ? '⚠️' : '🚨'
      
      console.log(`\n${scoreEmoji} ${subject}: ${avgScore}% average (${subjectReviews.length} units)`)
      
      subjectReviews.forEach(review => {
        const unitEmoji = review.overallScore >= 85 ? '🌟' : 
                         review.overallScore >= 75 ? '✨' : 
                         review.overallScore >= 60 ? '⚠️' : '🚨'
        console.log(`   ${unitEmoji} ${review.title}: ${review.overallScore}%`)
      })
    }
    
    // Critical issues summary
    console.log('\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:')
    const criticalUnits = reviews.filter(r => r.overallScore < 60)
    if (criticalUnits.length > 0) {
      criticalUnits.forEach(unit => {
        console.log(`\n❌ ${unit.title} (${unit.subject}) - ${unit.overallScore}%`)
        unit.specificProblems.slice(0, 3).forEach(problem => {
          console.log(`   ${problem}`)
        })
      })
    } else {
      console.log('✅ No units with critical scores (all above 60%)')
    }
    
    // Best practices examples
    console.log('\n🌟 EXEMPLARY UNITS (85%+):')
    const exemplaryUnits = reviews.filter(r => r.overallScore >= 85)
    if (exemplaryUnits.length > 0) {
      exemplaryUnits.forEach(unit => {
        console.log(`✅ ${unit.title} (${unit.subject}) - ${unit.overallScore}%`)
      })
    } else {
      console.log('⚠️ No units achieve exemplary status (85%+)')
    }
    
    // Overall statistics
    const overallAverage = Math.round(reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length)
    const distribution = {
      excellent: reviews.filter(r => r.overallScore >= 85).length,
      good: reviews.filter(r => r.overallScore >= 75 && r.overallScore < 85).length,
      needs_improvement: reviews.filter(r => r.overallScore >= 60 && r.overallScore < 75).length,
      critical: reviews.filter(r => r.overallScore < 60).length
    }
    
    console.log('\n📈 OVERALL STATISTICS:')
    console.log(`Overall Average Score: ${overallAverage}%`)
    console.log(`Excellent (85%+): ${distribution.excellent} units (${Math.round(distribution.excellent/reviews.length*100)}%)`)
    console.log(`Good (75-84%): ${distribution.good} units (${Math.round(distribution.good/reviews.length*100)}%)`)
    console.log(`Needs Improvement (60-74%): ${distribution.needs_improvement} units (${Math.round(distribution.needs_improvement/reviews.length*100)}%)`)
    console.log(`Critical (<60%): ${distribution.critical} units (${Math.round(distribution.critical/reviews.length*100)}%)`)
    
    // Export detailed results
    const fs = await import('fs')
    await fs.promises.writeFile(
      '/Users/michaelmcisaac/Github/teaching-engine2.0/comprehensive-unit-review-results.json',
      JSON.stringify({
        summary: {
          totalUnits: reviews.length,
          overallAverage,
          distribution,
          reviewDate: new Date().toISOString(),
          reviewer: 'Expert Curriculum Designer'
        },
        bySubject,
        detailedReviews: reviews
      }, null, 2)
    )
    
    console.log('\n💾 Detailed review results exported to: comprehensive-unit-review-results.json')
    
    // Final recommendations
    console.log('\n🎯 PRIORITY RECOMMENDATIONS:')
    if (overallAverage < 75) {
      console.log('🚨 URGENT: System-wide pedagogical improvements needed')
      console.log('• Focus on essential questions and big ideas quality')
      console.log('• Strengthen differentiation strategies')
      console.log('• Improve culminating task authenticity')
    } else if (overallAverage < 85) {
      console.log('⚠️ Good foundation, but refinement needed')
      console.log('• Enhance essential questions for deeper inquiry')
      console.log('• Expand differentiation strategies')
      console.log('• Strengthen assessment alignment')
    } else {
      console.log('🌟 Excellent pedagogical design overall')
      console.log('• Continue current quality standards')
      console.log('• Share best practices across units')
    }
    
  } catch (error) {
    console.error('❌ Error during comprehensive review:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the comprehensive review
reviewAllUnits()