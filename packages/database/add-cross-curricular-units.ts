#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCrossCurricularToUnits() {
  console.log('🔗 Adding Cross-Curricular Connections to Unit Plans\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) throw new Error('Emily not found');
  
  // Define cross-curricular connections for each unit
  const unitConnections = {
    // Sciences humaines units
    'Ma famille et notre classe': `
**Français langue première**: Family vocabulary, personal narratives, interview skills, sharing family stories
**Mathématiques**: Family trees, counting family members, comparing family sizes, birthday calendars
**Arts visuels**: Family portraits, self-portraits, classroom community mural, identity collages
**Formation personnelle et sociale**: Personal identity, belonging, respect for diversity, emotional connections
**Sciences de la nature**: Life cycles, growth in families, heredity basics, family pets and plants`,
    
    'Nos droits et responsabilités': `
**Français langue première**: Rights vocabulary, responsibility language, classroom charter writing, discussion skills
**Mathématiques**: Fair sharing problems, equal distribution, voting and graphing results, time for responsibilities
**Arts visuels**: Rights posters, responsibility badges, classroom rules illustrations, community helper portraits
**Formation personnelle et sociale**: Personal boundaries, respect for others, conflict resolution, empathy development
**Sciences de la nature**: Environmental responsibilities, caring for living things, habitat protection`,
    
    'Mon histoire dans le temps': `
**Français langue première**: Past tense introduction, timeline vocabulary, personal history narratives, interviewing elders
**Mathématiques**: Timeline creation, counting days/months/years, sequencing events, calendar skills
**Arts visuels**: Then and now drawings, historical illustrations, memory books, time capsules
**Formation personnelle et sociale**: Personal growth awareness, family traditions, cultural identity, change acceptance
**Sciences de la nature**: Seasonal changes over time, life cycles, growth patterns, environmental changes`,
    
    'Explorer notre monde': `
**Français langue première**: Geographic vocabulary, describing places, travel journals, world stories
**Mathématiques**: Maps and scales, distance concepts, directional language, comparing sizes
**Sciences de la nature**: Different environments, climate zones, animal habitats, natural resources
**Arts visuels**: Map making, landscape art, cultural art from different places, travel posters
**Formation personnelle et sociale**: Global citizenship, cultural appreciation, environmental stewardship`,
    
    'Citoyens numériques responsables': `
**Français langue première**: Digital vocabulary, online communication, digital storytelling, media literacy
**Mathématiques**: Screen time tracking, data privacy concepts, digital patterns, coding basics
**Formation personnelle et sociale**: Online safety, digital footprint, cyberbullying prevention, healthy tech habits
**Arts visuels**: Digital art creation, photo ethics, creative commons, digital citizenship posters
**Sciences de la nature**: Technology and environment, energy use of devices, recycling electronics`,
    
    // Arts visuels units
    'Découvrir l\'art dans notre monde': `
**Français langue première**: Art vocabulary, describing artwork, artist statements, art critiques
**Mathématiques**: Shapes in art, patterns, counting art supplies, measuring for projects
**Sciences de la nature**: Natural art materials, colors in nature, observational drawing, seasonal art
**Sciences humaines**: Art in our community, cultural art traditions, art history basics, local artists
**Formation personnelle et sociale**: Self-expression through art, art and emotions, creative confidence`,
    
    'Les couleurs et les sentiments': `
**Français langue première**: Color vocabulary, emotion words, describing feelings, color poems
**Mathématiques**: Color patterns, mixing colors (ratios), color wheels, graphing favorite colors
**Sciences de la nature**: Colors in nature, how we see color, rainbow science, natural pigments
**Sciences humaines**: Cultural meanings of colors, flags and symbols, celebrations and colors
**Formation personnelle et sociale**: Emotions and color associations, mood expression, calming colors, energy colors`,
    
    'Les célébrations d\'hiver par l\'art': `
**Français langue première**: Winter celebration vocabulary, cultural stories, greeting cards, celebration descriptions
**Mathématiques**: Snowflake symmetry, calendar counting to holidays, decoration patterns, gift wrapping geometry
**Sciences de la nature**: Winter changes, snow and ice properties, winter animals, evergreen trees
**Sciences humaines**: Cultural winter traditions, community celebrations, historical celebrations, family traditions
**Formation personnelle et sociale**: Inclusion and respect, giving and gratitude, celebration emotions, community belonging`,
    
    'Les textures et les motifs': `
**Français langue première**: Texture vocabulary, pattern language, describing surfaces, sensory poems
**Mathématiques**: Pattern rules, geometric patterns, tessellations, texture sorting and graphing
**Sciences de la nature**: Textures in nature, animal patterns, bark rubbings, natural patterns
**Sciences humaines**: Cultural patterns and textiles, Indigenous art patterns, pattern meanings
**Formation personnelle et sociale**: Sensory awareness, comfort textures, pattern preferences, tactile exploration`,
    
    'Les histoires dans l\'art': `
**Français langue première**: Visual storytelling, narrative art, comic creation, story illustrations
**Mathématiques**: Story sequences, counting story elements, time in stories, story mapping
**Sciences de la nature**: Nature stories, life cycle stories, environmental narratives, scientific illustration
**Sciences humaines**: Historical stories, cultural tales, community stories, family narratives
**Formation personnelle et sociale**: Personal stories, emotion in narrative, empathy through stories, identity stories`,
    
    'Notre galerie d\'art': `
**Français langue première**: Gallery vocabulary, artwork labels, artist statements, art reviews
**Mathématiques**: Gallery layout, measuring display space, pricing art, visitor statistics
**Sciences de la nature**: Preserving artwork, light and color, display environments, natural galleries
**Sciences humaines**: Community galleries, public art, art accessibility, cultural exhibitions
**Formation personnelle et sociale**: Pride in work, giving and receiving feedback, celebration, confidence`,
    
    // Formation personnelle et sociale units
    'Moi, moi-même et je': `
**Français langue première**: Identity vocabulary, self-description, personal narratives, name stories
**Mathématiques**: Personal data (age, height), birthday math, favorite number activities, personal timelines
**Sciences de la nature**: Human body basics, five senses, personal hygiene, growth and change
**Sciences humaines**: Family origins, personal history, cultural identity, community belonging
**Arts visuels**: Self-portraits, identity collages, name art, personal symbols`,
    
    'Moi en santé': `
**Français langue première**: Health vocabulary, wellness journals, healthy habits descriptions, body parts
**Mathématiques**: Measuring growth, counting healthy foods, exercise tracking, sleep schedules
**Sciences de la nature**: Body systems, nutrition basics, germs and hygiene, exercise science
**Sciences humaines**: Community health helpers, health traditions, wellness in different cultures
**Arts visuels**: Healthy food art, exercise posters, wellness vision boards, body awareness drawings`,
    
    'Sain et sauf': `
**Français langue première**: Safety vocabulary, emergency language, safety rules, helper communication
**Mathématiques**: Emergency numbers, safety statistics, distance from danger, time for safety drills
**Sciences de la nature**: Environmental safety, weather safety, animal safety, poison symbols
**Sciences humaines**: Community helpers, safety in different places, historical safety, safety laws
**Arts visuels**: Safety signs, emergency procedure posters, safety equipment drawings, helper portraits`,
    
    'Amis et sentiments': `
**Français langue première**: Friendship vocabulary, emotion words, social stories, conflict resolution language
**Mathématiques**: Friendship patterns, sharing problems, group formations, emotion graphing
**Sciences de la nature**: Animal friendships, cooperation in nature, emotional responses, social behaviors
**Sciences humaines**: Friendship across cultures, community connections, historical friendships
**Arts visuels**: Friendship art, emotion colors, collaborative art, empathy illustrations`,
    
    'Grandir et apprendre': `
**Français langue première**: Growth vocabulary, learning reflections, goal setting language, progress narratives
**Mathématiques**: Growth measurements, learning tracking, time for learning, progress graphs
**Sciences de la nature**: Life cycles, plant growth, animal development, seasonal growth
**Sciences humaines**: Learning through history, education traditions, community learning, elder wisdom
**Arts visuels**: Growth timelines, learning portfolios, achievement art, progress visualization`,
    
    'Notre monde merveilleux': `
**Français langue première**: Wonder vocabulary, gratitude expressions, world descriptions, appreciation writing
**Mathématiques**: Counting blessings, measuring beauty, patterns in nature, environmental statistics
**Sciences de la nature**: Natural wonders, ecosystems, environmental protection, biodiversity
**Sciences humaines**: World cultures, global connections, environmental citizenship, community care
**Arts visuels**: Nature art, world collages, environmental posters, celebration murals`
  };
  
  let updated = 0;
  let notFound = 0;
  
  // Update each unit
  for (const [unitTitle, connections] of Object.entries(unitConnections)) {
    const unit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        OR: [
          { title: unitTitle },
          { titleFr: unitTitle }
        ]
      }
    });
    
    if (unit) {
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          crossCurricularConnections: connections
        }
      });
      console.log(`✅ Updated: ${unitTitle}`);
      updated++;
    } else {
      console.log(`⚠️ Not found: ${unitTitle}`);
      notFound++;
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updated} units`);
  console.log(`Not found: ${notFound} units`);
  
  // Verify all units now have connections
  console.log('\n=== VERIFICATION ===\n');
  
  const allUnits = await prisma.unitPlan.findMany({
    where: { userId: emily.id },
    include: { longRangePlan: true }
  });
  
  const bySubject: Record<string, { total: number; withConnections: number }> = {};
  
  allUnits.forEach(unit => {
    const subject = unit.longRangePlan.subject;
    if (!bySubject[subject]) {
      bySubject[subject] = { total: 0, withConnections: 0 };
    }
    
    bySubject[subject].total++;
    
    if (unit.crossCurricularConnections && unit.crossCurricularConnections !== '') {
      bySubject[subject].withConnections++;
    }
  });
  
  Object.entries(bySubject).forEach(([subject, stats]) => {
    const percentage = Math.round((stats.withConnections / stats.total) * 100);
    console.log(`${subject}: ${stats.withConnections}/${stats.total} units (${percentage}%)`);
  });
  
  const totalUnits = allUnits.length;
  const totalWithConnections = allUnits.filter(u => 
    u.crossCurricularConnections && u.crossCurricularConnections !== ''
  ).length;
  
  console.log(`\nOVERALL: ${totalWithConnections}/${totalUnits} units have cross-curricular connections (${Math.round((totalWithConnections/totalUnits)*100)}%)`);
  
  await prisma.$disconnect();
}

addCrossCurricularToUnits()
  .then(() => console.log('\n✅ Phase 2 Complete!'))
  .catch(console.error);