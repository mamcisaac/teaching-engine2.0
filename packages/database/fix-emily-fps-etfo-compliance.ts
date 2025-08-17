import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ETFO-compliant differentiation strategies for Health/FPS
const healthDifferentiationStrategies = {
  forStruggling: "Visual supports, role-play practice, peer modeling, simplified scenarios",
  forIEP: "Modified social goals per IEP, sensory breaks, alternative communication",
  forELL: "Visual emotion cards, gesture communication, cultural sensitivity", 
  forAdvanced: "Leadership roles, conflict mediation, peer support helper"
};

// Function to generate unit-specific indigenous perspectives
function generateIndigenousPerspectives(unitTitle: string): string {
  const baseText = "Mi'kmaq teachings emphasize ";
  
  switch (unitTitle) {
    case 'Me, Myself, and I':
      return `${baseText}that understanding oneself begins with knowing your place in the circle of life and your connection to the seven generations. Traditional Mi'kmaq identity development involves understanding your clan responsibilities and the importance of living in balance with all relations, fostering healthy self-concept through community belonging.`;
      
    case 'Healthy Me':
      return `${baseText}holistic wellness through the Medicine Wheel teachings, where physical, mental, emotional, and spiritual health are interconnected. Traditional foods like dulse, fiddleheads, and berries nourish the body, while ceremony and community connection support overall well-being and vitality.`;
      
    case 'Safe and Sound':
      return `${baseText}community protection through collective responsibility and the teaching that we are all related (Msit No'kmaq). Elders share wisdom about recognizing safe relationships, trusting intuition, and understanding that safety comes from strong community bonds and respect for all beings.`;
      
    case 'Friends and Feelings':
      return `${baseText}emotional intelligence through understanding the interconnectedness of all feelings and relationships. The talking circle tradition teaches active listening, empathy, and conflict resolution, while honoring each person's emotional truth and fostering healthy friendship bonds within the community.`;
      
    case 'Growing and Learning':
      return `${baseText}lifelong learning as a sacred journey, where growth happens through observation of nature's cycles and elder teachings. Traditional knowledge is passed through storytelling, modeling, and experiential learning, recognizing that each person learns at their own pace in harmony with natural rhythms.`;
      
    case 'Our Wonderful World':
      return `${baseText}stewardship and responsibility for Mother Earth, understanding that humans are caretakers of creation. Environmental education includes traditional ecological knowledge, seasonal cycles, and the teaching that we must consider the impact of our actions on seven generations to come.`;
      
    default:
      return `${baseText}wellness, community connection, and living in harmony with natural and spiritual laws. Traditional teachings guide personal development through understanding one's role in the greater web of relationships and responsibilities within the Mi'kmaq worldview.`;
  }
}

// Function to generate lesson-specific assessment notes
function generateAssessmentNotes(lessonTitle: string, unitTitle: string): string {
  const baseAssessment = "Observable social-emotional learning assessment:\n";
  
  let specificChecks = "";
  
  if (unitTitle.includes('Me, Myself')) {
    specificChecks = `☐ Demonstrates positive self-talk and self-awareness
☐ Shows confidence in expressing personal preferences and needs  
☐ Identifies personal strengths and areas for growth
☐ Exhibits self-regulation strategies during activities`;
  } else if (unitTitle.includes('Healthy Me')) {
    specificChecks = `☐ Makes healthy choices during snack/meal discussions
☐ Shows understanding of physical wellness practices
☐ Demonstrates knowledge of hygiene and self-care
☐ Exhibits awareness of emotional wellness strategies`;
  } else if (unitTitle.includes('Safe and Sound')) {
    specificChecks = `☐ Identifies safe vs. unsafe situations appropriately
☐ Demonstrates protective safety behaviors and responses
☐ Shows trust in seeking help from appropriate adults
☐ Exhibits understanding of personal boundaries`;
  } else if (unitTitle.includes('Friends and Feelings')) {
    specificChecks = `☐ Uses appropriate words to express emotions and feelings
☐ Shows empathy and consideration for others' emotions
☐ Demonstrates conflict resolution skills with peers
☐ Exhibits positive friendship behaviors and social skills`;
  } else if (unitTitle.includes('Growing and Learning')) {
    specificChecks = `☐ Shows curiosity and willingness to try new learning experiences
☐ Demonstrates resilience when facing challenges or setbacks
☐ Exhibits growth mindset language and attitudes
☐ Shows pride in personal learning accomplishments`;
  } else if (unitTitle.includes('Our Wonderful World')) {
    specificChecks = `☐ Demonstrates environmental stewardship and care behaviors
☐ Shows appreciation for diversity in people and nature
☐ Exhibits responsible community citizenship actions
☐ Shows understanding of global interconnectedness`;
  } else {
    specificChecks = `☐ Demonstrates appropriate social-emotional responses
☐ Shows engagement and participation in learning activities
☐ Exhibits positive interactions with peers and adults
☐ Shows personal growth and development indicators`;
  }
  
  return baseAssessment + specificChecks + "\n\n" + 
         "Anecdotal observations focus on social-emotional skill development, " +
         "peer interactions, self-regulation, and personal wellness understanding.";
}

// Function to fix timing in lesson structure
function fixLessonTiming(content: string | null, section: 'mindsOn' | 'action' | 'consolidation'): string {
  if (!content) return '';
  
  const timingPrefixes = {
    mindsOn: '(8 minutes)',
    action: '(27 minutes)', 
    consolidation: '(10 minutes)'
  };
  
  // Remove any existing timing prefix
  const cleanContent = content.replace(/^\(\d+\s*minutes?\)\s*/, '');
  
  // Add the correct timing prefix
  return `${timingPrefixes[section]} ${cleanContent}`;
}

async function fixEmilyFPSETFOCompliance() {
  try {
    console.log('🔧 Fixing ALL 96 Emily McIsaac Formation personnelle et sociale lessons for ETFO compliance...\n');

    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Emily McIsaac'
        }
      }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get all FPS unit plans and their lessons
    const fpsUnitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Formation personnelle et sociale'
        }
      },
      include: {
        lessonPlans: {
          select: {
            id: true,
            title: true,
            duration: true,
            mindsOn: true,
            action: true,
            consolidation: true
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    let totalUpdated = 0;
    const updatePromises: Promise<any>[] = [];

    for (const unit of fpsUnitPlans) {
      console.log(`🔧 Updating unit: ${unit.title} (${unit.lessonPlans.length} lessons)`);
      
      const indigenousPerspective = generateIndigenousPerspectives(unit.title);

      for (const lesson of unit.lessonPlans) {
        const assessmentNotes = generateAssessmentNotes(lesson.title, unit.title);
        
        const updatePromise = prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: {
            // 1. Change duration from 60 to 45 minutes
            duration: 45,
            
            // 2. Fix timing structure
            mindsOn: fixLessonTiming(lesson.mindsOn, 'mindsOn'),
            action: fixLessonTiming(lesson.action, 'action'),
            consolidation: fixLessonTiming(lesson.consolidation, 'consolidation'),
            
            // 3. Set differentiation strategies for health/social
            differentiationStrategies: healthDifferentiationStrategies,
            
            // 4. Add indigenous perspectives (100+ chars about Mi'kmaq wellness)
            indigenousPerspectives: indigenousPerspective,
            
            // 5. Set assessment notes with checkboxes for social-emotional skills
            assessmentNotes: assessmentNotes
          }
        });
        
        updatePromises.push(updatePromise);
        totalUpdated++;
      }
    }

    console.log(`\n⚡ Executing ${updatePromises.length} lesson updates in parallel...`);
    
    await Promise.all(updatePromises);

    console.log(`\n✅ Successfully updated ALL ${totalUpdated} Formation personnelle et sociale lessons!`);
    console.log('\n🎯 ETFO Compliance Updates Applied:');
    console.log('   ✅ Duration: 60min → 45min');
    console.log('   ✅ Timing: mindsOn (8min), action (27min), consolidation (10min)');
    console.log('   ✅ Differentiation: Health/social-specific JSON strategies');
    console.log('   ✅ Indigenous Perspectives: Mi\'kmaq wellness teachings (100+ chars)');
    console.log('   ✅ Assessment: Observable social-emotional checkboxes');

    // Verify the updates
    console.log('\n🔍 Verification check...');
    const verificationResults = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          longRangePlan: {
            subject: 'Formation personnelle et sociale'
          }
        }
      },
      select: {
        id: true,
        duration: true,
        differentiationStrategies: true,
        indigenousPerspectives: true,
        assessmentNotes: true,
        mindsOn: true,
        action: true,
        consolidation: true
      }
    });

    const verificationStats = {
      duration45: verificationResults.filter(l => l.duration === 45).length,
      hasDifferentiation: verificationResults.filter(l => 
        l.differentiationStrategies && 
        typeof l.differentiationStrategies === 'object' &&
        'forStruggling' in l.differentiationStrategies
      ).length,
      hasIndigenous: verificationResults.filter(l => 
        l.indigenousPerspectives && l.indigenousPerspectives.length >= 100
      ).length,
      hasAssessment: verificationResults.filter(l => 
        l.assessmentNotes?.includes('☐')
      ).length,
      correctTiming: verificationResults.filter(l =>
        l.mindsOn?.startsWith('(8 minutes)') &&
        l.action?.startsWith('(27 minutes)') &&
        l.consolidation?.startsWith('(10 minutes)')
      ).length
    };

    console.log('\n📊 Verification Results:');
    console.log(`   🕐 45-minute duration: ${verificationStats.duration45}/96`);
    console.log(`   🔀 Differentiation strategies: ${verificationStats.hasDifferentiation}/96`);
    console.log(`   🏛️  Indigenous perspectives: ${verificationStats.hasIndigenous}/96`);
    console.log(`   📋 Assessment checkboxes: ${verificationStats.hasAssessment}/96`);
    console.log(`   ⏱️  Correct timing structure: ${verificationStats.correctTiming}/96`);

    const allCompliant = Object.values(verificationStats).every(count => count === 96);
    console.log(allCompliant ? '\n🎉 ALL 96 LESSONS ARE NOW ETFO-COMPLIANT!' : '\n⚠️  Some lessons may need manual review');

  } catch (error) {
    console.error('❌ Error fixing FPS ETFO compliance:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmilyFPSETFOCompliance();