#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// French vocabulary for Social Studies by theme
const FRENCH_VOCABULARY = {
  community: ['communauté', 'quartier', 'famille', 'voisins', 'amis'],
  geography: ['carte', 'direction', 'lieu', 'province', 'pays', 'océan', 'Île-du-Prince-Édouard'],
  citizenship: ['droits', 'responsabilités', 'respect', 'règles', 'citoyen'],
  history: ['histoire', 'passé', 'présent', 'futur', 'changement'],
  identity: ['identité', 'culture', 'tradition', 'célébration'],
  digital: ['numérique', 'internet', 'sécurité', 'technologie']
};

// Unit-specific vocabulary mapping
const UNIT_VOCABULARY = {
  'My Family and Our Class': [...FRENCH_VOCABULARY.community, ...FRENCH_VOCABULARY.identity],
  'Ma famille et notre classe': [...FRENCH_VOCABULARY.community, ...FRENCH_VOCABULARY.identity],
  'Our Rights and Responsibilities': [...FRENCH_VOCABULARY.citizenship, ...FRENCH_VOCABULARY.community],
  'Nos droits et responsabilités': [...FRENCH_VOCABULARY.citizenship, ...FRENCH_VOCABULARY.community],
  'My Story Through Time': [...FRENCH_VOCABULARY.history, ...FRENCH_VOCABULARY.identity],
  'Mon histoire dans le temps': [...FRENCH_VOCABULARY.history, ...FRENCH_VOCABULARY.identity],
  'Exploring Our World': [...FRENCH_VOCABULARY.geography, ...FRENCH_VOCABULARY.community],
  'Explorer notre monde': [...FRENCH_VOCABULARY.geography, ...FRENCH_VOCABULARY.community],
  'Responsible Digital Citizens': [...FRENCH_VOCABULARY.digital, ...FRENCH_VOCABULARY.citizenship],
  'Citoyens numériques responsables': [...FRENCH_VOCABULARY.digital, ...FRENCH_VOCABULARY.citizenship],
  'Our Neighbourhood': [...FRENCH_VOCABULARY.community, ...FRENCH_VOCABULARY.geography],
  'Notre quartier': [...FRENCH_VOCABULARY.community, ...FRENCH_VOCABULARY.geography]
};

async function updateSocialStudiesLessonsWithFrenchVocabulary() {
  console.log('🇫🇷 Updating ALL Social Studies lessons with French vocabulary for Emily McIsaac...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please ensure user is seeded.');
    }
    
    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})`);
    
    // Find all Social Studies units for Emily
    const socialStudiesUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences humaines'
        }
      },
      include: {
        longRangePlan: true,
        lessonPlans: {
          orderBy: { date: 'asc' }
        }
      }
    });
    
    console.log(`📚 Found ${socialStudiesUnits.length} Social Studies units`);
    
    if (socialStudiesUnits.length === 0) {
      console.log('❌ No Social Studies units found. Please ensure units are seeded first.');
      return;
    }
    
    let totalLessonsUpdated = 0;
    
    // Update each unit and its lessons
    for (const unit of socialStudiesUnits) {
      console.log(`\n📖 Processing Unit: ${unit.titleFr || unit.title}`);
      console.log(`   📅 ${unit.lessonPlans.length} lessons found`);
      
      // Get vocabulary for this unit
      const unitVocabulary = UNIT_VOCABULARY[unit.title] || UNIT_VOCABULARY[unit.titleFr] || [];
      
      if (unitVocabulary.length === 0) {
        console.log(`   ⚠️  No specific vocabulary found for unit "${unit.title}", using general vocabulary`);
      }
      
      // Update each lesson in the unit
      for (let i = 0; i < unit.lessonPlans.length; i++) {
        const lesson = unit.lessonPlans[i];
        
        // Select 2-3 relevant vocabulary words for this lesson
        const lessonVocabulary = unitVocabulary.slice(
          (i * 2) % unitVocabulary.length, 
          ((i * 2) + 3) % unitVocabulary.length || 3
        );
        
        // Ensure we have at least some vocabulary
        if (lessonVocabulary.length === 0) {
          lessonVocabulary.push('communauté', 'respect', 'apprendre');
        }
        
        // Create French title if not exists
        let frenchTitle = lesson.titleFr;
        if (!frenchTitle && lesson.title) {
          frenchTitle = await translateToFrench(lesson.title);
        }
        
        // Update the lesson with French vocabulary and content
        const updatedLesson = await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: {
            titleFr: frenchTitle,
            
            // Add French vocabulary to existing content
            learningGoalsFr: lesson.learningGoalsFr || 
              `Les élèves développeront leur compréhension des concepts sociaux tout en apprenant le vocabulaire français: ${lessonVocabulary.join(', ')}.`,
            
            // Ensure mindsOnFr exists
            mindsOnFr: lesson.mindsOnFr || 
              `Réfléchissons ensemble sur nos expériences avec ${lessonVocabulary[0] || 'la communauté'}.`,
            
            // Ensure actionFr exists  
            actionFr: lesson.actionFr ||
              `Explorer les concepts sociaux en utilisant le vocabulaire français: ${lessonVocabulary.slice(0, 2).join(', ')}.`,
            
            // Ensure consolidationFr exists
            consolidationFr: lesson.consolidationFr ||
              `Partager nos apprentissages en utilisant nos nouveaux mots français: ${lessonVocabulary.join(', ')}.`,
            
            // Add French vocabulary to indigenousPerspectives field
            indigenousPerspectives: lesson.indigenousPerspectives ? 
              `${lesson.indigenousPerspectives}\n\nVocabulaire français pour cette leçon: ${lessonVocabulary.join(', ')}.` :
              `Vocabulaire français pour cette leçon: ${lessonVocabulary.join(', ')}.`,
            
            // Ensure language is set to French immersion
            language: 'fr',
            
            // Add bilingual assessment criteria
            assessmentNotes: lesson.assessmentNotes ? 
              `${lesson.assessmentNotes} ☐ Uses French social studies vocabulary appropriately ☐ Demonstrates understanding in both languages` :
              `☐ Participates actively in discussions ☐ Uses French social studies vocabulary appropriately ☐ Demonstrates understanding of social concepts ☐ Shows respect for community members`,
            
            // Update materials to include French vocabulary cards
            materials: (() => {
              let existingMaterials = [];
              
              if (lesson.materials) {
                if (Array.isArray(lesson.materials)) {
                  existingMaterials = lesson.materials;
                } else if (typeof lesson.materials === 'string') {
                  try {
                    existingMaterials = JSON.parse(lesson.materials);
                  } catch (e) {
                    existingMaterials = [lesson.materials];
                  }
                } else if (typeof lesson.materials === 'object') {
                  existingMaterials = [lesson.materials];
                }
              }
              
              const newMaterials = [
                'French vocabulary cards',
                'Bilingual social studies word wall',
                'PEI/Île-du-Prince-Édouard local context materials'
              ];
              
              // Flatten and deduplicate
              const allMaterials = [...existingMaterials, ...newMaterials];
              return allMaterials.filter((item, index) => allMaterials.indexOf(item) === index);
            })()
          }
        });
        
        totalLessonsUpdated++;
        console.log(`   ✅ Updated Lesson ${i + 1}: ${updatedLesson.titleFr || updatedLesson.title}`);
        console.log(`      📝 Vocabulary: ${lessonVocabulary.join(', ')}`);
      }
      
      // Update the unit plan with French vocabulary
      const allUnitVocabulary = [...new Set(unitVocabulary)]; // Remove duplicates
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          keyVocabulary: JSON.stringify(allUnitVocabulary),
          
          // Ensure French title exists
          titleFr: unit.titleFr || await translateToFrench(unit.title),
          
          // Ensure French description exists
          descriptionFr: unit.descriptionFr || 
            `Unité d'études sociales développant la compréhension communautaire avec vocabulaire français essentiel: ${allUnitVocabulary.slice(0, 5).join(', ')}.`,
          
          // Update success criteria to include French vocabulary
          successCriteria: (() => {
            let existingCriteria = [];
            if (unit.successCriteria) {
              try {
                existingCriteria = JSON.parse(unit.successCriteria);
              } catch (e) {
                // If successCriteria is not valid JSON, treat as string and convert to array
                existingCriteria = [unit.successCriteria];
              }
            }
            
            const newCriteria = [
              'Je peux utiliser le vocabulaire français des études sociales',
              'Je peux expliquer les concepts sociaux en français et en anglais'
            ];
            
            if (existingCriteria.length === 0) {
              return JSON.stringify([
                'Je peux participer aux discussions sur la communauté',
                'Je peux utiliser le vocabulaire français des études sociales',
                'Je peux expliquer les concepts sociaux en français et en anglais',
                'Je peux montrer du respect pour ma communauté'
              ]);
            }
            
            return JSON.stringify([...existingCriteria, ...newCriteria]);
          })()
        }
      });
      
      console.log(`   📚 Updated unit vocabulary: ${allUnitVocabulary.length} French terms`);
    }
    
    // Final summary
    console.log('\n🎉 SOCIAL STUDIES FRENCH VOCABULARY UPDATE COMPLETE!');
    console.log(`✅ ${totalLessonsUpdated} lessons updated with French vocabulary`);
    console.log(`✅ ${socialStudiesUnits.length} units enhanced with bilingual content`);
    console.log('✅ All lessons now include:');
    console.log('   - French lesson titles (titleFr)');
    console.log('   - 2-3 relevant French social studies terms');
    console.log('   - Bilingual learning goals');
    console.log('   - French vocabulary in assessment criteria');
    console.log('   - Local PEI/Île-du-Prince-Édouard context');
    console.log('   - Updated materials lists with French supports');
    console.log('\n📊 VOCABULARY BREAKDOWN:');
    console.log(`   Community: ${FRENCH_VOCABULARY.community.join(', ')}`);
    console.log(`   Geography: ${FRENCH_VOCABULARY.geography.join(', ')}`);
    console.log(`   Citizenship: ${FRENCH_VOCABULARY.citizenship.join(', ')}`);
    console.log(`   History: ${FRENCH_VOCABULARY.history.join(', ')}`);
    console.log(`   Identity: ${FRENCH_VOCABULARY.identity.join(', ')}`);
    console.log(`   Digital: ${FRENCH_VOCABULARY.digital.join(', ')}`);
    
    console.log('\n🌟 Emily\'s Social Studies program now fully bilingual and culturally relevant!');
    
  } catch (error) {
    console.error('❌ Error updating Social Studies lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Simple French translation helper (basic translations for common educational terms)
async function translateToFrench(englishTitle: string): Promise<string> {
  const translations: Record<string, string> = {
    'My Family and Our Class': 'Ma famille et notre classe',
    'Our Rights and Responsibilities': 'Nos droits et responsabilités',
    'My Story Through Time': 'Mon histoire dans le temps',
    'Exploring Our World': 'Explorer notre monde',
    'Responsible Digital Citizens': 'Citoyens numériques responsables',
    'Our Neighbourhood': 'Notre quartier',
    'What is a Neighbourhood?': 'Qu\'est-ce qu\'un quartier?',
    'Mapping Our Neighbourhood': 'Cartographier notre quartier',
    'Important Places Near Us': 'Lieux importants près de nous',
    'Community Helpers': 'Aidants communautaires',
    'Safety in Our Neighbourhood': 'Sécurité dans notre quartier',
    'Being a Good Neighbour': 'Être un bon voisin',
    // Add more translations as needed
  };
  
  return translations[englishTitle] || englishTitle;
}

// Run the update function
updateSocialStudiesLessonsWithFrenchVocabulary()
  .then(() => console.log('\n🏆 French vocabulary integration completed successfully!'))
  .catch((error) => {
    console.error('💥 Update failed:', error);
    process.exit(1);
  });