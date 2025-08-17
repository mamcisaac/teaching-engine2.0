const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnergyLesson10ElectricitySafety() {
  try {
    console.log('🚨 CRITICAL SAFETY FIX: Lesson 10 - Electricity Safety');
    console.log('⚠️  Ensuring proper electrical safety protocols for Grade 1');
    
    const lessonId = 'cmeca1n0k00dpvjtai4g2uy6u';
    
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        titleFr: "Exploration de l'énergie : La sécurité électrique",
        
        learningGoals: "Students will learn essential electrical safety rules for Grade 1: NEVER touch electrical outlets, always ask adults for help with electrical items, and identify safe vs. unsafe electrical situations.",
        
        learningGoalsFr: "Les élèves apprendront les règles essentielles de sécurité électrique pour la 1re année : NE JAMAIS toucher les prises électriques, toujours demander l'aide des adultes pour les articles électriques.",
        
        materials: JSON.stringify({
          "electrical_safety_posters": "Large electrical safety rule posters",
          "safe_vs_unsafe_pictures": "Picture cards showing safe vs unsafe electrical situations",
          "safety_equipment": "Safety demonstration materials (teacher use only)",
          "journals": "Science safety journals",
          "french_vocabulary_cards": "Cartes de vocabulaire : la sécurité électrique, dangereux, sécuritaire",
          "adult_supervision_signs": "Visual reminders about adult supervision",
          "emergency_procedures": "Emergency contact information and procedures",
          "NO_REAL_ELECTRICAL_ITEMS": "🚨 NO actual electrical items for student handling",
          "safety_badge_materials": "Materials for safety expert badges"
        }),
        
        mindsOn: "🚨 ELECTRICAL SAFETY RULES INTRODUCTION:\n\n'Today we become electrical safety experts! Electricity is very powerful and can hurt us if we don't follow safety rules.'\n\nTeacher shows large safety posters. Students repeat key rules:\n- 'NEVER touch electrical outlets'\n- 'Always ask an adult for help'\n- 'Keep water away from electricity'\n\nStudents record safety rules in journals using French vocabulary.",
        
        mindsOnFr: "🚨 INTRODUCTION AUX RÈGLES DE SÉCURITÉ ÉLECTRIQUE:\n\n'Aujourd'hui nous devenons des experts en sécurité électrique! L'électricité est très puissante et peut nous blesser si nous ne suivons pas les règles de sécurité.'\n\nL'enseignant montre de grandes affiches de sécurité.",
        
        action: "🚨 COMPREHENSIVE ELECTRICAL SAFETY EDUCATION:\n\n1. FUNDAMENTAL SAFETY RULES FOR GRADE 1:\n   - NEVER touch electrical outlets with fingers or objects\n   - NEVER touch electrical cords or plugs\n   - NEVER touch electrical appliances with wet hands\n   - ALWAYS ask an adult before using anything electrical\n   - Keep water and electrical items separate\n   - Tell an adult immediately if you see damaged electrical items\n\n2. SAFE LEARNING ACTIVITIES:\n   - Safety rule chant with actions\n   - Picture sorting: Safe vs. Unsafe electrical situations\n   - Role-play asking adults for help appropriately\n   - Identify electrical items in classroom that are 'adult-only'\n   - Create safety reminders for home\n\n3. SCIENCE JOURNAL INTEGRATION:\n   - Draw and write electrical safety rules\n   - Record French safety vocabulary with pictures\n   - List electrical items at home that require adult help\n   - Create personal safety promise: 'I will always ask adults for help'\n\n4. FRENCH VOCABULARY DEVELOPMENT:\n   - 'la sécurité électrique' (electrical safety)\n   - 'dangereux' (dangerous)\n   - 'sécuritaire' (safe)\n   - 'l'aide d'un adulte' (adult help)\n   - 'jamais toucher' (never touch)\n\n5. SAFETY SCENARIO PRACTICE:\n   - What to do if you see a damaged cord\n   - How to ask an adult for help politely\n   - Safe ways to observe electrical items\n   - Emergency procedures if someone gets hurt\n\n6. HOME SAFETY CONNECTION:\n   - Discuss electrical safety rules that apply at home\n   - Identify who to ask for help at home\n   - Practice explaining safety rules to family members",
        
        actionFr: "🚨 ÉDUCATION COMPLÈTE À LA SÉCURITÉ ÉLECTRIQUE:\n\n1. RÈGLES DE SÉCURITÉ FONDAMENTALES POUR LA 1re ANNÉE:\n   - NE JAMAIS toucher les prises électriques avec les doigts ou des objets\n   - NE JAMAIS toucher les cordons ou prises électriques\n   - TOUJOURS demander à un adulte avant d'utiliser quelque chose d'électrique\n\n2. ACTIVITÉS D'APPRENTISSAGE SÉCURITAIRES:\n   - Chant de règles de sécurité avec actions\n   - Tri d'images : Situations électriques sécuritaires vs dangereuses\n   - Jeu de rôle pour demander l'aide aux adultes appropriément\n\n3. INTÉGRATION DU JOURNAL SCIENTIFIQUE:\n   - Dessiner et écrire les règles de sécurité électrique\n   - Enregistrer le vocabulaire français de sécurité avec des images\n   - Créer une promesse de sécurité personnelle",
        
        consolidation: "🚨 ELECTRICAL SAFETY MASTERY CHECK:\n\nStudents demonstrate safety knowledge:\n- Recite key safety rules together\n- Show proper way to ask adults for help\n- Identify safe vs. unsafe electrical situations\n- Share safety promises from their journals\n\nTeacher awards 'Electrical Safety Expert' badges to students who demonstrate understanding.\n\nExit ticket: Students must state one electrical safety rule and explain why it's important.",
        
        consolidationFr: "🚨 VÉRIFICATION DE MAÎTRISE DE LA SÉCURITÉ ÉLECTRIQUE:\n\nLes élèves démontrent leurs connaissances de sécurité:\n- Réciter les règles de sécurité clés ensemble\n- Montrer la façon appropriée de demander l'aide aux adultes\n- Identifier les situations électriques sécuritaires vs dangereuses",
        
        assessmentType: "formative",
        
        formativeCheckpoints: JSON.stringify([
          "☐ States clearly: 'NEVER touch electrical outlets'",
          "☐ Demonstrates how to ask adults for help appropriately",
          "☐ Identifies safe vs unsafe electrical situations correctly",
          "☐ Records electrical safety rules in science journal",
          "☐ Uses French safety vocabulary correctly",
          "☐ Shows understanding of water and electricity dangers",
          "☐ Can explain why electrical safety rules are important",
          "☐ Makes appropriate safety promises for home behavior"
        ]),
        
        differentiationStrategies: JSON.stringify({
          "forStruggling": "Visual safety rule cards with pictures. Repeated practice with safety scenarios. Simplified French vocabulary. Extra adult supervision and reinforcement.",
          "forAdvanced": "Create safety posters for younger students. Research electrical safety in different countries. Lead safety rule practice sessions.",
          "forELL": "Safety vocabulary in home language and French. Visual safety demonstrations. Cultural discussion of electrical safety practices at home.",
          "safetySupport": "Additional practice with safety scenarios. Visual reminders placed strategically. Direct adult check-ins for understanding."
        }),
        
        engagementHooks: JSON.stringify([
          "Electrical safety superhero training academy",
          "Safety rule rap song with movements",
          "Safety detective game finding electrical hazards in pictures",
          "French safety vocabulary treasure hunt"
        ])
      }
    });
    
    console.log('✅ ELECTRICAL SAFETY FIX COMPLETED: Lesson 10');
    console.log('   - Established comprehensive electrical safety rules for Grade 1');
    console.log('   - Added proper safety protocols and emergency procedures');
    console.log('   - Integrated French safety vocabulary');
    console.log('   - Added safety scenario practice and role-play');
    console.log('   - Created safety assessment checkpoints');
    console.log('   - Added home safety connection activities');
    
    return updatedLesson;

  } catch (error) {
    console.error('ERROR fixing lesson 10 electricity safety:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixEnergyLesson10ElectricitySafety();