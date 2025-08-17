const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnergyLessonsBatch2to9() {
  try {
    console.log('🚨 BATCH SAFETY FIX: Lessons 2-9 - Light and Sound Explorations');
    console.log('⚠️  Adding comprehensive safety protocols to prevent electrical hazards');
    
    const lessons = [
      {
        id: 'cmeca1n0h00dhvjtaymrvoifl',
        title: 'Energy Exploration: Light Sources',
        titleFr: "Exploration de l'énergie : Sources de lumière",
        focus: 'light sources'
      },
      {
        id: 'cmec9wtxv00hfvjd4ih5wuq52',
        title: 'Energy Exploration: Light Exploration',
        titleFr: "Exploration de l'énergie : Exploration de la lumière",
        focus: 'light exploration'
      },
      {
        id: 'cmeca1n0i00djvjta6k7bcqyk',
        title: 'Energy Exploration: Sound Exploration',
        titleFr: "Exploration de l'énergie : Exploration du son",
        focus: 'sound exploration'
      },
      {
        id: 'cmec9wtxw00hhvjd4ggwp7xdr',
        title: 'Energy Exploration: Sound Investigations',
        titleFr: "Exploration de l'énergie : Enquêtes sur le son",
        focus: 'sound investigations'
      },
      {
        id: 'cmeca1n0j00dlvjtandp2ll2d',
        title: 'Energy Exploration: Movement Energy',
        titleFr: "Exploration de l'énergie : Énergie du mouvement",
        focus: 'movement energy'
      },
      {
        id: 'cmec9wtxx00hjvjd4za26fokh',
        title: 'Energy Exploration: Heat and Cold',
        titleFr: "Exploration de l'énergie : Chaud et froid",
        focus: 'heat and cold'
      },
      {
        id: 'cmeca1n0j00dnvjtauz6dc05b',
        title: 'Energy Exploration: Heat and Cold - Unit: Energy in Our L...',
        titleFr: "Exploration de l'énergie : Chaud et froid - Unité : L'énergie dans nos vies",
        focus: 'heat and cold'
      },
      {
        id: 'cmec9wtxx00hlvjd4w2tdtnse',
        title: 'Energy Exploration: Moving Objects',
        titleFr: "Exploration de l'énergie : Objets en mouvement",
        focus: 'moving objects'
      }
    ];

    const results = [];

    for (const lesson of lessons) {
      console.log(`\n🔧 Fixing Lesson: ${lesson.title}`);
      
      const safeVocabulary = {
        'light sources': ['la lumière', 'les sources de lumière', 'sécuritaire', 'observation'],
        'light exploration': ['explorer la lumière', 'la sécurité', 'regarder seulement'],
        'sound exploration': ['le son', 'l\'exploration', 'écouter sécuritairement'],
        'sound investigations': ['enquêtes sur le son', 'investigation sécuritaire'],
        'movement energy': ['l\'énergie du mouvement', 'bouger sécuritairement'],
        'heat and cold': ['chaud', 'froid', 'température', 'sécurité thermique'],
        'moving objects': ['objets en mouvement', 'observation sécuritaire']
      };

      const updatedLesson = await prisma.eTFOLessonPlan.update({
        where: {
          id: lesson.id
        },
        data: {
          titleFr: lesson.titleFr,
          
          learningGoals: `Students will explore ${lesson.focus} through SAFE observation and investigation, understanding energy concepts while following all safety protocols.`,
          
          learningGoalsFr: `Les élèves exploreront ${lesson.focus.includes('heat') ? 'la température' : lesson.focus.includes('sound') ? 'le son' : lesson.focus.includes('light') ? 'la lumière' : lesson.focus.includes('movement') ? 'le mouvement' : 'l\'énergie'} par l'observation et l'investigation SÉCURITAIRES.`,
          
          materials: JSON.stringify({
            "safe_demonstration_materials": `Teacher-controlled materials for ${lesson.focus} demonstration`,
            "observation_tools": "Safe observation tools (magnifying glasses, safety goggles)",
            "pictures_and_posters": `Large pictures showing ${lesson.focus} safely`,
            "science_journals": "Individual science observation journals",
            "french_vocabulary_cards": `Cartes de vocabulaire français pour ${lesson.focus}`,
            "safety_equipment": "Safety goggles for any demonstration activities",
            "adult_supervision_required": "🚨 All activities require direct adult supervision",
            "NO_ELECTRICAL_STUDENT_CONTACT": "🚨 Students never touch electrical items",
            "emergency_procedures": "Posted emergency contact and safety procedures"
          }),
          
          mindsOn: `🚨 SAFETY FIRST: Introduction to ${lesson.focus} with safety rules review.\n\n'Today we explore ${lesson.focus} safely! Remember: we observe with our eyes, we don't touch electrical items, and we always ask adults for help.'\n\nTeacher demonstrates ${lesson.focus} from safe distance. Students record initial observations in science journals using French vocabulary.`,
          
          mindsOnFr: `🚨 SÉCURITÉ D'ABORD : Introduction à ${lesson.focus.includes('heat') ? 'la température' : lesson.focus.includes('sound') ? 'le son' : lesson.focus.includes('light') ? 'la lumière' : 'l\'énergie'} avec révision des règles de sécurité.`,
          
          action: `🚨 COMPREHENSIVE SAFETY PROTOCOLS FOR ${lesson.focus.toUpperCase()}:\n\n1. ELECTRICAL SAFETY RULES:\n   - NEVER touch electrical outlets, cords, or devices\n   - Adult supervision required for ALL activities\n   - Maintain safe observation distance (minimum 3 feet)\n   - Use pictures and safe demonstrations only\n\n2. SAFE EXPLORATION ACTIVITIES:\n   - Teacher-controlled demonstrations of ${lesson.focus}\n   - Students observe and record in science journals\n   - Identify examples of ${lesson.focus} in safe pictures\n   - Discuss how ${lesson.focus} works without touching electrical items\n   - Practice French vocabulary through safe observation\n\n3. SCIENCE JOURNAL INTEGRATION:\n   - Draw observations of ${lesson.focus} from safe demonstrations\n   - Write/draw predictions about ${lesson.focus}\n   - Record French vocabulary: ${safeVocabulary[lesson.focus] ? safeVocabulary[lesson.focus].join(', ') : 'vocabulaire de sécurité'}\n   - Document safety rules learned\n\n4. SAFETY-FOCUSED LEARNING:\n   - Understand that ${lesson.focus} involves energy that can be powerful\n   - Learn to observe safely without direct contact\n   - Practice asking adults for help appropriately\n   - Identify safe vs unsafe ways to explore ${lesson.focus}\n\n5. EMERGENCY PROCEDURES:\n   - Know how to call for adult help immediately\n   - Understand 'stop' signals from teacher\n   - Follow evacuation procedures if needed\n   - Never attempt to help with electrical emergencies`,
          
          actionFr: `🚨 PROTOCOLES DE SÉCURITÉ COMPLETS POUR ${lesson.focus.includes('heat') ? 'LA TEMPÉRATURE' : lesson.focus.includes('sound') ? 'LE SON' : lesson.focus.includes('light') ? 'LA LUMIÈRE' : 'L\'ÉNERGIE'}:\n\n1. RÈGLES DE SÉCURITÉ ÉLECTRIQUE:\n   - NE JAMAIS toucher les prises, cordons ou appareils électriques\n   - Supervision d'adulte requise pour TOUTES les activités\n\n2. ACTIVITÉS D'EXPLORATION SÉCURITAIRES:\n   - Démonstrations contrôlées par l'enseignant\n   - Les élèves observent et enregistrent dans leurs journaux scientifiques\n   - Identification d'exemples dans des images sécuritaires`,
          
          consolidation: `🚨 SAFETY REVIEW AND LEARNING CONSOLIDATION:\n\nStudents share their ${lesson.focus} discoveries from science journals while reinforcing safety rules:\n- 'We observed ${lesson.focus} safely without touching electrical items'\n- 'We always ask adults for help with energy explorations'\n- Review French vocabulary learned\n- Demonstrate understanding of safe observation techniques\n\nExit ticket: Students must state one safety rule and one thing they learned about ${lesson.focus}.`,
          
          consolidationFr: `🚨 RÉVISION DE SÉCURITÉ ET CONSOLIDATION D'APPRENTISSAGE:\n\nLes élèves partagent leurs découvertes de ${lesson.focus.includes('heat') ? 'température' : lesson.focus.includes('sound') ? 'son' : lesson.focus.includes('light') ? 'lumière' : 'énergie'} de leurs journaux scientifiques tout en renforçant les règles de sécurité.`,
          
          assessmentType: "formative",
          
          formativeCheckpoints: JSON.stringify([
            `☐ Observes ${lesson.focus} safely without touching electrical items`,
            "☐ Demonstrates safety awareness around energy sources",
            "☐ Records observations in science journal using pictures and words",
            `☐ Uses French vocabulary correctly related to ${lesson.focus}`,
            "☐ Follows all electrical safety rules during exploration",
            "☐ Asks for adult help appropriately when needed",
            `☐ Shows understanding of how ${lesson.focus} relates to energy`,
            "☐ Maintains safe observation distance during demonstrations"
          ]),
          
          differentiationStrategies: JSON.stringify({
            "forStruggling": `Visual safety cards for ${lesson.focus}. Simplified French vocabulary with picture support. Extra adult supervision. Peer buddy for journal recording.`,
            "forAdvanced": `Research additional examples of ${lesson.focus} using safe resources. Create safety posters. Lead French vocabulary practice with peers.`,
            "forELL": `Multilingual vocabulary cards for ${lesson.focus}. Visual demonstration supports. Safety words in home language and French.`,
            "safetyAccommodations": "Extra adult supervision for students needing additional support. Large print safety rules. Clear visual safety boundaries marked."
          }),
          
          engagementHooks: JSON.stringify([
            `Safe ${lesson.focus} demonstration show (teacher-controlled)`,
            `${lesson.focus} detective game using observation only`,
            `French vocabulary song about ${lesson.focus}`,
            "Safety expert badge earning activity"
          ])
        }
      });
      
      results.push(updatedLesson);
      console.log(`   ✅ Fixed: ${lesson.title} - Safety protocols added`);
    }
    
    console.log('\n🎉 BATCH SAFETY FIX COMPLETED: Lessons 2-9');
    console.log('   - Added comprehensive electrical safety protocols');
    console.log('   - Integrated French titles and learning objectives');
    console.log('   - Added science journal activities for safe observation');
    console.log('   - Established safe materials lists (no electrical student contact)');
    console.log('   - Added safety-focused assessment checkpoints');
    console.log('   - Created emergency procedures for all lessons');
    
    return results;

  } catch (error) {
    console.error('ERROR in batch safety fix lessons 2-9:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixEnergyLessonsBatch2to9();