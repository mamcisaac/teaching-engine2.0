#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCrossCurricularToLRPs() {
  console.log('🔗 Adding Cross-Curricular Connections to Long-Range Plans\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) throw new Error('Emily not found');
  
  // Define cross-curricular connections for each subject
  const crossCurricularConnections = {
    'Français (Immersion)': {
      'Mathématiques': 'Number vocabulary, counting rhymes, word problems, mathematical language in French',
      'Sciences de la nature': 'Nature vocabulary, observation journals, scientific descriptions, environmental texts',
      'Sciences humaines': 'Community vocabulary, cultural stories, historical narratives, citizenship language',
      'Arts visuels': 'Visual literacy, illustrated stories, art descriptions, creative writing with visuals',
      'Formation personnelle et sociale': 'Emotion vocabulary, social language, conflict resolution dialogues, wellness journals'
    },
    'Mathématiques': {
      'Français (Immersion)': 'Mathematical vocabulary in French, oral problem explanations, number stories',
      'Sciences de la nature': 'Data collection, measurement in experiments, patterns in nature, graphing observations',
      'Sciences humaines': 'Time concepts, dates, mapping, demographics, community statistics',
      'Arts visuels': 'Geometric art, patterns in design, symmetry, proportions in art',
      'Formation personnelle et sociale': 'Fair sharing concepts, taking turns, growth tracking, wellness statistics'
    },
    'Sciences de la nature': {
      'Français (Immersion)': 'Science vocabulary, observation reports, hypothesis writing, nature journals',
      'Mathématiques': 'Measuring, counting specimens, graphing data, analyzing patterns',
      'Sciences humaines': 'Human-environment interaction, seasonal traditions, environmental citizenship',
      'Arts visuels': 'Scientific drawing, nature art, observational sketching, environmental art',
      'Formation personnelle et sociale': 'Safety procedures, health habits, environmental responsibility, body awareness'
    },
    'Sciences humaines': {
      'Français (Immersion)': 'Community stories, interviews, cultural narratives, citizenship vocabulary',
      'Mathématiques': 'Timelines, maps with scale, population data, calendar systems',
      'Sciences de la nature': 'Environment and community, seasonal impacts, natural resources',
      'Arts visuels': 'Cultural art, community murals, historical illustrations, identity expression',
      'Formation personnelle et sociale': 'Rights and responsibilities, identity development, social roles, citizenship'
    },
    'Arts visuels': {
      'Français (Immersion)': 'Art vocabulary, artist statements, critiques, storytelling through art',
      'Mathématiques': 'Shapes and forms, patterns, symmetry, proportions, measuring for art',
      'Sciences de la nature': 'Nature drawing, scientific illustration, environmental art, seasonal art',
      'Sciences humaines': 'Cultural art traditions, community projects, historical art, identity expression',
      'Formation personnelle et sociale': 'Self-expression, emotions through art, therapeutic art, identity exploration'
    },
    'Formation personnelle et sociale': {
      'Français (Immersion)': 'Social vocabulary, feelings journal, communication skills, story sharing',
      'Mathématiques': 'Growth charts, fair sharing problems, time management, wellness tracking',
      'Sciences de la nature': 'Body systems, health habits, environmental wellness, nature and wellbeing',
      'Sciences humaines': 'Community roles, citizenship, cultural identity, social responsibility',
      'Arts visuels': 'Identity expression through art, emotion in color, self-portraits, feelings collage'
    }
  };
  
  // Update each LRP
  for (const [subject, connections] of Object.entries(crossCurricularConnections)) {
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject
      }
    });
    
    if (lrp) {
      await prisma.longRangePlan.update({
        where: { id: lrp.id },
        data: {
          crossCurricularConnections: connections
        }
      });
      console.log(`✅ Updated ${subject}`);
    } else {
      console.log(`⚠️ ${subject} LRP not found`);
    }
  }
  
  // Verify updates
  console.log('\n=== VERIFICATION ===\n');
  
  const updatedLRPs = await prisma.longRangePlan.findMany({
    where: { userId: emily.id },
    select: {
      subject: true,
      crossCurricularConnections: true
    }
  });
  
  let withConnections = 0;
  updatedLRPs.forEach(lrp => {
    const hasConnections = lrp.crossCurricularConnections && 
                          Object.keys(lrp.crossCurricularConnections as any).length > 0;
    if (hasConnections) {
      withConnections++;
      console.log(`✅ ${lrp.subject}: ${Object.keys(lrp.crossCurricularConnections as any).length} connections`);
    } else {
      console.log(`❌ ${lrp.subject}: No connections`);
    }
  });
  
  console.log(`\nSUMMARY: ${withConnections}/${updatedLRPs.length} LRPs now have cross-curricular connections`);
  
  await prisma.$disconnect();
}

addCrossCurricularToLRPs()
  .then(() => console.log('\n✅ Phase 1 Complete!'))
  .catch(console.error);