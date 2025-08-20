import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeVocabulary() {
  console.log('📝 COMPLETING MISSING VOCABULARY FIELDS\\n');
  
  try {
    // Get the 4 units that need vocabulary
    const unitsToFix = [
      'Mon corps et ma sécurité',
      'Mes émotions et sentiments', 
      'Amitiés et relations positives',
      'Nutrition et mode de vie sain'
    ];
    
    const vocabularies = {
      'Mon corps et ma sécurité': [
        { word: 'corps', definition: 'toutes les parties physiques de notre être', category: 'anatomie', grade_level: '1' },
        { word: 'sécurité', definition: 'être protégé du danger', category: 'bien-être', grade_level: '1' },
        { word: 'danger', definition: 'quelque chose qui peut nous blesser', category: 'sécurité', grade_level: '1' },
        { word: 'règles', definition: 'instructions à suivre pour être en sécurité', category: 'sécurité', grade_level: '1' },
        { word: 'propre', definition: 'sans saleté, lavé', category: 'hygiène', grade_level: '1' }
      ],
      'Mes émotions et sentiments': [
        { word: 'émotions', definition: 'ce que nous ressentons dans notre cœur', category: 'sentiments', grade_level: '1' },
        { word: 'content', definition: 'sentiment de joie et bonheur', category: 'sentiments', grade_level: '1' },
        { word: 'triste', definition: 'sentiment de peine ou chagrin', category: 'sentiments', grade_level: '1' },
        { word: 'calme', definition: 'sentiment de paix et tranquillité', category: 'sentiments', grade_level: '1' },
        { word: 'respirer', definition: 'prendre de l\\'air pour se calmer', category: 'stratégies', grade_level: '1' }
      ],
      'Amitiés et relations positives': [
        { word: 'ami', definition: 'personne qu\\'on aime et qui nous aime', category: 'relations', grade_level: '1' },
        { word: 'gentil', definition: 'qui est bon et aimable avec les autres', category: 'qualités', grade_level: '1' },
        { word: 'partager', definition: 'donner une partie de ce qu\\'on a', category: 'actions', grade_level: '1' },
        { word: 'écouter', definition: 'faire attention à ce que dit quelqu\\'un', category: 'actions', grade_level: '1' },
        { word: 'respecter', definition: 'traiter les autres avec politesse', category: 'valeurs', grade_level: '1' }
      ],
      'Nutrition et mode de vie sain': [
        { word: 'nutrition', definition: 'bien manger pour être en santé', category: 'santé', grade_level: '1' },
        { word: 'légumes', definition: 'plantes qu\\'on mange pour être fort', category: 'aliments', grade_level: '1' },
        { word: 'fruits', definition: 'aliments sucrés qui poussent sur les arbres', category: 'aliments', grade_level: '1' },
        { word: 'exercice', definition: 'bouger son corps pour être en forme', category: 'activité', grade_level: '1' },
        { word: 'sommeil', definition: 'dormir pour reposer notre corps', category: 'bien-être', grade_level: '1' }
      ]
    };
    
    for (const unitTitle of unitsToFix) {
      console.log(`Fixing ${unitTitle}...`);
      
      const unit = await prisma.unitPlan.findFirst({
        where: {
          title: unitTitle,
          longRangePlan: {
            userId: 23,
            subject: { contains: 'Formation personnelle' }
          }
        }
      });
      
      if (unit) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            keyVocabulary: vocabularies[unitTitle as keyof typeof vocabularies] as any
          }
        });
        
        console.log(`✅ Fixed ${unitTitle}`);
      } else {
        console.log(`❌ Could not find ${unitTitle}`);
      }
    }
    
    console.log('\\n🎉 Vocabulary completion attempt finished');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeVocabulary().catch(console.error);