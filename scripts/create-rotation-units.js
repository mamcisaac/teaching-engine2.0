import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function createRotationUnits() {
  console.log('Creating new rotation-based unit plans...');
  
  // Get Emily's ID
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    throw new Error('Emily not found');
  }
  
  // Get long range plans
  const longRangePlans = await prisma.longRangePlan.findMany({
    where: { userId: emily.id }
  });
  
  const lrpMap = {};
  longRangePlans.forEach(lrp => {
    lrpMap[lrp.subject] = lrp.id;
  });
  
  // Define new rotation-based units with proper 2-3 week durations
  const newUnits = [
    // FRENCH - Continuous through year (8 units)
    {
      title: "September French Foundations",
      titleFr: "Fondations de septembre",
      longRangePlanId: lrpMap['Français (Immersion)'],
      startDate: new Date('2025-09-04'),
      endDate: new Date('2025-09-30'),
      estimatedHours: 25,
      subject: 'Français (Immersion)'
    },
    {
      title: "October Vocabulary Building",
      titleFr: "Vocabulaire d'octobre",
      longRangePlanId: lrpMap['Français (Immersion)'],
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-31'),
      estimatedHours: 25,
      subject: 'Français (Immersion)'
    },
    {
      title: "November Reading Skills",
      titleFr: "Lecture de novembre",
      longRangePlanId: lrpMap['Français (Immersion)'],
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-30'),
      estimatedHours: 25,
      subject: 'Français (Immersion)'
    },
    {
      title: "December Holiday Stories",
      titleFr: "Contes de décembre",
      longRangePlanId: lrpMap['Français (Immersion)'],
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-19'),
      estimatedHours: 20,
      subject: 'Français (Immersion)'
    },
    {
      title: "January Writing Practice",
      titleFr: "Écriture de janvier",
      longRangePlanId: lrpMap['Français (Immersion)'],
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-01-31'),
      estimatedHours: 25,
      subject: 'Français (Immersion)'
    },
    {
      title: "February Speaking Focus",
      titleFr: "Expression orale de février",
      longRangePlanId: lrpMap['Français (Immersion)'],
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-28'),
      estimatedHours: 25,
      subject: 'Français (Immersion)'
    },
    {
      title: "Spring Language Arts",
      titleFr: "Arts du langage au printemps",
      longRangePlanId: lrpMap['Français (Immersion)'],
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-04-30'),
      estimatedHours: 30,
      subject: 'Français (Immersion)'
    },
    {
      title: "Year-End Celebration",
      titleFr: "Célébration de fin d'année",
      longRangePlanId: lrpMap['Français (Immersion)'],
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-06-20'),
      estimatedHours: 25,
      subject: 'Français (Immersion)'
    },
    
    // MATH - Continuous through year (8 units)
    {
      title: "Numbers to 20",
      titleFr: "Nombres jusqu'à 20",
      longRangePlanId: lrpMap['Mathématiques'],
      startDate: new Date('2025-09-04'),
      endDate: new Date('2025-09-30'),
      estimatedHours: 25,
      subject: 'Mathématiques'
    },
    {
      title: "Patterns and Sorting",
      titleFr: "Régularités et tri",
      longRangePlanId: lrpMap['Mathématiques'],
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-31'),
      estimatedHours: 25,
      subject: 'Mathématiques'
    },
    {
      title: "Addition Basics",
      titleFr: "Addition de base",
      longRangePlanId: lrpMap['Mathématiques'],
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-30'),
      estimatedHours: 25,
      subject: 'Mathématiques'
    },
    {
      title: "Subtraction Basics",
      titleFr: "Soustraction de base",
      longRangePlanId: lrpMap['Mathématiques'],
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-19'),
      estimatedHours: 20,
      subject: 'Mathématiques'
    },
    {
      title: "Measurement Exploration",
      titleFr: "Exploration de la mesure",
      longRangePlanId: lrpMap['Mathématiques'],
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-01-31'),
      estimatedHours: 25,
      subject: 'Mathématiques'
    },
    {
      title: "Geometry Shapes",
      titleFr: "Formes géométriques",
      longRangePlanId: lrpMap['Mathématiques'],
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-28'),
      estimatedHours: 25,
      subject: 'Mathématiques'
    },
    {
      title: "Problem Solving",
      titleFr: "Résolution de problèmes",
      longRangePlanId: lrpMap['Mathématiques'],
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-04-30'),
      estimatedHours: 25,
      subject: 'Mathématiques'
    },
    {
      title: "Math Review and Games",
      titleFr: "Révision et jeux mathématiques",
      longRangePlanId: lrpMap['Mathématiques'],
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-06-20'),
      estimatedHours: 25,
      subject: 'Mathématiques'
    },
    
    // ROTATION UNITS - 2-3 weeks each
    
    // September Rotation: Science (2 weeks)
    {
      title: "Our School Environment",
      titleFr: "Notre environnement scolaire",
      longRangePlanId: lrpMap['Sciences de la nature'],
      startDate: new Date('2025-09-08'),
      endDate: new Date('2025-09-19'),
      estimatedHours: 10,
      subject: 'Sciences de la nature'
    },
    
    // October Rotation: Social Studies (2 weeks) then Science (2 weeks)
    {
      title: "My Family and Community",
      titleFr: "Ma famille et ma communauté",
      longRangePlanId: lrpMap['Sciences humaines'],
      startDate: new Date('2025-10-06'),
      endDate: new Date('2025-10-17'),
      estimatedHours: 10,
      subject: 'Sciences humaines'
    },
    {
      title: "Fall Changes in Nature",
      titleFr: "Changements d'automne",
      longRangePlanId: lrpMap['Sciences de la nature'],
      startDate: new Date('2025-10-20'),
      endDate: new Date('2025-10-31'),
      estimatedHours: 10,
      subject: 'Sciences de la nature'
    },
    
    // November Rotation: Arts (2 weeks) then Health (2 weeks)
    {
      title: "Discovering Art",
      titleFr: "Découvrir l'art",
      longRangePlanId: lrpMap['Arts visuels'],
      startDate: new Date('2025-11-03'),
      endDate: new Date('2025-11-14'),
      estimatedHours: 10,
      subject: 'Arts visuels'
    },
    {
      title: "Healthy Habits",
      titleFr: "Habitudes saines",
      longRangePlanId: lrpMap['Formation personnelle et sociale'],
      startDate: new Date('2025-11-17'),
      endDate: new Date('2025-11-28'),
      estimatedHours: 10,
      subject: 'Formation personnelle et sociale'
    },
    
    // December Rotation: Arts (3 weeks for winter celebrations)
    {
      title: "Winter Celebration Art",
      titleFr: "Art des célébrations d'hiver",
      longRangePlanId: lrpMap['Arts visuels'],
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-19'),
      estimatedHours: 15,
      subject: 'Arts visuels'
    },
    
    // January Rotation: Science (2 weeks)
    {
      title: "Winter Science",
      titleFr: "Sciences d'hiver",
      longRangePlanId: lrpMap['Sciences de la nature'],
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-01-16'),
      estimatedHours: 10,
      subject: 'Sciences de la nature'
    },
    
    // February Rotation: Health (2 weeks)
    {
      title: "Safety and Emotions",
      titleFr: "Sécurité et émotions",
      longRangePlanId: lrpMap['Formation personnelle et sociale'],
      startDate: new Date('2026-02-02'),
      endDate: new Date('2026-02-13'),
      estimatedHours: 10,
      subject: 'Formation personnelle et sociale'
    },
    
    // March Rotation: Science (2 weeks)
    {
      title: "Growing and Changing",
      titleFr: "Grandir et changer",
      longRangePlanId: lrpMap['Sciences de la nature'],
      startDate: new Date('2026-03-02'),
      endDate: new Date('2026-03-13'),
      estimatedHours: 10,
      subject: 'Sciences de la nature'
    },
    
    // April Rotation: Social Studies (2 weeks)
    {
      title: "Digital Citizenship",
      titleFr: "Citoyenneté numérique",
      longRangePlanId: lrpMap['Sciences humaines'],
      startDate: new Date('2026-04-06'),
      endDate: new Date('2026-04-17'),
      estimatedHours: 10,
      subject: 'Sciences humaines'
    },
    
    // May Rotation: Science (2 weeks)
    {
      title: "Spring in Our World",
      titleFr: "Le printemps dans notre monde",
      longRangePlanId: lrpMap['Sciences de la nature'],
      startDate: new Date('2026-05-04'),
      endDate: new Date('2026-05-15'),
      estimatedHours: 10,
      subject: 'Sciences de la nature'
    }
  ];
  
  // Create all new units
  console.log(`Creating ${newUnits.length} new rotation-based units...`);
  
  const createdUnits = [];
  for (const unit of newUnits) {
    const created = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        title: unit.title,
        titleFr: unit.titleFr,
        longRangePlanId: unit.longRangePlanId,
        startDate: unit.startDate,
        endDate: unit.endDate,
        estimatedHours: unit.estimatedHours,
        description: `${unit.subject} unit for rotation model`,
        bigIdeas: `Grade 1 ${unit.subject} concepts`,
        essentialQuestions: [`What will we learn about ${unit.title.toLowerCase()}?`]
      }
    });
    createdUnits.push(created);
    console.log(`✓ Created: ${unit.subject} - ${unit.title}`);
  }
  
  console.log(`\n✅ Successfully created ${createdUnits.length} rotation-based units`);
  
  // Summary by subject
  const subjectCounts = {};
  newUnits.forEach(unit => {
    subjectCounts[unit.subject] = (subjectCounts[unit.subject] || 0) + 1;
  });
  
  console.log('\nUnits by subject:');
  Object.entries(subjectCounts).forEach(([subject, count]) => {
    console.log(`  ${subject}: ${count} units`);
  });
  
  return createdUnits;
}

createRotationUnits()
  .catch(console.error)
  .finally(() => prisma.$disconnect());