import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectCoreExtensionUnits() {
  console.log('🎯 IMPLEMENTING CORE + EXTENSION MODEL');
  console.log('=======================================');
  console.log('97 lessons = 63 core (65%) + 34 extensions (35%)');
  console.log('Every child gets core. Extensions enrich or flex.\n');

  try {
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      orderBy: { startDate: 'asc' }
    });

    // UNIT 1: 14 lessons (9 core + 5 extension)
    console.log('📚 UNIT 1: Notre école communautaire');
    await prisma.unitPlan.update({
      where: { id: units[0].id },
      data: {
        estimatedHours: 10.5, // 14 lessons × 45 min
        description: `🏫 NOTRE ÉCOLE COMMUNAUTAIRE (14 lessons: 9 core + 5 extension)

ETFO COMPLIANCE: 2.8 weeks for core, up to 4.5 weeks with extensions ✅

🎯 CORE LESSONS (9) - EVERY CHILD EXPERIENCES:
1. Notre salle de classe (Our classroom community)
2. Les règles de sécurité (Safety rules we all follow)
3. Rencontrer le directeur (Meeting the principal)
4. Notre bibliothèque (Our library space)
5. Les aides de l'école (School helpers tour)
6. Le concierge nous aide (Janitor appreciation)
7. L'infirmière de l'école (School nurse visit)
8. Notre terrain de jeu (Playground citizenship)
9. Célébration communautaire (Community celebration)

🌟 EXTENSION LESSONS (5) - WHEN TIME/ENERGY ALLOWS:
E1. Heritage Show & Tell (OPTIONAL family sharing)
   Alternative: Share favorite classroom item
E2. School Helper Interviews (deeper exploration)
   Alternative: Draw helpers instead
E3. Family Jobs at School (OPTIONAL parent involvement)
   Alternative: Imaginary job creation
E4. Community Mapping Project (collaborative)
   Alternative: Individual desk maps
E5. Thank You Letter Campaign (writing integration)
   Alternative: Drawings or verbal thanks

CULTURAL SENSITIVITY BUILT-IN:
• ALL family sharing marked OPTIONAL
• Classroom family always emphasized
• Alternative activities for every extension
• No child left out or exposed
• Privacy completely protected

FLEXIBILITY PROTOCOL:
September chaos? Do 9 core only.
Going well? Add 1-2 extensions.
Extra time? All 5 extensions.
Struggling? Core only is SUCCESS!

ASSESSMENT APPROACH:
Core mastery = Meeting expectations
Extensions = Exceeding expectations
Participation in either = Success`,

        parentCommunicationPlan: `Chers parents/tuteurs,

PROGRAMME DE BASE (pour tous les élèves):
• 9 leçons essentielles sur notre communauté scolaire
• Aucun devoir à la maison requis
• Tout se passe en classe

ENRICHISSEMENT OPTIONNEL:
• 5 activités d'extension disponibles
• Participation familiale TOUJOURS optionnelle
• Alternatives fournies pour chaque activité
• Votre niveau de confort respecté

"Core" = Ce que chaque enfant apprend
"Extension" = Opportunités supplémentaires SI désiré

Aucune pression. Aucune obligation. Seulement des opportunités.`
      }
    });
    console.log('✅ Unit 1: 9 core + 5 extension = 14 total\n');

    // UNIT 2: 14 lessons (9 core + 5 extension)
    console.log('🦸 UNIT 2: Les aides de notre quartier');
    await prisma.unitPlan.update({
      where: { id: units[1].id },
      data: {
        estimatedHours: 10.5,
        description: `🚒 LES AIDES DE NOTRE QUARTIER (14 lessons: 9 core + 5 extension)

ETFO COMPLIANCE: 2.8 weeks for core, up to 4.5 weeks with extensions ✅

🎯 CORE LESSONS (9) - ESSENTIAL HELPERS:
1-2. Les pompiers (Firefighters) - safety focus
3-4. La police (Police) - community safety
5-6. Les médecins (Doctors/Nurses) - health helpers
7. Les bibliothécaires (Librarians) - learning helpers
8. Les travailleurs communautaires (Community workers)
9. Célébration des aides (Helpers celebration)

🌟 EXTENSION LESSONS (5) - ENRICHMENT OPTIONS:
E1. Family Helper Stories (OPTIONAL sharing)
   Alternative: Fictional helper stories
E2. Helper Thank You Cards (art integration)
   Alternative: Class thank you poster
E3. Community Helper Day (dress-up/role play)
   Alternative: Drawing instead of dressing up
E4. Helper Interview Project (if visitors available)
   Alternative: Video interviews
E5. Neighborhood Helper Walk (weather permitting)
   Alternative: Virtual neighborhood tour

FAMILY SAFETY PROTOCOLS:
• "My family's jobs" always OPTIONAL
• Focus on community helpers, not family
• All sharing voluntary
• Privacy protected
• Alternatives always available

VISITOR FLEXIBILITY:
Real visitor? Extend to 2 lessons.
No visitor? Video/story in 1 lesson.
Multiple visitors? Use extension slots.
No visitors? Core content still complete.`
      }
    });
    console.log('✅ Unit 2: 9 core + 5 extension = 14 total\n');

    // UNIT 3: 12 lessons (8 core + 4 extension) - December sensitive
    console.log('🎄 UNIT 3: Nos familles et traditions');
    await prisma.unitPlan.update({
      where: { id: units[2].id },
      data: {
        estimatedHours: 9,
        description: `❄️ NOS FAMILLES ET TRADITIONS (12 lessons: 8 core + 4 extension)

ETFO COMPLIANCE: 2.5 weeks for core, up to 3.8 weeks with extensions ✅
DECEMBER REALITY: Reduced for concert/holiday chaos

🎯 CORE LESSONS (8) - INCLUSIVE FOR ALL:
1. Notre famille de classe (Our classroom family)
2. Différentes familles (Different family structures - general)
3. Les responsabilités (Responsibilities we have)
4. Aider les autres (Helping others)
5. Les célébrations (Celebrations in general)
6. Les traditions d'hiver (Winter traditions - various)
7. La gentillesse (Kindness in families)
8. Notre communauté (Our community as family)

🌟 EXTENSION LESSONS (4) - OPTIONAL ENRICHMENT:
E1. Family Heritage Artifact (OPTIONAL bring/share)
   Alternative: Draw imaginary artifact
E2. Family Recipe Book (OPTIONAL contribution)
   Alternative: Favorite school lunch
E3. Cultural Celebration Display (OPTIONAL)
   Alternative: Winter celebration art
E4. Family Appreciation Project (OPTIONAL)
   Alternative: Classroom family appreciation

EXTREME SENSITIVITY PROTOCOLS:
⚠️ ALL family content is OPTIONAL
⚠️ "Classroom family" is primary focus
⚠️ No mandatory home sharing
⚠️ Foster/adoption/divorce considered
⚠️ Cultural diversity celebrated
⚠️ Economic differences invisible
⚠️ Religious neutrality maintained

DECEMBER FLEXIBILITY:
Week 1: Aim for 4 lessons
Week 2: Concert week - 2 lessons?
Week 3: Chaos week - 2 lessons?
Total: 8 core is victory!
Extensions: Only if December is calm (unlikely)`
      }
    });
    console.log('✅ Unit 3: 8 core + 4 extension = 12 total\n');

    // UNIT 4: 14 lessons (9 core + 5 extension)
    console.log('🏘️ UNIT 4: Notre quartier et notre ville');
    await prisma.unitPlan.update({
      where: { id: units[3].id },
      data: {
        estimatedHours: 10.5,
        description: `🏠 NOTRE QUARTIER ET NOTRE VILLE (14 lessons: 9 core + 5 extension)

ETFO COMPLIANCE: 2.8 weeks for core, up to 4.5 weeks with extensions ✅

🎯 CORE LESSONS (9) - NEIGHBORHOOD BASICS:
1. Les endroits près de l'école (Places near school)
2. Comment on arrive à l'école (How we get to school)
3. Les magasins (Stores we visit)
4. Le parc (Our park)
5. La bibliothèque publique (Public library)
6. Les endroits sécuritaires (Safe places)
7. Les règles de la rue (Street safety)
8. Notre carte simple (Simple mapping)
9. Célébration du quartier (Neighborhood celebration)

🌟 EXTENSION LESSONS (5) - EXPLORATION OPTIONS:
E1. Family Neighborhood Walks (OPTIONAL weekend activity)
   Alternative: Virtual walk in class
E2. Favorite Places Map (OPTIONAL family input)
   Alternative: School places only
E3. Community Business Visit (if arranged)
   Alternative: Videos of businesses
E4. Neighborhood Photo Journal (OPTIONAL family photos)
   Alternative: Magazine pictures
E5. Dream Neighborhood Design (creative project)
   Alternative: Individual or group option

WINTER WEATHER FLEXIBILITY:
• Indoor alternatives for all outdoor activities
• Virtual tours ready as backup
• Block building for 3D mapping
• No family walks required in winter

PRIVACY PROTECTIONS:
• Home addresses never shared
• Routes to school kept private
• Family places optional
• Focus on public spaces`
      }
    });
    console.log('✅ Unit 4: 9 core + 5 extension = 14 total\n');

    // UNIT 5: 14 lessons (9 core + 5 extension)
    console.log('🗺️ UNIT 5: Géographie et cartographie');
    await prisma.unitPlan.update({
      where: { id: units[4].id },
      data: {
        estimatedHours: 10.5,
        description: `🏴‍☠️ GÉOGRAPHIE ET CARTOGRAPHIE (14 lessons: 9 core + 5 extension)

ETFO COMPLIANCE: 2.8 weeks for core, up to 4.5 weeks with extensions ✅

🎯 CORE LESSONS (9) - MAPPING FUNDAMENTALS:
1. Les directions simples (Simple directions: up, down, left, right)
2. Notre classe en carte (Mapping our classroom)
3. Carte de l'école (School map)
4. Symboles de carte (Map symbols)
5. Chasse au trésor #1 (Treasure hunt - classroom)
6. Chasse au trésor #2 (Treasure hunt - school)
7. Faire une carte (Making a simple map)
8. Lire une carte (Reading a map)
9. Célébration des explorateurs (Explorer celebration)

🌟 EXTENSION LESSONS (5) - ADVANCED EXPLORATION:
E1. Family Treasure Hunt (OPTIONAL home activity)
   Alternative: Extra school hunt
E2. Community Map Project (collaborative)
   Alternative: Individual maps
E3. Digital Mapping Introduction (if tech available)
   Alternative: Paper maps only
E4. World Map Exploration (where families from - OPTIONAL)
   Alternative: Where characters from books live
E5. Create Adventure Map Story
   Alternative: Use existing story maps

GAME-BASED APPROACH:
• Every lesson involves play
• Treasure hunts motivate learning
• Movement incorporated
• Repetition is positive
• Fun is the priority

REPORT CARD SEASON FLEXIBILITY:
• Core lessons can be compressed
• Extensions can wait until April
• Games reduce teacher prep
• Assessment through observation`
      }
    });
    console.log('✅ Unit 5: 9 core + 5 extension = 14 total\n');

    // UNIT 6: 15 lessons (10 core + 5 extension)
    console.log('🤝 UNIT 6: Citoyenneté et responsabilité');
    await prisma.unitPlan.update({
      where: { id: units[5].id },
      data: {
        estimatedHours: 11.25,
        description: `🌟 CITOYENNETÉ ET RESPONSABILITÉ (15 lessons: 10 core + 5 extension)

ETFO COMPLIANCE: 3.2 weeks for core, up to 4.8 weeks with extensions ✅

🎯 CORE LESSONS (10) - CITIZENSHIP ESSENTIALS:
1. Être un bon ami (Being a good friend)
2. Partager et attendre (Sharing and taking turns)
3. Nos responsabilités de classe (Classroom jobs)
4. Aider les autres (Helping others)
5. Résoudre les problèmes (Problem solving)
6. Le respect (Showing respect)
7. La sécurité ensemble (Safety together)
8. Prendre soin de notre espace (Caring for our space)
9. Les règles nous aident (Rules help us)
10. Célébration de citoyenneté (Citizenship celebration)

🌟 EXTENSION LESSONS (5) - LEADERSHIP OPTIONS:
E1. Family Citizenship Stories (OPTIONAL sharing)
   Alternative: Book character examples
E2. Community Service Project (group initiative)
   Alternative: Classroom service only
E3. Playground Leaders Program (recess helpers)
   Alternative: Classroom helpers only
E4. Kindness Week Planning (student-led)
   Alternative: Teacher-led version
E5. Democratic Class Decisions (voting practice)
   Alternative: Simple choices only

SPRING INTEGRATION:
• Outdoor citizenship when weather nice
• Indoor alternatives ready
• Integrated with daily routines
• Natural assessment opportunities
• Energy channeled positively

DIFFERENTIATION BUILT-IN:
• Core = Grade level expectations
• Extensions = Leadership opportunities
• Both = Success
• Natural enrichment for ready students`
      }
    });
    console.log('✅ Unit 6: 10 core + 5 extension = 15 total\n');

    // UNIT 7: 14 lessons (9 core + 5 extension)
    console.log('🌍 UNIT 7: Notre monde connecté');
    await prisma.unitPlan.update({
      where: { id: units[6].id },
      data: {
        estimatedHours: 10.5,
        description: `🌈 NOTRE MONDE CONNECTÉ (14 lessons: 9 core + 5 extension)

ETFO COMPLIANCE: 2.8 weeks for core, up to 4.5 weeks with extensions ✅
JUNE REALITY: Extensions only if energy exists

🎯 CORE LESSONS (9) - GLOBAL CONNECTIONS:
1. Les amis loin d'ici (Friends far away)
2. Différents endroits (Different places)
3. Comment on communique (How we communicate)
4. Les transports (Transportation)
5. La nourriture du monde (Food from around world)
6. Les jeux du monde (Games from around world)
7. La musique et danse (Music and dance)
8. Nos ressemblances (How we're similar)
9. Célébration mondiale (World celebration)

🌟 EXTENSION LESSONS (5) - IF JUNE ALLOWS:
E1. Family Heritage Flags (OPTIONAL creation)
   Alternative: Country of interest flag
E2. Pen Pal Letters (if arranged with other class)
   Alternative: Letters to fictional friends
E3. Virtual Class Exchange (if technology works)
   Alternative: Recorded messages
E4. International Day Planning (student input)
   Alternative: Teacher planned
E5. Summer Travel Dreams (OPTIONAL sharing)
   Alternative: Book destinations

JUNE SURVIVAL MODE:
• 9 core lessons = full success
• Extensions = bonus if possible
• Field day week? Skip extensions
• Last week? Celebration only
• Report cards? Minimal new content

END-OF-YEAR FLEXIBILITY:
• Videos count as lessons
• Crafts count as culture
• Games count as connection
• Fun is the priority
• Survival is success`
      }
    });
    console.log('✅ Unit 7: 9 core + 5 extension = 14 total\n');

    console.log('📊 FINAL ARCHITECTURE:');
    console.log('======================');
    console.log('Unit 1: 9 core + 5 extension = 14 lessons');
    console.log('Unit 2: 9 core + 5 extension = 14 lessons');
    console.log('Unit 3: 8 core + 4 extension = 12 lessons (December)');
    console.log('Unit 4: 9 core + 5 extension = 14 lessons');
    console.log('Unit 5: 9 core + 5 extension = 14 lessons');
    console.log('Unit 6: 10 core + 5 extension = 15 lessons');
    console.log('Unit 7: 9 core + 5 extension = 14 lessons');
    console.log('----------------------------------------');
    console.log('TOTAL: 63 core + 34 extension = 97 lessons ✅');
    console.log('');
    console.log('🎯 PEDAGOGICAL ADVANTAGES:');
    console.log('===========================');
    console.log('✅ Full curriculum available (97 lessons)');
    console.log('✅ Core curriculum guaranteed (63 lessons)');
    console.log('✅ Natural differentiation (extensions for ready students)');
    console.log('✅ Family safety (all sharing OPTIONAL)');
    console.log('✅ Flexibility built-in (35% can flex)');
    console.log('✅ ETFO compliant (2-4 week units)');
    console.log('✅ Assessment clear (core = meets, extension = exceeds)');
    console.log('✅ December/June reality (reduced expectations)');
    console.log('✅ Teacher wellness (extensions only when energy allows)');
    console.log('✅ Cultural sensitivity (alternatives for everything)');
    console.log('');
    console.log('🏆 THIS IS TRUE PEDAGOGICAL FLEXIBILITY!');
    console.log('=========================================');
    console.log('Not buffers that disappear...');
    console.log('But extensions that enrich when possible!');
    console.log('');
    console.log('Emily teaches 63 core lessons minimum.');
    console.log('Emily adds 34 extensions when she can.');
    console.log('Emily succeeds either way!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectCoreExtensionUnits().catch(console.error);