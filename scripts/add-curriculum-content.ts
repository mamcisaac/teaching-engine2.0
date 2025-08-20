import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addGrade1FrenchImmersionCurriculum() {
  console.log('Adding comprehensive Grade 1 French Immersion curriculum expectations...');

  // Get Emily's user ID
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) {
    console.error('Emily McIsaac user not found!');
    return;
  }

  // Additional French Language Arts expectations
  const frenchExpectations = [
    {
      code: 'CO1.2',
      description: 'Follow simple multi-step instructions in French',
      descriptionFr: 'Suivre des instructions simples à plusieurs étapes en français',
      strand: 'Communication orale',
      strandFr: 'Communication orale',
      subject: 'Français (Immersion)',
      grade: 1,
    },
    {
      code: 'CO1.3',
      description: 'Express basic needs and wants in French using simple phrases',
      descriptionFr: 'Exprimer des besoins et désirs de base en français en utilisant des phrases simples',
      strand: 'Communication orale',
      strandFr: 'Communication orale',
      subject: 'Français (Immersion)',
      grade: 1,
    },
    {
      code: 'L1.2',
      description: 'Recognize and name letters of the French alphabet',
      descriptionFr: 'Reconnaître et nommer les lettres de l\'alphabet français',
      strand: 'Lecture',
      strandFr: 'Lecture',
      subject: 'Français (Immersion)',
      grade: 1,
    },
    {
      code: 'L1.3',
      description: 'Read high-frequency French words by sight',
      descriptionFr: 'Lire les mots français fréquents à vue',
      strand: 'Lecture',
      strandFr: 'Lecture',
      subject: 'Français (Immersion)',
      grade: 1,
    },
    {
      code: 'E1.2',
      description: 'Write letters and simple words in French with proper formation',
      descriptionFr: 'Écrire des lettres et des mots simples en français avec une formation appropriée',
      strand: 'Écriture',
      strandFr: 'Écriture',
      subject: 'Français (Immersion)',
      grade: 1,
    },
  ];

  // Mathematics in French expectations
  const mathExpectations = [
    {
      code: 'N1.2',
      description: 'Recognize, read, and write numerals 1-20 in French',
      descriptionFr: 'Reconnaître, lire et écrire les chiffres 1-20 en français',
      strand: 'Sens du nombre',
      strandFr: 'Sens du nombre',
      subject: 'Mathématiques',
      grade: 1,
    },
    {
      code: 'N1.3',
      description: 'Compare sets of objects using French vocabulary (plus, moins, égal)',
      descriptionFr: 'Comparer des ensembles d\'objets en utilisant le vocabulaire français (plus, moins, égal)',
      strand: 'Sens du nombre',
      strandFr: 'Sens du nombre',
      subject: 'Mathématiques',
      grade: 1,
    },
    {
      code: 'M1.1',
      description: 'Measure and compare length, height, and distance using non-standard units in French',
      descriptionFr: 'Mesurer et comparer la longueur, la hauteur et la distance en utilisant des unités non-standard en français',
      strand: 'Mesure',
      strandFr: 'Mesure',
      subject: 'Mathématiques',
      grade: 1,
    },
    {
      code: 'G1.1',
      description: 'Identify and describe 2D shapes using French geometric vocabulary',
      descriptionFr: 'Identifier et décrire les formes 2D en utilisant le vocabulaire géométrique français',
      strand: 'Géométrie',
      strandFr: 'Géométrie',
      subject: 'Mathématiques',
      grade: 1,
    },
  ];

  // Science in French expectations
  const scienceExpectations = [
    {
      code: 'SV1.2',
      description: 'Classify living and non-living things using French scientific vocabulary',
      descriptionFr: 'Classifier les choses vivantes et non-vivantes en utilisant le vocabulaire scientifique français',
      strand: 'Sciences de la vie',
      strandFr: 'Sciences de la vie',
      subject: 'Sciences',
      grade: 1,
    },
    {
      code: 'SP1.1',
      description: 'Explore properties of materials using French vocabulary (dur, mou, lisse, rugueux)',
      descriptionFr: 'Explorer les propriétés des matériaux en utilisant le vocabulaire français (dur, mou, lisse, rugueux)',
      strand: 'Sciences physiques',
      strandFr: 'Sciences physiques',
      subject: 'Sciences',
      grade: 1,
    },
    {
      code: 'ST1.1',
      description: 'Observe and describe weather patterns using French weather vocabulary',
      descriptionFr: 'Observer et décrire les conditions météorologiques en utilisant le vocabulaire météorologique français',
      strand: 'Sciences de la Terre',
      strandFr: 'Sciences de la Terre',
      subject: 'Sciences',
      grade: 1,
    },
  ];

  // Social Studies in French expectations
  const socialStudiesExpectations = [
    {
      code: 'SS1.2',
      description: 'Describe family traditions and celebrations in French',
      descriptionFr: 'Décrire les traditions et célébrations familiales en français',
      strand: 'Communauté',
      strandFr: 'Communauté',
      subject: 'Études sociales',
      grade: 1,
    },
    {
      code: 'SS1.3',
      description: 'Identify similarities and differences in families using French vocabulary',
      descriptionFr: 'Identifier les similitudes et différences dans les familles en utilisant le vocabulaire français',
      strand: 'Communauté',
      strandFr: 'Communauté',
      subject: 'Études sociales',
      grade: 1,
    },
    {
      code: 'SS1.4',
      description: 'Describe the school and local community in French',
      descriptionFr: 'Décrire l\'école et la communauté locale en français',
      strand: 'Communauté',
      strandFr: 'Communauté',
      subject: 'Études sociales',
      grade: 1,
    },
  ];

  // Health and Physical Education expectations
  const healthExpectations = [
    {
      code: 'H1.1',
      description: 'Identify healthy lifestyle choices using French vocabulary',
      descriptionFr: 'Identifier les choix de mode de vie sains en utilisant le vocabulaire français',
      strand: 'Mode de vie sain',
      strandFr: 'Mode de vie sain',
      subject: 'Éducation physique et santé',
      grade: 1,
    },
    {
      code: 'EP1.1',
      description: 'Demonstrate basic locomotor movements following French commands',
      descriptionFr: 'Démontrer des mouvements locomoteurs de base en suivant les commandes françaises',
      strand: 'Mouvement',
      strandFr: 'Mouvement',
      subject: 'Éducation physique et santé',
      grade: 1,
    },
  ];

  // Arts expectations
  const artsExpectations = [
    {
      code: 'A1.1',
      description: 'Create visual art while learning French color and shape vocabulary',
      descriptionFr: 'Créer de l\'art visuel tout en apprenant le vocabulaire français des couleurs et des formes',
      strand: 'Arts visuels',
      strandFr: 'Arts visuels',
      subject: 'Arts',
      grade: 1,
    },
    {
      code: 'M1.1',
      description: 'Sing simple French songs and learn rhythm patterns',
      descriptionFr: 'Chanter des chansons françaises simples et apprendre les modèles rythmiques',
      strand: 'Musique',
      strandFr: 'Musique',
      subject: 'Arts',
      grade: 1,
    },
  ];

  // Combine all expectations
  const allExpectations = [
    ...frenchExpectations,
    ...mathExpectations,
    ...scienceExpectations,
    ...socialStudiesExpectations,
    ...healthExpectations,
    ...artsExpectations,
  ];

  // Create all curriculum expectations (skip if already exists)
  let createdCount = 0;
  for (const expectation of allExpectations) {
    try {
      await prisma.curriculumExpectation.create({
        data: expectation,
      });
      createdCount++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`Skipping existing expectation: ${expectation.code}`);
      } else {
        throw error;
      }
    }
  }

  console.log(`✅ Added ${createdCount} new curriculum expectations (${allExpectations.length - createdCount} already existed)`);

  // Create some frequency words for Grade 1
  const frequencyWords = [
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
    'le', 'la', 'les', 'un', 'une', 'des',
    'et', 'ou', 'mais', 'avec', 'dans', 'sur', 'sous',
    'rouge', 'bleu', 'jaune', 'vert', 'orange', 'violet', 'rose', 'blanc', 'noir',
    'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'maman', 'papa', 'famille', 'ami', 'amie', 'chat', 'chien',
    'école', 'maison', 'classe', 'livre', 'crayon', 'table', 'chaise'
  ];

  // Create a curriculum import record for the frequency words
  const curriculumImport = await prisma.curriculumImport.create({
    data: {
      userId: emily.id,
      filename: 'Grade 1 French Frequency Words',
      originalName: 'Mots fréquents de la 1re année',
      sourceFormat: 'manual',
      status: 'COMPLETED',
      totalOutcomes: frequencyWords.length,
      processedOutcomes: frequencyWords.length,
      parsedData: JSON.stringify({
        frequencyWords,
        description: 'Essential high-frequency words for Grade 1 French Immersion students',
        categories: {
          pronouns: ['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'],
          articles: ['le', 'la', 'les', 'un', 'une', 'des'],
          connectors: ['et', 'ou', 'mais', 'avec', 'dans', 'sur', 'sous'],
          colors: ['rouge', 'bleu', 'jaune', 'vert', 'orange', 'violet', 'rose', 'blanc', 'noir'],
          numbers: ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'],
          family: ['maman', 'papa', 'famille', 'ami', 'amie'],
          animals: ['chat', 'chien'],
          places: ['école', 'maison', 'classe'],
          objects: ['livre', 'crayon', 'table', 'chaise']
        }
      }),
      metadata: {
        grade: 1,
        subject: 'Français (Immersion)',
        source: 'PEI Grade 1 French Immersion Curriculum',
        importedBy: 'Emily McIsaac',
        importDate: new Date().toISOString()
      }
    }
  });

  console.log(`✅ Created frequency words import record with ${frequencyWords.length} words`);
  console.log('📚 Grade 1 French Immersion curriculum content has been enhanced!');
}

addGrade1FrenchImmersionCurriculum()
  .catch((e) => {
    console.error('Error adding curriculum content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });