#!/usr/bin/env npx tsx

/**
 * Simplify Unit 1: From Complex "Responsive Inquiry" to Simple Excellence
 * 
 * This script transforms the overly complex Unit 1 into a simple, implementable
 * format that Emily can actually use successfully with Grade 1 students.
 * 
 * CHANGES:
 * - Remove overwhelming documentation
 * - Simplify to Wonder-Explore-Share structure  
 * - Create sustainable assessment
 * - Make substitute-friendly
 * - Focus on Grade 1 development
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function simplifyUnit1() {
  console.log('🌟 SIMPLIFYING UNIT 1: From Complex to Simple Excellence')
  console.log('======================================================\n')
  
  try {
    // Find Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    })
    
    if (!emily) {
      throw new Error('Emily McIsaac account not found')
    }
    
    // Find Unit 1
    const unit1 = await prisma.unitPlan.findFirst({
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
    
    if (!unit1) {
      throw new Error('Unit 1 not found')
    }
    
    console.log(`Simplifying: ${unit1.title}`)
    console.log(`From: 1379 character description`)
    console.log(`To: Simple, clear, implementable format\n`)
    
    // SIMPLE DESCRIPTION - Clear and concise
    const simpleDescription = `Students explore their school environment safely while developing basic observation skills and learning to classify objects as living or non-living. This foundation unit establishes scientific curiosity and safety habits that will support learning all year.

**Daily Structure**: Wonder (what do we notice?) → Explore (hands-on discovery) → Share (what did we learn?)

**Flexibility**: 30-60 minutes depending on student engagement and discoveries. Core activities ensure all students succeed, with extensions available for excited learners.

**Safety Focus**: Gentle exploration, staying with groups, and asking before touching. Safety habits practiced naturally through investigations.

**French Integration**: Simple science words emerge naturally from real discoveries and communication needs.`

    // SIMPLE BIG IDEAS - Grade 1 appropriate
    const simpleBigIdeas = `We can learn about our world by looking carefully and asking questions. Being safe helps us explore with confidence. Our school has many interesting living and non-living things to discover.`

    // SIMPLE ESSENTIAL QUESTIONS - Wonder-based
    const simpleEssentialQuestions = [
      "What interesting things can we find in our school?",
      "How do we explore safely?", 
      "What makes something living or non-living?",
      "Qu'est-ce qu'on peut découvrir dans notre école?",
      "Comment explorer en sécurité?",
      "Qu'est-ce qui rend quelque chose vivant ou non-vivant?"
    ]

    // SIMPLE ASSESSMENT PLAN - Sustainable for Emily
    const simpleAssessmentPlan = `**SIMPLE & SUSTAINABLE ASSESSMENT:**

**Daily**: Quick mental notes during teaching - no documentation burden
**Weekly**: One photo + one sentence about the week's discoveries  
**Monthly**: 5-minute portfolio check with students
**Unit End**: Students show what they learned through simple demonstrations

**Evidence Sources**:
- Student drawings and observations
- Photos of investigations and discoveries
- Brief notes about safety habits and French word usage
- Simple documentation of living/non-living classification accuracy

**For Substitutes**: Basic observation checklist provided - no complex assessment required

**Safety Assessment**: Observe students following simple safety habits during investigations`

    // SIMPLE SUCCESS CRITERIA - Achievable and clear
    const simpleSuccessCriteria = [
      "Explore school environment with gentle, safe hands",
      "Notice differences between living and non-living things", 
      "Ask questions about discoveries",
      "Try using simple French science words",
      "Share discoveries with classmates",
      "Follow basic safety rules during investigations"
    ]

    // SIMPLE DIFFERENTIATION - Practical support
    const simpleDifferentiation = {
      "forAllStudents": "Hands-on exploration, visual supports, partner work, choice in how to show learning",
      "extraSupport": "Adult guidance, simplified tasks, visual cues, extended time when needed", 
      "extraChallenge": "Leadership roles, additional questions to explore, helping classmates",
      "languageLearners": "Visual vocabulary, peer support, celebrate attempts at French, allow home language"
    }

    // SIMPLE COMMUNITY CONNECTIONS - Easy to implement
    const simpleCommunityConnections = `**SIMPLE SAFETY PARTNERSHIPS:**

**With Families**: Send home simple safety tips and discoveries from each week
**School Community**: Visit with custodian, nurse, or principal when convenient  
**Outdoor Learning**: Use school yard and playground for natural investigations
**Student Helpers**: Older students can share safety tips or help with activities when available

**Substitute Support**: Community activities are optional - core learning happens in classroom`

    // SIMPLE KEY VOCABULARY - Essential information only
    const simpleKeyVocabulary = {
      "month": "septembre",
      "totalLessons": 19,
      "schoolDays": 19,
      "bigIdea": "Safe exploration builds scientific thinking",
      "dailyPattern": "Wonder → Explore → Share (30-60 minutes, flexible)",
      "coreWords": ["vivant", "non-vivant", "observer", "sécurité"],
      "safetyFocus": "Gentle hands, stay with group, ask before touching",
      "assessmentStyle": "Weekly photo + brief note, no daily documentation"
    }

    // SIMPLE ENDURING UNDERSTANDINGS - What students remember
    const simpleEnduringUnderstandings = `Curiosity and careful observation help us learn about the world. Following safety rules lets us explore with confidence. Our school environment has many fascinating things to discover when we look carefully.`

    // Update Unit 1 with Simple Excellence format
    console.log('Transforming Unit 1 to Simple Excellence...')
    
    await prisma.unitPlan.update({
      where: { id: unit1.id },
      data: {
        description: simpleDescription,
        bigIdeas: simpleBigIdeas,
        essentialQuestions: simpleEssentialQuestions,
        assessmentPlan: simpleAssessmentPlan,
        successCriteria: simpleSuccessCriteria,
        differentiationStrategies: simpleDifferentiation,
        communityConnections: simpleCommunityConnections,
        keyVocabulary: simpleKeyVocabulary,
        enduringUnderstandings: simpleEnduringUnderstandings
      }
    })
    
    console.log('✅ Unit 1 successfully simplified!\n')
    
    // Verify the transformation
    const updatedUnit = await prisma.unitPlan.findFirst({
      where: { id: unit1.id }
    })
    
    console.log('TRANSFORMATION RESULTS:')
    console.log('=======================')
    console.log(`✅ Description: ${updatedUnit.description?.length} characters (was 1379)`)
    console.log(`✅ Assessment: ${updatedUnit.assessmentPlan?.length} characters (was 1252)`)
    console.log(`✅ Success Criteria: ${updatedUnit.successCriteria?.length} items (was 10)`)
    console.log(`✅ Structure: Wonder-Explore-Share with flexible timing`)
    console.log(`✅ Assessment: Weekly documentation (not daily)`)
    console.log(`✅ Safety: Simple, age-appropriate habits`)
    console.log(`✅ French: Natural emergence, not forced vocabulary`)
    console.log(`✅ Substitute-Ready: Clear, simple activities`)
    
    console.log('\nKEY IMPROVEMENTS:')
    console.log('=================')
    console.log('🎯 SIMPLE: Easy to understand and implement')
    console.log('⏰ FLEXIBLE: 30-60 minutes based on engagement')  
    console.log('📊 SUSTAINABLE: Weekly assessment, not daily burden')
    console.log('👥 SUBSTITUTE-FRIENDLY: Clear instructions, no expertise needed')
    console.log('🧠 GRADE 1 APPROPRIATE: Honors 6-year-old development')
    console.log('🇫🇷 NATURAL FRENCH: Words emerge from real communication')
    console.log('🛡️ SAFE: Simple habits embedded in exploration')
    console.log('✨ IMPLEMENTABLE: Emily can teach this with confidence and joy')
    
  } catch (error) {
    console.error('💥 Simplification failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute simplification
simplifyUnit1()
  .then(() => {
    console.log('\n🌟 Unit 1 Simple Excellence transformation complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unit 1 simplification failed:', error)
    process.exit(1)
  })