import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function improveConsolidationSections() {
  console.log('✨ IMPROVING LESSON CONSOLIDATION SECTIONS');
  console.log('='.repeat(70));
  
  // Get lessons with weak consolidation
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true }
  });
  
  // Identify weak consolidation sections
  const weakConsolidations = lessons.filter(lesson => {
    const consolidation = lesson.consolidation || '';
    return consolidation.length < 50 || 
           (!consolidation.includes('partage') && 
            !consolidation.includes('réflex') &&
            !consolidation.includes('discuss'));
  });
  
  console.log(`Found ${weakConsolidations.length} lessons with weak consolidation sections`);
  
  // Consolidation templates based on subject and type
  const consolidationTemplates = {
    math: [
      "Cercle de partage mathématique: Chaque élève présente sa stratégie préférée. Discussion: Quelle méthode était la plus efficace? Pourquoi? Réflexion dans le journal: 'Aujourd'hui j'ai appris que les nombres...' Défi pour demain: Trouvez {concept} à la maison!",
      "Galerie mathématique: Exposition des solutions. Les élèves circulent avec des post-its pour noter 'J'aime ta stratégie parce que...' Synthèse collective: Créons notre affiche des stratégies gagnantes. Auto-évaluation: Pouce levé/baissé pour ma compréhension.",
      "Jeu de consolidation: 'Math en mouvement' - Les élèves démontrent {concept} avec leur corps. Discussion en pairs: Expliquez votre apprentissage à un ami. Question de sortie sur tableau: 'La chose la plus importante que j'ai apprise est...'",
    ],
    
    french: [
      "Cercle d'auteurs: Partage des créations en petits groupes. Deux étoiles et un souhait pour chaque présentation. Réflexion collective: Qu'est-ce qui rend un texte intéressant? Portfolio: Ajoutez votre meilleur travail avec une note explicative.",
      "Théâtre des lecteurs: Présentation dramatique des textes. Applaudissements et commentaires positifs. Discussion: Comment nos voix donnent vie aux mots? Journal de bord: 'Mon moment préféré était quand...' Préparation: Pratique à la maison pour la famille.",
      "Musée vivant du français: Exposition interactive des travaux. Les visiteurs posent des questions aux auteurs. Réflexion guidée: Comment je me suis amélioré depuis septembre? Célébration: Certificat du 'Mot extraordinaire du jour'.",
    ],
    
    science: [
      "Conférence scientifique: Présentation des découvertes avec démonstrations. Questions du public et réponses des experts. Synthèse visuelle: Carte conceptuelle collective. Carnet de scientifique: Dessin et description de l'apprentissage clé. Défi: Observer ce phénomène dans la nature.",
      "Laboratoire de partage: Rotation des stations pour partager les expériences. Panneau 'Eureka!': Moments de découverte affichés. Discussion: Qu'est-ce qui nous a surpris? Prédiction: Que se passerait-il si...? Application: Comment utiliser cette connaissance?",
      "Expo-sciences miniature: Stands de présentation par équipes. Vote pour la découverte la plus étonnante. Réflexion en cercle: Les scientifiques font des erreurs et apprennent! Journal illustré: Mon parcours de découverte aujourd'hui.",
    ],
    
    social: [
      "Conseil de communauté: Discussion sur nos apprentissages citoyens. Tour de parole avec bâton de parole. Engagement: Une action positive pour notre classe/école. Affiche collaborative: Nos promesses de bons citoyens. Réflexion silencieuse: Comment j'ai grandi aujourd'hui?",
      "Simulation de société: Mise en pratique des concepts appris. Débriefing: Qu'avons-nous appris sur le vivre-ensemble? Charte de classe: Ajout de nouvelles règles découvertes. Partage en famille: Lettre aux parents sur notre apprentissage.",
      "Célébration culturelle: Présentation des traditions étudiées. Dégustation/démonstration si applicable. Livre d'or: Chacun écrit ce qu'il a apprécié. Connexion personnelle: Lien avec notre propre culture. Projet: Créer notre propre tradition de classe.",
    ],
    
    arts: [
      "Vernissage artistique: Exposition avec cartons explicatifs. Visite guidée par les artistes. Livre d'or pour commentaires positifs. Réflexion: Mon processus créatif en 3 étapes. Portfolio: Photo de l'œuvre avec autoévaluation. Inspiration: Artiste à découvrir cette semaine.",
      "Performance créative: Présentation musicale/théâtrale/danse. Ovation debout et bravos! Discussion: Les émotions ressenties. Journal artistique: Croquis et mots sur l'expérience. Pratique continue: Enseigner un mouvement/rythme à la famille.",
      "Atelier de maître: Les élèves enseignent leur technique. Création collective inspirée des apprentissages. Cercle d'appréciation: Ce que j'ai admiré chez les autres. Documentation: Photos pour notre album de classe. Défi créatif: Nouvelle création à la maison.",
    ],
    
    physical: [
      "Célébration sportive: Démonstration des habiletés acquises. Encouragements et high-fives. Réflexion sur l'esprit sportif: Les bons gestes observés. Étirements de retour au calme avec respiration. Journal santé: Comment je me sens après l'exercice? Plan: Mon activité physique ce soir.",
      "Olympiade de classe: Mini-compétitions amicales. Médailles de participation pour tous. Discussion: L'importance de l'effort vs résultat. Hydratation et collation santé. Auto-évaluation: Mes progrès depuis le début. Engagement: 20 minutes d'activité quotidienne.",
      "Chorégraphie collective: Création d'un enchaînement de groupe. Présentation avec musique. Applaudissements rythmés. Réflexion: La coopération dans le mouvement. Relaxation guidée de 2 minutes. Défi famille: Enseigner notre danse à la maison.",
    ]
  };
  
  let improved = 0;
  const batchSize = 50;
  
  for (let i = 0; i < Math.min(weakConsolidations.length, 200); i += batchSize) {
    const batch = weakConsolidations.slice(i, i + batchSize);
    
    console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}...`);
    
    const updates = batch.map(async (lesson) => {
      // Determine subject area from lesson content
      const content = (lesson.title + ' ' + lesson.learningGoals + ' ' + lesson.action).toLowerCase();
      
      let subjectTemplates;
      if (content.includes('math') || content.includes('nombre') || content.includes('calcul')) {
        subjectTemplates = consolidationTemplates.math;
      } else if (content.includes('français') || content.includes('lecture') || content.includes('écriture')) {
        subjectTemplates = consolidationTemplates.french;
      } else if (content.includes('science') || content.includes('expéri') || content.includes('observ')) {
        subjectTemplates = consolidationTemplates.science;
      } else if (content.includes('communaut') || content.includes('citoyen') || content.includes('société')) {
        subjectTemplates = consolidationTemplates.social;
      } else if (content.includes('art') || content.includes('musi') || content.includes('dans') || content.includes('créa')) {
        subjectTemplates = consolidationTemplates.arts;
      } else if (content.includes('physique') || content.includes('mouvement') || content.includes('sport')) {
        subjectTemplates = consolidationTemplates.physical;
      } else {
        subjectTemplates = consolidationTemplates.french; // Default
      }
      
      // Select a template and customize it
      const template = subjectTemplates[i % subjectTemplates.length];
      const customized = template
        .replace('{concept}', 'ce concept')
        .replace('{skill}', 'cette habileté');
      
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: { consolidation: customized }
      });
      
      improved++;
    });
    
    await Promise.all(updates);
    console.log(`✅ Improved ${improved} consolidation sections`);
  }
  
  // Also improve Minds On sections for the worst cases
  console.log('\n📚 IMPROVING MINDS ON SECTIONS');
  
  const weakMindsOn = lessons.filter(lesson => {
    const mindsOn = lesson.mindsOn || '';
    return mindsOn.length < 50 || !mindsOn.includes('?');
  });
  
  console.log(`Found ${weakMindsOn.length} lessons with weak Minds On sections`);
  
  const mindsOnTemplates = [
    "Mystère du jour: {object} caché dans un sac. Indices donnés un par un. Les élèves posent des questions oui/non pour deviner. Connexion: 'Ceci nous aidera à apprendre...' Activation: Que savez-vous déjà sur ce sujet? Tour de table rapide.",
    "Défi d'entrée: Problème affiché au tableau à résoudre en équipe de 2. Musique de réflexion (2 min). Partage des solutions. Question provocante: 'Que se passerait-il si...?' Prédictions notées au tableau.",
    "Histoire mystère: Début d'une histoire liée au thème, arrêt au moment critique. 'Que va-t-il se passer?' Discussions en pairs. Votes pour les prédictions. Révélation: Nous allons découvrir ensemble! Vocabulaire clé introduit.",
    "Chasse au trésor rapide: 5 objets/images cachés dans la classe. 1 minute pour trouver. Regroupement: Qu'ont-ils en commun? Hypothèses partagées. Grande révélation du thème du jour. KWL chart commencé ensemble.",
    "Capsule vidéo intrigante (30 sec) sans son. Observations: Que voyez-vous? Questions: Que voulez-vous savoir? Visionnement avec son. Surprise! Discussion: Comment cela connecte avec hier? Objectif du jour révélé.",
  ];
  
  let mindsOnImproved = 0;
  
  for (let i = 0; i < Math.min(weakMindsOn.length, 100); i++) {
    const lesson = weakMindsOn[i];
    const template = mindsOnTemplates[i % mindsOnTemplates.length];
    const customized = template.replace('{object}', 'Objet mystère');
    
    await prisma.eTFOLessonPlan.update({
      where: { id: lesson.id },
      data: { mindsOn: customized }
    });
    
    mindsOnImproved++;
  }
  
  console.log(`✅ Improved ${mindsOnImproved} Minds On sections`);
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 LESSON QUALITY IMPROVEMENT COMPLETE!');
  console.log(`Total improvements: ${improved} consolidations, ${mindsOnImproved} Minds On sections`);
  
  await prisma.$disconnect();
}

improveConsolidationSections().catch(console.error);