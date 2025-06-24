import { ExternalActivity } from '@teaching-engine/database';
import { BaseConnector } from './baseConnector';
import { SearchParams } from '../activityDiscoveryService';

/**
 * Mock connector for testing and development
 * Provides sample activities without requiring external API connections
 */
export class MockConnector extends BaseConnector {
  private mockActivities: Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'>[];

  constructor() {
    super('mock');
    this.mockActivities = this.generateMockActivities();
  }

  async search(params: SearchParams): Promise<ExternalActivity[]> {
    let results = [...this.mockActivities];

    // Apply query filter
    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(activity => 
        activity.title.toLowerCase().includes(query) ||
        (activity.description || '').toLowerCase().includes(query)
      );
    }

    // Apply grade filter
    if (params.gradeLevel) {
      results = results.filter(activity => 
        activity.gradeMin <= params.gradeLevel! && 
        activity.gradeMax >= params.gradeLevel!
      );
    }

    // Apply subject filter
    if (params.subject) {
      results = results.filter(activity => 
        activity.subject.toLowerCase() === params.subject!.toLowerCase()
      );
    }

    // Apply limit
    if (params.limit) {
      results = results.slice(0, params.limit);
    }

    // Convert to full ExternalActivity objects
    return results.map(activity => ({
      ...activity,
      id: `mock-${activity.externalId}`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as ExternalActivity));
  }

  async getActivityDetails(externalId: string): Promise<ExternalActivity | null> {
    const activity = this.mockActivities.find(a => a.externalId === externalId);
    
    if (!activity) return null;

    return {
      ...activity,
      id: `mock-${activity.externalId}`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as ExternalActivity;
  }

  private generateMockActivities(): Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        source: 'mock',
        externalId: 'math-centres-grade1',
        url: 'https://example.com/math-centres-grade1',
        title: 'Centres de Mathématiques - 1re année',
        description: 'Ensemble de 5 centres de mathématiques alignés avec le curriculum de l\'Ontario. Inclut des activités de numération, mesure et géométrie adaptées pour l\'immersion française.',
        thumbnailUrl: 'https://placehold.co/300x200/4F46E5/white?text=Math+Centres',
        duration: 45,
        activityType: 'center_activity',
        gradeMin: 1,
        gradeMax: 1,
        subject: 'Mathematics',
        language: 'fr',
        materials: ['jetons', 'dés', 'règles', 'blocs de base 10', 'cartes de nombres'],
        technology: null,
        groupSize: 'small group',
        sourceRating: 4.8,
        sourceReviews: 234,
        internalRating: 4.7,
        internalReviews: 12,
        curriculumTags: ['B1.1', 'B1.2', 'B2.1', 'E1.1'],
        learningGoals: ['Représenter des nombres jusqu\'à 50', 'Mesurer avec des unités non standard', 'Identifier et décrire des formes 2D'],
        isFree: true,
        price: null,
        license: 'CC BY-SA 4.0',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'literacy-circles-fr',
        url: 'https://example.com/literacy-circles-fr',
        title: 'Cercles de Littératie - Immersion française',
        description: 'Structure complète pour les cercles de littératie incluant des rôles différenciés, des fiches de suivi et des mini-leçons pour développer les compétences en lecture.',
        thumbnailUrl: 'https://placehold.co/300x200/10B981/white?text=Literacy+Circles',
        duration: 30,
        activityType: 'reading',
        gradeMin: 1,
        gradeMax: 2,
        subject: 'French',
        language: 'fr',
        materials: ['livres nivelés', 'fiches de rôles', 'journaux de lecture'],
        technology: null,
        groupSize: 'small group',
        sourceRating: 4.9,
        sourceReviews: 156,
        internalRating: null,
        internalReviews: null,
        curriculumTags: ['A1.1', 'A1.2', 'A2.1', 'B1.1'],
        learningGoals: ['Développer la fluidité en lecture', 'Comprendre les éléments d\'une histoire', 'Exprimer ses idées oralement'],
        isFree: true,
        price: null,
        license: 'CC BY-SA 4.0',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'writing-workshop-gr1',
        url: 'https://example.com/writing-workshop-gr1',
        title: 'Atelier d\'Écriture - Textes Narratifs',
        description: 'Plan de leçon complet pour un atelier d\'écriture sur les textes narratifs. Inclut une mini-leçon, du temps d\'écriture autonome et un partage en groupe.',
        thumbnailUrl: 'https://placehold.co/300x200/F59E0B/white?text=Writing+Workshop',
        duration: 40,
        activityType: 'lesson_plan',
        gradeMin: 1,
        gradeMax: 1,
        subject: 'French',
        language: 'fr',
        materials: ['papier à écrire', 'crayons', 'tableau d\'ancrage', 'mentor texts'],
        technology: null,
        groupSize: 'whole class',
        sourceRating: 4.7,
        sourceReviews: 89,
        internalRating: 4.8,
        internalReviews: 8,
        curriculumTags: ['B1.1', 'B1.2', 'B2.1', 'B2.2'],
        learningGoals: ['Écrire un début, milieu et fin', 'Utiliser des mots de transition', 'Ajouter des détails descriptifs'],
        isFree: true,
        price: null,
        license: 'Free for educational use',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'social-studies-community',
        url: 'https://example.com/community-helpers',
        title: 'Notre Communauté - Unité Intégrée',
        description: 'Unité thématique sur les métiers et les helpers de la communauté. Inclut des activités de lecture, écriture, arts et études sociales intégrées.',
        thumbnailUrl: 'https://placehold.co/300x200/8B5CF6/white?text=Community',
        duration: 180,
        activityType: 'project',
        gradeMin: 1,
        gradeMax: 1,
        subject: 'Social Studies',
        language: 'fr',
        materials: ['livres sur les métiers', 'matériaux d\'art', 'invités de la communauté'],
        technology: ['tablette pour recherche'],
        groupSize: 'flexible',
        sourceRating: 4.9,
        sourceReviews: 412,
        internalRating: 4.9,
        internalReviews: 15,
        curriculumTags: ['A1.1', 'A1.2', 'B1.1'],
        learningGoals: ['Identifier les métiers dans la communauté', 'Comprendre les rôles et responsabilités', 'Créer un projet sur un métier'],
        isFree: true,
        price: null,
        license: 'CC BY-SA 4.0',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'science-living-things',
        url: 'https://example.com/living-things-gr1',
        title: 'Les êtres Vivants et Non-Vivants',
        description: 'Séquence d\'apprentissage complète sur les caractéristiques des êtres vivants. Inclut une sortie dans la cour d\'école, un tri d\'images et un journal d\'observation.',
        thumbnailUrl: 'https://placehold.co/300x200/06B6D4/white?text=Living+Things',
        duration: 45,
        activityType: 'experiment',
        gradeMin: 1,
        gradeMax: 1,
        subject: 'Science',
        language: 'fr',
        materials: ['loupes', 'journal d\'observation', 'images à trier', 'contenants pour spécimens'],
        technology: null,
        groupSize: 'pairs',
        sourceRating: 4.7,
        sourceReviews: 178,
        internalRating: 4.6,
        internalReviews: 9,
        curriculumTags: ['A2.1', 'A2.3', 'A3.1'],
        learningGoals: ['Faire des prédictions', 'Observer et enregistrer', 'Comprendre la flottabilité'],
        isFree: true,
        price: null,
        license: 'CC BY 4.0',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'phonics-sound-hunt',
        url: 'https://example.com/phonics-sound-hunt',
        title: 'Chasse aux Sons - Conscience Phonologique',
        description: 'Activité interactive pour développer la conscience phonologique. Les élèves cherchent des objets qui commencent par des sons spécifiques.',
        thumbnailUrl: 'https://placehold.co/300x200/EC4899/white?text=Sound+Hunt',
        duration: 25,
        activityType: 'handson',
        gradeMin: 1,
        gradeMax: 1,
        subject: 'French',
        language: 'fr',
        materials: ['sacs de collection', 'images de référence', 'fiche de suivi'],
        technology: null,
        groupSize: 'pairs',
        sourceRating: 4.8,
        sourceReviews: 203,
        internalRating: null,
        internalReviews: null,
        curriculumTags: ['A1.3', 'A2.1', 'B1.1'],
        learningGoals: ['Identifier les sons initiaux', 'Associer sons et lettres', 'Développer le vocabulaire'],
        isFree: true,
        price: null,
        license: 'CC BY-SA 4.0',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'art-integration-seasons',
        url: 'https://example.com/art-seasons',
        title: 'Art Visuel: Les Quatre Saisons',
        description: 'Projet d\'art intégré avec les sciences. Les élèves créent des œuvres représentant les caractéristiques de chaque saison.',
        thumbnailUrl: 'https://placehold.co/300x200/3B82F6/white?text=Seasons+Art',
        duration: 50,
        activityType: 'art_craft',
        gradeMin: 1,
        gradeMax: 3,
        subject: 'physical-education',
        language: 'fr',
        materials: [],
        technology: ['projecteur', 'espace pour bouger'],
        groupSize: 'whole class',
        sourceRating: 4.8,
        sourceReviews: 324,
        internalRating: 4.9,
        internalReviews: 22,
        curriculumTags: ['A1.1', 'B1.1'],
        learningGoals: ['Développer la motricité globale', 'Suivre des instructions', 'Libérer l\'énergie'],
        isFree: true,
        price: null,
        license: 'CC BY-SA 4.0',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'word-families-game',
        url: 'https://example.com/word-families',
        title: 'Jeu des Familles de Mots',
        description: 'Jeu de cartes pour pratiquer les familles de mots et les rimes en français.',
        thumbnailUrl: 'https://placehold.co/300x200/A855F7/white?text=Word+Families',
        duration: 15,
        activityType: 'game',
        gradeMin: 1,
        gradeMax: 2,
        subject: 'francais',
        language: 'fr',
        materials: ['cartes de mots', 'tableau de pointage'],
        technology: null,
        groupSize: 'pairs',
        sourceRating: 4.6,
        sourceReviews: 145,
        internalRating: 4.5,
        internalReviews: 6,
        curriculumTags: ['CL.1', 'CE.1'],
        learningGoals: ['Identifier les rimes', 'Regrouper les mots par famille', 'Développer le vocabulaire'],
        isFree: false,
        price: 2.99,
        license: 'Commercial - Single Classroom Use',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'art-texture-exploration',
        url: 'https://example.com/texture-art',
        title: 'Exploration des Textures en Art',
        description: 'Projet d\'art tactile où les élèves explorent différentes textures et créent un collage.',
        thumbnailUrl: 'https://placehold.co/300x200/F97316/white?text=Texture+Art',
        duration: 40,
        activityType: 'handson',
        gradeMin: 1,
        gradeMax: 3,
        subject: 'arts',
        language: 'fr',
        materials: ['papiers texturés', 'tissus', 'colle', 'ciseaux', 'carton'],
        technology: null,
        groupSize: 'individual',
        sourceRating: 4.7,
        sourceReviews: 89,
        internalRating: null,
        internalReviews: null,
        curriculumTags: ['D1.1', 'D1.3'],
        learningGoals: ['Explorer les textures', 'Créer un collage', 'Décrire les sensations tactiles'],
        isFree: true,
        price: null,
        license: 'CC BY-NC 4.0',
        lastVerified: new Date(),
        isActive: true
      },
      {
        source: 'mock',
        externalId: 'counting-coins',
        url: 'https://example.com/counting-coins',
        title: 'Compter la Monnaie Canadienne',
        description: 'Activité interactive pour apprendre à reconnaître et compter la monnaie canadienne.',
        thumbnailUrl: 'https://placehold.co/300x200/0EA5E9/white?text=Counting+Coins',
        duration: 25,
        activityType: 'handson',
        gradeMin: 1,
        gradeMax: 2,
        subject: 'math',
        language: 'fr',
        materials: ['monnaie factice', 'porte-monnaie', 'cartes de prix'],
        technology: null,
        groupSize: 'small group',
        sourceRating: 4.5,
        sourceReviews: 201,
        internalRating: 4.6,
        internalReviews: 11,
        curriculumTags: ['F1.1', 'F1.2', 'C3.1'],
        learningGoals: ['Identifier les pièces canadiennes', 'Compter la monnaie', 'Résoudre des problèmes d\'argent'],
        isFree: true,
        price: null,
        license: 'Free for educational use',
        lastVerified: new Date(),
        isActive: true
      }
    ];
  }
}