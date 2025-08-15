import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function createSeptemberLessons() {
  console.log('Creating perfect September French Foundations lessons...\n');
  
  // Get Emily's ID
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  const unitId = 'cmectx0os0001vj4pzf77jcl3'; // September French Foundations
  
  // Define 19 perfect lessons for September (Sept 4-30, excluding weekends)
  const lessons = [
    // Week 1: Welcome and Introductions (Sept 4-6, 3 days)
    {
      date: new Date('2025-09-04T09:00:00'),
      title: "Bienvenue à l'école!",
      titleFr: "Bienvenue à l'école - Premier jour",
      mindsOn: "Welcome circle: Teacher introduces self in French with gestures. Students listen and observe. Use photos and props to support understanding.",
      action: "Tour the classroom with French labels. Practice 'Bonjour, je m'appelle...' with name tags. Create first French name cards with decorations. Play name game with soft ball.",
      consolidation: "Celebration circle: Each student says 'Bonjour' and their name. Teacher celebrates each attempt with 'Bravo!' Close with French welcome song.",
      learningGoals: "Students will understand and use basic French greetings and introduce themselves",
      materials: ["Name tags", "Markers", "Photo cards", "Soft ball", "French labels", "Welcome song recording"],
      accommodations: ["Visual supports for all vocabulary", "Gestures and TPR", "Peer buddies", "Allow pointing/gestures instead of speech initially"],
      assessmentType: "diagnostic",
      assessmentNotes: "Observe comfort level with French, prior exposure, willingness to try",
      expectations: ["1CO.5", "1CO.1"]
    },
    {
      date: new Date('2025-09-05T09:00:00'),
      title: "Our Classroom in French",
      titleFr: "Notre salle de classe",
      mindsOn: "Review yesterday's greetings with puppet. Puppet only speaks French! Students help puppet learn classroom words.",
      action: "Classroom scavenger hunt with picture cards. Match French labels to objects. Practice 'Qu'est-ce que c'est? C'est un/une...' Create classroom picture dictionary pages.",
      consolidation: "Share one new French word learned. Play 'Teacher Says' (Jacques Dit) with classroom vocabulary.",
      learningGoals: "Students will identify and name classroom objects in French",
      materials: ["Puppet", "Picture cards", "Label cards", "Dictionary pages", "Glue", "Crayons"],
      accommodations: ["Picture support for all items", "Allow pointing", "Simplified vocabulary list for some", "Partner support"],
      assessmentType: "formative",
      assessmentNotes: "Track vocabulary acquisition, pronunciation attempts, engagement",
      expectations: ["1CO.5", "1CO.2"]
    },
    {
      date: new Date('2025-09-06T09:00:00'),
      title: "French Classroom Routines",
      titleFr: "Nos routines en français",
      mindsOn: "Morning routine practice: calendar, weather, attendance in French. Use visual schedule cards.",
      action: "Create class routine posters with photos and French phrases. Practice transitions with French commands. Role-play helper jobs using French.",
      consolidation: "Students demonstrate one routine using French. Class creates first French routine song together.",
      learningGoals: "Students will follow and participate in basic French classroom routines",
      materials: ["Visual schedule", "Camera", "Poster paper", "Routine cards", "Helper job chart"],
      accommodations: ["Visual cues for all routines", "Peer modeling", "Gradual release of English support", "Gesture options"],
      assessmentType: "formative",
      assessmentNotes: "Document routine comprehension and participation level",
      expectations: ["1CO.1", "1CO.2", "1CO.6"]
    },
    
    // Week 2: Numbers and Colors (Sept 9-13, 5 days)
    {
      date: new Date('2025-09-09T09:00:00'),
      title: "Numbers 1-5 in French",
      titleFr: "Les nombres 1 à 5",
      mindsOn: "Number song with finger counting. Mystery box with 1-5 objects to count together.",
      action: "Number stations: playdough numbers, number puzzles, counting collections, number formation practice. Create number books 1-5 with drawings.",
      consolidation: "Number parade: Students show their number and count objects in French. Play 'Combien?' game.",
      learningGoals: "Students will recognize, say, and write numbers 1-5 in French",
      materials: ["Number cards", "Playdough", "Counting objects", "Number books", "Mystery box"],
      accommodations: ["Tactile number cards", "Fewer numbers for some", "Tracing guides", "Peer support"],
      assessmentType: "formative",
      assessmentNotes: "Check number recognition, counting accuracy, formation",
      expectations: ["1CO.5", "1É.2"]
    },
    {
      date: new Date('2025-09-10T09:00:00'),
      title: "Numbers 6-10 in French",
      titleFr: "Les nombres 6 à 10",
      mindsOn: "Review 1-5 with movement. Introduce 6-10 with ten frames and objects.",
      action: "Number hunt around room. Create class counting book with photos. Play number bingo in French. Practice with dice games.",
      consolidation: "Partner counting practice. Share favorite number in French and why (show with fingers).",
      learningGoals: "Students will count to 10 in French with confidence",
      materials: ["Ten frames", "Dice", "Bingo cards", "Camera", "Counting objects"],
      accommodations: ["Number line support", "Concrete materials always available", "Partner practice", "Visual cues"],
      assessmentType: "formative",
      assessmentNotes: "Track counting fluency, number recognition, peer interaction",
      expectations: ["1CO.5", "1L.2"]
    },
    {
      date: new Date('2025-09-11T09:00:00'),
      title: "Basic Colors in French",
      titleFr: "Les couleurs de base",
      mindsOn: "Color magic: Teacher reveals colored scarves from bag. Students predict next color in French.",
      action: "Color mixing experiments with paint. Create rainbow books with French labels. Color sorting games. 'I Spy' with colors in French.",
      consolidation: "Color fashion show: Students share one thing they're wearing and its color in French.",
      learningGoals: "Students will identify and name basic colors in French",
      materials: ["Colored scarves", "Paint", "Brushes", "Color cards", "Rainbow book template"],
      accommodations: ["Color cards for reference", "Partner support", "Focus on 3-4 colors for some", "Allow pointing"],
      assessmentType: "formative",
      assessmentNotes: "Note color vocabulary acquisition, pronunciation, application",
      expectations: ["1CO.5", "1É.2"]
    },
    {
      date: new Date('2025-09-12T09:00:00'),
      title: "Colors and Numbers Together",
      titleFr: "Couleurs et nombres ensemble",
      mindsOn: "Count colored objects together. Sing number song with colored props.",
      action: "Create color-number patterns. Graph favorite colors with counting. Play 'Combien de... rouges?' Make color-number art.",
      consolidation: "Present patterns to class using French. Celebrate learning with color-number song.",
      learningGoals: "Students will combine color and number vocabulary in French",
      materials: ["Colored blocks", "Graph paper", "Pattern cards", "Art supplies"],
      accommodations: ["Simpler patterns", "Visual supports", "Peer helpers", "Choice in presentation"],
      assessmentType: "formative",
      assessmentNotes: "Assess integration of vocabulary, pattern understanding, confidence",
      expectations: ["1CO.5", "1CO.3"]
    },
    {
      date: new Date('2025-09-13T09:00:00'),
      title: "Days of the Week",
      titleFr: "Les jours de la semaine",
      mindsOn: "Calendar time: Introduce days with song and movements. Today, yesterday, tomorrow in French.",
      action: "Create weekly schedule wheels. Practice with 'What day?' games. Make days of week bookmarks. Sequence daily activities.",
      consolidation: "Plan our French learning for next week together. Students share favorite day in French.",
      learningGoals: "Students will recognize and sequence days of the week in French",
      materials: ["Calendar", "Schedule wheels", "Day cards", "Bookmark materials", "Song chart"],
      accommodations: ["Visual calendar", "Simplified to today/tomorrow", "Movement cues", "Repetition"],
      assessmentType: "formative",
      assessmentNotes: "Check sequencing ability, vocabulary retention, temporal understanding",
      expectations: ["1CO.5", "1L.2"]
    },
    
    // Week 3: Feelings and Family (Sept 16-20, 5 days)
    {
      date: new Date('2025-09-16T09:00:00'),
      title: "How Are You Feeling?",
      titleFr: "Comment te sens-tu?",
      mindsOn: "Emotion check-in with faces. Mirror emotions game. Teacher models 'Je suis...' with expressions.",
      action: "Create emotion wheels in French. Read 'La couleur des émotions'. Emotion charades. Make feelings journal covers.",
      consolidation: "Share current feeling in French with gesture. Comfort circle for any sad feelings.",
      learningGoals: "Students will express basic emotions in French",
      materials: ["Emotion cards", "Mirrors", "Book", "Wheel template", "Journal covers"],
      accommodations: ["Emotion visuals always available", "Allow gestures only", "Simplified emotions", "Buddy support"],
      assessmentType: "formative",
      assessmentNotes: "Observe emotional vocabulary use, self-expression, empathy",
      expectations: ["1CO.5", "1CO.3", "1CO.6"]
    },
    {
      date: new Date('2025-09-17T09:00:00'),
      title: "My Family in French",
      titleFr: "Ma famille",
      mindsOn: "Share family photos. Teacher introduces family vocabulary with photos.",
      action: "Create family trees with French labels. Family puppet shows. Draw family portraits with French descriptions. Family size graph.",
      consolidation: "Introduce one family member in French to the class. Sing family song together.",
      learningGoals: "Students will name family members in French",
      materials: ["Family photos", "Tree template", "Puppets", "Drawing supplies", "Graph"],
      accommodations: ["Flexible family definitions", "Picture supports", "Choice in sharing", "Simplified vocabulary"],
      assessmentType: "formative",
      assessmentNotes: "Note family vocabulary use, cultural sensitivity, participation",
      expectations: ["1CO.5", "1É.2"]
    },
    {
      date: new Date('2025-09-18T09:00:00'),
      title: "Classroom Friends",
      titleFr: "Les amis de la classe",
      mindsOn: "Friendship circle: Pass the heart and say something kind in French (simple: 'gentil', 'bon ami').",
      action: "Create friend interview sheets. Practice 'Tu aimes...?' questions. Make friendship bracelets with French color patterns. Friend portraits.",
      consolidation: "Share one thing learned about a friend. Friendship pledge in French.",
      learningGoals: "Students will use French to interact with classmates",
      materials: ["Heart prop", "Interview sheets", "Beads", "String", "Portrait paper"],
      accommodations: ["Picture question cards", "Partner choice", "Gesture options", "Teacher support"],
      assessmentType: "formative",
      assessmentNotes: "Track peer interaction, question formation, social engagement",
      expectations: ["1CO.5", "1CO.3", "1CO.6"]
    },
    {
      date: new Date('2025-09-19T09:00:00'),
      title: "Classroom Community",
      titleFr: "Notre communauté de classe",
      mindsOn: "Web of connection: Yarn web showing what we share. Use simple French: 'J'aime...', 'Moi aussi!'",
      action: "Create class book 'Notre classe'. Each adds a page about self in French. Community helpers in our class. Kindness cards in French.",
      consolidation: "Present class book pages. Celebrate our French-speaking community.",
      learningGoals: "Students will see themselves as part of a French-speaking community",
      materials: ["Yarn", "Book pages", "Markers", "Kindness cards", "Binding materials"],
      accommodations: ["Scribing available", "Picture options", "Choice in contribution", "Peer support"],
      assessmentType: "formative",
      assessmentNotes: "Assess community building, French identity, collaboration",
      expectations: ["1CO.5", "1É.2", "1CO.6"]
    },
    {
      date: new Date('2025-09-20T09:00:00'),
      title: "Celebration of Learning",
      titleFr: "Célébration d'apprentissage",
      mindsOn: "Gallery walk of our French work from two weeks. Students find their favorite pieces.",
      action: "Prepare mini-presentations of learning. Practice with partners. Create 'I can' badges in French. Set up celebration stations.",
      consolidation: "Celebration assembly: Share learning with another class or families. French songs and demonstrations.",
      learningGoals: "Students will celebrate and share their French learning",
      materials: ["Student work", "Badges", "Presentation cards", "Celebration supplies"],
      accommodations: ["Choice in presentation", "Partner presentations", "Visual supports", "Family support"],
      assessmentType: "summative",
      assessmentNotes: "Document growth from week 1, confidence, vocabulary use",
      expectations: ["1CO.5", "1CO.6", "1É.3"]
    },
    
    // Week 4: School and Actions (Sept 23-27, 5 days)
    {
      date: new Date('2025-09-23T09:00:00'),
      title: "School Helpers",
      titleFr: "Les aidants de l'école",
      mindsOn: "Mystery visitor: School helper visits, students guess their job in French.",
      action: "School helper interviews with simple questions. Create thank you cards in French. Role-play different school jobs. Helper matching game.",
      consolidation: "Share which school helper job they'd like and why (gestures and simple French).",
      learningGoals: "Students will identify school helpers and their roles in French",
      materials: ["Visitor", "Interview cards", "Thank you cards", "Role-play props", "Matching cards"],
      accommodations: ["Picture supports", "Pre-made question cards", "Buddy interviews", "Choice in expression"],
      assessmentType: "formative",
      assessmentNotes: "Note vocabulary expansion, question use, community connection",
      expectations: ["1CO.5", "1CO.2", "1CO.3"]
    },
    {
      date: new Date('2025-09-24T09:00:00'),
      title: "Action Words",
      titleFr: "Les verbes d'action",
      mindsOn: "Simon Says (Jacques Dit) with basic actions. Focus on school actions: walk, sit, stand, listen, look.",
      action: "Action stations: act out verbs, match actions to pictures, create action dice, verb charades. Make personal action books.",
      consolidation: "Action freeze dance: When music stops, do an action and say it in French.",
      learningGoals: "Students will understand and use basic French action verbs",
      materials: ["Action cards", "Dice template", "Music", "Book materials", "Picture cards"],
      accommodations: ["Start with 3-4 verbs", "Physical support", "Picture cues", "Partner modeling"],
      assessmentType: "formative",
      assessmentNotes: "Track comprehension of commands, verb usage, physical response",
      expectations: ["1CO.5", "1CO.2", "1CO.0"]
    },
    {
      date: new Date('2025-09-25T09:00:00'),
      title: "What I Like",
      titleFr: "Ce que j'aime",
      mindsOn: "Teacher shares likes with props: 'J'aime les pommes, j'aime le bleu...' Students predict next item.",
      action: "Create 'J'aime' books with magazine pictures. Survey friends about likes. Like/don't like sorting. Preference graphs.",
      consolidation: "Speed sharing: Quick partners share one thing they like in French.",
      learningGoals: "Students will express preferences in French",
      materials: ["Props", "Magazines", "Glue", "Survey sheets", "Graph paper"],
      accommodations: ["Picture choices", "Sentence starters", "Yes/no options", "Peer support"],
      assessmentType: "formative",
      assessmentNotes: "Assess expression of preferences, use of 'j'aime', peer interaction",
      expectations: ["1CO.5", "1É.2", "1CO.3"]
    },
    {
      date: new Date('2025-09-26T09:00:00'),
      title: "September Weather",
      titleFr: "La météo de septembre",
      mindsOn: "Weather observation: Look outside, describe in French with gestures. Weather song with movements.",
      action: "Create weather wheel for daily use. Weather dress-up relay. Make weather journals. Track weekly weather in French.",
      consolidation: "Weather reporters: Students report today's weather in French to the class.",
      learningGoals: "Students will describe weather in French",
      materials: ["Weather wheel", "Dress-up clothes", "Journals", "Weather symbols", "Microphone prop"],
      accommodations: ["Weather pictures", "Simplified terms", "Partner reporting", "Gesture support"],
      assessmentType: "formative",
      assessmentNotes: "Note weather vocabulary, daily routine integration, confidence",
      expectations: ["1CO.5", "1L.2", "1É.2"]
    },
    {
      date: new Date('2025-09-27T09:00:00'),
      title: "Month-End Reflection",
      titleFr: "Réflexion de fin de mois",
      mindsOn: "French learning journey map: Show where we started and where we are now.",
      action: "Create September learning portfolios. Record French messages for families. Update 'I can' lists. Plan October learning wishes.",
      consolidation: "Circle of success: Each student shares one French success from September.",
      learningGoals: "Students will reflect on their French learning progress",
      materials: ["Journey map", "Portfolios", "Recording device", "I can lists", "Success tokens"],
      accommodations: ["Visual portfolios", "Choice in sharing", "Family language included", "Peer support"],
      assessmentType: "summative",
      assessmentNotes: "Document September growth, self-assessment, goal setting",
      expectations: ["1CO.6", "1L.5", "1É.3"]
    },
    {
      date: new Date('2025-09-30T09:00:00'),
      title: "Welcome October",
      titleFr: "Bienvenue octobre",
      mindsOn: "September memories: Share favorite French learning moment. Preview October with picture cards.",
      action: "Create October calendars with French labels. Autumn walk with French observations. October goal setting. Transition activities.",
      consolidation: "October excitement circle: Share what you want to learn in French next.",
      learningGoals: "Students will transition to October learning with confidence",
      materials: ["Calendar templates", "Autumn collection bags", "Goal cards", "October preview cards"],
      accommodations: ["Visual goals", "Peer partnerships", "Choice in goals", "Scaffolded planning"],
      assessmentType: "diagnostic",
      assessmentNotes: "Assess readiness for October, continuing needs, interests",
      expectations: ["1CO.6", "1CO.1", "1L.1"]
    }
  ];
  
  // Create each lesson with full ETFO structure
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    
    const created = await prisma.eTFOLessonPlan.create({
      data: {
        userId: emily.id,
        unitPlanId: unitId,
        title: lesson.title,
        titleFr: lesson.titleFr,
        date: lesson.date,
        duration: 60,
        mindsOn: lesson.mindsOn,
        mindsOnFr: lesson.mindsOn,
        action: lesson.action,
        actionFr: lesson.action,
        consolidation: lesson.consolidation,
        consolidationFr: lesson.consolidation,
        learningGoals: lesson.learningGoals,
        learningGoalsFr: lesson.learningGoals,
        materials: lesson.materials,
        accommodations: lesson.accommodations,
        grouping: "whole class, small groups, partners",
        assessmentType: lesson.assessmentType,
        assessmentNotes: lesson.assessmentNotes,
        isSubFriendly: true,
        subNotes: "All materials are labeled and organized in the French center. Visual supports are available for all vocabulary. Maintain a calm, encouraging atmosphere for French learning.",
        grade: 1,
        subject: "Français (Immersion)",
        language: "fr",
        differentiationStrategies: {
          forStruggling: "Additional visual supports, peer partners, allow gesture/pointing, reduced vocabulary",
          forOnLevel: "Standard lesson activities with choice and voice",
          forAdvanced: "Extended vocabulary, leadership roles, peer teaching opportunities"
        },
        priorKnowledgeCheck: i === 0 ? "First day - assess any French exposure, comfort with new language" : "Review previous day's vocabulary and concepts",
        engagementHooks: ["songs", "games", "puppets", "hands-on materials"],
        formativeCheckpoints: ["entrance routine", "mid-lesson check", "exit observation"],
        indigenousPerspectives: "Daily land acknowledgment in French, seasonal connections to Mi'kmaq teachings",
        reflectionActivities: ["thumbs up/down", "one word share", "picture response", "partner tell"]
      }
    });
    
    // Link to curriculum expectations
    if (lesson.expectations) {
      for (const expCode of lesson.expectations) {
        const expectation = await prisma.curriculumExpectation.findFirst({
          where: { code: expCode }
        });
        
        if (expectation) {
          await prisma.eTFOLessonPlanExpectation.create({
            data: {
              lessonPlanId: created.id,
              expectationId: expectation.id
            }
          });
        }
      }
    }
    
    console.log(`✓ Created Day ${i + 1}: ${lesson.title}`);
  }
  
  console.log('\n✅ Successfully created 19 perfect September French Foundations lessons');
  console.log('\nKey features:');
  console.log('- Logical progression from greetings to preferences');
  console.log('- ETFO three-part structure in every lesson');
  console.log('- Age-appropriate for beginning Grade 1');
  console.log('- Proper differentiation and accommodations');
  console.log('- Assessment opportunities throughout');
  console.log('- Indigenous perspectives integrated');
  console.log('- Family and community connections');
  
  return lessons.length;
}

createSeptemberLessons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());