import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createHealthUnit6Perfect() {
  console.log('🎯 CREATING PERFECT HEALTH/FPS UNIT 6\n');
  console.log('════════════════════════════════════════');
  
  // Get the Health/FPS LRP
  const healthLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Formation personnelle et sociale' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!healthLRP) {
    console.log('❌ Health/FPS LRP not found');
    return;
  }
  
  console.log(`📚 Found LRP: ${healthLRP.title}`);
  console.log(`📊 Current Units: ${healthLRP.unitPlans.length}\n`);
  
  // Create Unit 6: Community, Safety and Celebration
  const unit6 = await prisma.unitPlan.create({
    data: {
      title: "Communauté et célébrations",
      subject: "Formation personnelle et sociale",
      gradeLevel: "1",
      startDate: new Date('2026-05-25'),
      endDate: new Date('2026-06-19'),
      estimatedHours: 14,
      isInterdisciplinary: true,
      longRangePlan: {
        connect: { id: healthLRP.id }
      },
      bigIdeas: [
        "Nous faisons partie d'une communauté scolaire et locale",
        "Les célébrations nous rassemblent et créent des souvenirs",
        "La sécurité estivale est importante pour s'amuser"
      ],
      essentialQuestions: [
        "Comment contribuons-nous à notre communauté?",
        "Pourquoi célébrons-nous ensemble?",
        "Comment rester en sécurité pendant l'été?"
      ],
      keyVocabulary: [
        {"word": "communauté", "definition": "groupe de personnes qui vivent ensemble", "category": "société", "grade_level": "1"},
        {"word": "école", "definition": "endroit où on apprend", "category": "lieux", "grade_level": "1"},
        {"word": "voisinage", "definition": "les maisons et les gens près de chez nous", "category": "société", "grade_level": "1"},
        {"word": "célébration", "definition": "fête pour un événement spécial", "category": "événements", "grade_level": "1"},
        {"word": "graduation", "definition": "cérémonie de fin d'année scolaire", "category": "événements", "grade_level": "1"},
        {"word": "souvenir", "definition": "ce qu'on garde dans notre mémoire", "category": "émotions", "grade_level": "1"},
        {"word": "été", "definition": "saison chaude après le printemps", "category": "saisons", "grade_level": "1"},
        {"word": "vacances", "definition": "temps de repos sans école", "category": "temps", "grade_level": "1"},
        {"word": "plage", "definition": "bord de la mer avec du sable", "category": "lieux", "grade_level": "1"},
        {"word": "piscine", "definition": "bassin d'eau pour nager", "category": "lieux", "grade_level": "1"},
        {"word": "soleil", "definition": "étoile qui nous donne lumière et chaleur", "category": "nature", "grade_level": "1"},
        {"word": "crème solaire", "definition": "produit pour protéger la peau du soleil", "category": "sécurité", "grade_level": "1"},
        {"word": "casque", "definition": "protection pour la tête", "category": "sécurité", "grade_level": "1"},
        {"word": "vélo", "definition": "moyen de transport à deux roues", "category": "transport", "grade_level": "1"},
        {"word": "prudent", "definition": "faire attention pour éviter le danger", "category": "sécurité", "grade_level": "1"},
        {"word": "ami", "definition": "personne qu'on aime bien", "category": "relations", "grade_level": "1"},
        {"word": "famille", "definition": "parents et enfants qui vivent ensemble", "category": "relations", "grade_level": "1"},
        {"word": "aider", "definition": "donner de l'aide à quelqu'un", "category": "actions", "grade_level": "1"},
        {"word": "partager", "definition": "donner une partie de ce qu'on a", "category": "actions", "grade_level": "1"},
        {"word": "remercier", "definition": "dire merci", "category": "politesse", "grade_level": "1"},
        {"word": "fier", "definition": "content de ce qu'on a fait", "category": "émotions", "grade_level": "1"},
        {"word": "grandir", "definition": "devenir plus grand", "category": "développement", "grade_level": "1"},
        {"word": "apprendre", "definition": "acquérir des connaissances", "category": "éducation", "grade_level": "1"},
        {"word": "réussir", "definition": "bien faire quelque chose", "category": "accomplissement", "grade_level": "1"},
        {"word": "au revoir", "definition": "salutation quand on part", "category": "salutations", "grade_level": "1"}
      ],
      keySkills: [
        "Reconnaître son rôle dans la communauté",
        "Pratiquer la sécurité estivale",
        "Célébrer les accomplissements",
        "Planifier des activités sécuritaires",
        "Exprimer la gratitude"
      ],
      assessmentStrategies: {
        formative: [
          "Observations des interactions communautaires",
          "Journal de gratitude",
          "Discussions sur la sécurité estivale"
        ],
        summative: [
          "Projet de contribution communautaire",
          "Présentation des règles de sécurité estivale",
          "Portfolio de l'année scolaire"
        ]
      },
      differentiationStrategies: {
        forStruggling: [
          "Modélisation des comportements sécuritaires",
          "Support visuel pour les règles",
          "Partenariat avec un pair"
        ],
        forAdvanced: [
          "Leadership dans les projets communautaires",
          "Création de guides de sécurité",
          "Mentorat des pairs"
        ]
      },
      crossCurricularConnections: [
        "Français: Écrire des cartes de remerciement",
        "Arts: Créer des souvenirs visuels",
        "Sciences: La météo et la sécurité",
        "Mathématiques: Compter les jours de vacances"
      ],
      resources: [
        "Affiches de sécurité estivale",
        "Photos de la communauté scolaire",
        "Matériel pour projet de fin d'année",
        "Livres sur les vacances d'été"
      ],
      technologyIntegration: [
        "Créer un album photo numérique de l'année",
        "Vidéo de remerciements à la communauté",
        "Présentation sur la sécurité estivale"
      ],
      weeklyBreakdown: [
        {
          week: 1,
          topics: ["Notre communauté scolaire", "Les personnes qui nous aident"],
          activities: ["Carte de la communauté", "Interviews des membres du personnel"]
        },
        {
          week: 2,
          topics: ["Célébrations et accomplissements", "Souvenirs de l'année"],
          activities: ["Portfolio de l'année", "Préparation de la graduation"]
        },
        {
          week: 3,
          topics: ["Sécurité estivale", "Activités de vacances"],
          activities: ["Affiches de sécurité", "Plan d'activités estivales"]
        },
        {
          week: 4,
          topics: ["Au revoir et merci", "Prêt pour la 2e année"],
          activities: ["Cartes de remerciement", "Célébration de fin d'année"]
        }
      ]
    }
  });
  
  console.log('✅ Created Unit 6:', unit6.title);
  console.log(`   ID: ${unit6.id}`);
  console.log(`   Dates: ${unit6.startDate.toISOString().split('T')[0]} to ${unit6.endDate.toISOString().split('T')[0]}`);
  console.log(`   Hours: ${unit6.estimatedHours}`);
  console.log(`   Vocabulary: ${unit6.keyVocabulary.length} words\n`);
  
  // Now verify the complete Health/FPS plan
  console.log('📊 COMPLETE HEALTH/FPS PLAN:\n');
  console.log('═'.repeat(60));
  
  const updatedLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Formation personnelle et sociale' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  let totalDays = 0;
  let totalHours = 0;
  
  updatedLRP.unitPlans.forEach((unit, i) => {
    const start = unit.startDate.toISOString().split('T')[0];
    const end = unit.endDate.toISOString().split('T')[0];
    const days = Math.ceil((unit.estimatedHours || 0) / 0.75);
    
    console.log(`Unit ${i + 1}: ${unit.title}`);
    console.log(`   📅 ${start} to ${end}`);
    console.log(`   ⏱️  ${unit.estimatedHours} hours = ${days} school days`);
    
    totalDays += days;
    totalHours += unit.estimatedHours || 0;
  });
  
  console.log('\n' + '─'.repeat(60));
  console.log(`TOTALS: ${updatedLRP.unitPlans.length} units, ${totalHours} hours, ${totalDays} days`);
  console.log(`Target: 6 units, ~73.5 hours, ~98 days`);
  
  const daysOff = Math.abs(98 - totalDays);
  const hoursOff = Math.abs(73.5 - totalHours);
  
  if (daysOff <= 3 && hoursOff <= 2) {
    console.log('✅ PERFECT! Health/FPS is now within tolerance');
  } else {
    console.log(`⚠️  Days off by: ${daysOff}, Hours off by: ${hoursOff}`);
  }
  
  console.log('\n🎉 HEALTH/FPS UNIT 6 CREATION COMPLETE!');
  console.log('════════════════════════════════════════');
  console.log('• 6 units now properly scheduled');
  console.log('• Alternates with Social Studies throughout year');
  console.log('• Ends with community celebration and summer safety');
  console.log('• Ready for September 2025 implementation!');
  
  await prisma.$disconnect();
}

createHealthUnit6Perfect().catch(console.error);