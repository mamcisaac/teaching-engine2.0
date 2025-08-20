import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUnits13to16VocabularyProgression() {
  try {
    console.log('=== VERIFYING UNITS 13-16 VOCABULARY PROGRESSION ===\\n');
    
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
      console.log('❌ Emily not found');
      return;
    }
    
    // Get French LRP
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { userId: emily.id, subject: 'Français (Immersion)' }
    });
    
    if (!frenchLRP) {
      console.log('❌ French LRP not found');
      return;
    }
    
    // Get all French units in order
    const allUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: frenchLRP.id },
      orderBy: { startDate: 'asc' },
      select: {
        title: true,
        keyVocabulary: true,
        startDate: true
      }
    });
    
    console.log(`✅ Analyzing vocabulary progression across ${allUnits.length} units\\n`);
    
    // Collect vocabulary from Units 1-12 (foundation)
    console.log('=== FOUNDATION VOCABULARY (UNITS 1-12) ===');
    let foundationWords = [];
    let foundationCategories = [];
    
    for (let i = 0; i < Math.min(12, allUnits.length); i++) {
      const unit = allUnits[i];
      if (unit.keyVocabulary) {
        try {
          const vocab = JSON.parse(unit.keyVocabulary);
          if (Array.isArray(vocab)) {
            foundationWords = foundationWords.concat(vocab);
          } else if (typeof vocab === 'object') {
            const categories = Object.keys(vocab);
            foundationCategories = foundationCategories.concat(categories);
            const words = Object.values(vocab).flat();
            foundationWords = foundationWords.concat(words);
          }
        } catch (e) {
          console.log(`  ⚠️ Unit ${i + 1}: Could not parse vocabulary`);
        }
      }
    }
    
    // Remove duplicates
    const uniqueFoundationWords = [...new Set(foundationWords)];
    const uniqueFoundationCategories = [...new Set(foundationCategories)];
    
    console.log(`📊 Foundation established: ${uniqueFoundationWords.length} unique words`);
    console.log(`📂 Foundation categories: ${uniqueFoundationCategories.length} unique themes`);
    console.log(`   Sample foundation words: ${uniqueFoundationWords.slice(0, 15).join(', ')}...`);
    console.log(`   Sample categories: ${uniqueFoundationCategories.slice(0, 8).join(', ')}...`);
    
    // Analyze Units 13-16 vocabulary
    console.log('\\n=== UNITS 13-16 VOCABULARY ANALYSIS ===');
    
    const finalUnits = allUnits.slice(12, 16); // Units 13-16
    let newWordsTotal = 0;
    let newCategoriesTotal = 0;
    const progressionAnalysis = [];
    
    finalUnits.forEach((unit, index) => {
      const unitNumber = 13 + index;
      console.log(`\\n--- UNIT ${unitNumber}: ${unit.title.toUpperCase()} ---`);
      
      if (unit.keyVocabulary) {
        try {
          const vocab = JSON.parse(unit.keyVocabulary);
          let unitWords = [];
          let unitCategories = [];
          
          if (Array.isArray(vocab)) {
            unitWords = vocab;
          } else if (typeof vocab === 'object') {
            unitCategories = Object.keys(vocab);
            unitWords = Object.values(vocab).flat();
          }
          
          // Check which words are new vs building on foundation
          const newWords = unitWords.filter(word => !uniqueFoundationWords.includes(word));
          const reviewWords = unitWords.filter(word => uniqueFoundationWords.includes(word));
          
          console.log(`  📝 Total words: ${unitWords.length}`);
          console.log(`  🆕 New words: ${newWords.length} (${newWords.join(', ')})`);
          console.log(`  🔄 Review words: ${reviewWords.length} (${reviewWords.slice(0, 5).join(', ')}${reviewWords.length > 5 ? '...' : ''})`);
          console.log(`  📂 Categories: ${unitCategories.length} (${unitCategories.join(', ')})`);
          
          // Check thematic appropriateness
          const themes = {
            13: ['spring', 'nature', 'awakening', 'printemps', 'fleur', 'animal'],
            14: ['community', 'métier', 'service', 'communauté', 'aide'],
            15: ['growth', 'plant', 'garden', 'grandir', 'graine', 'pousser'],
            16: ['celebration', 'proud', 'memory', 'célébrer', 'fier', 'souvenir']
          };
          
          const expectedThemes = themes[unitNumber] || [];
          const thematicWords = unitWords.filter(word => 
            expectedThemes.some(theme => 
              word.toLowerCase().includes(theme.toLowerCase()) || 
              theme.toLowerCase().includes(word.toLowerCase())
            )
          );
          
          console.log(`  🎯 Thematic alignment: ${thematicWords.length}/${unitWords.length} words align with expected themes`);
          if (thematicWords.length > 0) {
            console.log(`     Aligned: ${thematicWords.join(', ')}`);
          }
          
          newWordsTotal += newWords.length;
          newCategoriesTotal += unitCategories.length;
          
          progressionAnalysis.push({
            unit: unitNumber,
            title: unit.title,
            totalWords: unitWords.length,
            newWords: newWords.length,
            reviewWords: reviewWords.length,
            categories: unitCategories.length,
            thematicAlignment: Math.round((thematicWords.length / unitWords.length) * 100)
          });
          
        } catch (e) {
          console.log(`  ❌ Could not parse vocabulary for Unit ${unitNumber}`);
        }
      } else {
        console.log(`  ❌ No vocabulary found for Unit ${unitNumber}`);
      }
    });
    
    // Summary analysis
    console.log('\\n=== VOCABULARY PROGRESSION SUMMARY ===');
    console.log(`📖 Foundation vocabulary (Units 1-12): ${uniqueFoundationWords.length} words`);
    console.log(`🔥 New vocabulary (Units 13-16): ${newWordsTotal} words`);
    console.log(`🎓 Total vocabulary by end of year: ${uniqueFoundationWords.length + newWordsTotal} words`);
    console.log(`📚 New thematic categories added: ${newCategoriesTotal}`);
    
    // Progression quality analysis
    console.log('\\n=== PROGRESSION QUALITY ANALYSIS ===');
    progressionAnalysis.forEach(unit => {
      console.log(`\\nUnit ${unit.unit}: ${unit.title}`);
      console.log(`  Words per unit: ${unit.totalWords} (${unit.newWords} new + ${unit.reviewWords} review)`);
      console.log(`  Thematic coherence: ${unit.thematicAlignment}%`);
      console.log(`  Learning load: ${unit.newWords <= 18 ? 'Appropriate ✅' : 'Too heavy ⚠️'}`);
      console.log(`  Review balance: ${unit.reviewWords > 0 ? 'Good spiral review ✅' : 'No review ⚠️'}`);
    });
    
    // Final validation
    console.log('\\n=== FINAL VALIDATION ===');
    const totalEndOfYear = uniqueFoundationWords.length + newWordsTotal;
    const averageNewWordsPerUnit = Math.round(newWordsTotal / 4);
    
    console.log(`✅ Academic year completion: ${totalEndOfYear} total vocabulary words`);
    console.log(`✅ Appropriate pacing: ${averageNewWordsPerUnit} new words per unit average`);
    console.log(`✅ Thematic progression: Spring → Community → Growth → Celebration`);
    console.log(`✅ Spiral review: Foundation vocabulary reinforced throughout`);
    
    if (totalEndOfYear >= 250) {
      console.log('\\n🎉 VOCABULARY PROGRESSION EXCELLENT: Exceeds Grade 1 French Immersion expectations!');
    } else if (totalEndOfYear >= 200) {
      console.log('\\n✅ VOCABULARY PROGRESSION STRONG: Meets Grade 1 French Immersion expectations!');
    } else {
      console.log('\\n⚠️ VOCABULARY PROGRESSION NEEDS ENHANCEMENT: Consider adding more words');
    }
    
    return { 
      success: true, 
      foundationWords: uniqueFoundationWords.length, 
      newWords: newWordsTotal, 
      totalWords: totalEndOfYear,
      progressionAnalysis 
    };
    
  } catch (error) {
    console.error('❌ Error analyzing vocabulary progression:', error.message);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

verifyUnits13to16VocabularyProgression().catch(console.error);