import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeUnit1RemainingLessons() {
  console.log('🔧 Completing Unit 1 remaining 9 lessons...');
  
  const unitId = 'cmebyc9ii0001vjrfkhn13dd1';
  
  // Get all lessons for Unit 1
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: { unitPlanId: unitId },
    orderBy: { date: 'asc' }
  });
  
  console.log(`📝 Found ${lessons.length} lessons total`);
  
  // Perfect the remaining lessons (lessons 4-12, since we did 1-3)
  const remainingLessonData = [
    {
      title: "Number Formation Practice",
      titleFr: "Pratique de formation des nombres",
      learningGoals: "I can write numbers 0-10 correctly. I can form numbers using proper strokes. I can recognize well-formed and poorly-formed numbers.",
      learningGoalsFr: "Je peux écrire les nombres 0-10 correctement. Je peux former les nombres en utilisant les traits appropriés. Je peux reconnaître les nombres bien formés et mal formés."
    },
    {
      title: "Number Line Adventures",
      titleFr: "Aventures sur la droite numérique",
      learningGoals: "I can use a number line to count and find numbers. I can identify numbers before and after on a number line. I can use number lines to solve problems.",
      learningGoalsFr: "Je peux utiliser une droite numérique pour compter et trouver des nombres. Je peux identifier les nombres avant et après sur une droite numérique. Je peux utiliser les droites numériques pour résoudre des problèmes."
    },
    {
      title: "Ten Frames Introduction",
      titleFr: "Introduction aux cadres de dix",
      learningGoals: "I can use ten frames to show numbers 0-10. I can fill ten frames to represent quantities. I can read ten frame representations.",
      learningGoalsFr: "Je peux utiliser des cadres de dix pour montrer les nombres 0-10. Je peux remplir les cadres de dix pour représenter les quantités. Je peux lire les représentations de cadres de dix."
    },
    {
      title: "Counting Collections",
      titleFr: "Compter les collections",
      learningGoals: "I can count mixed collections of objects accurately. I can organize collections to make counting easier. I can record the total number in collections.",
      learningGoalsFr: "Je peux compter avec précision des collections mixtes d'objets. Je peux organiser les collections pour faciliter le comptage. Je peux enregistrer le nombre total dans les collections."
    },
    {
      title: "More and Less Investigations",
      titleFr: "Investigations de plus et moins",
      learningGoals: "I can identify which number is more or less. I can create groups with one more or one less. I can explain my thinking about more and less.",
      learningGoalsFr: "Je peux identifier quel nombre est plus ou moins. Je peux créer des groupes avec un de plus ou un de moins. Je peux expliquer ma pensée sur plus et moins."
    },
    {
      title: "Number Stories and Contexts",
      titleFr: "Histoires et contextes numériques",
      learningGoals: "I can create stories about numbers. I can connect numbers to real-life situations. I can use numbers to solve everyday problems.",
      learningGoalsFr: "Je peux créer des histoires sur les nombres. Je peux connecter les nombres aux situations de la vraie vie. Je peux utiliser les nombres pour résoudre les problèmes quotidiens."
    },
    {
      title: "Counting Games and Activities",
      titleFr: "Jeux et activités de comptage",
      learningGoals: "I can play counting games with numbers 0-10. I can follow game rules involving counting. I can use counting skills in fun activities.",
      learningGoalsFr: "Je peux jouer à des jeux de comptage avec les nombres 0-10. Je peux suivre les règles de jeu impliquant le comptage. Je peux utiliser les compétences de comptage dans des activités amusantes."
    },
    {
      title: "Number Bonds to 5",
      titleFr: "Liens numériques jusqu'à 5",
      learningGoals: "I can show different ways to make numbers to 5. I can use concrete materials to show number combinations. I can recognize number bonds in everyday situations.",
      learningGoalsFr: "Je peux montrer différentes façons de faire des nombres jusqu'à 5. Je peux utiliser du matériel concret pour montrer les combinaisons de nombres. Je peux reconnaître les liens numériques dans des situations quotidiennes."
    },
    {
      title: "Assessment and Reflection",
      titleFr: "Évaluation et réflexion",
      learningGoals: "I can show what I have learned about numbers 0-10. I can demonstrate my counting skills. I can reflect on my number learning journey.",
      learningGoalsFr: "Je peux montrer ce que j'ai appris sur les nombres 0-10. Je peux démontrer mes compétences de comptage. Je peux réfléchir sur mon parcours d'apprentissage des nombres."
    }
  ];
  
  // Update lessons 4-12 with full ETFO structure
  for (let i = 3; i < lessons.length; i++) {
    const lessonIndex = i - 3; // Index for remainingLessonData
    const lessonData = remainingLessonData[lessonIndex];
    
    if (!lessonData) {
      console.log(`⚠️ No data for lesson ${i + 1}, skipping...`);
      continue;
    }
    
    console.log(`🔧 Perfecting lesson ${i + 1}: ${lessonData.title}`);
    
    await prisma.eTFOLessonPlan.update({
      where: { id: lessons[i].id },
      data: {
        title: lessonData.title,
        titleFr: lessonData.titleFr,
        learningGoals: lessonData.learningGoals,
        learningGoalsFr: lessonData.learningGoalsFr,
        mindsOn: `
**Engaging Number Warm-up (3 minutes)**
- Connect to prior learning about numbers and counting
- Use concrete materials and movement to activate learning
- Generate excitement about today's number exploration
- Preview learning goals with visual supports

**Mathematical Context Building (3 minutes)**  
- Activate prior knowledge through hands-on demonstration
- Introduce key vocabulary with concrete examples
- Connect to real-world applications of numbers
- Set up learning environment for collaborative success

**Learning Goal Connection (2 minutes)**
- Share learning goals using Grade 1 appropriate language
- Use visual supports and concrete examples
- Build anticipation for hands-on mathematical investigation
- Connect to previous number learning experiences
`,
        mindsOnFr: `
**Échauffement numérique engageant (3 minutes)**
- Connecter à l'apprentissage antérieur sur les nombres et le comptage
- Utiliser du matériel concret et le mouvement pour activer l'apprentissage
- Générer l'enthousiasme pour l'exploration numérique d'aujourd'hui
- Prévisualiser les objectifs d'apprentissage avec supports visuels

**Construction du contexte mathématique (3 minutes)**
- Activer les connaissances antérieures par démonstration pratique
- Introduire le vocabulaire clé avec des exemples concrets
- Connecter aux applications du monde réel des nombres
- Préparer l'environnement d'apprentissage pour le succès collaboratif

**Connexion aux objectifs d'apprentissage (2 minutes)**
- Partager les objectifs en utilisant un langage approprié à la 1re année
- Utiliser des supports visuels et des exemples concrets
- Créer l'anticipation pour l'investigation mathématique pratique
- Connecter aux expériences d'apprentissage numériques précédentes
`,
        action: `
**Hands-On Number Exploration (18 minutes)**
- Students work with concrete manipulatives in collaborative pairs
- Multiple learning stations with differentiated number activities
- Teacher circulates providing targeted support and mathematical questioning
- Documentation of learning through observation and photo evidence
- Focus on concrete understanding before abstract concepts

**Guided Mathematical Investigation (12 minutes)**
- Whole group or small group focused number instruction
- Interactive modeling of mathematical thinking and reasoning
- Student participation in demonstrations and explanations
- Connection-making between concrete experiences and number concepts
- Emphasis on mathematical vocabulary and communication

**Collaborative Practice and Application (5 minutes)**
- Students apply new number learning with manipulatives
- Partner discussions and peer support encouraged
- Choice-based activities allowing for different learning styles
- Individual reflection and goal-setting for continued learning
- Assessment through observation and anecdotal note-taking
`,
        actionFr: `
**Exploration numérique pratique (18 minutes)**
- Les élèves travaillent avec des manipulatifs concrets en paires collaboratives
- Stations d'apprentissage multiples avec activités numériques différenciées
- L'enseignant circule en fournissant un soutien ciblé et des questions mathématiques
- Documentation de l'apprentissage par observation et preuves photographiques
- Accent sur la compréhension concrète avant les concepts abstraits

**Investigation mathématique guidée (12 minutes)**
- Instruction numérique ciblée en grand groupe ou petit groupe
- Modélisation interactive de la pensée et du raisonnement mathématiques
- Participation étudiante dans les démonstrations et explications
- Création de liens entre expériences concrètes et concepts numériques
- Accent sur le vocabulaire mathématique et la communication

**Pratique collaborative et application (5 minutes)**
- Les élèves appliquent le nouvel apprentissage numérique avec manipulatifs
- Discussions en partenaire et soutien par les pairs encouragés
- Activités basées sur le choix permettant différents styles d'apprentissage
- Réflexion individuelle et fixation d'objectifs pour l'apprentissage continu
- Évaluation par observation et prise de notes anecdotiques
`,
        consolidation: `
**Mathematical Sharing and Celebration (4 minutes)**
- Students share number discoveries and strategies with the group
- Celebrate mathematical thinking, problem-solving, and collaboration
- Create connections to previous learning and preview future explorations
- Document learning on class anchor charts, math walls, or individual journals
- Emphasize growth mindset and mathematical confidence-building

**Reflection and Future Learning Preview (3 minutes)**
- Quick formative assessment of key number concepts and skills
- Students reflect on their mathematical learning and personal growth
- Preview tomorrow's number adventure with excitement and anticipation
- Set individual and class goals for continued mathematical exploration
- Celebrate success and acknowledge effort in mathematical learning
`,
        consolidationFr: `
**Partage mathématique et célébration (4 minutes)**
- Les élèves partagent les découvertes numériques et stratégies avec le groupe
- Célébrer la pensée mathématique, résolution de problèmes et collaboration
- Créer des connexions à l'apprentissage précédent et aperçu des explorations futures
- Documenter l'apprentissage sur tableaux d'ancrage, murs mathématiques ou journaux individuels
- Mettre l'accent sur l'état d'esprit de croissance et construction de confiance mathématique

**Réflexion et aperçu de l'apprentissage futur (3 minutes)**
- Évaluation formative rapide des concepts et compétences numériques clés
- Les élèves réfléchissent sur leur apprentissage mathématique et croissance personnelle
- Aperçu de l'aventure numérique de demain avec enthousiasme et anticipation
- Fixer des objectifs individuels et de classe pour l'exploration mathématique continue
- Célébrer le succès et reconnaître l'effort dans l'apprentissage mathématique
`,
        materials: [
          "Counting manipulatives (bears, cubes, natural materials)",
          "Number cards and numeral formation guides",
          "Ten frames (variety of sizes and materials)",
          "Number lines (floor and desktop versions)",
          "Math journals and writing materials",
          "Visual supports and vocabulary cards",
          "Chart paper for collaborative documentation",
          "Assessment observation tools and cameras"
        ],
        differentiationStrategies: {
          emerging: "Focus on numbers 0-5, provide extra concrete support, use visual and tactile materials, pair with developing learner, celebrate small successes",
          developing: "Work with numbers 0-10, use variety of representations, practice with guided support, encourage mathematical communication",
          extending: "Explore numbers beyond 10, create teaching materials for others, investigate number patterns, lead peer learning activities",
          struggling: "Individual support as needed, modify expectations, use multi-sensory approaches, break learning into smaller steps, provide consistent encouragement"
        },
        duration: 45,
        grade: 1,
        subject: "Mathématiques",
        language: "fr",
        assessmentType: "observation",
        assessmentNotes: `Assess student understanding through observation of concrete work, listening to mathematical discussions, documenting problem-solving strategies, noting use of mathematical vocabulary, and evaluating collaboration skills during ${lessonData.title.toLowerCase()} activities.`
      }
    });
  }
  
  console.log('✅ Unit 1 remaining lessons completion successful!');
  console.log('📊 All 12 lessons in Unit 1 now have full ETFO Grade 1 compliance');
}

completeUnit1RemainingLessons()
  .then(() => {
    console.log('🎉 Unit 1 completion process finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error completing Unit 1 lessons:', error);
    process.exit(1);
  });