import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function detailedSampleAnalysis() {
  try {
    console.log('🔬 DETAILED SAMPLE ANALYSIS: Emily\'s FPS Lessons');
    console.log('==================================================');

    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily McIsaac' } }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    // Get 3 lessons from different units for detailed analysis
    const sampleLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        subject: 'Formation personnelle et sociale'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        duration: true,
        mindsOn: true,
        action: true,
        consolidation: true,
        learningGoals: true,
        materials: true,
        differentiationStrategies: true,
        indigenousPerspectives: true,
        assessmentNotes: true,
        unitPlan: {
          select: {
            title: true
          }
        }
      }
    });

    console.log(`Analyzing ${sampleLessons.length} sample lessons for detailed quality review:\n`);

    for (let i = 0; i < sampleLessons.length; i++) {
      const lesson = sampleLessons[i];
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`LESSON ${i + 1}: ${lesson.title}`);
      console.log(`Unit: ${lesson.unitPlan?.title || 'Unknown'}`);
      console.log(`${'='.repeat(80)}`);
      
      // Basic Structure Analysis
      console.log('\n📋 BASIC STRUCTURE ANALYSIS');
      console.log('----------------------------');
      console.log('Duration:', lesson.duration, 'minutes');
      console.log('MindsOn Length:', lesson.mindsOn?.length || 0, 'chars');
      console.log('Action Length:', lesson.action?.length || 0, 'chars');
      console.log('Consolidation Length:', lesson.consolidation?.length || 0, 'chars');
      console.log('Learning Goals:', lesson.learningGoals ? 'Present' : 'Missing');
      
      // ETFO Structure Timing Check
      console.log('\n⏱️  ETFO STRUCTURE TIMING CHECK');
      console.log('------------------------------');
      const hasMindsOnTiming = lesson.mindsOn?.includes('(8 min') || lesson.mindsOn?.includes('8 minutes');
      const hasActionTiming = lesson.action?.includes('(27 min') || lesson.action?.includes('27 minutes');
      const hasConsolidationTiming = lesson.consolidation?.includes('(10 min') || lesson.consolidation?.includes('10 minutes');
      
      console.log('MindsOn Timing:', hasMindsOnTiming ? '✅ Present' : '❌ Missing');
      console.log('Action Timing:', hasActionTiming ? '✅ Present' : '❌ Missing');
      console.log('Consolidation Timing:', hasConsolidationTiming ? '✅ Present' : '❌ Missing');
      
      // Content Quality Analysis
      console.log('\n📝 CONTENT QUALITY ANALYSIS');
      console.log('---------------------------');
      
      // Check for age-appropriateness
      const fullContent = ((lesson.mindsOn || '') + ' ' + (lesson.action || '') + ' ' + (lesson.consolidation || '')).toLowerCase();
      const inappropriateTerms = ['puberty', 'sexual', 'reproduction', 'genitals', 'breast', 'penis', 'vagina'];
      const foundInappropriate = inappropriateTerms.filter(term => fullContent.includes(term));
      
      if (foundInappropriate.length > 0) {
        console.log('🚨 CRITICAL: Inappropriate content found:', foundInappropriate.join(', '));
      } else {
        console.log('✅ Age-appropriate content');
      }
      
      // Check for Grade 1 vocabulary level
      const complexWords = ['comprehension', 'sophisticated', 'analytical', 'synthesis', 'evaluation'];
      const foundComplex = complexWords.filter(word => fullContent.includes(word));
      if (foundComplex.length > 0) {
        console.log('⚠️  WARNING: Complex vocabulary found:', foundComplex.join(', '));
      } else {
        console.log('✅ Grade 1 appropriate vocabulary');
      }
      
      // Social-emotional skill development check
      const socialEmotionalSkills = ['share', 'friend', 'feeling', 'kind', 'help', 'listen', 'respect'];
      const foundSkills = socialEmotionalSkills.filter(skill => fullContent.includes(skill));
      console.log('Social-emotional skills present:', foundSkills.length > 0 ? `✅ ${foundSkills.join(', ')}` : '❌ None identified');
      
      // Differentiation Analysis
      console.log('\n🔀 DIFFERENTIATION ANALYSIS');
      console.log('---------------------------');
      
      if (lesson.differentiationStrategies) {
        try {
          const diff = typeof lesson.differentiationStrategies === 'object' ? 
            lesson.differentiationStrategies : JSON.parse(lesson.differentiationStrategies as string);
          
          console.log('Differentiation present:', typeof diff === 'object' ? '✅' : '❌');
          
          if (typeof diff === 'object') {
            const strategies = ['forStruggling', 'support', 'forAdvanced', 'extension', 'multiModal', 'accommodations'];
            strategies.forEach(strategy => {
              if (strategy in diff) {
                console.log(`  ${strategy}:`, '✅ Present');
              }
            });
            
            // Check quality of differentiation
            const struggling = diff.forStruggling || diff.support || '';
            const advanced = diff.forAdvanced || diff.extension || '';
            
            if (struggling.length < 50) {
              console.log('⚠️  WARNING: Support strategies too brief');
            }
            if (advanced.length < 50) {
              console.log('⚠️  WARNING: Extension strategies too brief');
            }
          }
        } catch (e) {
          console.log('❌ Differentiation format error:', e.message);
        }
      } else {
        console.log('❌ No differentiation strategies found');
      }
      
      // Indigenous Perspectives Analysis
      console.log('\n🏛️  INDIGENOUS PERSPECTIVES ANALYSIS');
      console.log('-----------------------------------');
      
      if (lesson.indigenousPerspectives) {
        const indigenous = lesson.indigenousPerspectives;
        console.log('Length:', indigenous.length, 'chars');
        console.log('Meets 100+ requirement:', indigenous.length >= 100 ? '✅' : '❌');
        
        // Check for Mi'kmaq specificity
        const mikmaqTerms = ['mikmaq', "mi'kmaq", 'maritime', 'atlantic', 'first nations'];
        const foundMikmaq = mikmaqTerms.some(term => indigenous.toLowerCase().includes(term));
        console.log("Mi'kmaq specific content:", foundMikmaq ? '✅' : '⚠️  Generic Indigenous content');
        
        // Check for authenticity vs generic content
        const genericTerms = ['many cultures', 'indigenous peoples in general', 'various tribes', 'different groups'];
        const foundGeneric = genericTerms.some(term => indigenous.toLowerCase().includes(term));
        if (foundGeneric) {
          console.log('⚠️  WARNING: Contains generic Indigenous language');
        }
        
        // Check for traditional teachings appropriateness
        const traditionalElements = ['teachings', 'ceremonies', 'traditions', 'knowledge', 'community'];
        const foundTraditional = traditionalElements.filter(element => indigenous.toLowerCase().includes(element));
        console.log('Traditional elements:', foundTraditional.length > 0 ? `✅ ${foundTraditional.join(', ')}` : '❌ None found');
        
        // Display first 200 chars for review
        console.log('Content preview:', indigenous.substring(0, 200) + (indigenous.length > 200 ? '...' : ''));
        
      } else {
        console.log('❌ No Indigenous perspectives found');
      }
      
      // Assessment Analysis
      console.log('\n📊 ASSESSMENT ANALYSIS');
      console.log('----------------------');
      
      if (lesson.assessmentNotes) {
        const assessment = lesson.assessmentNotes;
        console.log('Length:', assessment.length, 'chars');
        
        const hasCheckboxes = assessment.includes('☐');
        console.log('Observable format (checkboxes):', hasCheckboxes ? '✅' : '❌');
        
        if (hasCheckboxes) {
          // Count checkboxes
          const checkboxCount = (assessment.match(/☐/g) || []).length;
          console.log('Number of observable criteria:', checkboxCount);
          
          if (checkboxCount < 3) {
            console.log('⚠️  WARNING: Too few assessment criteria');
          }
          
          // Check for specific assessment types
          const assessmentTypes = ['demonstrates', 'identifies', 'uses', 'shows', 'explains'];
          const foundTypes = assessmentTypes.filter(type => assessment.toLowerCase().includes(type));
          console.log('Assessment verbs:', foundTypes.length > 0 ? `✅ ${foundTypes.join(', ')}` : '⚠️  Limited variety');
        }
        
        // Display assessment for review
        console.log('Assessment preview:', assessment.substring(0, 200) + (assessment.length > 200 ? '...' : ''));
        
      } else {
        console.log('❌ No assessment notes found');
      }
      
      // Materials Analysis
      console.log('\n🎨 MATERIALS & RESOURCES ANALYSIS');
      console.log('---------------------------------');
      
      if (lesson.materials) {
        try {
          const materials = Array.isArray(lesson.materials) ? lesson.materials : 
            (typeof lesson.materials === 'string' ? JSON.parse(lesson.materials) : lesson.materials);
          
          if (Array.isArray(materials)) {
            console.log('Number of materials:', materials.length);
            console.log('Materials appropriate for Grade 1:', materials.length > 0 ? '✅' : '❌');
            
            // Check for hands-on materials
            const handsOnTerms = ['manipulatives', 'blocks', 'cards', 'pictures', 'games'];
            const foundHandsOn = materials.some(material => 
              handsOnTerms.some(term => material.toLowerCase().includes(term))
            );
            console.log('Hands-on materials:', foundHandsOn ? '✅' : '⚠️  Limited hands-on materials');
            
            console.log('Sample materials:', materials.slice(0, 5).join(', '));
          }
        } catch (e) {
          console.log('⚠️  Materials format issue');
        }
      } else {
        console.log('❌ No materials specified');
      }
      
      // Overall Lesson Quality Rating
      console.log('\n🏆 OVERALL LESSON QUALITY RATING');
      console.log('--------------------------------');
      
      let score = 0;
      let maxScore = 10;
      
      if (lesson.duration === 45) score++;
      if (hasMindsOnTiming && hasActionTiming && hasConsolidationTiming) score++;
      if (foundInappropriate.length === 0) score++;
      if (foundSkills.length > 0) score++;
      if (lesson.differentiationStrategies) score++;
      if (lesson.indigenousPerspectives && lesson.indigenousPerspectives.length >= 100) score++;
      if (lesson.assessmentNotes && lesson.assessmentNotes.includes('☐')) score++;
      if (lesson.learningGoals) score++;
      if (lesson.materials) score++;
      if (foundComplex.length === 0) score++;
      
      const percentage = (score / maxScore * 100).toFixed(1);
      console.log(`Lesson Quality Score: ${score}/${maxScore} (${percentage}%)`);
      
      if (percentage >= '90') {
        console.log('🌟 EXCELLENT LESSON');
      } else if (percentage >= '80') {
        console.log('✅ GOOD LESSON');
      } else if (percentage >= '70') {
        console.log('⚠️  NEEDS IMPROVEMENT');
      } else {
        console.log('🚨 REQUIRES MAJOR REVISION');
      }
    }

  } catch (error) {
    console.error('❌ Error during detailed analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

detailedSampleAnalysis().catch(console.error);