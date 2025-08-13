import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCoreFieldsPE() {
  console.log('🔧 ADDING CORE FIELDS TO PE LESSONS');
  console.log('='.repeat(60));
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Mon corps en mouvement' }
  });
  
  if (!unit) {
    console.error('Unit not found!');
    return;
  }
  
  // Get all lessons from weeks 1-3 that need core fields
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: { 
      unitPlanId: unit.id,
      date: {
        lte: new Date('2025-09-19')
      }
    },
    orderBy: { date: 'asc' }
  });
  
  console.log(`Adding core fields to ${lessons.length} lessons`);
  
  // Core field data for each lesson
  const coreData = [
    { // Lesson 1: Bienvenue
      learningGoals: "Comprendre les attentes en éducation physique; Apprendre les routines de sécurité; Développer l'écoute active",
      materials: JSON.stringify(['Sifflet', 'Cônes colorés', 'Cerceaux', 'Musique énergique', 'Affiches de règles']),
      grouping: "Toute la classe, puis petits groupes"
    },
    { // Lesson 2: Je bouge
      learningGoals: "Explorer différents types de mouvements; Développer la conscience corporelle; Améliorer la coordination",
      materials: JSON.stringify(['Musique variée', 'Tambourin', 'Rubans colorés', 'Cartes de mouvements']),
      grouping: "Individuel et toute la classe"
    },
    { // Lesson 3: Équilibre
      learningGoals: "Développer l'équilibre statique et dynamique; Améliorer le contrôle postural; Renforcer la concentration",
      materials: JSON.stringify(['Lignes au sol', 'Bancs suédois', 'Sacs de fèves', 'Musique calme']),
      grouping: "Individuel, partenaires, stations"
    },
    { // Lesson 4: Espace
      learningGoals: "Comprendre l'espace personnel et général; Développer la conscience spatiale; Éviter les collisions",
      materials: JSON.stringify(['Cerceaux', 'Cônes', 'Rubans', 'Musique', 'Foulards']),
      grouping: "Individuel et toute la classe"
    },
    { // Lesson 5: Lancer
      learningGoals: "Développer la technique de lancer; Améliorer la précision; Renforcer la coordination œil-main",
      materials: JSON.stringify(['Balles variées', 'Cibles', 'Cerceaux', 'Seaux', 'Cônes']),
      grouping: "Stations en petits groupes"
    },
    { // Lesson 6: Attraper
      learningGoals: "Apprendre à attraper en sécurité; Développer la réaction; Améliorer la coordination",
      materials: JSON.stringify(['Ballons légers', 'Foulards', 'Balles en mousse', 'Parachute']),
      grouping: "Partenaires et petits groupes"
    },
    { // Lesson 7: Contrôle balle
      learningGoals: "Développer le contrôle de balle; Améliorer la dextérité; Apprendre le dribble de base",
      materials: JSON.stringify(['Ballons variés', 'Cônes', 'Lignes au sol', 'Musique rythmée']),
      grouping: "Individuel puis partenaires"
    },
    { // Lesson 8: Pieds
      learningGoals: "Développer la coordination pied-œil; Apprendre le contrôle au pied; Améliorer l'agilité",
      materials: JSON.stringify(['Ballons de soccer', 'Cônes', 'Cerceaux', 'Mini-buts']),
      grouping: "Individuel et petits groupes"
    },
    { // Lesson 9: Combinaisons
      learningGoals: "Combiner différentes habiletés; Développer la fluidité; Améliorer l'enchaînement",
      materials: JSON.stringify(['Matériel varié', 'Parcours', 'Musique', 'Chronomètre']),
      grouping: "Stations et équipes"
    },
    { // Lesson 10: Coopération
      learningGoals: "Développer l'esprit d'équipe; Apprendre à coopérer; Communiquer efficacement",
      materials: JSON.stringify(['Parachute', 'Ballons', 'Cordes', 'Cerceaux', 'Dossards']),
      grouping: "Équipes de 4-5 élèves"
    },
    { // Lesson 11: Danse
      learningGoals: "Explorer l'expression corporelle; Développer le rythme; Créer des mouvements",
      materials: JSON.stringify(['Musique variée', 'Foulards', 'Rubans', 'Tambourins', 'Espace dégagé']),
      grouping: "Individuel, duos, toute la classe"
    },
    { // Lesson 12: Célébration
      learningGoals: "Démontrer les apprentissages; Célébrer les progrès; Partager avec fierté",
      materials: JSON.stringify(['Tout le matériel', 'Musique festive', 'Certificats', 'Décorations']),
      grouping: "Performances variées"
    }
  ];
  
  for (let i = 0; i < lessons.length && i < coreData.length; i++) {
    const updated = await prisma.eTFOLessonPlan.update({
      where: { id: lessons[i].id },
      data: coreData[i]
    });
    
    console.log(`✅ Added core fields to: ${updated.title}`);
  }
  
  // Final verification
  console.log('\n📊 FINAL VERIFICATION AFTER CORE FIELDS:');
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: { unitPlanId: unit.id },
    orderBy: { date: 'asc' }
  });
  
  let fullyCompliant = 0;
  
  for (const lesson of allLessons) {
    const hasThreePart = lesson.mindsOn && lesson.action && lesson.consolidation;
    const hasAssessment = lesson.assessmentType && lesson.assessmentNotes;
    const hasDifferentiation = lesson.accommodations && lesson.modifications && lesson.extensions;
    const isSubReady = lesson.isSubFriendly && lesson.subNotes;
    const hasCore = lesson.learningGoals && lesson.materials && lesson.grouping;
    
    if (hasThreePart && hasAssessment && hasDifferentiation && isSubReady && hasCore) {
      fullyCompliant++;
    }
  }
  
  console.log(`Total lessons: ${allLessons.length}`);
  console.log(`Fully ETFO compliant: ${fullyCompliant}`);
  console.log(`Compliance rate: ${Math.round(fullyCompliant / allLessons.length * 100)}%`);
  
  if (fullyCompliant === allLessons.length) {
    console.log('\n');
    console.log('=' .repeat(60));
    console.log('🏆 ABSOLUTE PERFECTION ACHIEVED!');
    console.log('=' .repeat(60));
    console.log('✨ All 35 PE lessons are now 100% PERFECT!');
    console.log('✨ Complete ETFO compliance achieved!');
    console.log('✨ Every lesson has:');
    console.log('   ✅ Three-part structure (Minds On/Action/Consolidation)');
    console.log('   ✅ Clear learning goals');
    console.log('   ✅ Differentiation strategies');
    console.log('   ✅ Assessment methods');
    console.log('   ✅ Materials list');
    console.log('   ✅ Grouping strategies');
    console.log('   ✅ Sub-friendly notes');
    console.log('   ✅ Accommodations & modifications');
    console.log('   ✅ Extensions for advanced learners');
    console.log('=' .repeat(60));
    console.log('🎯 "Mon corps en mouvement" unit is PERFECT!');
    console.log('🎯 35 lessons from Sept 1 to Oct 30, 2025');
    console.log('🎯 Ready for Grade 1 French Immersion!');
    console.log('=' .repeat(60));
  }
  
  await prisma.$disconnect();
}

addCoreFieldsPE();