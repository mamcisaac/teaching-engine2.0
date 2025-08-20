import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectScienceUnitsManually() {
  console.log('🎯 CREATING PERFECT SCIENCE UNITS MANUALLY\n');
  console.log('=' .repeat(80));
  console.log('CRITICAL FIX: Reducing from 259 lessons to 195 lessons exactly');
  console.log('Core + Extension Model with safety protocols maintained');
  console.log('Grade 1 appropriate with complete pedagogical elements');
  console.log('ETFO compliant: All units 2-4 weeks\n');
  
  const EMILY_USER_ID = 23;
  const SCIENCE_LRP_ID = 'cmebyc98q0005vjr19wxzdygh'; // From the review
  
  try {
    console.log('🗑️  PHASE 1: REMOVING OVERSIZED SCIENCE UNITS...\n');
    
    // Delete related records first to avoid foreign key constraints
    await prisma.unitPlanExpectation.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: SCIENCE_LRP_ID
        }
      }
    });
    
    // Now delete the unit plans
    const deleteResult = await prisma.unitPlan.deleteMany({
      where: {
        longRangePlanId: SCIENCE_LRP_ID
      }
    });
    
    console.log(`✅ Deleted ${deleteResult.count} oversized Science units (were 259 lessons)`);
    
    console.log('\\n🔬 PHASE 2: CREATING 10 PERFECT SCIENCE UNITS (195 LESSONS)...\n');
    
    // Perfect Science units with exact lesson counts and safety protocols
    const perfectScienceUnits = [
      {
        title: 'Petits scientifiques sécuritaires',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-09-03', endDate: '2025-09-26',
        bigIdeas: 'Nous sommes tous des scientifiques curieux qui explorent le monde en sécurité.',
        essentialQuestions: ['Comment observer?', 'Que découvrir?', 'Comment rester sécuritaire?'],
        description: 'Introduction à la démarche scientifique avec protocoles de sécurité rigoureux et développement de la curiosité.',
        safety: 'Règles de sécurité de base, utilisation appropriée des sens, manipulation sécuritaire d\'objets.'
      },
      {
        title: 'Matériaux de notre environnement',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-09-29', endDate: '2025-10-24',
        bigIdeas: 'Tous les objets sont faits de matériaux avec des propriétés uniques et mesurables.',
        essentialQuestions: ['De quoi c\'est fait?', 'Quelles propriétés?', 'Comment tester sécuritairement?'],
        description: 'Exploration tactile sécuritaire des matériaux avec tests de propriétés et classification.',
        safety: 'Tests sécuritaires seulement, pas de substances dangereuses, supervision constante.'
      },
      {
        title: 'Changements saisonniers d\'automne',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-10-27', endDate: '2025-11-21',
        bigIdeas: 'La nature change constamment selon les saisons et nous pouvons observer ces changements.',
        essentialQuestions: ['Quels changements observer?', 'Pourquoi la nature change?', 'Comment documenter?'],
        description: 'Observations systématiques des changements d\'automne avec documentation scientifique.',
        safety: 'Sécurité extérieure, identification des plantes/objets dangereux, vêtements appropriés.'
      },
      {
        title: 'Lumière et chaleur hivernales',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-11-24', endDate: '2025-12-19',
        bigIdeas: 'La lumière et la chaleur sont essentielles à la vie et proviennent de diverses sources.',
        essentialQuestions: ['D\'où vient la lumière?', 'Comment produire chaleur?', 'Que faire sans soleil?'],
        description: 'Expériences sécuritaires avec sources de lumière et de chaleur, importance pour la vie.',
        safety: 'Sources de chaleur sécuritaires uniquement, protection des yeux, supervision adulte constante.'
      },
      {
        title: 'Croissance et besoins des vivants',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2026-01-06', endDate: '2026-01-31',
        bigIdeas: 'Tous les êtres vivants grandissent, changent et ont des besoins spécifiques.',
        essentialQuestions: ['Comment grandir?', 'De quoi ont besoin les plantes?', 'Comment aider?'],
        description: 'Cycle de vie des plantes avec jardinage intérieur sécuritaire et observations.',
        safety: 'Plantes non-toxiques seulement, lavage des mains obligatoire, outils appropriés à l\'âge.'
      },
      {
        title: 'Forces et mouvements simples',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-02-02', endDate: '2026-02-27',
        bigIdeas: 'Les objets bougent grâce aux forces que nous appliquons et nous pouvons prédire leurs mouvements.',
        essentialQuestions: ['Comment faire bouger?', 'Qu\'est-ce qui pousse?', 'Comment prédire?'],
        description: 'Exploration sécuritaire des forces avec matériel approprié et prédictions testables.',
        safety: 'Objets légers seulement, espace dégagé pour expériences, pas de projections dangereuses.'
      },
      {
        title: 'Éveil du printemps',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-03-02', endDate: '2026-03-27',
        bigIdeas: 'Le printemps apporte renouveau et nouvelles découvertes dans la nature.',
        essentialQuestions: ['Que renaît au printemps?', 'Comment les plantes poussent?', 'Quoi observer dehors?'],
        description: 'Jardinage scolaire avec observations de croissance et documentation du renouveau.',
        safety: 'Outils de jardinage adaptés, identification sécuritaire des plantes, hygiène rigoureuse.'
      },
      {
        title: 'Notre environnement partagé',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-03-30', endDate: '2026-04-24',
        bigIdeas: 'Nous partageons notre environnement avec tous les êtres vivants et devons le protéger.',
        essentialQuestions: ['Qui vit dans notre environnement?', 'Comment protéger?', 'Que partager?'],
        description: 'Écologie locale avec sensibilisation environnementale et actions concrètes.',
        safety: 'Observation respectueuse des animaux, pas de contact direct, protection de l\'habitat.'
      },
      {
        title: 'Sons et vibrations fascinants',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-04-27', endDate: '2026-05-22',
        bigIdeas: 'Les sons nous entourent, nous permettent de communiquer et sont créés par des vibrations.',
        essentialQuestions: ['Comment entendre?', 'Qu\'est-ce qui vibre?', 'Comment créer sons?'],
        description: 'Expériences sonores sécuritaires avec exploration des vibrations et création d\'instruments.',
        safety: 'Protection auditive quand nécessaire, volumes appropriés, matériaux sécuritaires.'
      },
      {
        title: 'Exposition scientifique de fin d\'année',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-05-25', endDate: '2026-06-19',
        bigIdeas: 'Notre année scientifique mérite d\'être partagée et célébrée avec notre communauté.',
        essentialQuestions: ['Qu\'avons-nous découvert?', 'Comment partager en sécurité?', 'Que retenir?'],
        description: 'Foire scientifique avec démonstrations sécuritaires et célébration des apprentissages.',
        safety: 'Démonstrations sécurisées, supervision adulte, matériaux non-dangereux pour public.'
      }
    ];
    
    // Verify lesson count
    const totalLessons = perfectScienceUnits.reduce((sum, unit) => sum + unit.lessons, 0);
    const totalHours = perfectScienceUnits.reduce((sum, unit) => sum + unit.hours, 0);
    
    console.log(`Mathematical verification:`);
    console.log(`Total lessons: ${totalLessons} (Target: 195) ${totalLessons === 195 ? '✅' : '❌'}`);
    console.log(`Total hours: ${totalHours} (Target: ~146.25) ${Math.abs(totalHours - 146.25) < 1 ? '✅' : '❌'}`);
    console.log(`Reduction: From 259 to ${totalLessons} lessons (-${259-totalLessons} lessons)\\n`);
    
    if (totalLessons !== 195) {
      throw new Error(`Lesson count error: ${totalLessons} instead of 195`);
    }
    
    // Create each perfect unit
    for (let i = 0; i < perfectScienceUnits.length; i++) {
      const unit = perfectScienceUnits[i];
      console.log(`Creating Unit ${i + 1}: ${unit.title} (${unit.lessons} lessons)...`);
      
      const createdUnit = await prisma.unitPlan.create({
        data: {
          userId: EMILY_USER_ID,
          longRangePlanId: SCIENCE_LRP_ID,
          title: unit.title,
          titleFr: unit.title,
          description: `${unit.description}

🔬 STRUCTURE CORE + EXTENSION (${unit.lessons} leçons totales):
• Leçons essentielles: ${unit.core} (70% - contenu obligatoire pour tous)
• Leçons d'extension: ${unit.extension} (30% - enrichissement/consolidation flexible)

⚠️ PROTOCOLES DE SÉCURITÉ INTÉGRÉS:
${unit.safety}

Cette structure permet une adaptation naturelle selon les besoins de la classe tout en maintenant la sécurité absolue.`,
          descriptionFr: unit.description,
          bigIdeas: unit.bigIdeas,
          bigIdeasFr: unit.bigIdeas,
          essentialQuestions: unit.essentialQuestions,
          startDate: new Date(unit.startDate),
          endDate: new Date(unit.endDate),
          estimatedHours: unit.hours,
          
          // Perfect Assessment Plan with safety emphasis
          assessmentPlan: `🔬 ÉVALUATION SCIENTIFIQUE SÉCURITAIRE:

STRUCTURE TEMPORELLE (${unit.lessons} leçons = ${unit.hours} heures):
• ${unit.core} leçons essentielles (priorité absolue - tous élèves)
• ${unit.extension} leçons d'extension (adaptation selon classe)

⚠️ PROTOCOLES DE SÉCURITÉ:
${unit.safety}

ÉVALUATION EN ACTION:
• Formatif: Observations pendant expériences sécuritaires
• Comme apprentissage: Carnets de scientifique avec dessins
• Sommatif: Démonstrations sécurisées des apprentissages

DÉMARCHE SCIENTIFIQUE GRADE 1:
1. Observer avec nos sens (sécuritairement)
2. Poser questions simples
3. Faire prédictions
4. Tester de façon sécuritaire
5. Documenter ce qu'on découvre
6. Partager nos découvertes

POINTS DE DÉCISION FLEXIBLES:
• Jour 3: Évaluation sécurité → ajuster manipulations si nécessaire
• Mi-parcours: Vérification compréhension → modifier expériences
• Fin d'unité: Démonstration sécuritaire → célébrer découvertes`,
          
          // Perfect Science Differentiation with safety
          differentiationStrategies: {
            forStruggling: `SOUTIEN SCIENTIFIQUE SÉCURITAIRE:
• Focus sur ${unit.core} leçons essentielles avec manipulation simple
• Partenariat avec élève plus avancé pour sécurité
• Extensions utilisées pour répéter expériences sécuritaires
• Temps supplémentaire pour observation et documentation
• Support visuel constant pour procédures sécuritaires`,
            
            forOnLevel: `PROGRESSION SCIENTIFIQUE ÉQUILIBRÉE:
• Complétion ${unit.core} essentielles + extensions sélectionnées
• Autonomie graduelle dans expériences sécuritaires
• Carnet de scientifique personnalisé
• Leadership dans sécurité pour pairs
• Applications créatives des découvertes`,
            
            forAdvanced: `ENRICHISSEMENT SCIENTIFIQUE:
• Passage rapide par ${unit.core} essentielles
• Toutes ${unit.extension} extensions + enquêtes supplémentaires
• Mentor sécurité pour autres élèves
• Projets d'investigation autonomes (supervisés)
• Connexions scientifiques complexes`,
            
            forELL: `SOUTIEN SCIENTIFIQUE LINGUISTIQUE:
• Vocabulaire scientifique avec supports visuels
• Démonstrations répétées en français simple
• Carnet avec dessins et mots français/anglais
• Procédures sécurité expliquées clairement
• Célébration des progrès linguistiques scientifiques`
          },
          
          // Perfect Success Criteria for Science
          successCriteria: {
            beginning: `JEUNE SCIENTIFIQUE DÉBUTANT:
• Observe avec curiosité et attention
• Suit consignes de sécurité avec rappels
• Pose questions simples sur ce qu'il voit
• Participe à expériences avec aide
• Dessine ou explique ce qu'il découvre`,
            
            developing: `SCIENTIFIQUE EN DÉVELOPPEMENT:
• Utilise sens pour observer de façon sécuritaire
• Fait prédictions simples avant tests
• Suit la plupart des consignes sécurité
• Documente observations avec mots et dessins
• Explique découvertes à ses pairs`,
            
            proficient: `SCIENTIFIQUE COMPÉTENT:
• Observe, prédit, teste de façon autonome et sécuritaire
• Utilise vocabulaire scientifique approprié
• Respecte toujours consignes de sécurité
• Compare résultats avec prédictions
• Explique découvertes clairement aux autres`,
            
            extending: `SCIENTIFIQUE AVANCÉ:
• Conçoit expériences simples de façon sécuritaire
• Fait connexions entre différentes découvertes
• Enseigne procédures sécuritaires aux pairs
• Pose questions scientifiques complexes
• Inspire curiosité scientifique chez autres`
          },
          
          // Science-specific connections
          crossCurricularConnections: `🔬 INTÉGRATION SCIENTIFIQUE NATURELLE:
• Mathématiques: Mesures, graphiques, comptage dans expériences
• Français: Vocabulaire scientifique, carnets de laboratoire
• Arts: Dessins scientifiques, modèles créatifs
• Santé: Sécurité, hygiène, bien-être dans nature
• Social: Environnement communautaire, conservation`,
          
          // Community connections for Science
          communityConnections: `🌍 CONNEXIONS SCIENTIFIQUES COMMUNAUTAIRES:
• Scientifiques locaux invités (avec démonstrations sécuritaires)
• Visites de centres scientifiques si disponibles
• Projets environnementaux communautaires
• Jardins communautaires pour observations
• Partenariats avec centres de la nature locaux`,
          
          // Indigenous perspectives for Science
          indigenousPerspectives: `🍃 PERSPECTIVES SCIENTIFIQUES MI'KMAQ:
Intégration respectueuse des savoirs traditionnels Mi'kmaq:
• Observations saisonnières et calendriers naturels
• Médecines et utilisations traditionnelles des plantes (observation seulement)
• Respect et protection de l'environnement naturel
• Connexions spirituelles avec la nature
• Savoirs astronomiques et météorologiques traditionnels

IMPORTANT: Consultation avec Aînés Mi'kmaq pour assurer respect et authenticité.`,
          
          // Parent communication for Science
          parentCommunicationPlan: `👨‍👩‍👧‍👦 COMMUNICATION SCIENTIFIQUE FAMILIALE:
• Hebdomadaire: Photos d'expériences sécuritaires (avec permission)
• Bi-mensuel: Expériences simples et sécuritaires à faire à la maison
• Mensuel: Carnets de scientifique partagés avec familles
• Au besoin: Information sur précautions sécuritaires
• Ressources: Liste d'activités scientifiques familiales sécuritaires`,
          
          // Safety-focused culminating task
          culminatingTask: `🔬 TÂCHE CULMINANTE SCIENTIFIQUE SÉCURITAIRE:

OPTION MINIMUM (Leçons essentielles complétées):
• Démonstration sécurisée (3 minutes) d'une découverte
• Carnet de scientifique avec observations favorites
• Explication simple à un pair ou parent
• Participation à exposition de classe

OPTION COMPLÈTE (Toutes leçons + extensions):
• Projet d'investigation complet avec hypothèse
• Présentation enrichie (5 minutes) avec matériel visuel
• Carnet détaillé avec réflexions scientifiques
• Leadership dans exposition scolaire publique
• Démonstration sécuritaire pour autres classes

⚠️ SÉCURITÉ ABSOLUE: Toutes démonstrations supervisées par adulte, matériaux pré-approuvés, procédures testées.

L'option choisie dépend du niveau de maîtrise de la démarche scientifique et des protocoles de sécurité.`
        }
      });
      
      console.log(`  ✅ Created successfully with ID: ${createdUnit.id}`);
    }
    
    console.log('\\n🎉 PERFECT SCIENCE UNITS COMPLETED!');
    console.log('=' .repeat(80));
    console.log('✅ CRITICAL FIX: Reduced from 259 to 195 lessons exactly');
    console.log('✅ All units 2-4 weeks (ETFO compliant)');
    console.log('✅ Complete safety protocols maintained and enhanced');
    console.log('✅ Grade 1 appropriate scientific thinking');
    console.log('✅ French immersion ready with scientific vocabulary');
    console.log('✅ Built-in differentiation and assessment');
    console.log('✅ Indigenous scientific perspectives respectfully integrated');
    console.log('✅ Core + Extension flexibility for real classroom adaptation');
    console.log('\\n🚀 READY FOR EMILY\'S SAFE AND ENGAGING SCIENCE CLASSROOM!');
    
  } catch (error) {
    console.error('Error creating perfect Science units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectScienceUnitsManually();