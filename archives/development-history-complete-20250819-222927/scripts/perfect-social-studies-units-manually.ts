import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectSocialStudiesUnitsManually() {
  console.log('🌍 CREATING PERFECT SOCIAL STUDIES UNITS MANUALLY\n');
  console.log('='.repeat(80));
  console.log('Core + Extension Model: 97 lessons exactly (alternating schedule)');
  console.log('Grade 1 appropriate with complete pedagogical elements');
  console.log('ETFO compliant: All units 2-4 weeks\n');
  
  const EMILY_USER_ID = 23;
  const SOCIAL_STUDIES_LRP_ID = 'cmebyc98s0007vjr1v0a2ibp5'; // Sciences humaines from database
  
  try {
    console.log('🗑️  PHASE 1: REMOVING ETFO-VIOLATING SOCIAL STUDIES UNITS...\n');
    
    // Delete all related records first to avoid foreign key constraints
    await prisma.unitPlanExpectation.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: SOCIAL_STUDIES_LRP_ID
        }
      }
    });
    
    await prisma.unitPlanResource.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: SOCIAL_STUDIES_LRP_ID
        }
      }
    });
    
    await prisma.unitPlanTransferSkill.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: SOCIAL_STUDIES_LRP_ID
        }
      }
    });
    
    await prisma.eTFOLessonPlan.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: SOCIAL_STUDIES_LRP_ID
        }
      }
    });
    
    // Now delete the unit plans
    const deleteResult = await prisma.unitPlan.deleteMany({
      where: {
        longRangePlanId: SOCIAL_STUDIES_LRP_ID
      }
    });
    
    console.log(`✅ Deleted ${deleteResult.count} ETFO-violating Social Studies units`);
    
    console.log('\n🌍 PHASE 2: CREATING 5 PERFECT SOCIAL STUDIES UNITS (97 LESSONS)...\n');
    
    // Perfect Social Studies units with exact lesson counts
    const perfectSocialStudiesUnits = [
      {
        title: 'Moi et mon école',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-09-04', endDate: '2025-09-25',
        bigIdeas: 'L\'école est un lieu spécial où nous apprenons, grandissons et créons des amitiés précieuses.',
        essentialQuestions: ['Qui suis-je à l\'école?', 'Comment apprendre ensemble?', 'Que découvrir ici?'],
        description: 'Exploration sécuritaire de l\'école avec création d\'identité scolaire positive.',
        safetyFocus: 'Règles de sécurité scolaire, déplacements sécuritaires, signalement approprié.'
      },
      {
        title: 'Ma famille et mon foyer',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-10-02', endDate: '2025-10-23',
        bigIdeas: 'Chaque famille est unique et précieuse, avec ses propres traditions et façons de vivre.',
        essentialQuestions: ['Qui forme ma famille?', 'Comment vivre ensemble?', 'Que rend ma famille spéciale?'],
        description: 'Célébration respectueuse de la diversité familiale avec protection de la vie privée.',
        safetyFocus: 'Respect de la vie privé familiale, signalement de situations préoccupantes, sécurité personnelle.'
      },
      {
        title: 'Notre communauté automnale',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-10-28', endDate: '2025-11-20',
        bigIdeas: 'Notre communauté nous offre des services essentiels et des lieux importants pour notre bien-être.',
        essentialQuestions: ['Qui nous aide?', 'Où aller en cas de besoin?', 'Comment contribuer?'],
        description: 'Exploration des services communautaires avec identification des personnes ressources.',
        safetyFocus: 'Identification des personnes d\'aide sécuritaires, numéros d\'urgence, lieux sûrs dans la communauté.'
      },
      {
        title: 'Célébrations et traditions hivernales',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2025-12-01', endDate: '2025-12-19',
        bigIdeas: 'Les célébrations unissent nos communautés et nous connectent à nos cultures et traditions.',
        essentialQuestions: ['Comment célébrer ensemble?', 'Que partager de nos traditions?', 'Comment respecter les différences?'],
        description: 'Exploration respectueuse des traditions culturelles avec inclusion de toutes les familles.',
        safetyFocus: 'Respect des croyances diverses, inclusion de tous, signalement d\'exclusion ou intimidation.'
      },
      {
        title: 'Notre quartier et voisinage',
        lessons: 18, hours: 13.5, core: 12, extension: 6,
        startDate: '2026-01-07', endDate: '2026-02-03',
        bigIdeas: 'Nous faisons partie d\'un quartier avec des voisins, des lieux spéciaux et une histoire unique.',
        essentialQuestions: ['Où habitons-nous?', 'Qui sont nos voisins?', 'Comment être un bon citoyen?'],
        description: 'Exploration géographique sécuritaire du quartier avec développement du sens civique.',
        safetyFocus: 'Sécurité dans le quartier, reconnaissance des limites personnelles, signalement de dangers.'
      }
    ];
    
    // Verify lesson count
    const totalLessons = perfectSocialStudiesUnits.reduce((sum, unit) => sum + unit.lessons, 0);
    const totalHours = perfectSocialStudiesUnits.reduce((sum, unit) => sum + unit.hours, 0);
    
    console.log(`Mathematical verification:`);
    console.log(`Total lessons: ${totalLessons} (Target: 97) ${totalLessons === 97 ? '✅' : '❌'}`);
    console.log(`Total hours: ${totalHours} (Target: ~72.75) ${Math.abs(totalHours - 72.75) < 1 ? '✅' : '❌'}\n`);
    
    if (totalLessons !== 97) {
      throw new Error(`Lesson count error: ${totalLessons} instead of 97`);
    }
    
    // Create each perfect unit
    for (let i = 0; i < perfectSocialStudiesUnits.length; i++) {
      const unit = perfectSocialStudiesUnits[i];
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
          longRangePlanId: SOCIAL_STUDIES_LRP_ID,
          title: unit.title,
          titleFr: unit.title,
          description: `${unit.description}

🌍 STRUCTURE CORE + EXTENSION (${unit.lessons} leçons totales):
• Leçons essentielles: ${unit.core} (70% - concepts fondamentaux pour tous)
• Leçons d'extension: ${unit.extension} (30% - approfondissement/projets personnalisés)

👨‍👩‍👧‍👦 SÉCURITÉ FAMILIALE ET COMMUNAUTAIRE:
${unit.safetyFocus}

Cette structure respecte la diversité tout en développant le sens d'appartenance communautaire.`,
          descriptionFr: unit.description,
          bigIdeas: unit.bigIdeas,
          bigIdeasFr: unit.bigIdeas,
          essentialQuestions: unit.essentialQuestions,
          startDate: new Date(unit.startDate),
          endDate: new Date(unit.endDate),
          estimatedHours: unit.hours,
          
          // Perfect Assessment Plan for Social Studies
          assessmentPlan: `🌍 ÉVALUATION SOCIALE RESPECTUEUSE ET SÉCURITAIRE:

STRUCTURE TEMPORELLE (${unit.lessons} leçons = ${unit.hours} heures):
• ${unit.core} leçons essentielles (concepts de base obligatoires)
• ${unit.extension} leçons d'extension (projets personnalisés et créatifs)

👨‍👩‍👧‍👦 PROTECTION DE LA VIE PRIVÉE:
${unit.safetyFocus}

ÉVALUATION SENSIBLE AUX CULTURES:
• Formatif: Observations respectueuses des interactions sociales
• Comme apprentissage: Réflexions avec choix de partage personnel
• Sommatif: Projets permettant expression culturelle authentique

CITOYENNETÉ GRADE 1:
1. Respecter les différences avec curiosité bienveillante
2. Identifier des personnes d'aide sécuritaires
3. Participer à la vie de classe et d'école
4. Exprimer besoins et sentiments de façon appropriée
5. Contribuer positivement au bien-être collectif
6. Célébrer diversité comme richesse communautaire

POINTS DE DÉCISION SÉCURITAIRES:
• Jour 3: Évaluation sensibilité culturelle → ajuster approches si nécessaire
• Mi-parcours: Vérification inclusion de tous → intervenir pour égalité
• Fin d'unité: Célébration communautaire → renforcer appartenance positive`,
          
          // Perfect Social Studies Differentiation with safety
          differentiationStrategies: {
            forStruggling: `SOUTIEN SOCIAL ADAPTÉ:
• Focus sur ${unit.core} leçons essentielles avec supports visuels
• Partenariat avec pairs bienveillants pour inclusion
• Extensions utilisées pour renforcer concepts sociaux de base
• Expression par dessins, gestes, choix multiples
• Validation constante de la valeur personnelle et culturelle`,
            
            forOnLevel: `DÉVELOPPEMENT SOCIAL ÉQUILIBRÉ:
• Complétion ${unit.core} essentielles + extensions communautaires
• Leadership rotatif dans projets de classe
• Applications créatives des concepts citoyens
• Développement d'empathie et résolution de conflits
• Portfolio de contributions communautaires`,
            
            forAdvanced: `LEADERSHIP SOCIAL POSITIF:
• Maîtrise rapide ${unit.core} essentielles
• Toutes ${unit.extension} extensions + projets de service communautaire
• Mentorat social pour inclusion de tous les élèves
• Recherche sur diversité culturelle avec présentation
• Initiatives d'amélioration de la vie scolaire`,
            
            forELL: `INCLUSION CULTURELLE RESPECTUEUSE:
• Vocabulaire social avec supports visuels multilingues
• Célébration active de la culture d'origine
• Connexions entre traditions familiales et canadiennes
• Expression culturelle comme contribution précieuse
• Partenariat linguistique avec pairs francophones`
          },
          
          // Perfect Success Criteria for Social Studies
          successCriteria: {
            beginning: `CITOYEN DÉBUTANT:
• Respecte les différences avec curiosité bienveillante
• Participe aux activités communautaires avec encouragement
• Identifie quelques personnes d'aide à l'école
• Exprime besoins de base de façon appropriée
• Montre fierté de sa famille et culture`,
            
            developing: `CITOYEN EN DÉVELOPPEMENT:
• Démontre empathie envers pairs de cultures différentes
• Contribue activement au bien-être de la classe
• Explique rôles de personnes d'aide communautaires
• Résout conflits simples avec aide d'adulte
• Partage traditions familiales avec respect des autres`,
            
            proficient: `CITOYEN COMPÉTENT:
• Promeut inclusion et équité naturellement
• Prend initiatives pour améliorer vie communautaire
• Utilise ressources communautaires de façon autonome
• Résout la plupart des conflits de façon pacifique
• Célèbre diversité comme richesse collective`,
            
            extending: `LEADER COMMUNAUTAIRE:
• Inspire respect et inclusion chez autres élèves
• Crée projets innovants d'amélioration communautaire
• Enseigne concepts sociaux aux pairs avec patience
• Médie conflits complexes avec succès
• Fait pont entre cultures avec sensibilité exceptionnelle`
          },
          
          // Social Studies specific connections
          crossCurricularConnections: `🌍 INTÉGRATION SOCIALE NATURELLE:
• Français: Vocabulaire communautaire, récits familiaux, présentations culturelles
• Mathématiques: Dénombrement, graphiques de préférences, mesures dans la communauté
• Arts: Expressions culturelles, créations communautaires, célébrations artistiques
• Sciences: Environnement local, ressources naturelles, impact humain
• Santé: Bien-être communautaire, sécurité personnelle, relations saines`,
          
          // Community connections for Social Studies
          communityConnections: `🏘️ CONNEXIONS COMMUNAUTAIRES AUTHENTIQUES:
• Personnes ressources invitées (pompiers, police, bibliothécaires)
• Sorties sécuritaires dans le quartier selon météo
• Partenariats avec centres communautaires locaux
• Projets de service adapté à l'âge (collectes, cartes)
• Célébrations culturelles communautaires inclusives`,
          
          // Indigenous perspectives for Social Studies
          indigenousPerspectives: `🍃 PERSPECTIVES MI'KMAQ RESPECTUEUSES:
Reconnaissance territoriale adaptée à l'âge et intégration respectueuse des perspectives Mi'kmaq:
• Premiers peuples de cette terre et leur histoire de vie ici
• Concepts Mi'kmaq de communauté et respect mutuel
• Traditions de partage et de soin collectif
• Relation respectueuse avec la terre et les ressources
• Contributions continues des peuples Mi'kmaq à nos communautés

IMPORTANT: Collaboration avec communauté Mi'kmaq locale pour assurer authenticité, respect et appropriateness culturelle.`,
          
          // Parent communication for Social Studies
          parentCommunicationPlan: `👨‍👩‍👧‍👦 COMMUNICATION FAMILIALE RESPECTUEUSE:
• Hebdomadaire: Photos d'activités communautaires (avec permission)
• Bi-mensuel: Suggestions d'exploration communautaire familiale
• Mensuel: Célébration des contributions culturelles familiales
• Au besoin: Communication sensible sur sujets sociaux délicats
• Ressources: Guide des services communautaires pour familles`,
          
          // Social Studies culminating task
          culminatingTask: `🌍 TÂCHE CULMINANTE SOCIALE INCLUSIVE:

OPTION MINIMUM (Leçons essentielles complétées):
• Présentation (3 minutes) de sa famille/culture avec fierté
• Portfolio simple de contributions communautaires
• Participation à événement communautaire scolaire
• Identification de personnes d'aide dans la communauté

OPTION COMPLÈTE (Toutes leçons + extensions):
• Projet créatif sur diversité et inclusion communautaire
• Présentation enrichie (5 minutes) aux familles et communauté
• Portfolio détaillé avec réflexions sur citoyenneté
• Organisation d'événement culturel inclusif pour l'école
• Création de ressource pour futurs élèves sur leur communauté

👨‍👩‍👧‍👦 SÉCURITÉ ABSOLUE: Toutes présentations respectent vie privée familiale, célèbrent diversité, promeuvent inclusion sans forcer partage personnel.

L'option choisie respecte le niveau de confort familial et culturel tout en développant fierté d'appartenance communautaire.`
        }
      });
      
      console.log(`  ✅ Created successfully (${weeks.toFixed(1)} weeks - ETFO compliant)`);
    }
    
    console.log('\n🎉 PERFECT SOCIAL STUDIES UNITS COMPLETED!');
    console.log('='.repeat(80));
    console.log('✅ Maintained 97 lessons exactly (alternating schedule)');
    console.log('✅ FIXED: All units now 2-4 weeks (no ETFO violations)');
    console.log('✅ Complete pedagogical elements for community awareness');
    console.log('✅ Grade 1 appropriate social development');
    console.log('✅ French immersion ready with social vocabulary');
    console.log('✅ Built-in safety protocols for family privacy');
    console.log('✅ Indigenous perspectives respectfully integrated');
    console.log('✅ Core + Extension flexibility for diverse communities');
    console.log('\n🚀 READY FOR EMILY\'S INCLUSIVE SOCIAL STUDIES CLASSROOM!');
    
  } catch (error) {
    console.error('Error creating perfect Social Studies units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectSocialStudiesUnitsManually();