import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function transformUnitsToPerfection() {
  console.log('🎯 TRANSFORMING UNITS TO TRUE GRADE 1 PERFECTION');
  console.log('=================================================');
  console.log('Making units developmentally appropriate, flexible, and truly implementable');
  console.log('');

  try {
    // Get all units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } },
        expectations: { include: { expectation: true } }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('📚 BEGINNING TRANSFORMATION OF 7 UNITS...\n');

    // Transform Unit 1: Notre école communautaire
    console.log('🏫 UNIT 1: Notre école communautaire → "Our School Friends"');
    console.log('Simplifying for Grade 1 comprehension...');
    
    const unit1Updates = {
      title: 'Notre école communautaire / Our School Friends',
      description: `🏫 TRANSFORMED FOR GRADE 1 SUCCESS!

This unit helps 6-year-olds discover their school as a friendly, safe community where everyone has a special job. Using simple French vocabulary (maximum 5 new words per lesson), students will meet school helpers, explore school spaces, and understand how we all work together.

🎯 SIMPLE LEARNING GOALS (Grade 1 Language):
• "I can name my school helpers" (not "understand community roles")
• "I can find important places in my school" (not "navigate institutional spaces")  
• "I can say how helpers keep us safe" (not "analyze safety protocols")
• "I can be a good school friend" (not "demonstrate citizenship")

🎮 HANDS-ON ACTIVITIES:
• Build a 3D school map with blocks
• School scavenger hunt with picture clues
• Helper appreciation cards with drawings
• "School Helper Charades" game
• Daily classroom helper jobs
• School helper dress-up station

🔄 EVERY-OTHER-DAY CONTINUITY:
• Each lesson starts with "Rappel Rapide" - a 1-minute song about previous lesson
• Visual journey map on classroom wall showing our learning path
• Take-home "French Phrase Cards" for family practice
• "Remember when..." story connections

💪 REAL FLEXIBILITY BUILT-IN:
• Lessons 1-2 can merge (Introduction + Tour = "Meet Our School")
• Lessons 5-6 can merge (Principal + Secretary = "Office Helpers")  
• 20-minute "Quick Win" versions for disrupted days
• Catch-up kit with visual guides for absent students
• Emergency substitute plan: "School Helper Bingo"

🇫🇷 FRENCH SCAFFOLDING:
Week 1: école, ami(e), classe, professeur, jouer
Week 2: directeur/directrice, secrétaire, concierge, bibliothèque, aider
Week 3: infirmière, cafétéria, gymnase, sécurité, merci

Each word has: picture card + gesture + daily practice

🏃 MOVEMENT & BRAIN BREAKS:
• 2-minute "Helper Dance" at 20-minute mark
• Outdoor lesson: School grounds tour
• Movement transition: "Walk like a..." (teacher, janitor, librarian)
• Breathing exercise: "School Bell Breathing" for regulation`,

      assessmentPlan: `📊 GRADE 1 APPROPRIATE ASSESSMENT:

DAILY OBSERVATIONS (not formal tests):
• Can student name 3 school helpers? (use picture prompts)
• Does student participate in helper games?
• Can student find library/gym/office? (with peer support OK)
• Does student use 2-3 French words? (pronunciation flexible)

SUCCESS INDICATORS FOR 6-YEAR-OLDS:
✅ Points to correct helper when shown picture
✅ Participates in group activities (even if quiet)
✅ Shows excitement about school helpers
✅ Tries to use French words (effort counts!)
✅ Helps classmates (showing community understanding)

PORTFOLIO PIECES (not grades):
• Drawing of favorite school helper
• Photo of student doing classroom job
• Recording of student saying "Bonjour" to helper
• School map they colored

ACCOMMODATION NOTES:
• Non-verbal responses accepted (pointing, gestures)
• Partner support encouraged
• Visual aids always available
• Extended time always OK
• Home language connections welcomed`,

      differentiationStrategies: {
        forStruggling: `• Picture cards for every concept
• Peer buddy system
• Gesture-based responses OK
• Start with 1-2 French words only
• Extra time with visual supports
• Parents receive visual vocabulary guides`,
        
        forOnLevel: `• 3-5 French words per lesson
• Simple sentence frames: "Je vois..." (I see...)
• Partner activities for practice
• Choice in activities
• Take-home practice cards`,
        
        forAdvanced: `• Helper interview questions
• Create own school helper book
• Lead "Rappel Rapide" songs
• Teach French words to others
• Write thank you notes to helpers
• Extended vocabulary (10 words)`,
        
        forELL: `• Visual supports for everything
• Home language connections encouraged
• Family vocabulary sheets in multiple languages
• Gesture library for communication
• Partner with strong English speaker
• Extra visual dictionary time`
      },

      parentCommunicationPlan: `📱 FAMILY PARTNERSHIP (Stress-Free Approach):

WEEKLY COMMUNICATION:
"This week we're meeting our school helpers! At home, you can:
• Ask: 'Who helps at your school?'
• Practice: 'Bonjour!' and 'Merci!'
• Look at the picture cards we sent home
• No stress - any language is fine!"

FRENCH PHRASE OF THE WEEK:
Week 1: "Bonjour, comment ça va?" (Hello, how are you?)
Week 2: "Merci beaucoup!" (Thank you very much!)
Week 3: "J'aime mon école!" (I love my school!)

Each phrase includes:
• Audio recording (QR code)
• Gesture video
• Fun practice idea

HOME EXTENSIONS (All Optional):
• Draw your family's helpers
• Practice French greetings at dinner
• School helper dress-up play
• Read books about community helpers
• Virtual school tour for families

FLEXIBILITY COMMUNICATION:
"Don't worry if we miss days! We have built-in catch-up time and every lesson includes review. Focus on fun, not perfection!"

CELEBRATION IDEAS:
• School Helper Appreciation Day
• Family volunteers share their jobs
• Student helper certificates
• Class book of school helpers`
    };

    await prisma.unitPlan.update({
      where: { id: units[0].id },
      data: unit1Updates
    });
    console.log('✅ Unit 1 transformed!\n');

    // Transform Unit 2: Les aides de notre quartier
    console.log('👮 UNIT 2: Les aides de notre quartier → "Heroes Around Us"');
    console.log('Simplifying for Grade 1 comprehension...');
    
    const unit2Updates = {
      title: 'Les aides de notre quartier / Heroes Around Us',
      description: `🦸 TRANSFORMED FOR GRADE 1 SUCCESS!

This unit introduces 6-year-olds to 5 community heroes through dramatic play, stories, and hands-on activities. We focus on concrete understanding: "How do helpers help us?" rather than abstract community roles.

🎯 SIMPLE LEARNING GOALS (Grade 1 Language):
• "I can name 5 community heroes"
• "I can show what each hero does"
• "I can say thank you to heroes"
• "I know who to ask for help"

🎮 HANDS-ON ACTIVITIES:
• Community helper dress-up station (permanent center)
• Hero visits to classroom (or virtual)
• "Heroes Help Us" action songs
• Safety scenarios with puppets
• Thank you cards for local heroes
• "Hero of the Day" dramatic play

🔄 EVERY-OTHER-DAY CONTINUITY:
• Hero song collection (add one each lesson)
• Classroom "Hero Wall" with photos
• Hero gesture review game
• Take-home hero trading cards

💪 REAL FLEXIBILITY BUILT-IN:
• Each hero can be 1-3 lessons (expand or compress)
• Virtual backup for in-person visits
• "Hero Day" can combine 2 lessons
• Rainy day plan: Hero movie clips
• Catch-up: Hero coloring books

🇫🇷 FRENCH SCAFFOLDING:
Lesson 1-3: pompier, feu, eau, aider, rouge
Lesson 4-6: police, sécurité, stop, bleu, protéger
Lesson 7-9: docteur, hôpital, malade, mieux, soigner
Lesson 10-12: bibliothécaire, livre, lire, histoire, apprendre
Lesson 13-14: Review all heroes + merci, s'il vous plaît

🏃 MOVEMENT & BRAIN BREAKS:
• "Move Like a Hero" transitions
• Firefighter obstacle course (gym)
• Police officer "Stop and Go" game
• Doctor check-up roleplay
• Librarian "Quiet Feet" walking`,

      assessmentPlan: `📊 GRADE 1 APPROPRIATE ASSESSMENT:

OBSERVATION CHECKLIST:
□ Identifies heroes from pictures
□ Participates in dramatic play
□ Uses 1-2 French words per hero
□ Shows understanding through actions
□ Demonstrates "asking for help" behavior

PORTFOLIO EVIDENCE:
• Photo in dress-up center
• Drawing of favorite hero
• "Thank you" card created
• Video of hero gesture/song

NO STRESS ASSESSMENT:
• Playing = learning
• Watching = participating
• Trying = succeeding
• Gestures = communication`,

      differentiationStrategies: {
        forStruggling: `• Focus on 2-3 main heroes
• Picture cards always available
• Act out instead of speaking
• Partner for all activities
• Extra dress-up time`,
        
        forOnLevel: `• Learn all 5 heroes
• Simple French phrases
• Lead hero games
• Create hero books
• Share hero stories`,
        
        forAdvanced: `• Interview questions for visitors
• Write/draw hero adventures
• Create new hero characters
• Teach hero songs to class
• Research additional heroes`,
        
        forELL: `• Visual vocabulary prominent
• Home language hero names OK
• Family heroes included
• Gesture-heavy instruction
• Multilingual hero books`
      }
    };

    await prisma.unitPlan.update({
      where: { id: units[1].id },
      data: unit2Updates
    });
    console.log('✅ Unit 2 transformed!\n');

    // Transform Unit 3: Nos familles et traditions
    console.log('👨‍👩‍👧‍👦 UNIT 3: Nos familles et traditions → "My Special People"');
    console.log('Adding sensitivity and flexibility for diverse families...');
    
    const unit3Updates = {
      title: 'Nos familles et traditions / My Special People',
      description: `💝 TRANSFORMED FOR GRADE 1 SUCCESS & FAMILY SENSITIVITY!

This unit celebrates ALL types of families with extreme sensitivity to diverse situations. Every activity is OPTIONAL and focuses on "people who care for us" rather than specific family structures.

⚠️ CRITICAL FLEXIBILITY: 
- Unit designed to pause/adapt for Christmas preparations
- All family sharing is OPTIONAL
- Alternative activities always available
- Focus on classroom family as safe option

🎯 SIMPLE LEARNING GOALS (Grade 1 Language):
• "Families are different and special"
• "We all have people who care for us"
• "We celebrate in different ways"
• "Our classroom is a family too"

🎮 SAFE, INCLUSIVE ACTIVITIES:
• Create classroom family tree
• "Celebration Calendar" (any celebrations)
• Caring actions card sort
• Family jobs in our classroom
• Celebration crafts (winter/family/cultural)
• "People Who Love Me" art (flexible interpretation)

🔄 EVERY-OTHER-DAY CONTINUITY:
• Daily "Caring Circle" sharing (optional)
• Celebration countdown visual
• "Family" can mean classroom family
• Review through celebration preparation

💪 EXTREME FLEXIBILITY BUILT-IN:
• Can pause unit for Christmas concerts
• Lessons can stretch over December
• "Celebration prep" can replace lessons
• Emergency plan: Focus on classroom family only
• All family activities have alternatives

🇫🇷 FRENCH SCAFFOLDING:
Lesson 1-4: famille, ami, aimer, ensemble, maison
Lesson 5-8: fête, célébrer, heureux, partager, joie
Lesson 9-12: aider, merci, s'il vous plaît, ensemble, spécial

Christmas vocabulary (optional): Noël, cadeau, sapin

🏃 MOVEMENT & BRAIN BREAKS:
• Celebration dances from different cultures
• "Family helper" action games
• Quiet reflection time offered
• Extra recess during busy December`,

      assessmentPlan: `📊 SENSITIVE ASSESSMENT APPROACH:

OBSERVE WITHOUT PRESSURE:
• Participation is always optional
• Classroom family activities count
• Celebration of any kind counts
• Drawing/craft participation noted
• Kindness to classmates prioritized

PORTFOLIO OPTIONS:
• Classroom family portrait
• Celebration craft
• Caring actions demonstrated
• French vocabulary attempts
• Acts of kindness recorded

FAMILY COMMUNICATION:
"All family sharing is OPTIONAL. We celebrate all types of families and care situations."`
    };

    await prisma.unitPlan.update({
      where: { id: units[2].id },
      data: unit3Updates
    });
    console.log('✅ Unit 3 transformed with sensitivity!\n');

    // Transform Unit 4: Notre quartier et notre ville
    console.log('🏘️ UNIT 4: Notre quartier et notre ville → "Places We Go"');
    console.log('Making it concrete and explorable...');
    
    const unit4Updates = {
      title: 'Notre quartier et notre ville / Places We Go',
      description: `🗺️ TRANSFORMED FOR GRADE 1 SUCCESS!

This unit explores familiar places through walks, photos, and hands-on mapping. We focus on places children actually go, not abstract civic concepts.

🎯 SIMPLE LEARNING GOALS (Grade 1 Language):
• "I can name places in my neighborhood"
• "I can make a simple map"
• "I can tell how to be safe walking"
• "I can find my favorite places"

🎮 HANDS-ON ACTIVITIES:
• Neighborhood walk with iPads
• Photo journal creation
• Build neighborhood with blocks
• "Places We Go" board game
• Safety sign hunt
• Favorite place show-and-tell

🔄 EVERY-OTHER-DAY CONTINUITY:
• Photo wall grows each lesson
• Daily "Where did you go?" sharing
• Map builds progressively
• Safety rules review song

💪 WEATHER FLEXIBILITY:
• Indoor alternative for every outdoor plan
• Virtual neighborhood tour backup
• "Imaginary walks" with movement
• Use of school neighborhood if needed

🇫🇷 FRENCH SCAFFOLDING:
Lesson 1-5: parc, magasin, maison, école, rue
Lesson 6-10: bibliothèque, ami, jouer, marcher, voir
Lesson 11-14: carte, ici, là, proche, loin

🏃 MOVEMENT & BRAIN BREAKS:
• "Walk to the..." movement game
• Outdoor exploration (weather permitting)
• "Traffic light" stop/go game
• Map treasure hunts`,

      assessmentPlan: `📊 EXPLORATION-BASED ASSESSMENT:

OBSERVE DURING ACTIVITIES:
• Points to places on map
• Shares about neighborhood places
• Follows safety rules on walks
• Uses 3-4 French place words
• Shows excitement about exploration

PORTFOLIO PIECES:
• Photo journal pages
• Simple map drawing
• Favorite place artwork
• Safety rule demonstration`
    };

    await prisma.unitPlan.update({
      where: { id: units[3].id },
      data: unit4Updates
    });
    console.log('✅ Unit 4 transformed!\n');

    // Transform Unit 5: Géographie et cartographie
    console.log('🗺️ UNIT 5: Géographie et cartographie → "Treasure Hunters"');
    console.log('Making mapping fun and game-based...');
    
    const unit5Updates = {
      title: 'Géographie et cartographie / Treasure Hunters',
      description: `🏴‍☠️ TRANSFORMED FOR GRADE 1 SUCCESS!

This unit turns mapping into treasure hunting adventures! We learn directions through games, not abstract geography.

🎯 SIMPLE LEARNING GOALS (Grade 1 Language):
• "I can follow a treasure map"
• "I can use left, right, up, down"
• "I can make my own map"
• "I can find hidden treasures"

🎮 GAME-BASED ACTIVITIES:
• Daily classroom treasure hunts
• Playground treasure maps
• "Pirate Direction Dance"
• Build treasure islands (sand table)
• Map making station
• "X Marks the Spot" games

🔄 EVERY-OTHER-DAY CONTINUITY:
• Treasure hunter certificates earned
• Class treasure map grows
• Direction song with gestures
• "Where's the treasure?" daily game

💪 ATTENTION FLEXIBILITY:
• 10-minute mini-hunts available
• Individual or team options
• Quiet map coloring alternative
• "Treasure" can be stickers/stamps

🇫🇷 FRENCH SCAFFOLDING:
Lesson 1-5: gauche, droite, carte, trésor, chercher
Lesson 6-10: en haut, en bas, devant, derrière, trouver
Lesson 11-14: île, X, ici, là-bas, suivre

🏃 MOVEMENT & BRAIN BREAKS:
• Treasure hunter stretches
• Direction dance party
• Outdoor treasure hunts
• "Freeze like a statue" game`,

      assessmentPlan: `📊 PLAY-BASED ASSESSMENT:

TREASURE HUNTING SUCCESS:
• Follows simple maps
• Uses direction words
• Creates own simple map
• Shows joy in hunting
• Helps others find treasures

PORTFOLIO TREASURES:
• Map creations
• Photo finding treasure
• Direction dance video
• Treasure hunter certificate`
    };

    await prisma.unitPlan.update({
      where: { id: units[4].id },
      data: unit5Updates
    });
    console.log('✅ Unit 5 transformed!\n');

    // Transform Unit 6: Citoyenneté et responsabilité
    console.log('🤝 UNIT 6: Citoyenneté et responsabilité → "Classroom Helpers"');
    console.log('Making citizenship concrete through classroom jobs...');
    
    const unit6Updates = {
      title: 'Citoyenneté et responsabilité / Classroom Helpers',
      description: `🌟 TRANSFORMED FOR GRADE 1 SUCCESS!

This unit makes citizenship real through classroom jobs and kindness. We focus on being helpers, not abstract civic concepts.

🎯 SIMPLE LEARNING GOALS (Grade 1 Language):
• "I can do my classroom job"
• "I can help my friends"
• "I can share and take turns"
• "I can fill our kindness jar"

🎮 CONCRETE ACTIVITIES:
• Real classroom jobs with badges
• Kindness jar (marble for each kind act)
• "Helper of the Day" crown
• Sharing circle practice
• Clean-up dance parties
• Thank you note station

🔄 EVERY-OTHER-DAY CONTINUITY:
• Daily job chart check-in
• Kindness jar grows visibly
• "Helper Song" each morning
• Job badges worn with pride

💪 INTEGRATED FLEXIBILITY:
• Jobs continue during regular day
• Can combine with routines
• Natural assessment through observation
• No extra time needed

🇫🇷 FRENCH SCAFFOLDING:
Lesson 1-5: aider, partager, ami, merci, s'il vous plaît
Lesson 6-10: nettoyer, ranger, ensemble, tour, attendre
Lesson 11-15: gentil, respecter, écouter, félicitations, bravo

🏃 MOVEMENT & BRAIN BREAKS:
• Clean-up dance parties
• "Helper Freeze Dance"
• Job rotation movement
• Kindness high-fives`,

      assessmentPlan: `📊 OBSERVATION-BASED ASSESSMENT:

HELPER BEHAVIORS:
• Completes classroom job
• Shares materials
• Waits for turn
• Uses kind words
• Helps without being asked

KINDNESS EVIDENCE:
• Marbles in kindness jar
• Peer nominations
• Thank you notes received
• Helper badges earned`
    };

    await prisma.unitPlan.update({
      where: { id: units[5].id },
      data: unit6Updates
    });
    console.log('✅ Unit 6 transformed!\n');

    // Transform Unit 7: Notre monde connecté
    console.log('🌍 UNIT 7: Notre monde connecté → "New Friends Far Away"');
    console.log('Making global connections Grade 1 appropriate...');
    
    const unit7Updates = {
      title: 'Notre monde connecté / New Friends Far Away',
      description: `🌈 TRANSFORMED FOR GRADE 1 SUCCESS!

This unit creates simple connections with other places through pen pals, videos, and stories. We focus on "friends in other places" not global systems.

🎯 SIMPLE LEARNING GOALS (Grade 1 Language):
• "People live in different places"
• "We can make far away friends"
• "Different is interesting"
• "We can share our stories"

🎮 CONNECTION ACTIVITIES:
• Pen pal letters/drawings (another Grade 1 class)
• Video calls with other schools
• "Postcards from..." collection
• World music dance party
• Food celebration day
• Summer vacation dreaming

🔄 EVERY-OTHER-DAY CONTINUITY:
• Pen pal correspondence wall
• "Hello" in different languages
• World map with pins
• Countdown to summer

💪 END-OF-YEAR FLEXIBILITY:
• Can extend into June activities
• Combines with year-end celebrations
• Optional based on energy levels
• Summer preparation integrated

🇫🇷 FRENCH SCAFFOLDING:
Lesson 1-5: ami, lettre, bonjour, monde, différent
Lesson 6-10: pays, océan, avion, voyage, découvrir
Lesson 11-14: été, vacances, au revoir, à bientôt, merci

🏃 MOVEMENT & BRAIN BREAKS:
• World music dance parties
• "Airplane" movement game
• Summer activity charades
• Outdoor celebrations`,

      assessmentPlan: `📊 CELEBRATION ASSESSMENT:

END-OF-YEAR SUCCESS:
• Shows interest in other places
• Attempts pen pal communication
• Participates in celebrations
• Uses learned French words
• Shows growth from September

PORTFOLIO FINALE:
• Pen pal correspondence
• Year reflection drawing
• Favorite unit memory
• French words learned list`
    };

    await prisma.unitPlan.update({
      where: { id: units[6].id },
      data: unit7Updates
    });
    console.log('✅ Unit 7 transformed!\n');

    console.log('🎉 ALL UNITS TRANSFORMED TO GRADE 1 PERFECTION!');
    console.log('================================================');
    console.log('✅ Simplified language and concepts');
    console.log('✅ Added hands-on activities');
    console.log('✅ Built in real flexibility');
    console.log('✅ Created continuity bridges');
    console.log('✅ Scaffolded French learning');
    console.log('✅ Added movement and brain breaks');
    console.log('✅ Created disruption fail-safes');
    console.log('✅ Enhanced parent engagement');
    console.log('\n🎓 Units are now TRULY PERFECT for Emily\'s Grade 1 classroom!');

  } catch (error) {
    console.error('❌ Error transforming units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

transformUnitsToPerfection().catch(console.error);