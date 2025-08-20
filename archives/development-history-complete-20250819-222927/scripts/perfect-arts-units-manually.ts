import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectArtsUnitsManually() {
  console.log('🎨 CREATING PERFECT ARTS UNITS MANUALLY\n');
  console.log('=' .repeat(80));
  console.log('FIX: Maintaining 195 lessons but fixing ETFO violations');
  console.log('Core + Extension Model with daily skill building');
  console.log('Grade 1 appropriate with complete pedagogical elements');
  console.log('ETFO compliant: All units 2-4 weeks (no more violations)\n');
  
  const EMILY_USER_ID = 23;
  const ARTS_LRP_ID = 'cmebyc98v0009vjr16o3e7awo'; // From the review
  
  try {
    console.log('🗑️  PHASE 1: REMOVING ETFO-VIOLATING ARTS UNITS...\n');
    
    // Delete all related records first to avoid foreign key constraints
    await prisma.unitPlanExpectation.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: ARTS_LRP_ID
        }
      }
    });
    
    await prisma.unitPlanResource.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: ARTS_LRP_ID
        }
      }
    });
    
    await prisma.unitPlanTransferSkill.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: ARTS_LRP_ID
        }
      }
    });
    
    await prisma.eTFOLessonPlan.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: ARTS_LRP_ID
        }
      }
    });
    
    // Now delete the unit plans
    const deleteResult = await prisma.unitPlan.deleteMany({
      where: {
        longRangePlanId: ARTS_LRP_ID
      }
    });
    
    console.log(`✅ Deleted ${deleteResult.count} ETFO-violating Arts units`);
    
    console.log('\\n🎨 PHASE 2: CREATING 10 PERFECT ARTS UNITS (195 LESSONS)...\n');
    
    // Perfect Arts units with exact lesson counts and proper timing
    const perfectArtsUnits = [
      {
        title: 'Premiers pas artistiques',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-09-03', endDate: '2025-09-26',
        bigIdeas: 'L\'art nous permet d\'exprimer nos idées et émotions de façon créative et personnelle.',
        essentialQuestions: ['Comment créer?', 'Que représenter?', 'Comment m\'exprimer?'],
        description: 'Introduction joyeuse aux arts avec exploration des matériaux et premières créations.'
      },
      {
        title: 'L\'aventure des lignes et formes',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-09-29', endDate: '2025-10-24',
        bigIdeas: 'Les lignes et formes sont les éléments de base de toute création artistique.',
        essentialQuestions: ['Quelles sortes de lignes?', 'Comment les formes racontent?', 'Que créer?'],
        description: 'Exploration créative des lignes et formes avec applications automnales.'
      },
      {
        title: 'La magie des couleurs',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-10-27', endDate: '2025-11-21',
        bigIdeas: 'Les couleurs communiquent des émotions et créent l\'atmosphère dans nos œuvres.',
        essentialQuestions: ['Comment les couleurs parlent?', 'Que ressentir?', 'Comment mélanger?'],
        description: 'Découverte des couleurs primaires, mélanges et expressions émotionnelles.'
      },
      {
        title: 'Arts des fêtes hivernales',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-11-24', endDate: '2025-12-19',
        bigIdeas: 'L\'art célèbre nos traditions et unit nos communautés dans la joie.',
        essentialQuestions: ['Comment célébrer?', 'Que créer ensemble?', 'Comment décorer?'],
        description: 'Créations artistiques festives respectueuses de toutes les traditions.'
      },
      {
        title: 'Textures et matériaux',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2026-01-06', endDate: '2026-01-31',
        bigIdeas: 'Différents matériaux offrent différentes possibilités d\'expression artistique.',
        essentialQuestions: ['Que peut-on toucher?', 'Comment créer textures?', 'Quoi utiliser?'],
        description: 'Exploration tactile des matériaux artistiques et créations texturées.'
      },
      {
        title: 'Impression et motifs',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-02-02', endDate: '2026-02-27',
        bigIdeas: 'Les motifs répétitifs créent de la beauté et de l\'harmonie dans l\'art.',
        essentialQuestions: ['Comment répéter?', 'Que imprimer?', 'Quels motifs créer?'],
        description: 'Techniques d\'impression simples et création de motifs décoratifs.'
      },
      {
        title: 'Exploration 3D et sculpture',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-03-02', endDate: '2026-03-27',
        bigIdeas: 'L\'art tridimensionnel nous permet de créer des objets qui occupent l\'espace.',
        essentialQuestions: ['Comment modeler?', 'Que construire?', 'Comment tenir debout?'],
        description: 'Introduction à la sculpture avec matériaux sécuritaires et constructions créatives.'
      },
      {
        title: 'Art environnemental printanier',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-03-30', endDate: '2026-04-24',
        bigIdeas: 'La nature nous inspire et nous pouvons créer de l\'art respectueux de l\'environnement.',
        essentialQuestions: ['Comment la nature inspire?', 'Que créer dehors?', 'Comment respecter?'],
        description: 'Art nature avec matériaux naturels et sensibilisation environnementale.'
      },
      {
        title: 'Techniques artistiques avancées',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-04-27', endDate: '2026-05-22',
        bigIdeas: 'Maîtriser de nouvelles techniques nous donne plus d\'outils pour nous exprimer.',
        essentialQuestions: ['Comment améliorer technique?', 'Que maîtriser?', 'Comment enseigner?'],
        description: 'Perfectionnement des techniques apprises et introduction de nouvelles méthodes.'
      },
      {
        title: 'Notre galerie d\'art française',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-05-25', endDate: '2026-06-19',
        bigIdeas: 'Notre parcours artistique cette année mérite d\'être exposé et célébré.',
        essentialQuestions: ['Qu\'avons-nous créé?', 'Comment présenter?', 'Que célébrer?'],
        description: 'Organisation d\'exposition artistique et célébration des créations de l\'année.'
      }
    ];
    
    // Verify lesson count
    const totalLessons = perfectArtsUnits.reduce((sum, unit) => sum + unit.lessons, 0);
    const totalHours = perfectArtsUnits.reduce((sum, unit) => sum + unit.hours, 0);
    
    console.log(`Mathematical verification:`);
    console.log(`Total lessons: ${totalLessons} (Target: 195) ${totalLessons === 195 ? '✅' : '❌'}`);
    console.log(`Total hours: ${totalHours} (Target: ~146.25) ${Math.abs(totalHours - 146.25) < 1 ? '✅' : '❌'}\\n`);
    
    if (totalLessons !== 195) {
      throw new Error(`Lesson count error: ${totalLessons} instead of 195`);
    }
    
    // Create each perfect unit
    for (let i = 0; i < perfectArtsUnits.length; i++) {
      const unit = perfectArtsUnits[i];
      console.log(`Creating Unit ${i + 1}: ${unit.title} (${unit.lessons} lessons)...`);
      
      const duration = Math.ceil((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const weeks = duration / 7;
      
      console.log(`  Date range: ${unit.startDate} to ${unit.endDate} (${weeks.toFixed(1)} weeks)`);
      if (weeks > 4) {
        throw new Error(`ETFO violation: Unit ${i + 1} is ${weeks.toFixed(1)} weeks (>4 weeks)`);
      }
      
      const createdUnit = await prisma.unitPlan.create({
        data: {
          userId: EMILY_USER_ID,
          longRangePlanId: ARTS_LRP_ID,
          title: unit.title,
          titleFr: unit.title,
          description: `${unit.description}

🎨 STRUCTURE CORE + EXTENSION (${unit.lessons} leçons totales):
• Leçons essentielles: ${unit.core} (70% - techniques de base pour tous)
• Leçons d'extension: ${unit.extension} (30% - créations avancées/personnalisées)

Cette structure permet progression technique tout en encourageant créativité personnelle.`,
          descriptionFr: unit.description,
          bigIdeas: unit.bigIdeas,
          bigIdeasFr: unit.bigIdeas,
          essentialQuestions: unit.essentialQuestions,
          startDate: new Date(unit.startDate),
          endDate: new Date(unit.endDate),
          estimatedHours: unit.hours,
          
          // Perfect Assessment Plan for Arts
          assessmentPlan: `🎨 ÉVALUATION ARTISTIQUE APPROPRIÉE:

STRUCTURE TEMPORELLE (${unit.lessons} leçons = ${unit.hours} heures):
• ${unit.core} leçons essentielles (techniques de base obligatoires)
• ${unit.extension} leçons d'extension (exploration créative personnelle)

ÉVALUATION CRÉATIVE:
• Formatif: Observation du processus créatif quotidien
• Comme apprentissage: Portfolio artistique avec auto-réflection
• Sommatif: Présentation de créations avec explication du processus

PROGRESSION ARTISTIQUE GRADE 1:
1. Explorer matériaux en sécurité
2. Apprendre techniques de base
3. Expérimenter couleurs/formes/textures
4. Créer œuvres personnelles
5. Partager et expliquer créations
6. Apprécier art des autres

POINTS DE DÉCISION CRÉATIFS:
• Jour 3: Évaluation manipulation sécuritaire → ajuster matériaux
• Mi-parcours: Observation créativité → encourager exploration
• Fin d'unité: Célébration créations → documenter croissance artistique`,
          
          // Perfect Arts Differentiation
          differentiationStrategies: {
            forStruggling: `SOUTIEN ARTISTIQUE BIENVEILLANT:
• Focus sur ${unit.core} leçons essentielles avec guidance constante
• Matériaux simplifiés et choix réduits pour éviter surcharge
• Extensions utilisées pour pratique répétée des techniques
• Valorisation de chaque tentative créative
• Partenariat avec élève plus avancé pour encouragement`,
            
            forOnLevel: `PROGRESSION ARTISTIQUE ÉQUILIBRÉE:
• Complétion ${unit.core} essentielles + extensions créatives sélectionnées
• Autonomie croissante dans choix artistiques
• Expérimentation libre avec techniques apprises
• Partage et critique constructive avec pairs
• Portfolio personnalisé de créations favorites`,
            
            forAdvanced: `ENRICHISSEMENT ARTISTIQUE:
• Maîtrise rapide ${unit.core} essentielles
• Toutes ${unit.extension} extensions + projets personnels ambitieux
• Mentorship artistique pour autres élèves
• Exploration de techniques non-enseignées (supervisée)
• Leadership dans expositions et présentations`,
            
            forELL: `SOUTIEN ARTISTIQUE LINGUISTIQUE:
• Vocabulaire artistique avec supports visuels et gestes
• Démonstrations physiques plus que verbales
• Expression créative comme communication alternative
• Célébration de culture artistique d'origine
• Portfolio avec mots français et dessins explicatifs`
          },
          
          // Perfect Success Criteria for Arts
          successCriteria: {
            beginning: `ARTISTE DÉBUTANT:
• Explore matériaux avec curiosité et respect
• Suit consignes sécuritaires pour outils/matériaux
• Exprime plaisir pendant création
• Partage créations avec fierté croissante
• Respecte œuvres des autres élèves`,
            
            developing: `ARTISTE EN DÉVELOPPEMENT:
• Utilise techniques de base de façon appropriée
• Fait choix artistiques délibérés (couleurs, formes)
• Explique simplement son processus créatif
• Donne suggestions constructives aux pairs
• Montre persévérance devant défis créatifs`,
            
            proficient: `ARTISTE COMPÉTENT:
• Maîtrise techniques essentielles de façon autonome
• Crée œuvres personnelles expressives et originales
• Explique clairement intentions et techniques utilisées
• Apprécie et critique art de façon respectueuse
• Inspire créativité chez autres élèves`,
            
            extending: `ARTISTE AVANCÉ:
• Combine techniques multiples dans créations complexes
• Innove et expérimente au-delà des techniques enseignées
• Enseigne techniques aux pairs avec patience
• Propose idées créatives pour projets de classe
• Fait connexions entre art et autres matières`
          },
          
          // Arts-specific connections
          crossCurricularConnections: `🎨 INTÉGRATION ARTISTIQUE NATURELLE:
• Français: Vocabulaire artistique, descriptions d'œuvres, histoires illustrées
• Mathématiques: Formes géométriques, motifs, mesures dans créations
• Sciences: Couleurs (lumière), matériaux, propriétés physiques
• Social Studies: Art de différentes cultures, traditions artistiques
• Santé: Expression émotions, bien-être créatif, posture sécuritaire`,
          
          // Community connections for Arts
          communityConnections: `🌍 CONNEXIONS ARTISTIQUES COMMUNAUTAIRES:
• Artistes locaux invités pour démonstrations (si disponible)
• Visites de galeries ou centres artistiques communautaires
• Exposition d'art pour familles et communauté scolaire
• Projets artistiques collaboratifs avec autres classes
• Participation à concours artistiques locaux appropriés`,
          
          // Indigenous perspectives for Arts
          indigenousPerspectives: `🎨 PERSPECTIVES ARTISTIQUES MI'KMAQ:
Intégration respectueuse de traditions artistiques Mi'kmaq:
• Motifs et symboles traditionnels (avec permission d'Aînés)
• Techniques artisanales ancestrales adaptées pour Grade 1
• Histoire et signification des arts Mi'kmaq
• Matériaux naturels utilisés traditionnellement
• Respect pour dimension spirituelle de l'art autochtone

IMPORTANT: Collaboration avec communauté Mi'kmaq locale pour assurer authenticité et respect.`,
          
          // Parent communication for Arts
          parentCommunicationPlan: `👨‍👩‍👧‍👦 COMMUNICATION ARTISTIQUE FAMILIALE:
• Hebdomadaire: Photos de processus créatif (avec permission)
• Bi-mensuel: Créations envoyées à la maison avec explication
• Mensuel: Suggestions d'activités artistiques familiales simples
• Au besoin: Information sur matériaux utilisés (allergies, etc.)
• Évènement: Invitation à exposition d'art trimestrielle`,
          
          // Arts culminating task
          culminatingTask: `🎨 TÂCHE CULMINANTE ARTISTIQUE:

OPTION MINIMUM (Leçons essentielles complétées):
• Création finale utilisant technique préférée de l'unité
• Présentation courte (2 minutes) de l'œuvre aux pairs
• Ajout au portfolio personnel avec auto-réflection simple
• Participation à exposition de classe

OPTION COMPLÈTE (Toutes leçons + extensions):
• Œuvre complexe combinant plusieurs techniques de l'unité
• Présentation détaillée (5 minutes) incluant processus créatif
• Portfolio enrichi avec réflexions sur croissance artistique
• Leadership dans organisation d'exposition publique
• Création de carte d'artiste professionnelle

L'option choisie dépend de la maîtrise technique démontrée et de la confiance créative développée.`
        }
      });
      
      console.log(`  ✅ Created successfully (${weeks.toFixed(1)} weeks - ETFO compliant)`);
    }
    
    console.log('\\n🎉 PERFECT ARTS UNITS COMPLETED!');
    console.log('=' .repeat(80));
    console.log('✅ Maintained 195 lessons exactly');
    console.log('✅ FIXED: All units now 2-4 weeks (no ETFO violations)');
    console.log('✅ Complete pedagogical elements for daily skill building');
    console.log('✅ Grade 1 appropriate creative development');
    console.log('✅ French immersion ready with artistic vocabulary');
    console.log('✅ Built-in differentiation respecting all skill levels');
    console.log('✅ Indigenous artistic perspectives respectfully integrated');
    console.log('✅ Core + Extension flexibility for creative exploration');
    console.log('\\n🚀 READY FOR EMILY\'S INSPIRING ARTS CLASSROOM!');
    
  } catch (error) {
    console.error('Error creating perfect Arts units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectArtsUnitsManually();