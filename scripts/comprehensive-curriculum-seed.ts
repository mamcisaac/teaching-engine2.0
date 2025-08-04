#!/usr/bin/env tsx

/**
 * Comprehensive Curriculum Seed Script
 * Creates realistic Grade 1 French Immersion curriculum expectations
 * Based on PEI French Immersion curriculum structure
 */

import { prisma } from '../server/src/prisma';

async function seedComprehensiveCurriculum() {
  console.log('🚀 Creating comprehensive Grade 1 French Immersion curriculum');
  
  try {
    // Clear existing curriculum expectations
    console.log('🗑️ Clearing existing curriculum expectations...');
    await prisma.curriculumExpectation.deleteMany();
    
    let totalCreated = 0;
    
    // 1. FRANÇAIS LANGUE PREMIÈRE - Communication orale
    console.log('📢 Creating Communication orale expectations...');
    const oralCommunicationExpectations = [
      {
        code: 'CO1.1',
        description: 'Démontrer sa compréhension de courts textes oraux en français',
        strand: 'Communication orale',
        substrand: 'Compréhension'
      },
      {
        code: 'CO1.2', 
        description: 'Communiquer oralement en français dans diverses situations',
        strand: 'Communication orale',
        substrand: 'Expression'
      },
      {
        code: 'CO1.3',
        description: 'Utiliser le vocabulaire approprié selon le contexte',
        strand: 'Communication orale',
        substrand: 'Vocabulaire'
      },
      {
        code: 'CO1.4',
        description: 'Poser des questions simples et y répondre en français',
        strand: 'Communication orale',
        substrand: 'Interaction'
      },
      {
        code: 'CO1.5',
        description: 'Raconter des événements vécus ou imaginés',
        strand: 'Communication orale',
        substrand: 'Narration'
      },
      {
        code: 'CO1.6',
        description: 'Exprimer ses besoins, ses sentiments et ses opinions',
        strand: 'Communication orale',
        substrand: 'Expression personnelle'
      },
      {
        code: 'CO1.7',
        description: 'Écouter attentivement et respecter les tours de parole',
        strand: 'Communication orale',
        substrand: 'Écoute active'
      },
      {
        code: 'CO1.8',
        description: 'Utiliser des gestes et des expressions faciales pour appuyer la communication',
        strand: 'Communication orale',
        substrand: 'Communication non verbale'
      }
    ];
    
    for (const expectation of oralCommunicationExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Français langue première',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 2. FRANÇAIS LANGUE PREMIÈRE - Lecture
    console.log('📖 Creating Lecture expectations...');
    const readingExpectations = [
      {
        code: 'L1.1',
        description: 'Identifier les lettres de l\'alphabet et leurs sons',
        strand: 'Lecture',
        substrand: 'Correspondances graphème-phonème'
      },
      {
        code: 'L1.2',
        description: 'Lire des mots familiers à vue',
        strand: 'Lecture',
        substrand: 'Reconnaissance de mots'
      },
      {
        code: 'L1.3',
        description: 'Utiliser diverses stratégies pour identifier les mots nouveaux',
        strand: 'Lecture',
        substrand: 'Stratégies de lecture'
      },
      {
        code: 'L1.4',
        description: 'Lire des phrases simples avec fluidité',
        strand: 'Lecture',
        substrand: 'Fluidité'
      },
      {
        code: 'L1.5',
        description: 'Comprendre le sens de textes simples',
        strand: 'Lecture',
        substrand: 'Compréhension'
      },
      {
        code: 'L1.6',
        description: 'Faire des prédictions à partir d\'images et de titres',
        strand: 'Lecture',
        substrand: 'Prédiction'
      },
      {
        code: 'L1.7',
        description: 'Identifier les personnages principaux d\'une histoire',
        strand: 'Lecture',
        substrand: 'Éléments littéraires'
      },
      {
        code: 'L1.8',
        description: 'Établir des liens entre le texte et son expérience personnelle',
        strand: 'Lecture',
        substrand: 'Liens texte-soi'
      },
      {
        code: 'L1.9',
        description: 'Utiliser les illustrations pour appuyer la compréhension',
        strand: 'Lecture',
        substrand: 'Éléments visuels'
      },
      {
        code: 'L1.10',
        description: 'Démontrer sa compréhension par le dessin ou oralement',
        strand: 'Lecture',
        substrand: 'Réaction au texte'
      }
    ];
    
    for (const expectation of readingExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Français langue première',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 3. FRANÇAIS LANGUE PREMIÈRE - Écriture
    console.log('✍️ Creating Écriture expectations...');
    const writingExpectations = [
      {
        code: 'É1.1',
        description: 'Former les lettres correctement',
        strand: 'Écriture',
        substrand: 'Calligraphie'
      },
      {
        code: 'É1.2',
        description: 'Écrire des mots simples en respectant l\'orthographe',
        strand: 'Écriture',
        substrand: 'Orthographe'
      },
      {
        code: 'É1.3',
        description: 'Composer des phrases simples',
        strand: 'Écriture',
        substrand: 'Production de phrases'
      },
      {
        code: 'É1.4',
        description: 'Écrire de courts textes sur des sujets familiers',
        strand: 'Écriture',
        substrand: 'Production de textes'
      },
      {
        code: 'É1.5',
        description: 'Utiliser des majuscules au début des phrases',
        strand: 'Écriture',
        substrand: 'Conventions d\'écriture'
      },
      {
        code: 'É1.6',
        description: 'Utiliser des points à la fin des phrases',
        strand: 'Écriture',
        substrand: 'Ponctuation'
      },
      {
        code: 'É1.7',
        description: 'Laisser des espaces entre les mots',
        strand: 'Écriture',
        substrand: 'Présentation'
      },
      {
        code: 'É1.8',
        description: 'Réviser ses écrits avec l\'aide de l\'enseignant',
        strand: 'Écriture',
        substrand: 'Révision'
      }
    ];
    
    for (const expectation of writingExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Français langue première',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 4. MATHÉMATIQUES (en français)
    console.log('🔢 Creating Mathématiques expectations...');
    const mathExpectations = [
      // Sens du nombre
      {
        code: 'N1.1',
        description: 'Compter de 1 à 100 par bonds de 1, 2, 5 et 10',
        strand: 'Sens du nombre',
        substrand: 'Comptage'
      },
      {
        code: 'N1.2',
        description: 'Représenter, comparer et ordonner les nombres de 0 à 20',
        strand: 'Sens du nombre',
        substrand: 'Représentation des nombres'
      },
      {
        code: 'N1.3',
        description: 'Démontrer la compréhension de l\'addition jusqu\'à 20',
        strand: 'Sens du nombre',
        substrand: 'Addition'
      },
      {
        code: 'N1.4',
        description: 'Démontrer la compréhension de la soustraction jusqu\'à 20',
        strand: 'Sens du nombre',
        substrand: 'Soustraction'
      },
      {
        code: 'N1.5',
        description: 'Résoudre des problèmes simples d\'addition et de soustraction',
        strand: 'Sens du nombre',
        substrand: 'Résolution de problèmes'
      },
      // Mesure
      {
        code: 'M1.1',
        description: 'Comparer et ordonner des objets selon leur longueur',
        strand: 'Mesure',
        substrand: 'Longueur'
      },
      {
        code: 'M1.2',
        description: 'Mesurer la longueur avec des unités non conventionnelles',
        strand: 'Mesure',
        substrand: 'Unités de mesure'
      },
      {
        code: 'M1.3',
        description: 'Identifier et nommer les pièces de monnaie canadiennes',
        strand: 'Mesure',
        substrand: 'Argent'
      },
      {
        code: 'M1.4',
        description: 'Lire l\'heure à l\'heure juste et à la demi-heure',
        strand: 'Mesure',
        substrand: 'Temps'
      },
      // Géométrie
      {
        code: 'G1.1',
        description: 'Identifier et décrire des formes à deux dimensions',
        strand: 'Géométrie',
        substrand: 'Formes 2D'
      },
      {
        code: 'G1.2',
        description: 'Identifier et décrire des solides',
        strand: 'Géométrie',
        substrand: 'Formes 3D'
      },
      {
        code: 'G1.3',
        description: 'Décrire la position d\'objets dans l\'espace',
        strand: 'Géométrie',
        substrand: 'Position et déplacement'
      },
      // Régularités et algèbre
      {
        code: 'R1.1',
        description: 'Identifier et continuer des suites répétitives',
        strand: 'Régularités et algèbre',
        substrand: 'Suites'
      },
      {
        code: 'R1.2',
        description: 'Créer des suites répétitives avec des objets ou des sons',
        strand: 'Régularités et algèbre',
        substrand: 'Création de suites'
      },
      // Traitement de données
      {
        code: 'TD1.1',
        description: 'Recueillir et organiser des données primaires',
        strand: 'Traitement de données',
        substrand: 'Collecte de données'
      },
      {
        code: 'TD1.2',
        description: 'Lire et interpréter des pictogrammes simples',
        strand: 'Traitement de données',
        substrand: 'Graphiques'
      }
    ];
    
    for (const expectation of mathExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Mathématiques',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 5. SCIENCES (en français)
    console.log('🔬 Creating Sciences expectations...');
    const scienceExpectations = [
      // Sciences de la vie
      {
        code: 'SV1.1',
        description: 'Observer et décrire les caractéristiques des êtres vivants',
        strand: 'Sciences de la vie',
        substrand: 'Caractéristiques du vivant'
      },
      {
        code: 'SV1.2',
        description: 'Comparer les besoins des plantes et des animaux',
        strand: 'Sciences de la vie',
        substrand: 'Besoins des êtres vivants'
      },
      {
        code: 'SV1.3',
        description: 'Identifier les parties du corps humain et leurs fonctions',
        strand: 'Sciences de la vie',
        substrand: 'Corps humain'
      },
      {
        code: 'SV1.4',
        description: 'Observer les changements saisonniers chez les êtres vivants',
        strand: 'Sciences de la vie',
        substrand: 'Changements saisonniers'
      },
      // Sciences physiques
      {
        code: 'SP1.1',
        description: 'Explorer les propriétés des matériaux',
        strand: 'Sciences physiques',
        substrand: 'Matériaux et objets'
      },
      {
        code: 'SP1.2',
        description: 'Observer et décrire le mouvement des objets',
        strand: 'Sciences physiques',
        substrand: 'Forces et mouvement'
      },
      {
        code: 'SP1.3',
        description: 'Identifier les sources de lumière et de son',
        strand: 'Sciences physiques',
        substrand: 'Énergie'
      },
      // Sciences de la Terre et de l\'espace
      {
        code: 'ST1.1',
        description: 'Observer et décrire les caractéristiques du temps qu\'il fait',
        strand: 'Sciences de la Terre',
        substrand: 'Météorologie'
      },
      {
        code: 'ST1.2',
        description: 'Identifier les objets dans le ciel',
        strand: 'Sciences de la Terre',
        substrand: 'Astronomie'
      },
      {
        code: 'ST1.3',
        description: 'Observer les changements dans l\'environnement',
        strand: 'Sciences de la Terre',
        substrand: 'Environnement'
      }
    ];
    
    for (const expectation of scienceExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Sciences',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 6. ÉTUDES SOCIALES (en français)
    console.log('🌍 Creating Études sociales expectations...');
    const socialStudiesExpectations = [
      {
        code: 'SS1.1',
        description: 'Identifier les membres de sa famille et leurs rôles',
        strand: 'Identité et appartenance',
        substrand: 'Famille'
      },
      {
        code: 'SS1.2',
        description: 'Décrire les caractéristiques de sa communauté',
        strand: 'Identité et appartenance',
        substrand: 'Communauté'
      },
      {
        code: 'SS1.3',
        description: 'Identifier les aides communautaires et leurs rôles',
        strand: 'Citoyenneté active',
        substrand: 'Services communautaires'
      },
      {
        code: 'SS1.4',
        description: 'Reconnaître les symboles du Canada et de l\'Île-du-Prince-Édouard',
        strand: 'Citoyenneté active',
        substrand: 'Symboles nationaux'
      },
      {
        code: 'SS1.5',
        description: 'Comprendre les règles et leur importance',
        strand: 'Citoyenneté active',
        substrand: 'Règles et lois'
      },
      {
        code: 'SS1.6',
        description: 'Situer sa maison, son école et sa communauté',
        strand: 'Géographie',
        substrand: 'Orientation spatiale'
      },
      {
        code: 'SS1.7',
        description: 'Utiliser un vocabulaire géographique simple',
        strand: 'Géographie',
        substrand: 'Vocabulaire géographique'
      },
      {
        code: 'SS1.8',
        description: 'Comprendre la notion de passé, présent et futur',
        strand: 'Histoire',
        substrand: 'Temps et chronologie'
      }
    ];
    
    for (const expectation of socialStudiesExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Études sociales',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 7. ÉDUCATION PHYSIQUE (en français)
    console.log('🏃 Creating Éducation physique expectations...');
    const physicalEducationExpectations = [
      {
        code: 'EP1.1',
        description: 'Démontrer des habiletés locomotrices de base',
        strand: 'Habiletés motrices',
        substrand: 'Locomotion'
      },
      {
        code: 'EP1.2',
        description: 'Démontrer des habiletés de manipulation d\'objets',
        strand: 'Habiletés motrices',
        substrand: 'Manipulation'
      },
      {
        code: 'EP1.3',
        description: 'Participer à des jeux coopératifs simples',
        strand: 'Jeux et sports',
        substrand: 'Jeux coopératifs'
      },
      {
        code: 'EP1.4',
        description: 'Suivre les règles de sécurité lors des activités',
        strand: 'Sécurité',
        substrand: 'Prévention des blessures'
      },
      {
        code: 'EP1.5',
        description: 'Reconnaître l\'importance de l\'activité physique',
        strand: 'Vie active',
        substrand: 'Bienfaits de l\'exercice'
      }
    ];
    
    for (const expectation of physicalEducationExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Éducation physique',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 8. ÉDUCATION À LA SANTÉ (en français)
    console.log('🍎 Creating Éducation à la santé expectations...');
    const healthEducationExpectations = [
      {
        code: 'ES1.1',
        description: 'Identifier les habitudes d\'hygiène personnelle',
        strand: 'Santé personnelle',
        substrand: 'Hygiène'
      },
      {
        code: 'ES1.2',
        description: 'Reconnaître les aliments sains',
        strand: 'Santé personnelle',
        substrand: 'Nutrition'
      },
      {
        code: 'ES1.3',
        description: 'Comprendre l\'importance du sommeil',
        strand: 'Santé personnelle',
        substrand: 'Repos'
      },
      {
        code: 'ES1.4',
        description: 'Identifier les émotions de base',
        strand: 'Santé émotionnelle',
        substrand: 'Reconnaissance des émotions'
      },
      {
        code: 'ES1.5',
        description: 'Exprimer ses sentiments de façon appropriée',
        strand: 'Santé émotionnelle',
        substrand: 'Expression des émotions'
      },
      {
        code: 'ES1.6',
        description: 'Identifier les personnes de confiance',
        strand: 'Sécurité personnelle',
        substrand: 'Réseau de soutien'
      }
    ];
    
    for (const expectation of healthEducationExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Éducation à la santé',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    // 9. ARTS (en français)
    console.log('🎨 Creating Arts expectations...');
    const artsExpectations = [
      {
        code: 'A1.1',
        description: 'Explorer différents matériaux artistiques',
        strand: 'Arts visuels',
        substrand: 'Exploration des médiums'
      },
      {
        code: 'A1.2',
        description: 'Créer des œuvres d\'art simples',
        strand: 'Arts visuels',
        substrand: 'Création artistique'
      },
      {
        code: 'A1.3',
        description: 'Décrire ses créations artistiques',
        strand: 'Arts visuels',
        substrand: 'Réflexion artistique'
      },
      {
        code: 'MU1.1',
        description: 'Chanter des chansons simples en français',
        strand: 'Musique',
        substrand: 'Chant'
      },
      {
        code: 'MU1.2',
        description: 'Jouer des instruments de percussion simples',
        strand: 'Musique',
        substrand: 'Instruments'
      },
      {
        code: 'MU1.3',
        description: 'Reconnaître les sons forts et doux',
        strand: 'Musique',
        substrand: 'Éléments musicaux'
      }
    ];
    
    for (const expectation of artsExpectations) {
      await prisma.curriculumExpectation.create({
        data: {
          ...expectation,
          descriptionFr: expectation.description,
          strandFr: expectation.strand,
          subject: 'Arts',
          grade: 1,
        }
      });
      totalCreated++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CURRICULUM CREATION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Total curriculum expectations created: ${totalCreated}`);
    console.log(`📚 Subjects covered: 8 (Français, Mathématiques, Sciences, Études sociales, Éducation physique, Éducation à la santé, Arts)`);
    console.log(`🎯 Average expectations per subject: ${Math.round(totalCreated / 8)}`);
    
    // Verify the database count
    const dbCount = await prisma.curriculumExpectation.count();
    console.log(`🗄️ Database verification: ${dbCount} total expectations`);
    
    if (dbCount >= 80) {
      console.log('🎉 SUCCESS: Database now contains comprehensive curriculum data!');
      console.log('Teachers can now browse hundreds of real curriculum expectations!');
    } else {
      console.log('⚠️ WARNING: Expected more curriculum expectations');
    }
    
  } catch (error) {
    console.error('💥 Error creating curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedComprehensiveCurriculum()
  .then(() => {
    console.log('\n🎯 Comprehensive curriculum seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Curriculum seeding failed:', error);
    process.exit(1);
  });