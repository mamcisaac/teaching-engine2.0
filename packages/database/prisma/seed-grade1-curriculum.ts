#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGrade1Curriculum() {
  console.log('🚀 Starting Grade 1 French Immersion curriculum seed...');
  
  try {
    // Clear existing Grade 1 curriculum
    console.log('🗑️ Clearing existing Grade 1 curriculum expectations...');
    await prisma.curriculumExpectation.deleteMany({
      where: { grade: 1 }
    });
    
    let totalCreated = 0;
    
    // 1. FRANÇAIS LANGUE PREMIÈRE - Communication orale
    console.log('📢 Creating Communication orale expectations...');
    const oralCommunication = [
      { code: 'CO1.1', description: 'Démontrer sa compréhension de courts textes oraux en français', strand: 'Communication orale', substrand: 'Compréhension' },
      { code: 'CO1.2', description: 'Communiquer oralement en français dans diverses situations', strand: 'Communication orale', substrand: 'Expression' },
      { code: 'CO1.3', description: 'Utiliser le vocabulaire approprié selon le contexte', strand: 'Communication orale', substrand: 'Vocabulaire' },
      { code: 'CO1.4', description: 'Poser des questions simples et y répondre en français', strand: 'Communication orale', substrand: 'Interaction' },
      { code: 'CO1.5', description: 'Raconter des événements vécus ou imaginés', strand: 'Communication orale', substrand: 'Narration' },
      { code: 'CO1.6', description: 'Exprimer ses besoins, ses sentiments et ses opinions', strand: 'Communication orale', substrand: 'Expression personnelle' },
      { code: 'CO1.7', description: 'Écouter attentivement et respecter les tours de parole', strand: 'Communication orale', substrand: 'Écoute active' },
      { code: 'CO1.8', description: 'Utiliser des gestes et des expressions faciales pour appuyer la communication', strand: 'Communication orale', substrand: 'Communication non verbale' }
    ];
    
    for (const exp of oralCommunication) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Français langue première',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 2. FRANÇAIS LANGUE PREMIÈRE - Lecture
    console.log('📖 Creating Lecture expectations...');
    const reading = [
      { code: 'L1.1', description: "Identifier les lettres de l'alphabet et leurs sons", strand: 'Lecture', substrand: 'Correspondances graphème-phonème' },
      { code: 'L1.2', description: 'Lire des mots familiers à vue', strand: 'Lecture', substrand: 'Mots fréquents' },
      { code: 'L1.3', description: 'Décoder des mots simples en utilisant des stratégies', strand: 'Lecture', substrand: 'Décodage' },
      { code: 'L1.4', description: 'Comprendre des textes simples avec support visuel', strand: 'Lecture', substrand: 'Compréhension' },
      { code: 'L1.5', description: 'Identifier les éléments principaux d\'une histoire', strand: 'Lecture', substrand: 'Éléments narratifs' },
      { code: 'L1.6', description: 'Faire des prédictions à partir des illustrations', strand: 'Lecture', substrand: 'Stratégies de compréhension' },
      { code: 'L1.7', description: 'Établir des liens entre le texte et ses expériences personnelles', strand: 'Lecture', substrand: 'Connexions' },
      { code: 'L1.8', description: 'Reconnaître différents types de textes', strand: 'Lecture', substrand: 'Genres littéraires' }
    ];
    
    for (const exp of reading) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Français langue première',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 3. FRANÇAIS LANGUE PREMIÈRE - Écriture
    console.log('✏️ Creating Écriture expectations...');
    const writing = [
      { code: 'E1.1', description: 'Former correctement les lettres de l\'alphabet', strand: 'Écriture', substrand: 'Calligraphie' },
      { code: 'E1.2', description: 'Écrire des mots simples phonétiquement', strand: 'Écriture', substrand: 'Orthographe' },
      { code: 'E1.3', description: 'Composer des phrases simples', strand: 'Écriture', substrand: 'Composition' },
      { code: 'E1.4', description: 'Utiliser la majuscule et le point', strand: 'Écriture', substrand: 'Ponctuation' },
      { code: 'E1.5', description: 'Écrire des messages courts pour diverses intentions', strand: 'Écriture', substrand: 'Genres' },
      { code: 'E1.6', description: 'Illustrer ses écrits pour appuyer le message', strand: 'Écriture', substrand: 'Représentation visuelle' }
    ];
    
    for (const exp of writing) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Français langue première',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 4. MATHÉMATIQUES (in French)
    console.log('🔢 Creating Mathématiques expectations...');
    const math = [
      { code: 'N1.1', description: 'Compter jusqu\'à 100 par bonds de 1, 2, 5 et 10', strand: 'Nombre', substrand: 'Numération' },
      { code: 'N1.2', description: 'Comparer et ordonner des nombres jusqu\'à 50', strand: 'Nombre', substrand: 'Relations numériques' },
      { code: 'N1.3', description: 'Additionner et soustraire jusqu\'à 20', strand: 'Nombre', substrand: 'Opérations' },
      { code: 'N1.4', description: 'Résoudre des problèmes simples', strand: 'Nombre', substrand: 'Résolution de problèmes' },
      { code: 'G1.1', description: 'Identifier et décrire des formes géométriques de base', strand: 'Géométrie', substrand: 'Formes' },
      { code: 'G1.2', description: 'Créer et identifier des régularités', strand: 'Géométrie', substrand: 'Régularités' },
      { code: 'M1.1', description: 'Mesurer avec des unités non conventionnelles', strand: 'Mesure', substrand: 'Longueur' },
      { code: 'M1.2', description: 'Identifier les jours, semaines et mois', strand: 'Mesure', substrand: 'Temps' },
      { code: 'S1.1', description: 'Collecter et organiser des données simples', strand: 'Statistiques', substrand: 'Données' },
      { code: 'S1.2', description: 'Créer des graphiques concrets et pictogrammes', strand: 'Statistiques', substrand: 'Représentation' }
    ];
    
    for (const exp of math) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Mathématiques',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 5. SCIENCES (in French)
    console.log('🔬 Creating Sciences expectations...');
    const science = [
      { code: 'SC1.1', description: 'Observer et décrire les caractéristiques des êtres vivants', strand: 'Systèmes vivants', substrand: 'Caractéristiques' },
      { code: 'SC1.2', description: 'Identifier les besoins des êtres vivants', strand: 'Systèmes vivants', substrand: 'Besoins essentiels' },
      { code: 'SC1.3', description: 'Explorer les changements saisonniers', strand: 'Systèmes de la Terre', substrand: 'Saisons' },
      { code: 'SC1.4', description: 'Observer et décrire le temps qu\'il fait', strand: 'Systèmes de la Terre', substrand: 'Météo' },
      { code: 'SC1.5', description: 'Identifier les propriétés des matériaux', strand: 'Matière et énergie', substrand: 'Propriétés' },
      { code: 'SC1.6', description: 'Explorer les forces simples (pousser, tirer)', strand: 'Structures et mécanismes', substrand: 'Forces' }
    ];
    
    for (const exp of science) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Sciences',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 6. ÉTUDES SOCIALES (in French with PEI focus)
    console.log('🌍 Creating Études sociales expectations...');
    const socialStudies = [
      { code: 'ES1.1', description: 'Identifier sa communauté locale à l\'Île-du-Prince-Édouard', strand: 'Communauté', substrand: 'Identité locale' },
      { code: 'ES1.2', description: 'Reconnaître les symboles de l\'Île-du-Prince-Édouard', strand: 'Communauté', substrand: 'Symboles provinciaux' },
      { code: 'ES1.3', description: 'Explorer l\'héritage acadien et francophone de l\'Île', strand: 'Culture', substrand: 'Patrimoine' },
      { code: 'ES1.4', description: 'Comprendre les rôles dans la famille et la communauté', strand: 'Citoyenneté', substrand: 'Rôles sociaux' },
      { code: 'ES1.5', description: 'Pratiquer le respect et la coopération', strand: 'Citoyenneté', substrand: 'Valeurs' },
      { code: 'ES1.6', description: 'Identifier les différences et similitudes entre les personnes', strand: 'Diversité', substrand: 'Inclusion' }
    ];
    
    for (const exp of socialStudies) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Études sociales',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 7. ARTS (in French)
    console.log('🎨 Creating Arts expectations...');
    const arts = [
      { code: 'AV1.1', description: 'Explorer différents matériaux artistiques', strand: 'Arts visuels', substrand: 'Exploration' },
      { code: 'AV1.2', description: 'Créer des œuvres inspirées de la culture acadienne', strand: 'Arts visuels', substrand: 'Création culturelle' },
      { code: 'AM1.1', description: 'Chanter des chansons françaises simples', strand: 'Arts musicaux', substrand: 'Chant' },
      { code: 'AM1.2', description: 'Explorer les sons et les rythmes', strand: 'Arts musicaux', substrand: 'Rythme' },
      { code: 'AD1.1', description: 'Exprimer des idées par le mouvement', strand: 'Arts dramatiques', substrand: 'Expression corporelle' },
      { code: 'AD1.2', description: 'Participer à des jeux de rôle en français', strand: 'Arts dramatiques', substrand: 'Jeu dramatique' }
    ];
    
    for (const exp of arts) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Arts',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 8. ÉDUCATION PHYSIQUE (in French)
    console.log('🏃 Creating Éducation physique expectations...');
    const physEd = [
      { code: 'EP1.1', description: 'Démontrer des habiletés locomotrices de base', strand: 'Habiletés motrices', substrand: 'Locomotion' },
      { code: 'EP1.2', description: 'Démontrer des habiletés de manipulation d\'objets', strand: 'Habiletés motrices', substrand: 'Manipulation' },
      { code: 'EP1.3', description: 'Participer à des jeux coopératifs simples', strand: 'Jeux et sports', substrand: 'Jeux coopératifs' },
      { code: 'EP1.4', description: 'Suivre les règles de sécurité lors des activités', strand: 'Sécurité', substrand: 'Prévention des blessures' },
      { code: 'EP1.5', description: 'Reconnaître l\'importance de l\'activité physique', strand: 'Vie active', substrand: 'Bienfaits de l\'exercice' }
    ];
    
    for (const exp of physEd) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Éducation physique',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 9. ÉDUCATION À LA SANTÉ (in French)
    console.log('🍎 Creating Éducation à la santé expectations...');
    const health = [
      { code: 'SA1.1', description: 'Identifier les habitudes de vie saines', strand: 'Santé personnelle', substrand: 'Habitudes' },
      { code: 'SA1.2', description: 'Reconnaître l\'importance de l\'hygiène personnelle', strand: 'Santé personnelle', substrand: 'Hygiène' },
      { code: 'SA1.3', description: 'Identifier les émotions de base', strand: 'Santé mentale', substrand: 'Émotions' },
      { code: 'SA1.4', description: 'Pratiquer des stratégies de gestion du stress', strand: 'Santé mentale', substrand: 'Bien-être' },
      { code: 'SA1.5', description: 'Comprendre la sécurité personnelle', strand: 'Sécurité', substrand: 'Protection personnelle' }
    ];
    
    for (const exp of health) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          descriptionFr: exp.description,
          strandFr: exp.strand,
          subject: 'Éducation à la santé',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 10. ENGLISH LANGUAGE ARTS (for French Immersion students)
    console.log('📝 Creating English Language Arts expectations...');
    const englishArts = [
      { code: 'ELA1.1', description: 'Develop phonemic awareness in English', strand: 'Oral Language', substrand: 'Phonemic Awareness' },
      { code: 'ELA1.2', description: 'Recognize and name English alphabet letters', strand: 'Reading', substrand: 'Letter Recognition' },
      { code: 'ELA1.3', description: 'Begin to decode simple English words', strand: 'Reading', substrand: 'Decoding' },
      { code: 'ELA1.4', description: 'Understand that English text flows left to right', strand: 'Reading', substrand: 'Print Concepts' },
      { code: 'ELA1.5', description: 'Listen to and understand simple English stories', strand: 'Oral Language', substrand: 'Listening Comprehension' },
      { code: 'ELA1.6', description: 'Speak simple English words and phrases', strand: 'Oral Language', substrand: 'Speaking' },
      { code: 'ELA1.7', description: 'Write English alphabet letters', strand: 'Writing', substrand: 'Letter Formation' },
      { code: 'ELA1.8', description: 'Compare and contrast French and English sounds', strand: 'Language Awareness', substrand: 'Bilingual Awareness' }
    ];
    
    for (const exp of englishArts) {
      await prisma.curriculumExpectation.create({
        data: {
          ...exp,
          description: exp.description,
          strand: exp.strand,
          subject: 'English Language Arts',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    console.log(`\n✅ Successfully created ${totalCreated} Grade 1 French Immersion curriculum expectations!`);
    
  } catch (error) {
    console.error('💥 Error seeding curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedGrade1Curriculum()
  .then(() => {
    console.log('\n🎯 Grade 1 curriculum seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Curriculum seeding failed:', error);
    process.exit(1);
  });