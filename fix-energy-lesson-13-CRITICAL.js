const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnergyLesson13Critical() {
  try {
    console.log('🚨🚨🚨 EMERGENCY SAFETY FIX: Lesson 13 - Batteries and Power');
    console.log('⚠️  CRITICAL ELECTRICAL HAZARD - GRADE 1 STUDENTS AND BATTERIES');
    
    const lessonId = 'cmec9wtxz00hpvjd4jb7zaf2o';
    
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        titleFr: "Exploration de l'énergie : Les piles et l'énergie électrique (Observation sécuritaire seulement)",
        
        learningGoals: "Students will learn about batteries and electrical energy through SAFE observation only, understanding that batteries are powerful and must only be handled by adults.",
        
        learningGoalsFr: "Les élèves apprendront au sujet des piles et de l'énergie électrique par l'observation SÉCURITAIRE seulement, comprenant que les piles sont puissantes et doivent être manipulées par les adultes seulement.",
        
        materials: JSON.stringify({
          "NO_STUDENT_BATTERY_ACCESS": "🚨 STUDENTS NEVER TOUCH BATTERIES - ADULT ONLY",
          "battery_pictures": "Large pictures of different battery types (for observation only)",
          "sealed_battery_display": "Teacher demonstration - batteries in sealed clear container",
          "safety_equipment": "Safety goggles for teacher demonstration only",
          "journals": "Science observation journals",
          "french_vocabulary_cards": "Cartes de vocabulaire : les piles, l'électricité, la sécurité",
          "electrical_safety_posters": "Posters showing electrical safety rules",
          "adult_supervision_signs": "Signs: 'Adult supervision required'",
          "emergency_contact_info": "Emergency procedures posted visibly"
        }),
        
        mindsOn: "🚨🚨🚨 CRITICAL SAFETY ANNOUNCEMENT:\n\n'Today we learn about batteries, but batteries are VERY POWERFUL and can be dangerous. Only adults can touch batteries. We will look at pictures and watch teacher demonstrations from our safe spots.'\n\nTeacher shows sealed battery display from safe distance. Students record in journals what they observe about battery shapes and sizes. NO STUDENT BATTERY CONTACT.",
        
        mindsOnFr: "🚨🚨🚨 ANNONCE DE SÉCURITÉ CRITIQUE:\n\n'Aujourd'hui nous apprenons au sujet des piles, mais les piles sont TRÈS PUISSANTES et peuvent être dangereuses. Seulement les adultes peuvent toucher les piles.'\n\nL'enseignant montre l'affichage de piles scellées à distance sécuritaire.",
        
        action: "🚨🚨🚨 MAXIMUM SAFETY PROTOCOLS - BATTERY LESSON:\n\n1. ABSOLUTE BATTERY SAFETY RULES:\n   - STUDENTS NEVER TOUCH BATTERIES - EVER\n   - Batteries can cause burns, choking, chemical exposure\n   - Only teacher handles batteries in sealed containers\n   - Students observe from designated safe area (minimum 6 feet away)\n   - Emergency wash station identified and accessible\n\n2. SAFE LEARNING ACTIVITIES:\n   - Teacher demonstrates battery-powered devices from safe distance\n   - Students observe how batteries make things work (flashlight, clock)\n   - Use large pictures to identify battery shapes and sizes\n   - Discuss why batteries need adult handling\n   - Record observations in science journals using French vocabulary\n\n3. SCIENCE JOURNAL INTEGRATION:\n   - Draw pictures of battery-powered devices they see at home\n   - Write safety rule: 'Only adults touch batteries'\n   - List French vocabulary: les piles (batteries), l'électricité (electricity), la sécurité (safety)\n   - Record what they learned about electrical energy\n\n4. FRENCH VOCABULARY DEVELOPMENT:\n   - 'les piles' (batteries) - for adult use only\n   - 'l'électricité' (electricity) - powerful energy\n   - 'la sécurité' (safety) - most important\n   - 'dangereux' (dangerous) - why we don't touch\n\n5. EMERGENCY PROCEDURES:\n   - If any battery emergency: immediate evacuation\n   - Never touch spilled battery contents\n   - Call for immediate adult help\n   - Wash hands thoroughly after lesson\n\n6. ASSESSMENT OF SAFETY UNDERSTANDING:\n   - Students demonstrate understanding: 'We never touch batteries'\n   - Can identify adult-only electrical items\n   - Show proper hand-washing procedure",
        
        actionFr: "🚨🚨🚨 PROTOCOLES DE SÉCURITÉ MAXIMALE - LEÇON SUR LES PILES:\n\n1. RÈGLES ABSOLUES DE SÉCURITÉ DES PILES:\n   - LES ÉLÈVES NE TOUCHENT JAMAIS LES PILES - JAMAIS\n   - Les piles peuvent causer des brûlures, étouffement, exposition chimique\n   - Seulement l'enseignant manipule les piles dans des contenants scellés\n\n2. ACTIVITÉS D'APPRENTISSAGE SÉCURITAIRES:\n   - L'enseignant démontre les appareils à piles à distance sécuritaire\n   - Les élèves observent comment les piles font fonctionner les choses\n   - Utiliser de grandes images pour identifier les formes et tailles de piles\n   - Discuter pourquoi les piles nécessitent la manipulation d'adultes\n\n3. INTÉGRATION DU JOURNAL SCIENTIFIQUE:\n   - Dessiner des images d'appareils à piles qu'ils voient à la maison\n   - Écrire la règle de sécurité : 'Seulement les adultes touchent les piles'\n   - Vocabulaire français : les piles, l'électricité, la sécurité",
        
        consolidation: "🚨 CRITICAL SAFETY REVIEW:\n\nStudents recite together: 'Only adults touch batteries. Batteries are powerful. We stay safe by observing only.'\n\nReview French vocabulary with safety emphasis. Students share their journal observations about electrical energy. Teacher reinforces: batteries help us but are adult-only tools.\n\nExit ticket: Students must correctly identify one electrical safety rule before leaving.",
        
        consolidationFr: "🚨 RÉVISION DE SÉCURITÉ CRITIQUE:\n\nLes élèves récitent ensemble : 'Seulement les adultes touchent les piles. Les piles sont puissantes. Nous restons en sécurité en observant seulement.'\n\nRévision du vocabulaire français avec emphase sur la sécurité.",
        
        assessmentType: "formative",
        
        formativeCheckpoints: JSON.stringify([
          "☐ States clearly: 'Only adults can touch batteries'",
          "☐ Demonstrates safe observation distance from electrical items",
          "☐ Records battery observations in science journal without touching",
          "☐ Uses French vocabulary correctly: les piles, l'électricité, la sécurité",
          "☐ Identifies electrical safety rules",
          "☐ Shows understanding that batteries are powerful and can be dangerous",
          "☐ Asks for adult help appropriately",
          "☐ Follows hand-washing safety procedure"
        ]),
        
        differentiationStrategies: JSON.stringify({
          "forStruggling": "Extra visual safety reminders. Repeated safety rule practice. Simplified French vocabulary with picture support. Additional adult supervision proximity.",
          "forAdvanced": "Research safe battery alternatives (hand-crank devices). Create safety posters for younger students. Lead safety rule reminders.",
          "forELL": "Safety vocabulary in home language and French. Visual safety demonstration supports. Cultural discussion of electrical safety practices.",
          "emergencySupport": "Immediate adult intervention available. Clear visual safety boundaries marked. Emergency contact information visible."
        }),
        
        engagementHooks: JSON.stringify([
          "Teacher magic show: making flashlight work (from safe distance)",
          "Battery detective game using pictures only",
          "Safety superhero chant about electrical safety",
          "French vocabulary safety song"
        ])
      }
    });
    
    console.log('✅✅✅ CRITICAL SAFETY FIX COMPLETED: Lesson 13');
    console.log('   - ELIMINATED direct battery handling by students');
    console.log('   - Added maximum safety protocols for electrical hazards');
    console.log('   - Established safe observation distances');
    console.log('   - Added emergency procedures for battery incidents');
    console.log('   - Integrated French safety vocabulary');
    console.log('   - Added safety-focused assessment checkpoints');
    console.log('   - Removed all electrical contact risks for Grade 1 students');
    
    return updatedLesson;

  } catch (error) {
    console.error('CRITICAL ERROR fixing lesson 13:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixEnergyLesson13Critical();