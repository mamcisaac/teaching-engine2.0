const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnergyLesson1() {
  try {
    console.log('🚨 CRITICAL SAFETY FIX: Lesson 1 - Energy Exploration: What is Energy?');
    
    const lessonId = 'cmec9wtxu00hdvjd4njuabceb';
    
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        titleFr: "Exploration de l'énergie : Qu'est-ce que l'énergie ?",
        
        learningGoals: "Students will identify sources of energy in their daily lives and understand what energy is through safe observation and exploration.",
        
        learningGoalsFr: "Les élèves identifieront les sources d'énergie dans leur vie quotidienne et comprendront ce qu'est l'énergie par l'observation et l'exploration sécuritaires.",
        
        materials: JSON.stringify({
          "flashlights": "Flashlights (teacher-controlled only)",
          "pictures": "Pictures of electrical items (NOT actual electrical items)",
          "safety_equipment": "Safety goggles for light experiments",
          "journals": "Science observation journals",
          "french_vocabulary_cards": "Cartes de vocabulaire français",
          "energy_posters": "Safe energy use posters",
          "observation_sheets": "Energy observation recording sheets",
          "safe_demonstration_items": "Teacher-only demonstration materials"
        }),
        
        mindsOn: "🚨 SAFETY FIRST: Teacher demonstrates energy concepts using SAFE materials only. Students observe from safe distance. Introduce vocabulary: 'l'énergie' (energy). Students record initial observations in science journals about energy they can see safely around them.",
        
        mindsOnFr: "🚨 SÉCURITÉ D'ABORD : L'enseignant démontre les concepts d'énergie en utilisant des matériaux SÛRS seulement. Les élèves observent à distance sécuritaire. Introduction du vocabulaire français pour l'énergie.",
        
        action: "🚨 CRITICAL SAFETY PROTOCOLS:\n\n1. ELECTRICAL SAFETY RULES:\n   - NEVER touch electrical outlets or wires\n   - Adult supervision required for ALL activities\n   - Use pictures of electrical items, NOT actual electrical equipment\n   - Students observe teacher demonstrations from safe distance\n\n2. SAFE ENERGY EXPLORATION:\n   - Teacher-controlled flashlight demonstrations only\n   - Students identify energy sources through pictures and safe observation\n   - Record observations in science journals using French vocabulary\n   - Discuss how we use energy safely in our daily lives\n\n3. SCIENCE JOURNAL ACTIVITY:\n   - Draw different types of energy they observe safely\n   - Write/draw hypothesis about where energy comes from\n   - Use French vocabulary: l'énergie, la sécurité, l'électricité\n\n4. EMERGENCY PROCEDURES:\n   - If any electrical emergency: stop activity immediately\n   - Call for adult help\n   - Never touch electrical equipment",
        
        actionFr: "🚨 PROTOCOLES DE SÉCURITÉ CRITIQUES:\n\n1. RÈGLES DE SÉCURITÉ ÉLECTRIQUE:\n   - NE JAMAIS toucher les prises électriques ou les fils\n   - Supervision d'un adulte requise pour TOUTES les activités\n   - Utiliser des images d'articles électriques, PAS d'équipement électrique réel\n\n2. EXPLORATION SÉCURITAIRE DE L'ÉNERGIE:\n   - Démonstrations de lampes de poche contrôlées par l'enseignant seulement\n   - Les élèves identifient les sources d'énergie par des images et observation sécuritaire\n   - Enregistrer les observations dans les journaux scientifiques\n\n3. ACTIVITÉ DE JOURNAL SCIENTIFIQUE:\n   - Dessiner différents types d'énergie observés en sécurité\n   - Utiliser le vocabulaire français : l'énergie, la sécurité, l'électricité",
        
        consolidation: "Students share their energy discoveries from science journals. Review SAFETY RULES: 'We never touch electrical outlets or wires.' Discuss French vocabulary learned. Students demonstrate understanding of safe energy exploration. Exit ticket: Draw one safe way to observe energy.",
        
        consolidationFr: "Les élèves partagent leurs découvertes d'énergie de leurs journaux scientifiques. Révision des RÈGLES DE SÉCURITÉ. Discussion du vocabulaire français appris. Démonstration de la compréhension de l'exploration sécuritaire de l'énergie.",
        
        assessmentType: "formative",
        
        formativeCheckpoints: JSON.stringify([
          "☐ Identifies energy sources safely without touching electrical items",
          "☐ Demonstrates safety awareness around electricity",
          "☐ Records observations in science journal using pictures and words",
          "☐ Uses French vocabulary correctly: l'énergie, la sécurité, l'électricité",
          "☐ Follows all electrical safety rules",
          "☐ Asks for adult help when needed"
        ]),
        
        differentiationStrategies: JSON.stringify({
          "forStruggling": "Provide visual safety cards showing safe vs unsafe. Use peer buddies for journal recording. Simplified French vocabulary with picture cards.",
          "forAdvanced": "Research additional energy sources using approved safe resources. Create safety posters for classroom. Lead safety reminders for peers.",
          "forELL": "Multilingual safety vocabulary cards. Visual demonstration supports. Safety words in home language and French.",
          "safetyAccommodations": "Extra adult supervision for students needing additional support. Large print safety rules. Clear visual safety boundaries."
        }),
        
        engagementHooks: JSON.stringify([
          "Magic energy demonstration (teacher-controlled flashlight)",
          "Energy detective game using safe observation only",
          "French energy vocabulary song",
          "Safety superhero role-play"
        ])
      }
    });
    
    console.log('✅ SAFETY FIX COMPLETED: Lesson 1');
    console.log('   - Added electrical safety warnings');
    console.log('   - Removed direct battery/electrical handling');
    console.log('   - Added French title and objectives');
    console.log('   - Integrated science journal activities');
    console.log('   - Added safety-focused assessment');
    console.log('   - Added emergency procedures');
    
    return updatedLesson;

  } catch (error) {
    console.error('ERROR fixing lesson 1:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixEnergyLesson1();