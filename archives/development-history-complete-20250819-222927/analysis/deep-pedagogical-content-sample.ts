import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepPedagogicalSample() {
  console.log('🔍 DEEP PEDAGOGICAL CONTENT SAMPLING');
  console.log('=====================================\n');

  const samples = [
    { subject: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh', unitTitle: 'Bienvenue en français' },
    { subject: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in', unitTitle: 'Fondations des nombres 0-10' },
    { subject: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh', unitTitle: 'Petits scientifiques sécuritaires' },
    { subject: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5', unitTitle: 'Moi et mon école' },
    { subject: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo', unitTitle: 'Premiers pas artistiques' },
    { subject: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw', unitTitle: 'Mon corps et ma sécurité' }
  ];

  for (const sample of samples) {
    console.log(`📚 ${sample.subject.toUpperCase()} - "${sample.unitTitle}"`);
    console.log('='.repeat(60));
    
    const unit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: sample.lrpId,
        title: sample.unitTitle
      },
      select: {
        title: true,
        description: true,
        bigIdeas: true,
        essentialQuestions: true,
        successCriteria: true,
        assessmentPlan: true,
        differentiationStrategies: true,
        indigenousPerspectives: true,
        keyVocabulary: true,
        estimatedHours: true,
        startDate: true,
        endDate: true
      }
    });

    if (!unit) {
      console.log('❌ Unit not found\n---\n');
      continue;
    }

    // Description Analysis (Core+Extension check)
    console.log('📖 DESCRIPTION ANALYSIS:');
    if (unit.description) {
      const hasCore = unit.description.toLowerCase().includes('core') || 
                      unit.description.toLowerCase().includes('essentielles');
      const hasExtension = unit.description.toLowerCase().includes('extension') || 
                          unit.description.toLowerCase().includes('enrichissement');
      const hasETFO = unit.description.toLowerCase().includes('etfo') ||
                      unit.description.toLowerCase().includes('minds on') ||
                      unit.description.toLowerCase().includes('consolidation');
      
      console.log(`  ✅ Description present (${unit.description.length} chars)`);
      console.log(`  ${hasCore ? '✅' : '❌'} Core+Extension model mentioned`);
      console.log(`  ${hasETFO ? '✅' : '❌'} ETFO compliance referenced`);
      
      // Sample first 200 chars
      console.log(`  Sample: "${unit.description.substring(0, 200)}${unit.description.length > 200 ? '...' : ''}"`);
    } else {
      console.log('  ❌ No description');
    }

    // Big Ideas Analysis  
    console.log('\n💡 BIG IDEAS ANALYSIS:');
    if (unit.bigIdeas) {
      console.log(`  ✅ Big Ideas present (${unit.bigIdeas.length} chars)`);
      console.log(`  Sample: "${unit.bigIdeas.substring(0, 150)}${unit.bigIdeas.length > 150 ? '...' : ''}"`);
    } else {
      console.log('  ❌ No big ideas');
    }

    // Essential Questions Analysis
    console.log('\n❓ ESSENTIAL QUESTIONS ANALYSIS:');
    if (unit.essentialQuestions) {
      console.log(`  ✅ Essential Questions present`);
      try {
        const questions = JSON.parse(unit.essentialQuestions);
        if (Array.isArray(questions)) {
          console.log(`  Count: ${questions.length} questions`);
          console.log(`  Sample: "${questions[0] || 'No questions'}"`);
        } else {
          const textContent = typeof unit.essentialQuestions === 'string' ? unit.essentialQuestions : JSON.stringify(unit.essentialQuestions);
          console.log(`  Format: Text (${textContent.length} chars)`);
          console.log(`  Sample: "${textContent.substring(0, 100)}..."`);
        }
      } catch {
        const textContent = typeof unit.essentialQuestions === 'string' ? unit.essentialQuestions : JSON.stringify(unit.essentialQuestions);
        console.log(`  Format: Text (${textContent.length} chars)`);
        console.log(`  Sample: "${textContent.substring(0, 100)}..."`);
      }
    } else {
      console.log('  ❌ No essential questions');
    }

    // Success Criteria Analysis
    console.log('\n🎯 SUCCESS CRITERIA ANALYSIS:');
    if (unit.successCriteria) {
      const textContent = typeof unit.successCriteria === 'string' ? unit.successCriteria : JSON.stringify(unit.successCriteria);
      console.log(`  ✅ Success Criteria present (${textContent.length} chars)`);
      console.log(`  Sample: "${textContent.substring(0, 150)}${textContent.length > 150 ? '...' : ''}"`);
    } else {
      console.log('  ❌ No success criteria');
    }

    // Assessment Plan Analysis
    console.log('\n📊 ASSESSMENT PLAN ANALYSIS:');
    if (unit.assessmentPlan) {
      const textContent = typeof unit.assessmentPlan === 'string' ? unit.assessmentPlan : JSON.stringify(unit.assessmentPlan);
      const hasFormative = textContent.toLowerCase().includes('formative') ||
                           textContent.toLowerCase().includes('formatif');
      const hasSummative = textContent.toLowerCase().includes('summative') ||
                          textContent.toLowerCase().includes('sommatif');
      const hasSelfAssess = textContent.toLowerCase().includes('self') ||
                           textContent.toLowerCase().includes('auto');
      
      console.log(`  ✅ Assessment Plan present (${textContent.length} chars)`);
      console.log(`  ${hasFormative ? '✅' : '❌'} Formative assessment mentioned`);
      console.log(`  ${hasSummative ? '✅' : '❌'} Summative assessment mentioned`);
      console.log(`  ${hasSelfAssess ? '✅' : '❌'} Self-assessment mentioned`);
    } else {
      console.log('  ❌ No assessment plan');
    }

    // Differentiation Analysis
    console.log('\n🔄 DIFFERENTIATION ANALYSIS:');
    if (unit.differentiationStrategies) {
      const textContent = typeof unit.differentiationStrategies === 'string' ? unit.differentiationStrategies : JSON.stringify(unit.differentiationStrategies);
      const hasStruggling = textContent.toLowerCase().includes('struggling') ||
                           textContent.toLowerCase().includes('difficulty') ||
                           textContent.toLowerCase().includes('difficulté');
      const hasExtending = textContent.toLowerCase().includes('extending') ||
                          textContent.toLowerCase().includes('advanced') ||
                          textContent.toLowerCase().includes('avancé');
      
      console.log(`  ✅ Differentiation present (${textContent.length} chars)`);
      console.log(`  ${hasStruggling ? '✅' : '❌'} Support for struggling learners`);
      console.log(`  ${hasExtending ? '✅' : '❌'} Extension for advanced learners`);
    } else {
      console.log('  ❌ No differentiation strategies');
    }

    // Indigenous Perspectives Analysis
    console.log('\n🪶 INDIGENOUS PERSPECTIVES ANALYSIS:');
    if (unit.indigenousPerspectives) {
      const textContent = typeof unit.indigenousPerspectives === 'string' ? unit.indigenousPerspectives : JSON.stringify(unit.indigenousPerspectives);
      const hasMikmaq = textContent.toLowerCase().includes('mi\'kmaq') ||
                       textContent.toLowerCase().includes('mikmaq');
      const hasElders = textContent.toLowerCase().includes('elder') ||
                       textContent.toLowerCase().includes('aîné');
      const hasLand = textContent.toLowerCase().includes('land') ||
                      textContent.toLowerCase().includes('terre') ||
                      textContent.toLowerCase().includes('territoire');
      
      console.log(`  ✅ Indigenous Perspectives present (${textContent.length} chars)`);
      console.log(`  ${hasMikmaq ? '✅' : '❌'} Mi'kmaq specific content`);
      console.log(`  ${hasElders ? '✅' : '❌'} Elder wisdom/consultation`);
      console.log(`  ${hasLand ? '✅' : '❌'} Land-based learning`);
    } else {
      console.log('  ❌ No Indigenous perspectives');
    }

    // Key Vocabulary Analysis
    console.log('\n📝 KEY VOCABULARY ANALYSIS:');
    if (unit.keyVocabulary) {
      console.log(`  ✅ Key Vocabulary present`);
      try {
        const vocab = JSON.parse(unit.keyVocabulary);
        if (Array.isArray(vocab)) {
          console.log(`  Count: ${vocab.length} vocabulary items`);
          console.log(`  Sample: "${vocab[0]?.word || 'No words'}: ${vocab[0]?.definition || 'No definition'}"`);
        }
      } catch {
        console.log(`  Format: Text (${unit.keyVocabulary.length} chars)`);
      }
    } else {
      console.log('  ❌ No key vocabulary');
    }

    console.log('\n---\n');
  }

  await prisma.$disconnect();
}

deepPedagogicalSample().catch(console.error);