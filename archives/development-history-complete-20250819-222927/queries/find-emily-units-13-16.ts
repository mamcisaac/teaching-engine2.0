import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findEmilysUnits13to16() {
  try {
    console.log('=== SEARCHING FOR EMILY\'S FRENCH UNITS 13-16 ===\n');
    
    // Get Emily's user record
    const emily = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'emily' } },
          { name: { contains: 'Emily' } }
        ]
      }
    });
    
    if (!emily) {
      console.log('❌ Emily not found in database');
      return;
    }
    
    console.log('✅ Found Emily:', emily.name, '(ID:', emily.id + ')');
    
    // Get all French unit plans for Emily, ordered by sequence
    const frenchUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français langue première'
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        essentialQuestions: true,
        bigIdeas: true,
        keyVocabulary: true,
        differentiationStrategies: true,
        culminatingTask: true,
        assessmentPlan: true,
        parentCommunicationPlan: true,
        communityConnections: true,
        indigenousPerspectives: true,
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        }
      }
    });
    
    console.log('\n=== ALL FRENCH UNITS (ORDERED BY SEQUENCE) ===');
    console.log('Total units found:', frenchUnits.length);
    
    frenchUnits.forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}:`);
      console.log('  ID:', unit.id);
      console.log('  Title:', unit.title);
      console.log('  Subject:', unit.longRangePlan.subject);
      console.log('  LRP Title:', unit.longRangePlan.title);
      console.log('  Start Date:', unit.startDate.toISOString().split('T')[0]);
      console.log('  End Date:', unit.endDate.toISOString().split('T')[0]);
      console.log('  Created:', unit.createdAt.toISOString().split('T')[0]);
    });
    
    // Identify Units 13-16 (should be the last 4 chronologically)
    console.log('\n=== UNITS 13-16 IDENTIFICATION ===');
    
    if (frenchUnits.length >= 16) {
      const units13to16 = frenchUnits.slice(12, 16); // Units 13-16 (0-indexed)
      
      console.log('✅ FOUND UNITS 13-16:');
      units13to16.forEach((unit, index) => {
        const unitNum = 13 + index;
        console.log(`\n=== UNIT ${unitNum} DETAILED ANALYSIS ===`);
        console.log('  ID:', unit.id);
        console.log('  Title:', unit.title);
        console.log('  Subject:', unit.longRangePlan.subject);
        console.log('  Start Date:', unit.startDate.toISOString().split('T')[0]);
        console.log('  End Date:', unit.endDate.toISOString().split('T')[0]);
        
        // Content analysis for ETFO compliance
        console.log('\n  ETFO COMPLIANCE CHECK:');
        console.log('  ✓ Essential Questions:', unit.essentialQuestions ? 'Present ✅' : 'Missing ❌');
        console.log('  ✓ Big Ideas:', unit.bigIdeas ? 'Present ✅' : 'Missing ❌');
        console.log('  ✓ Key Vocabulary:', unit.keyVocabulary ? 'Present ✅' : 'Missing ❌');
        console.log('  ✓ Differentiation:', unit.differentiationStrategies ? 'Present ✅' : 'Missing ❌');
        console.log('  ✓ Culminating Task:', unit.culminatingTask ? 'Present ✅' : 'Missing ❌');
        console.log('  ✓ Assessment Plan:', unit.assessmentPlan ? 'Present ✅' : 'Missing ❌');
        console.log('  ✓ Parent Communication:', unit.parentCommunicationPlan ? 'Present ✅' : 'Missing ❌');
        console.log('  ✓ Community Connections:', unit.communityConnections ? 'Present ✅' : 'Missing ❌');
        console.log('  ✓ Indigenous Perspectives:', unit.indigenousPerspectives ? 'Present ✅' : 'Missing ❌');
        
        // Content preview
        if (unit.essentialQuestions) {
          console.log('\n  ESSENTIAL QUESTIONS PREVIEW:');
          const questions = JSON.parse(unit.essentialQuestions);
          if (Array.isArray(questions)) {
            questions.slice(0, 2).forEach((q, i) => console.log(`    ${i+1}. ${q}`));
          }
        }
        
        if (unit.keyVocabulary) {
          console.log('\n  VOCABULARY PREVIEW:');
          const vocab = JSON.parse(unit.keyVocabulary);
          if (Array.isArray(vocab)) {
            console.log(`    ${vocab.slice(0, 5).join(', ')}...`);
          }
        }
      });
      
      return units13to16;
    } else {
      console.log(`❌ Expected 16+ units, found only ${frenchUnits.length}`);
      console.log('Showing all available units above');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findEmilysUnits13to16().catch(console.error);