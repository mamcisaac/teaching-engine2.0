#!/usr/bin/env tsx

import { PrismaClient } from '@teaching-engine/database'

const prisma = new PrismaClient()

async function analyzeSpecificUnits() {
  try {
    console.log('🔍 DETAILED UNIT ANALYSIS - SPECIFIC EXAMPLES')
    console.log('=' + '='.repeat(70))
    console.log('Focus: Critical Issues with Concrete Improvement Examples')
    console.log('Reviewer: Expert Curriculum Designer')
    console.log('')
    
    // Get specific problematic units for detailed analysis
    const sampleUnits = await prisma.unitPlan.findMany({
      where: {
        userId: 23,
        title: {
          in: [
            "Ma communauté", // Lowest French score (41%)
            "Energy in Our Lives", // Lowest Science score (38%)
            "Measurement Exploration", // Low Math score (41%)
            "Winter Celebrations Through Art", // Low Arts score (42%)
            "Safe and Sound", // Low FPS score (44%)
            "Me, Myself, and I" // Highest score to show what's working (66%)
          ]
        }
      },
      include: {
        longRangePlan: {
          select: {
            title: true,
            subject: true,
            grade: true
          }
        },
        expectations: {
          include: {
            expectation: {
              select: {
                code: true,
                title: true,
                subject: true
              }
            }
          }
        }
      }
    })
    
    console.log(`📊 Analyzing ${sampleUnits.length} representative units\n`)
    
    for (const unit of sampleUnits) {
      console.log(`\n🔍 DETAILED ANALYSIS: ${unit.title}`)
      console.log(`Subject: ${unit.longRangePlan.subject}`)
      console.log('=' + '='.repeat(60))
      
      // Analyze essential questions
      console.log('\n❓ ESSENTIAL QUESTIONS ANALYSIS:')
      if (unit.essentialQuestions) {
        try {
          const questions = JSON.parse(unit.essentialQuestions as string)
          console.log('\nCURRENT QUESTIONS:')
          questions.forEach((q: string, i: number) => {
            console.log(`${i + 1}. "${q}"`)
            
            // Detailed analysis of each question
            const issues = []
            if (q.length > 60) issues.push('Too long for Grade 1')
            if (q.split(' ').some(word => word.length > 8)) issues.push('Complex vocabulary')
            if (q.toLowerCase().startsWith('is ') || q.toLowerCase().startsWith('do ') || 
                q.toLowerCase().startsWith('can ') || q.toLowerCase().startsWith('will ')) {
              issues.push('Closed/yes-no question')
            }
            if (!q.toLowerCase().includes('how') && !q.toLowerCase().includes('why') && 
                !q.toLowerCase().includes('what') && !q.toLowerCase().includes('where')) {
              issues.push('Lacks inquiry words')
            }
            
            if (issues.length > 0) {
              console.log(`   ❌ Issues: ${issues.join(', ')}`)
            } else {
              console.log(`   ✅ Generally good`)
            }
          })
          
          // Provide specific improvements
          console.log('\n🎯 IMPROVED QUESTIONS (Grade 1 Appropriate):')
          if (unit.title === "Ma communauté") {
            console.log('1. "Who helps us in our neighborhood?" (Qui nous aide dans notre quartier?)')
            console.log('2. "How do people work together?" (Comment les gens travaillent-ils ensemble?)')
            console.log('3. "What makes our community special?" (Qu\'est-ce qui rend notre communauté spéciale?)')
          } else if (unit.title === "Energy in Our Lives") {
            console.log('1. "What gives us power to move and play?"')
            console.log('2. "How do we use energy every day?"')
            console.log('3. "What happens when we turn things on and off?"')
          } else if (unit.title === "Measurement Exploration") {
            console.log('1. "How do we know which is bigger?"')
            console.log('2. "What tools help us measure things?"')
            console.log('3. "How can we compare our heights?"')
          } else if (unit.title === "Winter Celebrations Through Art") {
            console.log('1. "How do families celebrate winter?"')
            console.log('2. "What colors and shapes show winter joy?"')
            console.log('3. "How can we make art about celebrations?"')
          }
          
        } catch (e) {
          console.log('❌ Cannot parse essential questions - format error')
        }
      } else {
        console.log('❌ CRITICAL: No essential questions provided')
      }
      
      // Analyze big ideas
      console.log('\n💡 BIG IDEAS ANALYSIS:')
      if (unit.bigIdeas) {
        console.log('\nCURRENT BIG IDEAS:')
        console.log(`"${unit.bigIdeas}"`)
        
        // Analyze current big ideas
        console.log('\n❌ PROBLEMS WITH CURRENT BIG IDEAS:')
        if (unit.bigIdeas.includes('can') || unit.bigIdeas.includes('are') || unit.bigIdeas.includes('is')) {
          console.log('• Too factual - states facts rather than transferable understanding')
        }
        if (unit.bigIdeas.split(' ').length < 10) {
          console.log('• Too brief - lacks depth of understanding')
        }
        if (!unit.bigIdeas.toLowerCase().includes('understand') && 
            !unit.bigIdeas.toLowerCase().includes('learn') &&
            !unit.bigIdeas.toLowerCase().includes('help')) {
          console.log('• Missing transferable concepts')
        }
        
        // Provide improved big ideas
        console.log('\n🎯 IMPROVED BIG IDEAS (Transferable Understanding):')
        if (unit.title === "Ma communauté") {
          console.log('"Understanding our community helps us belong and contribute. People work together to help everyone feel safe and happy. We can be community helpers too."')
        } else if (unit.title === "Energy in Our Lives") {
          console.log('"Understanding energy helps us make smart choices. Energy helps living things grow and move. We can save energy to help our Earth."')
        } else if (unit.title === "Measurement Exploration") {
          console.log('"Understanding measurement helps us compare and describe our world. We can use tools and our bodies to measure things. Measuring helps us solve problems."')
        } else if (unit.title === "Winter Celebrations Through Art") {
          console.log('"Understanding celebrations helps us appreciate different cultures. Art helps us share joy and traditions. Creating art brings communities together."')
        }
        
      } else {
        console.log('❌ CRITICAL: No big ideas provided')
      }
      
      // Analyze differentiation
      console.log('\n🎭 DIFFERENTIATION ANALYSIS:')
      if (unit.differentiationStrategies) {
        try {
          const strategies = JSON.parse(unit.differentiationStrategies as string)
          console.log('Current strategies found - analyzing quality...')
          
          Object.entries(strategies).forEach(([category, strategyList]: [string, any]) => {
            console.log(`\n${category}:`)
            if (Array.isArray(strategyList) && strategyList.length > 0) {
              strategyList.forEach((strategy: string) => {
                console.log(`• ${strategy}`)
              })
            } else {
              console.log('• No strategies provided')
            }
          })
        } catch (e) {
          console.log('❌ Cannot parse differentiation strategies')
        }
      } else {
        console.log('❌ CRITICAL: No differentiation strategies provided')
      }
      
      // Provide comprehensive differentiation examples
      console.log('\n🎯 REQUIRED DIFFERENTIATION STRATEGIES (Grade 1):')
      console.log('\nFor Struggling Learners:')
      console.log('• Use pictures and visual supports')
      console.log('• Provide manipulatives and hands-on materials')
      console.log('• Break tasks into smaller steps')
      console.log('• Offer extra time and practice')
      console.log('• Use peer partners for support')
      
      console.log('\nFor Advanced Learners:')
      console.log('• Provide extension activities and choices')
      console.log('• Encourage deeper questioning and investigation')
      console.log('• Offer leadership roles in group work')
      console.log('• Connect to more complex concepts')
      
      console.log('\nFor ELL (English Language Learners):')
      console.log('• Use visual vocabulary cards')
      console.log('• Provide first language support when possible')
      console.log('• Use gestures and body language')
      console.log('• Pair with bilingual buddies')
      console.log('• Focus on key vocabulary')
      
      console.log('\nFor IEP Students:')
      console.log('• Follow individual accommodation plans')
      console.log('• Modify materials and expectations as needed')
      console.log('• Provide assistive technology support')
      console.log('• Use preferred learning modalities')
      console.log('• Build on individual strengths')
      
      // Analyze culminating task
      console.log('\n🎯 CULMINATING TASK ANALYSIS:')
      if (unit.culminatingTask) {
        console.log('\nCURRENT CULMINATING TASK:')
        console.log(`"${unit.culminatingTask}"`)
        
        console.log('\n🎯 IMPROVED CULMINATING TASK:')
        if (unit.title === "Ma communauté") {
          console.log('"Community Helper Fair: Students choose a community helper to represent and create a display with pictures, props, and costumes. They share how this person helps our community and demonstrate their job through role-play. Families are invited to visit our Community Helper Fair where students present their learning in both French and English."')
        } else if (unit.title === "Energy in Our Lives") {
          console.log('"Energy Detective Showcase: Students become energy detectives and create a poster showing how they use energy at home and school. They demonstrate one way to save energy and teach other classes their energy-saving tip through a song, dance, or demonstration."')
        } else if (unit.title === "Measurement Exploration") {
          console.log('"Measurement Museum: Students create measurement tools using classroom materials and set up stations where visitors can measure different objects. They guide younger students through measuring activities and explain which tool works best for different jobs."')
        }
        
      } else {
        console.log('❌ CRITICAL: No culminating task provided')
      }
      
      // Assessment criteria
      console.log('\n📊 ASSESSMENT IMPROVEMENTS NEEDED:')
      console.log('• Create simple rubrics with pictures/symbols')
      console.log('• Use observation checklists for skills')
      console.log('• Include student self-assessment with emojis')
      console.log('• Document learning through photos and videos')
      console.log('• Provide specific feedback on learning goals')
      console.log('• Connect assessment to curriculum expectations')
      
      console.log('\n' + '='.repeat(60))
    }
    
    // Overall critical recommendations
    console.log('\n\n🚨 CRITICAL SYSTEM-WIDE RECOMMENDATIONS')
    console.log('=' + '='.repeat(70))
    
    console.log('\n1. IMMEDIATE ESSENTIAL QUESTIONS REVISION:')
    console.log('• All questions MUST be rewritten for Grade 1 reading level')
    console.log('• Use simple vocabulary (5 letters or less per word)')
    console.log('• Start with How, What, Where, Why, or When')
    console.log('• Keep questions under 8 words')
    console.log('• Focus on observable, concrete concepts')
    
    console.log('\n2. BIG IDEAS COMPLETE OVERHAUL:')
    console.log('• Replace all factual statements with transferable understandings')
    console.log('• Begin with "Understanding..." or "Learning about..."')
    console.log('• Connect to life beyond the classroom')
    console.log('• Use Grade 1 appropriate vocabulary')
    console.log('• Focus on conceptual rather than procedural knowledge')
    
    console.log('\n3. DIFFERENTIATION STRATEGIES MANDATORY:')
    console.log('• EVERY unit MUST include all four categories')
    console.log('• Minimum 3 strategies per category')
    console.log('• Focus on Grade 1 developmental needs')
    console.log('• Include visual, kinesthetic, and auditory supports')
    console.log('• Align with French Immersion language development')
    
    console.log('\n4. CULMINATING TASK ENHANCEMENT:')
    console.log('• Make all tasks hands-on and creative')
    console.log('• Include family/community connections')
    console.log('• Provide clear assessment criteria')
    console.log('• Ensure authentic demonstration of learning')
    console.log('• Support both French and English expression')
    
    console.log('\n5. FRENCH IMMERSION SPECIFIC ISSUES:')
    console.log('• Essential questions should explicitly support French language development')
    console.log('• Include vocabulary acquisition goals')
    console.log('• Connect to French cultural contexts')
    console.log('• Provide scaffolding for language production')
    console.log('• Balance content and language learning objectives')
    
    console.log('\n📈 PRIORITY RANKING:')
    console.log('1. 🚨 URGENT: Rewrite essential questions (ALL 40 units)')
    console.log('2. 🚨 URGENT: Create differentiation strategies (ALL 40 units)')
    console.log('3. 🚨 HIGH: Revise big ideas for transferability (ALL 40 units)')
    console.log('4. ⚠️ MEDIUM: Enhance culminating tasks for authenticity')
    console.log('5. ⚠️ MEDIUM: Strengthen assessment criteria')
    
    console.log('\n⏰ TIMELINE RECOMMENDATION:')
    console.log('• Week 1-2: Emergency revision of essential questions')
    console.log('• Week 3-4: Complete differentiation strategy development')
    console.log('• Week 5-6: Big ideas conceptual revision')
    console.log('• Week 7-8: Culminating task enhancement')
    console.log('• Week 9-10: Assessment criteria alignment')
    
  } catch (error) {
    console.error('❌ Error in detailed analysis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the detailed analysis
analyzeSpecificUnits()