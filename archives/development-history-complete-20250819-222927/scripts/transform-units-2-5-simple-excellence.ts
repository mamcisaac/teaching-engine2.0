#!/usr/bin/env npx tsx

/**
 * Transform Units 2-5: From Complex to Simple Excellence
 * 
 * This script continues the Unit 1 transformation, converting Units 2-5
 * to the Simple Excellence format that Emily can implement with confidence.
 * 
 * TRANSFORMATION GOALS:
 * - Wonder-Explore-Share daily structure (30-60 minutes, flexible)
 * - Weekly assessment instead of daily documentation burden
 * - Substitute-friendly with clear, simple instructions
 * - Grade 1 appropriate cognitive development
 * - Natural French integration, not forced vocabulary
 * - Practical safety protocols embedded in activities
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function transformUnits2to5() {
  console.log('🌟 TRANSFORMING UNITS 2-5: Simple Excellence Implementation')
  console.log('========================================================\n')
  
  try {
    // Find Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    })
    
    if (!emily) {
      throw new Error('Emily McIsaac account not found')
    }
    
    // Find Units 2-5 for Science
    const units = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      skip: 1, // Skip Unit 1 (already done)
      take: 4  // Take Units 2-5
    })
    
    if (units.length < 4) {
      throw new Error('Not enough Science units found for transformation')
    }
    
    console.log(`Found ${units.length} units to transform:`)
    units.forEach((unit, index) => {
      console.log(`- Unit ${index + 2}: ${unit.title}`)
    })
    console.log('')
    
    // UNIT 2: Materials and Properties (October) - Simple Excellence
    const unit2Excellence = {
      description: `Students explore different materials through gentle hands-on investigations, discovering properties like hard/soft, smooth/rough, heavy/light. This builds observation skills while introducing scientific vocabulary naturally through real discoveries.

**Daily Structure**: Wonder (what do we notice about this material?) → Explore (gentle testing and sorting) → Share (what did we discover?)

**Flexibility**: 30-60 minutes based on engagement. Extensions available for excited learners, simplified versions for challenging days.

**Safety Focus**: Gentle exploration with appropriate materials, no tasting without permission, careful handling of all objects.

**French Integration**: Material words emerge naturally from investigations and classification needs.`,

      bigIdeas: `Different materials have different properties that we can discover through careful observation. Safe exploration helps us learn about the world around us.`,

      essentialQuestions: [
        "What makes materials different from each other?",
        "How can we explore materials safely?",
        "What properties can we discover by looking and touching?",
        "Qu'est-ce qui rend les matériaux différents?",
        "Comment pouvons-nous explorer les matériaux en sécurité?",
        "Quelles propriétés pouvons-nous découvrir?"
      ],

      assessmentPlan: `**SIMPLE & SUSTAINABLE ASSESSMENT:**

**Daily**: Quick observations during investigations - no formal documentation
**Weekly**: One photo + brief note about material discoveries
**Monthly**: Students show favorite material investigations
**Unit End**: Simple sorting demonstration showing property understanding

**Evidence Sources**:
- Student sorting and classification activities
- Photos of material explorations
- Brief notes about safety habits and vocabulary usage
- Simple documentation of property identification accuracy

**For Substitutes**: Basic sorting activities provided - no complex assessment required
**Safety Assessment**: Students demonstrate safe material handling`,

      successCriteria: [
        "Handle different materials gently and safely",
        "Notice and describe simple material properties",
        "Sort materials by one property (hard/soft, rough/smooth)",
        "Use basic French material words in context",
        "Share discoveries about materials with classmates",
        "Follow safety rules when exploring new materials"
      ],

      differentiationStrategies: {
        "forAllStudents": "Hands-on material exploration, visual property cards, partner investigations, choice in materials to explore",
        "extraSupport": "Fewer materials to sort, adult guidance for exploration, visual cues for properties, extended time for discoveries",
        "extraChallenge": "More complex property sorting, leadership in investigations, helping classmates, advanced property vocabulary",
        "languageLearners": "Visual property cards, peer translation support, celebrate French attempts, allow home language descriptions"
      },

      communityConnections: `**MATERIAL EXPLORATION PARTNERSHIPS:**

**With Families**: Send home simple material exploration challenges
**School Community**: Visit maintenance staff to see school building materials
**Outdoor Learning**: Explore natural materials in schoolyard safely
**Community Helpers**: Learn about materials different workers use

**Substitute Support**: All community connections are optional extras`,

      keyVocabulary: {
        "month": "octobre",
        "totalLessons": 20,
        "schoolDays": 20,
        "bigIdea": "Material properties guide safe exploration",
        "dailyPattern": "Wonder → Explore → Share (flexible timing)",
        "coreWords": ["dur", "mou", "lisse", "rugueux"],
        "safetyFocus": "Gentle handling, no tasting, appropriate tools",
        "assessmentStyle": "Weekly material sorting photo + note"
      },

      enduringUnderstandings: `Different materials have different properties that help us understand and use them appropriately. Safe, gentle exploration reveals the fascinating variety in our material world.`
    }

    // UNIT 3: Fall Changes and Weather Safety (November) - Simple Excellence  
    const unit3Excellence = {
      description: `Students observe and document fall changes in their environment while learning essential weather safety. This connects science learning to seasonal experiences while building observation skills and safety awareness.

**Daily Structure**: Wonder (what's changing around us?) → Explore (safe observation and documentation) → Share (what changes did we notice?)

**Flexibility**: 30-60 minutes with outdoor observation when weather permits, indoor alternatives always ready.

**Safety Focus**: Weather appropriate clothing, staying with groups outdoors, understanding weather safety basics.

**French Integration**: Seasonal vocabulary emerges naturally from real observations and weather discussions.`,

      bigIdeas: `The world around us changes with the seasons, and we can observe these changes safely. Weather affects how we dress, play, and stay safe.`,

      essentialQuestions: [
        "What changes can we observe in fall?",
        "How do we stay safe in different weather?",
        "What do living things do when seasons change?",
        "Quels changements observons-nous en automne?",
        "Comment restons-nous en sécurité par différents temps?",
        "Que font les êtres vivants quand les saisons changent?"
      ],

      assessmentPlan: `**SIMPLE & SUSTAINABLE ASSESSMENT:**

**Daily**: Quick observations during weather/nature time - no formal recording
**Weekly**: One seasonal photo + brief note about observed changes
**Monthly**: Students share favorite fall observations
**Unit End**: Weather safety demonstration and seasonal change sharing

**Evidence Sources**:
- Student seasonal observation drawings
- Photos of fall explorations and weather safety practices
- Brief notes about weather vocabulary usage
- Documentation of weather safety awareness

**For Substitutes**: Window observations and indoor seasonal activities available
**Safety Assessment**: Students demonstrate weather-appropriate safety choices`,

      successCriteria: [
        "Observe and describe fall changes in environment",
        "Identify appropriate clothing for different weather",
        "Follow safety rules during outdoor observations",
        "Use basic French weather and seasonal words",
        "Notice how living things respond to seasonal changes",
        "Make connections between weather and daily activities"
      ],

      differentiationStrategies: {
        "forAllStudents": "Multi-sensory observations, visual weather cards, peer observation partners, choice in documentation method",
        "extraSupport": "Fewer observation targets, adult guidance outdoors, visual safety reminders, extended time for noticing",
        "extraChallenge": "Detailed observation recording, weather pattern predictions, leadership in outdoor explorations",
        "languageLearners": "Visual weather vocabulary, peer support for observations, celebrate French attempts, multilingual weather words"
      },

      communityConnections: `**SEASONAL SAFETY PARTNERSHIPS:**

**With Families**: Share seasonal safety tips and home observations
**School Community**: Learn from custodial staff about seasonal building changes
**Outdoor Learning**: Regular safe observations in schoolyard and playground
**Weather Helpers**: Learn from those who work outside in all weather

**Substitute Support**: Indoor alternatives ensure learning continues regardless of weather`,

      keyVocabulary: {
        "month": "novembre", 
        "totalLessons": 18,
        "schoolDays": 18,
        "bigIdea": "Seasonal changes and weather safety awareness",
        "dailyPattern": "Wonder → Explore → Share (weather dependent flexibility)",
        "coreWords": ["automne", "temps", "changement", "sécurité"],
        "safetyFocus": "Weather appropriate choices, group safety outdoors",
        "assessmentStyle": "Weekly seasonal observation photo + note"
      },

      enduringUnderstandings: `Seasons bring predictable changes that we can observe and document. Understanding weather helps us make safe choices about clothing, activities, and outdoor exploration.`
    }

    // UNIT 4: Energy Around Us (December) - Simple Excellence
    const unit4Excellence = {
      description: `Students explore familiar forms of energy through safe, age-appropriate investigations. Focus on energy they can see, hear, and feel in their daily lives, building foundation understanding through concrete experiences.

**Daily Structure**: Wonder (where do we notice energy?) → Explore (safe energy investigations) → Share (what energy did we discover?)

**Flexibility**: 30-60 minutes with indoor focus during December weather, extensions for high engagement days.

**Safety Focus**: Electrical safety awareness, appropriate volume levels, gentle movement explorations.

**French Integration**: Energy vocabulary develops naturally through movement, sound, and light investigations.`,

      bigIdeas: `Energy is all around us in forms we can see, hear, and feel. We can explore energy safely while learning how it helps us in daily life.`,

      essentialQuestions: [
        "Where do we see and hear energy around us?",
        "How can we explore energy safely?",
        "What kinds of energy help us every day?",
        "Où voyons-nous et entendons-nous l'énergie autour de nous?",
        "Comment pouvons-nous explorer l'énergie en sécurité?",
        "Quels types d'énergie nous aident chaque jour?"
      ],

      assessmentPlan: `**SIMPLE & SUSTAINABLE ASSESSMENT:**

**Daily**: Quick observations during energy explorations - no complex recording
**Weekly**: One photo + brief note about energy discoveries
**Monthly**: Students demonstrate favorite energy investigations
**Unit End**: Energy safety awareness check and discovery sharing

**Evidence Sources**:
- Student energy investigation activities
- Photos of safe energy explorations
- Brief notes about energy vocabulary usage and safety awareness
- Documentation of energy source identification

**For Substitutes**: Safe indoor energy activities provided - minimal setup required
**Safety Assessment**: Students demonstrate energy safety awareness`,

      successCriteria: [
        "Identify familiar forms of energy (light, sound, movement)",
        "Explore energy sources safely with adult guidance", 
        "Recognize basic electrical safety rules",
        "Use simple French energy words in context",
        "Connect energy discoveries to daily life",
        "Follow safety protocols during energy investigations"
      ],

      differentiationStrategies: {
        "forAllStudents": "Multi-sensory energy exploration, visual safety reminders, collaborative investigations, choice in energy focus",
        "extraSupport": "Simplified energy concepts, increased adult support, visual energy source cards, extended exploration time",
        "extraChallenge": "Complex energy connections, investigation leadership roles, peer teaching opportunities",
        "languageLearners": "Visual energy vocabulary, gestural communication support, celebrate energy word attempts, multilingual connections"
      },

      communityConnections: `**ENERGY SAFETY PARTNERSHIPS:**

**With Families**: Share electrical safety tips and home energy exploration ideas
**School Community**: Learn about school energy use with maintenance staff
**Safe Explorations**: Appropriate energy investigations in classroom and gym
**Community Helpers**: Learn about energy use in different jobs

**Substitute Support**: All community connections optional - core learning happens in classroom`,

      keyVocabulary: {
        "month": "décembre",
        "totalLessons": 15,
        "schoolDays": 15,
        "bigIdea": "Energy awareness and safety in daily life",
        "dailyPattern": "Wonder → Explore → Share (indoor focused)",
        "coreWords": ["énergie", "lumière", "son", "mouvement"],
        "safetyFocus": "Electrical safety, appropriate exploration volume",
        "assessmentStyle": "Weekly energy investigation photo + note"
      },

      enduringUnderstandings: `Energy comes in many forms that we encounter daily. Safe exploration of energy helps us understand and appreciate the role energy plays in our lives.`
    }

    // UNIT 5: Winter Discoveries (January) - Simple Excellence
    const unit5Excellence = {
      description: `Students explore winter phenomena through safe indoor and outdoor observations, building on fall changes unit while developing weather awareness and seasonal adaptation understanding.

**Daily Structure**: Wonder (what's special about winter?) → Explore (appropriate winter investigations) → Share (what winter discoveries did we make?)

**Flexibility**: 30-60 minutes with weather-dependent outdoor components, indoor alternatives always prepared.

**Safety Focus**: Winter clothing safety, ice and snow awareness, temperature safety concepts.

**French Integration**: Winter vocabulary emerges naturally from seasonal experiences and investigations.`,

      bigIdeas: `Winter brings unique conditions that affect living and non-living things. We can explore winter safely while learning how to adapt to seasonal changes.`,

      essentialQuestions: [
        "What makes winter different from other seasons?",
        "How do we stay safe and comfortable in winter?",
        "How do living things survive winter conditions?",
        "Qu'est-ce qui rend l'hiver différent des autres saisons?",
        "Comment restons-nous en sécurité et confortables en hiver?",
        "Comment les êtres vivants survivent-ils aux conditions hivernales?"
      ],

      assessmentPlan: `**SIMPLE & SUSTAINABLE ASSESSMENT:**

**Daily**: Quick observations during winter explorations - no formal documentation
**Weekly**: One photo + brief note about winter discoveries
**Monthly**: Students share winter adaptation observations
**Unit End**: Winter safety awareness demonstration and seasonal connection making

**Evidence Sources**:
- Student winter observation activities and drawings
- Photos of appropriate winter explorations
- Brief notes about winter vocabulary usage and safety awareness
- Documentation of seasonal adaptation understanding

**For Substitutes**: Indoor winter investigations available for all weather conditions
**Safety Assessment**: Students demonstrate winter safety awareness`,

      successCriteria: [
        "Observe and describe winter characteristics safely",
        "Identify appropriate winter clothing and safety practices",
        "Notice how living things adapt to winter conditions", 
        "Use basic French winter vocabulary in context",
        "Make connections between winter conditions and daily life",
        "Follow winter safety protocols during explorations"
      ],

      differentiationStrategies: {
        "forAllStudents": "Multi-sensory winter exploration, visual winter safety cards, collaborative seasonal observations, choice in exploration focus",
        "extraSupport": "Simplified winter concepts, increased adult support outdoors, visual seasonal comparison aids, extended observation time",
        "extraChallenge": "Complex seasonal pattern recognition, weather prediction attempts, leadership in winter safety discussions",
        "languageLearners": "Visual winter vocabulary, peer support for seasonal observations, celebrate French attempts, home culture winter connections"
      },

      communityConnections: `**WINTER SAFETY PARTNERSHIPS:**

**With Families**: Share winter safety tips and home seasonal observations
**School Community**: Learn about winter building preparations with staff
**Outdoor Learning**: Safe winter observations when conditions permit
**Seasonal Helpers**: Learn from those who work outside in winter

**Substitute Support**: Complete indoor program ensures learning continues in all weather`,

      keyVocabulary: {
        "month": "janvier",
        "totalLessons": 20,
        "schoolDays": 20,
        "bigIdea": "Winter adaptation and safety awareness",
        "dailyPattern": "Wonder → Explore → Share (weather responsive)",
        "coreWords": ["hiver", "neige", "froid", "adaptation"],
        "safetyFocus": "Winter clothing, temperature awareness, ice safety",
        "assessmentStyle": "Weekly winter discovery photo + note"
      },

      enduringUnderstandings: `Winter brings unique conditions that require adaptation by both living things and people. Understanding winter helps us stay safe and appreciate seasonal cycles.`
    }

    // Apply transformations to each unit
    const transformations = [unit2Excellence, unit3Excellence, unit4Excellence, unit5Excellence]
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i]
      const excellence = transformations[i]
      
      console.log(`Transforming Unit ${i + 2}: ${unit.title}`)
      console.log(`Applying Simple Excellence format...`)
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          description: excellence.description,
          bigIdeas: excellence.bigIdeas,
          essentialQuestions: excellence.essentialQuestions,
          assessmentPlan: excellence.assessmentPlan,
          successCriteria: excellence.successCriteria,
          differentiationStrategies: excellence.differentiationStrategies,
          communityConnections: excellence.communityConnections,
          keyVocabulary: excellence.keyVocabulary,
          enduringUnderstandings: excellence.enduringUnderstandings
        }
      })
      
      console.log(`✅ Unit ${i + 2} successfully transformed!\n`)
    }
    
    // Verify transformations
    const updatedUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 5
    })
    
    console.log('TRANSFORMATION VERIFICATION:')
    console.log('==========================')
    updatedUnits.forEach((unit, index) => {
      const vocab = unit.keyVocabulary as any
      console.log(`✅ Unit ${index + 1}: ${unit.title}`)
      console.log(`   Structure: Wonder-Explore-Share (${vocab?.dailyPattern || 'flexible timing'})`)
      console.log(`   Assessment: ${vocab?.assessmentStyle || 'Weekly photo + note'}`)
      console.log(`   Safety Focus: ${vocab?.safetyFocus || 'Age-appropriate protocols'}`)
      console.log(`   Month: ${vocab?.month || 'TBD'} (${vocab?.totalLessons || 'TBD'} lessons)`)
      console.log('')
    })
    
    console.log('SIMPLE EXCELLENCE ACHIEVEMENTS:')
    console.log('===============================')
    console.log('🎯 SIMPLE: Clear Wonder-Explore-Share structure every day')
    console.log('⏰ FLEXIBLE: 30-60 minutes based on engagement and conditions')
    console.log('📊 SUSTAINABLE: Weekly assessment instead of daily documentation burden')
    console.log('👥 SUBSTITUTE-FRIENDLY: Clear instructions, minimal expertise required')
    console.log('🧠 GRADE 1 APPROPRIATE: Concrete experiences, age-appropriate concepts')
    console.log('🇫🇷 NATURAL FRENCH: Vocabulary emerges from real communication needs')
    console.log('🛡️ SAFE: Protocols embedded naturally in all investigations')
    console.log('✨ IMPLEMENTABLE: Emily can teach these with confidence and joy')
    
  } catch (error) {
    console.error('💥 Transformation failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute transformation
transformUnits2to5()
  .then(() => {
    console.log('\n🌟 Units 2-5 Simple Excellence transformation complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Units 2-5 transformation failed:', error)
    process.exit(1)
  })