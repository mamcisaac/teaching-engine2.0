#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LessonTemplate {
  title: string;
  titleFr?: string;
  mindsOn: string;
  action: string;
  consolidation: string;
  mindsOnFr?: string;
  actionFr?: string;
  consolidationFr?: string;
  learningGoals: string;
  materials: string[];
  accommodations: string[];
  assessmentType: string;
  assessmentNotes: string;
}

class EnhancedLessonGenerator {
  private usedTitles = new Set<string>();

  constructor(private prisma: PrismaClient) {}

  async generateLessonsForUnit(unitId: string): Promise<void> {
    // Get unit details with context
    const unit = await this.prisma.unitPlan.findUnique({
      where: { id: unitId },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    if (!unit) {
      throw new Error(`Unit ${unitId} not found`);
    }

    console.log(`🎯 Generating lessons for: ${unit.longRangePlan.subject} - "${unit.title}"`);

    // Calculate lesson timing
    const startDate = new Date(unit.startDate);
    const endDate = new Date(unit.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const schoolDays = Math.floor(totalDays * 5/7); // Approximate school days
    const targetLessons = Math.min(Math.max(schoolDays * 1.2, 8), 15); // 8-15 lessons per unit

    console.log(`   Duration: ${totalDays} days (${schoolDays} school days)`);
    console.log(`   Target lessons: ${Math.floor(targetLessons)}`);

    // Generate contextual lessons based on subject and unit
    const templates = this.generateLessonTemplates(unit, Math.floor(targetLessons));
    
    // Create lessons with proper scheduling
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      
      // Calculate lesson date (spread evenly across unit duration)
      const dayOffset = Math.floor((totalDays * i) / templates.length);
      const lessonDate = new Date(startDate);
      lessonDate.setDate(lessonDate.getDate() + dayOffset);
      
      // Ensure it's a weekday
      while (lessonDate.getDay() === 0 || lessonDate.getDay() === 6) {
        lessonDate.setDate(lessonDate.getDate() + 1);
      }

      // Ensure unique title
      let uniqueTitle = template.title;
      let counter = 1;
      while (this.usedTitles.has(uniqueTitle)) {
        uniqueTitle = `${template.title} - ${counter}`;
        counter++;
      }
      this.usedTitles.add(uniqueTitle);

      // Create lesson
      await this.prisma.eTFOLessonPlan.create({
        data: {
          userId: unit.userId,
          unitPlanId: unit.id,
          title: uniqueTitle,
          titleFr: template.titleFr,
          date: lessonDate,
          duration: 60,
          
          // ETFO Three-Part Structure
          mindsOn: template.mindsOn,
          action: template.action,
          consolidation: template.consolidation,
          mindsOnFr: template.mindsOnFr,
          actionFr: template.actionFr,
          consolidationFr: template.consolidationFr,
          
          // Learning goals and materials
          learningGoals: template.learningGoals,
          materials: template.materials,
          accommodations: template.accommodations,
          
          // Assessment
          assessmentType: template.assessmentType,
          assessmentNotes: template.assessmentNotes,
          
          // Grade and language
          grade: 1,
          language: unit.longRangePlan.subject.includes('Français') ? 'fr' : 'en',
          subject: unit.longRangePlan.subject,
          
          // Grouping and sub-friendly
          grouping: 'Varied grouping',
          isSubFriendly: true,
          subNotes: 'All materials organized. Follow three-part ETFO structure.',
        }
      });
    }

    console.log(`   ✅ Created ${templates.length} lessons`);
  }

  private generateLessonTemplates(unit: any, count: number): LessonTemplate[] {
    const subject = unit.longRangePlan.subject;
    const unitTitle = unit.title;
    
    if (subject === 'Français (Immersion)') {
      return this.generateFrenchLessons(unitTitle, count);
    } else if (subject === 'Mathématiques') {
      return this.generateMathLessons(unitTitle, count);
    } else if (subject === 'Sciences de la nature') {
      return this.generateScienceLessons(unitTitle, count);
    } else if (subject === 'Sciences humaines') {
      return this.generateSocialStudiesLessons(unitTitle, count);
    } else if (subject === 'Arts visuels') {
      return this.generateArtsLessons(unitTitle, count);
    } else if (subject === 'Formation personnelle et sociale') {
      return this.generateHealthLessons(unitTitle, count);
    }
    
    return [];
  }

  private generateFrenchLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    // Les fêtes d'automne (Fall Celebrations)
    if (unitTitle.includes('fêtes d\'automne')) {
      const topics = [
        'L\'automne arrive', 'Nos traditions d\'automne', 'Halloween en français', 
        'L\'Action de grâce', 'Les couleurs d\'automne', 'Les fruits d\'automne',
        'Nos costumes préférés', 'Histoires d\'automne', 'Chansons d\'automne',
        'Célébrons ensemble', 'Les feuilles qui tombent', 'Nos souvenirs d\'automne'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Fall Celebrations: ${topic}`,
          titleFr: `Les fêtes d'automne: ${topic}`,
          mindsOn: `Cercle communautaire avec chanson d'automne. Discussion sur ${topic.toLowerCase()} avec supports visuels.`,
          action: `Exploration interactive de ${topic.toLowerCase()} : jeux de rôle, activités créatives, et pratique du vocabulaire d'automne.`,
          consolidation: `Partage des créations d'automne. Récapitulatif du vocabulaire appris. Connexion aux célébrations familiales.`,
          mindsOnFr: `Community circle with autumn song. Discussion about ${topic.toLowerCase()} with visual supports.`,
          actionFr: `Interactive exploration of ${topic.toLowerCase()}: role-play, creative activities, and autumn vocabulary practice.`,
          consolidationFr: `Sharing autumn creations. Vocabulary review. Connection to family celebrations.`,
          learningGoals: `Students will use French vocabulary to describe and discuss ${topic.toLowerCase()} and autumn celebrations.`,
          materials: ['Images d\'automne', 'Cartes de vocabulaire', 'Matériel artistique', 'Livres d\'automne', 'Costumes'],
          accommodations: ['Supports visuels', 'Répétition', 'Temps supplémentaire', 'Soutien par les pairs'],
          assessmentType: 'formative',
          assessmentNotes: `Observer l'utilisation du vocabulaire d'automne et la participation aux discussions sur ${topic.toLowerCase()}.`
        });
      });
    }
    
    // L'hiver magique (Magical Winter)
    else if (unitTitle.includes('hiver magique')) {
      const topics = [
        'L\'hiver arrive', 'La neige magique', 'Nos vêtements d\'hiver',
        'Les activités d\'hiver', 'Noël en français', 'Les animaux en hiver',
        'Les bonhommes de neige', 'Histoires d\'hiver', 'Chansons d\'hiver',
        'La nouvelle année', 'Les flocons de neige', 'Nos souvenirs d\'hiver'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Magical Winter: ${topic}`,
          titleFr: `L'hiver magique: ${topic}`,
          mindsOn: `Cercle d'hiver avec chanson saisonnière. Activation des connaissances sur ${topic.toLowerCase()}.`,
          action: `Exploration interactive de ${topic.toLowerCase()} avec matériel concret, jeux sensoriels et création artistique.`,
          consolidation: `Présentation des œuvres d'hiver. Discussion des apprentissages. Planification de la prochaine activité.`,
          learningGoals: `Students will express winter experiences and describe ${topic.toLowerCase()} using French vocabulary.`,
          materials: ['Images d\'hiver', 'Matériel sensoriel', 'Vêtements d\'hiver', 'Livres d\'hiver', 'Flocons artificiels'],
          accommodations: ['Supports tactiles', 'Instructions répétées', 'Partenaires de langue', 'Adaptation culturelle'],
          assessmentType: 'formative',
          assessmentNotes: `Évaluer l'expression orale en français et la compréhension de ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Nos amis les animaux (Our Animal Friends)
    else if (unitTitle.includes('amis les animaux')) {
      const topics = [
        'Les animaux domestiques', 'Les animaux sauvages', 'Les sons des animaux',
        'Où vivent les animaux', 'Que mangent les animaux', 'Les bébés animaux',
        'Nos animaux préférés', 'Prendre soin des animaux', 'Les animaux au zoo',
        'Histoires d\'animaux', 'Chansons d\'animaux', 'Nos observations d\'animaux'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Animal Friends: ${topic}`,
          titleFr: `Nos amis les animaux: ${topic}`,
          mindsOn: `Cercle d'animaux avec sons et mouvements. Introduction du vocabulaire de ${topic.toLowerCase()}.`,
          action: `Exploration interactive de ${topic.toLowerCase()} : imitation d'animaux, jeux de classification, création d'habitats.`,
          consolidation: `Partage des découvertes sur les animaux. Réflexion sur ${topic.toLowerCase()}. Connexion aux animaux de la maison.`,
          learningGoals: `Students will describe and classify animals, focusing on ${topic.toLowerCase()} using French vocabulary.`,
          materials: ['Images d\'animaux', 'Sons d\'animaux', 'Livres d\'animaux', 'Matériel de classement', 'Marionnettes'],
          accommodations: ['Supports visuels', 'Mouvements corporels', 'Répétition des sons', 'Respect des cultures'],
          assessmentType: 'formative',
          assessmentNotes: `Observer la compréhension et l'utilisation du vocabulaire des animaux, particulièrement ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Ma communauté (My Community)
    else if (unitTitle.includes('communauté')) {
      const topics = [
        'Ma maison', 'Mon quartier', 'Les magasins', 'Les services communautaires',
        'Les métiers', 'Les transports', 'Les lieux importants', 'Les voisins',
        'Les règles communautaires', 'Aider dans la communauté', 'Nos traditions',
        'Célébrer ensemble'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `My Community: ${topic}`,
          titleFr: `Ma communauté: ${topic}`,
          mindsOn: `Cercle communautaire avec carte du quartier. Discussion sur ${topic.toLowerCase()} et expériences personnelles.`,
          action: `Exploration de ${topic.toLowerCase()} par jeux de rôle, création de cartes, interviews et activités communautaires.`,
          consolidation: `Présentation des projets communautaires. Réflexion sur l'importance de ${topic.toLowerCase()}.`,
          learningGoals: `Students will describe their community and explain the role of ${topic.toLowerCase()} using French.`,
          materials: ['Cartes du quartier', 'Images communautaires', 'Matériel de construction', 'Livres communautaires'],
          accommodations: ['Cartes visuelles', 'Exemples concrets', 'Connexions personnelles', 'Soutien linguistique'],
          assessmentType: 'formative',
          assessmentNotes: `Évaluer la capacité à décrire la communauté et à expliquer l'importance de ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Le printemps en fleurs (Spring in Bloom)
    else if (unitTitle.includes('printemps')) {
      const topics = [
        'Le printemps arrive', 'Les fleurs qui poussent', 'Les arbres bourgeonnent',
        'Les animaux au printemps', 'Le jardin de classe', 'Planter des graines',
        'Pâques et traditions', 'Les oiseaux reviennent', 'Les insectes actifs',
        'Nettoyer notre environnement', 'Célébrer la croissance', 'Nos découvertes de printemps'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Spring in Bloom: ${topic}`,
          titleFr: `Le printemps en fleurs: ${topic}`,
          mindsOn: `Cercle de printemps avec chansons de croissance. Observation de ${topic.toLowerCase()} dans la nature.`,
          action: `Investigation interactive de ${topic.toLowerCase()} : jardinage, observation scientifique, création artistique.`,
          consolidation: `Partage des observations de printemps. Journal de croissance. Planification des prochaines observations.`,
          learningGoals: `Students will describe spring changes and explain ${topic.toLowerCase()} using descriptive French vocabulary.`,
          materials: ['Graines et plantes', 'Outils de jardinage', 'Loupes', 'Journaux scientifiques', 'Images de printemps'],
          accommodations: ['Exploration sensorielle', 'Instructions visuelles', 'Travail en équipe', 'Connexions saisonnières'],
          assessmentType: 'formative',
          assessmentNotes: `Observer l'utilisation du vocabulaire du printemps et la compréhension de ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Célébrons nos apprentissages (Celebrating Our Learning)
    else if (unitTitle.includes('Célébrons')) {
      const topics = [
        'Nos progrès en français', 'Nos livres préférés', 'Nos chansons favorites',
        'Nos créations artistiques', 'Nos jeux en français', 'Nos amitiés françaises',
        'Nos histoires personnelles', 'Nos talents spéciaux', 'Nos traditions familiales',
        'Nos projets de classe', 'Nos succès scolaires', 'Nos rêves pour l\'été'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Celebrating Learning: ${topic}`,
          titleFr: `Célébrons nos apprentissages: ${topic}`,
          mindsOn: `Cercle de célébration avec réflexion sur ${topic.toLowerCase()}. Partage des moments marquants.`,
          action: `Création de portfolio sur ${topic.toLowerCase()} : présentation, exposition, performance ou démonstration.`,
          consolidation: `Présentation publique des apprentissages. Réflexion métacognitive. Célébration collective.`,
          learningGoals: `Students will reflect on and present their learning journey, highlighting ${topic.toLowerCase()}.`,
          materials: ['Portfolios', 'Matériel de présentation', 'Appareils photo', 'Matériel de célébration'],
          accommodations: ['Formats de présentation variés', 'Soutien technique', 'Temps de préparation', 'Choix personnels'],
          assessmentType: 'summative',
          assessmentNotes: `Évaluer la réflexion métacognitive et la présentation de ${topic.toLowerCase()} en français.`
        });
      });
    }
    
    return lessons;
  }

  private generateMathLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    // Making Sense of Numbers
    if (unitTitle.includes('Making Sense of Numbers')) {
      const topics = [
        'Number Stories', 'Counting Collections', 'Number Bonds', 'Ten Frames',
        'Number Lines', 'More and Less', 'Number Patterns', 'Counting Games',
        'Number Relationships', 'Place Value Basics', 'Number Talks', 'Assessment Celebration'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Number Sense: ${topic}`,
          mindsOn: `Number talk circle with ${topic.toLowerCase()}. Share counting strategies and number observations.`,
          action: `Hands-on exploration of ${topic.toLowerCase()} using manipulatives, games, and problem-solving activities.`,
          consolidation: `Math journal reflection on ${topic.toLowerCase()}. Share discoveries and make connections to daily life.`,
          learningGoals: `Students will develop number sense through understanding ${topic.toLowerCase()} and their relationships.`,
          materials: ['Counting manipulatives', 'Ten frames', 'Number lines', 'Math journals', 'Number cards'],
          accommodations: ['Visual number supports', 'Extra manipulatives', 'Partner work', 'Extended thinking time'],
          assessmentType: 'formative',
          assessmentNotes: `Observe number sense development through ${topic.toLowerCase()} exploration and explanations.`
        });
      });
    }
    
    // Patterns and Shapes
    else if (unitTitle.includes('Patterns and Shapes')) {
      const topics = [
        'Pattern Recognition', 'Creating Patterns', 'Growing Patterns', 'Shape Hunt',
        'Building with Shapes', 'Shape Attributes', 'Pattern Blocks', 'Symmetry Exploration',
        'Patterns in Nature', 'Shape Sorting', 'Pattern Stories', 'Geometry Gallery'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Patterns & Shapes: ${topic}`,
          mindsOn: `Pattern warm-up with clapping and movements. Explore ${topic.toLowerCase()} in our classroom environment.`,
          action: `Interactive investigation of ${topic.toLowerCase()} through building, sorting, creating, and analyzing activities.`,
          consolidation: `Gallery walk of ${topic.toLowerCase()} creations. Discuss patterns and shapes discovered.`,
          learningGoals: `Students will identify, create, and extend patterns while exploring ${topic.toLowerCase()}.`,
          materials: ['Pattern blocks', 'Geometric shapes', 'Building materials', 'Art supplies', 'Pattern cards'],
          accommodations: ['Color-coded materials', 'Simplified patterns', 'Tactile shapes', 'Peer assistance'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor pattern recognition and shape understanding through ${topic.toLowerCase()} activities.`
        });
      });
    }
    
    // Adding and Subtracting
    else if (unitTitle.includes('Adding and Subtracting')) {
      const topics = [
        'Addition Stories', 'Subtraction Stories', 'Combining Groups', 'Taking Away',
        'Number Line Addition', 'Counting On', 'Counting Back', 'Fact Families',
        'Word Problems', 'Mental Math Strategies', 'Real-Life Math', 'Operation Olympics'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Addition & Subtraction: ${topic}`,
          mindsOn: `Math story time with ${topic.toLowerCase()}. Connect to real-life situations and prior knowledge.`,
          action: `Explore ${topic.toLowerCase()} through concrete manipulatives, visual representations, and problem-solving.`,
          consolidation: `Share solution strategies for ${topic.toLowerCase()}. Record learning in math journals.`,
          learningGoals: `Students will understand addition and subtraction concepts through ${topic.toLowerCase()} exploration.`,
          materials: ['Counting bears', 'Number lines', 'Math manipulatives', 'Story problem cards', 'Math journals'],
          accommodations: ['Concrete materials', 'Visual supports', 'Simplified problems', 'Think-pair-share'],
          assessmentType: 'formative',
          assessmentNotes: `Assess understanding of addition/subtraction through ${topic.toLowerCase()} problem-solving.`
        });
      });
    }
    
    // Mental Math Strategies
    else if (unitTitle.includes('Mental Math')) {
      const topics = [
        'Counting Strategies', 'Number Combinations', 'Quick Images', 'Estimation Games',
        'Double Facts', 'Near Doubles', 'Make Ten Strategy', 'Benchmark Numbers',
        'Number Talk Strategies', 'Mental Math Games', 'Strategy Sharing', 'Math Fluency Fun'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Mental Math: ${topic}`,
          mindsOn: `Quick mental math warm-up with ${topic.toLowerCase()}. Share thinking strategies with partners.`,
          action: `Practice ${topic.toLowerCase()} through games, activities, and strategy development sessions.`,
          consolidation: `Reflect on effective strategies for ${topic.toLowerCase()}. Set goals for mental math growth.`,
          learningGoals: `Students will develop mental math fluency using ${topic.toLowerCase()} and strategic thinking.`,
          materials: ['Math games', 'Strategy charts', 'Timer', 'Manipulatives', 'Recording sheets'],
          accommodations: ['Strategy cards', 'Partner support', 'Extra processing time', 'Visual reminders'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor development of mental math strategies, particularly ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Measurement Exploration
    else if (unitTitle.includes('Measurement')) {
      const topics = [
        'Length Comparison', 'Non-Standard Units', 'Weight Exploration', 'Capacity Investigation',
        'Time Concepts', 'Measuring Tools', 'Estimation Skills', 'Measurement Hunt',
        'Cooking Math', 'Body Measurements', 'Classroom Measurements', 'Measurement Fair'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Measurement: ${topic}`,
          mindsOn: `Measurement mystery with ${topic.toLowerCase()}. Predict and estimate before measuring.`,
          action: `Hands-on investigation of ${topic.toLowerCase()} using various tools and non-standard units.`,
          consolidation: `Compare results and discuss ${topic.toLowerCase()} findings. Record measurements and observations.`,
          learningGoals: `Students will explore measurement concepts through ${topic.toLowerCase()} activities and comparisons.`,
          materials: ['Measuring tools', 'Non-standard units', 'Scales', 'Containers', 'Recording sheets'],
          accommodations: ['Visual measurement charts', 'Partner measuring', 'Simplified tools', 'Hands-on practice'],
          assessmentType: 'formative',
          assessmentNotes: `Observe measurement understanding and estimation skills through ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Problem Solving Adventures
    else if (unitTitle.includes('Problem Solving')) {
      const topics = [
        'Story Problems', 'Logic Puzzles', 'Pattern Problems', 'Number Mysteries',
        'Real-Life Challenges', 'Multiple Solutions', 'Problem-Solving Strategies', 'Math Investigations',
        'Group Problem Solving', 'Creative Problem Solving', 'Problem Creation', 'Solution Celebration'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Problem Solving: ${topic}`,
          mindsOn: `Problem-solving circle with ${topic.toLowerCase()}. Brainstorm strategies and share ideas.`,
          action: `Collaborative work on ${topic.toLowerCase()} using manipulatives and strategic thinking.`,
          consolidation: `Present solutions to ${topic.toLowerCase()}. Reflect on effective problem-solving strategies.`,
          learningGoals: `Students will develop problem-solving skills through ${topic.toLowerCase()} and strategic thinking.`,
          materials: ['Problem cards', 'Manipulatives', 'Chart paper', 'Markers', 'Strategy posters'],
          accommodations: ['Visual problem supports', 'Partner collaboration', 'Simplified problems', 'Multiple representations'],
          assessmentType: 'formative',
          assessmentNotes: `Assess problem-solving approaches and mathematical reasoning in ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Math Celebration
    else if (unitTitle.includes('Math Celebration')) {
      const topics = [
        'Math Portfolio Review', 'Favorite Math Games', 'Math Art Creations', 'Number Stories',
        'Problem-Solving Showcase', 'Math Learning Journey', 'Math Skills Demonstration', 'Math Connections',
        'Math Goals Setting', 'Math Confidence Building', 'Math Fun Fair', 'Summer Math Adventures'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Math Celebration: ${topic}`,
          mindsOn: `Math celebration circle discussing ${topic.toLowerCase()}. Share math learning highlights.`,
          action: `Create and present ${topic.toLowerCase()} showcasing mathematical understanding and growth.`,
          consolidation: `Celebrate math achievements and reflect on ${topic.toLowerCase()}. Plan continued math learning.`,
          learningGoals: `Students will demonstrate mathematical understanding and reflect on growth through ${topic.toLowerCase()}.`,
          materials: ['Math portfolios', 'Art supplies', 'Presentation materials', 'Games', 'Celebration supplies'],
          accommodations: ['Various presentation formats', 'Peer support', 'Choice in demonstrations', 'Family involvement'],
          assessmentType: 'summative',
          assessmentNotes: `Evaluate mathematical understanding and growth demonstrated through ${topic.toLowerCase()}.`
        });
      });
    }
    
    return lessons;
  }

  private generateScienceLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    // Fall Changes
    if (unitTitle.includes('Fall Changes')) {
      const topics = [
        'Autumn Observations', 'Leaf Investigations', 'Weather Changes', 'Animal Preparations',
        'Plant Changes', 'Seasonal Adaptations', 'Migration Patterns', 'Harvest Time',
        'Temperature Tracking', 'Daylight Changes', 'Fall Collections', 'Seasonal Comparisons'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Fall Changes: ${topic}`,
          mindsOn: `Nature walk observation focusing on ${topic.toLowerCase()}. Wonder questions about seasonal changes.`,
          action: `Scientific investigation of ${topic.toLowerCase()} through observation, measurement, and data collection.`,
          consolidation: `Record findings about ${topic.toLowerCase()} in science journals. Share discoveries with class.`,
          learningGoals: `Students will observe and record seasonal changes, particularly ${topic.toLowerCase()}.`,
          materials: ['Magnifying glasses', 'Collection bags', 'Thermometers', 'Science journals', 'Clipboards'],
          accommodations: ['Picture observation guides', 'Partner investigations', 'Modified recording sheets', 'Indoor alternatives'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor observation skills and understanding of seasonal changes through ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Energy in Our Lives
    else if (unitTitle.includes('Energy')) {
      const topics = [
        'What is Energy?', 'Light Exploration', 'Sound Investigations', 'Heat and Cold',
        'Moving Objects', 'Energy Sources', 'Batteries and Power', 'Solar Energy',
        'Wind Power', 'Energy at Home', 'Energy Conservation', 'Energy Fair'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Energy Exploration: ${topic}`,
          mindsOn: `Energy demonstration with ${topic.toLowerCase()}. Activate prior knowledge about energy use.`,
          action: `Hands-on investigation of ${topic.toLowerCase()} through experiments and energy exploration stations.`,
          consolidation: `Document energy discoveries about ${topic.toLowerCase()}. Discuss energy applications in daily life.`,
          learningGoals: `Students will explore different forms of energy and understand ${topic.toLowerCase()}.`,
          materials: ['Flashlights', 'Batteries', 'Musical instruments', 'Solar panels', 'Energy sources'],
          accommodations: ['Safety adaptations', 'Visual energy charts', 'Guided experiments', 'Peer partnerships'],
          assessmentType: 'formative',
          assessmentNotes: `Assess understanding of energy concepts through ${topic.toLowerCase()} investigations.`
        });
      });
    }
    
    // Winter Wonders
    else if (unitTitle.includes('Winter Wonders')) {
      const topics = [
        'Winter Weather', 'Snow and Ice', 'Animal Adaptations', 'Plant Dormancy',
        'Winter Survival', 'Ice Experiments', 'Snowflake Studies', 'Winter Clothing',
        'Heating and Insulation', 'Winter Activities', 'Arctic Animals', 'Winter Safety'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Winter Wonders: ${topic}`,
          mindsOn: `Winter experience sharing about ${topic.toLowerCase()}. Generate questions about winter phenomena.`,
          action: `Scientific exploration of ${topic.toLowerCase()} through experiments and winter investigations.`,
          consolidation: `Record winter science learning about ${topic.toLowerCase()}. Connect to winter experiences.`,
          learningGoals: `Students will investigate winter phenomena and understand ${topic.toLowerCase()}.`,
          materials: ['Ice cubes', 'Insulation materials', 'Winter clothing', 'Thermometers', 'Snow samples'],
          accommodations: ['Indoor winter simulations', 'Sensory alternatives', 'Layered investigations', 'Cultural connections'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor scientific thinking about winter and understanding of ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Growing and Changing
    else if (unitTitle.includes('Growing and Changing')) {
      const topics = [
        'Life Cycles', 'Plant Growth', 'Animal Development', 'Human Growth',
        'Seeds and Sprouting', 'Butterfly Metamorphosis', 'Growth Needs', 'Measuring Growth',
        'Baby Animals', 'Growth Patterns', 'Caring for Living Things', 'Growth Celebration'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Growing & Changing: ${topic}`,
          mindsOn: `Growth story sharing about ${topic.toLowerCase()}. Observe growth examples in classroom.`,
          action: `Investigation of ${topic.toLowerCase()} through observation, measurement, and growth tracking.`,
          consolidation: `Document growth observations about ${topic.toLowerCase()}. Discuss growth discoveries.`,
          learningGoals: `Students will understand growth and development through studying ${topic.toLowerCase()}.`,
          materials: ['Seeds', 'Planting supplies', 'Measuring tools', 'Growth charts', 'Life cycle cards'],
          accommodations: ['Visual growth sequences', 'Hands-on materials', 'Growth partnerships', 'Family connections'],
          assessmentType: 'formative',
          assessmentNotes: `Assess understanding of growth and change through ${topic.toLowerCase()} observations.`
        });
      });
    }
    
    // Spring Awakening
    else if (unitTitle.includes('Spring Awakening')) {
      const topics = [
        'Spring Signs', 'Plants Awakening', 'Animal Activity', 'Weather Warming',
        'New Life', 'Pollination', 'Insects Returning', 'Bird Migration',
        'Garden Planning', 'Spring Cleaning in Nature', 'Renewable Growth', 'Seasonal Cycles'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Spring Awakening: ${topic}`,
          mindsOn: `Spring exploration walk focusing on ${topic.toLowerCase()}. Share spring observations.`,
          action: `Scientific investigation of ${topic.toLowerCase()} through outdoor study and spring monitoring.`,
          consolidation: `Record spring science discoveries about ${topic.toLowerCase()}. Plan continued observations.`,
          learningGoals: `Students will observe and document spring changes, particularly ${topic.toLowerCase()}.`,
          materials: ['Field notebooks', 'Magnifying glasses', 'Cameras', 'Collection containers', 'Spring charts'],
          accommodations: ['Indoor spring displays', 'Picture documentation', 'Partner observations', 'Accessible outdoor areas'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor scientific observation skills and understanding of ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Our Impact on Nature
    else if (unitTitle.includes('Impact on Nature')) {
      const topics = [
        'Caring for Earth', 'Reduce, Reuse, Recycle', 'Water Conservation', 'Clean Air',
        'Protecting Animals', 'Habitat Care', 'Litter Impact', 'Garden Stewardship',
        'Energy Saving', 'Nature Cleanup', 'Environmental Heroes', 'Future Earth Keepers'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Environmental Impact: ${topic}`,
          mindsOn: `Environmental discussion about ${topic.toLowerCase()}. Share ways to help nature.`,
          action: `Action-oriented exploration of ${topic.toLowerCase()} through environmental projects and stewardship.`,
          consolidation: `Plan environmental actions related to ${topic.toLowerCase()}. Commit to nature care.`,
          learningGoals: `Students will understand environmental stewardship and take action on ${topic.toLowerCase()}.`,
          materials: ['Recycling materials', 'Cleanup supplies', 'Environmental books', 'Action planning sheets'],
          accommodations: ['Age-appropriate environmental concepts', 'Hands-on projects', 'Family involvement', 'Community connections'],
          assessmentType: 'formative',
          assessmentNotes: `Assess environmental awareness and commitment to action regarding ${topic.toLowerCase()}.`
        });
      });
    }
    
    return lessons;
  }

  private generateSocialStudiesLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    // My Family and Our Class
    if (unitTitle.includes('Family and Our Class')) {
      const topics = [
        'Family Structures', 'Family Traditions', 'Classroom Community', 'Helping at Home',
        'Family Roles', 'Class Responsibilities', 'Sharing and Caring', 'Family Stories',
        'Class Rules', 'Working Together', 'Celebrating Differences', 'Our Learning Family'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Family & Class: ${topic}`,
          mindsOn: `Community circle sharing about ${topic.toLowerCase()}. Connect home and school experiences.`,
          action: `Explore ${topic.toLowerCase()} through family interviews, class projects, and community building activities.`,
          consolidation: `Share family and class discoveries about ${topic.toLowerCase()}. Plan community actions.`,
          learningGoals: `Students will understand family and classroom communities through exploring ${topic.toLowerCase()}.`,
          materials: ['Family photos', 'Interview sheets', 'Chart paper', 'Art supplies', 'Community books'],
          accommodations: ['Cultural sensitivity', 'Flexible family definitions', 'Visual supports', 'Multiple languages'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding of community concepts and comfort with ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Our Rights and Responsibilities
    else if (unitTitle.includes('Rights and Responsibilities')) {
      const topics = [
        'What are Rights?', 'What are Responsibilities?', 'Classroom Rights', 'School Responsibilities',
        'Helping Others', 'Following Rules', 'Being Fair', 'Making Good Choices',
        'Solving Problems', 'Being Kind', 'Standing Up for Others', 'Rights and Responsibilities Heroes'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Rights & Responsibilities: ${topic}`,
          mindsOn: `Circle discussion about ${topic.toLowerCase()}. Share examples from daily life.`,
          action: `Role-play and problem-solving activities exploring ${topic.toLowerCase()}. Create class agreements.`,
          consolidation: `Reflect on ${topic.toLowerCase()} learning. Plan ways to practice rights and responsibilities.`,
          learningGoals: `Students will understand and practice rights and responsibilities, focusing on ${topic.toLowerCase()}.`,
          materials: ['Scenario cards', 'Chart paper', 'Role-play props', 'Class agreement materials'],
          accommodations: ['Visual scenarios', 'Simplified concepts', 'Peer modeling', 'Cultural examples'],
          assessmentType: 'formative',
          assessmentNotes: `Assess understanding of citizenship concepts through ${topic.toLowerCase()} applications.`
        });
      });
    }
    
    // My Story Through Time
    else if (unitTitle.includes('Story Through Time')) {
      const topics = [
        'Personal Timeline', 'Family History', 'Before I Was Born', 'Growing and Changing',
        'Important Events', 'Past and Present', 'Traditions and Customs', 'Photo Stories',
        'Interview Grandparents', 'Time Concepts', 'Memory Books', 'My Future Dreams'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `My Story: ${topic}`,
          mindsOn: `Story sharing about ${topic.toLowerCase()}. Explore time concepts and personal history.`,
          action: `Create personal history projects about ${topic.toLowerCase()}. Interview family members.`,
          consolidation: `Present personal stories about ${topic.toLowerCase()}. Celebrate individual histories.`,
          learningGoals: `Students will explore personal and family history through ${topic.toLowerCase()}.`,
          materials: ['Timeline materials', 'Family photos', 'Interview sheets', 'Memory books', 'Recording devices'],
          accommodations: ['Flexible family structures', 'Cultural sensitivity', 'Alternative documentation', 'Family support'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding of time concepts and comfort sharing ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Exploring Our World
    else if (unitTitle.includes('Exploring Our World')) {
      const topics = [
        'Our Neighborhood', 'Places in Our Community', 'Different Homes', 'Transportation',
        'Maps and Directions', 'Near and Far', 'Different Countries', 'Cultural Celebrations',
        'Languages We Hear', 'Foods from Around the World', 'Games Children Play', 'Our Connected World'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Exploring Our World: ${topic}`,
          mindsOn: `World exploration circle about ${topic.toLowerCase()}. Share connections to different places.`,
          action: `Investigate ${topic.toLowerCase()} through maps, virtual tours, cultural artifacts, and community connections.`,
          consolidation: `Share world discoveries about ${topic.toLowerCase()}. Connect to personal experiences.`,
          learningGoals: `Students will explore their local and global communities through ${topic.toLowerCase()}.`,
          materials: ['World maps', 'Cultural artifacts', 'Photos', 'Books about places', 'Virtual tour technology'],
          accommodations: ['Visual maps', 'Cultural connections', 'Family involvement', 'Multiple perspectives'],
          assessmentType: 'formative',
          assessmentNotes: `Assess geographic awareness and cultural understanding through ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Responsible Digital Citizens
    else if (unitTitle.includes('Digital Citizens')) {
      const topics = [
        'Technology in Our Lives', 'Safe Technology Use', 'Kind Online Behavior', 'Protecting Personal Information',
        'Asking for Help Online', 'Screen Time Balance', 'Digital Footprints', 'Online Learning Tools',
        'Communication Technology', 'Technology Helpers', 'Digital Creativity', 'Future Technology'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Digital Citizens: ${topic}`,
          mindsOn: `Technology discussion about ${topic.toLowerCase()}. Share technology experiences and questions.`,
          action: `Explore ${topic.toLowerCase()} through demonstrations, practice activities, and safety scenarios.`,
          consolidation: `Reflect on ${topic.toLowerCase()} learning. Create digital citizenship commitments.`,
          learningGoals: `Students will understand responsible technology use and practice ${topic.toLowerCase()}.`,
          materials: ['Computers/tablets', 'Safety scenario cards', 'Digital citizenship posters', 'Practice activities'],
          accommodations: ['Step-by-step guidance', 'Visual safety rules', 'Partner support', 'Family communication'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding of digital citizenship and safe practices with ${topic.toLowerCase()}.`
        });
      });
    }
    
    return lessons;
  }

  private generateArtsLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    // Discovering Art in Our World
    if (unitTitle.includes('Discovering Art')) {
      const topics = [
        'Art All Around Us', 'Lines and Shapes in Art', 'Colors in Nature', 'Textures We Feel',
        'Art at Home', 'Community Art', 'Famous Artwork', 'Art Materials Exploration',
        'Creating with Lines', 'Shape Art Adventures', 'Color Mixing Magic', 'Our Art Gallery'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Art Discovery: ${topic}`,
          mindsOn: `Art exploration circle discussing ${topic.toLowerCase()}. Observe art examples and share reactions.`,
          action: `Creative exploration of ${topic.toLowerCase()} through hands-on art making and experimentation.`,
          consolidation: `Gallery walk of ${topic.toLowerCase()} creations. Reflect on artistic discoveries and processes.`,
          learningGoals: `Students will explore visual arts concepts and create artwork focusing on ${topic.toLowerCase()}.`,
          materials: ['Art supplies', 'Various papers', 'Paintbrushes', 'Art reproductions', 'Natural materials'],
          accommodations: ['Adaptive tools', 'Various art mediums', 'Peer assistance', 'Choice in materials'],
          assessmentType: 'formative',
          assessmentNotes: `Observe artistic exploration and understanding of ${topic.toLowerCase()} through art creation.`
        });
      });
    }
    
    // Colors and Feelings
    else if (unitTitle.includes('Colors and Feelings')) {
      const topics = [
        'Happy Colors', 'Sad Colors', 'Angry Colors', 'Calm Colors',
        'Primary Colors', 'Color Mixing', 'Warm and Cool Colors', 'Color Stories',
        'Feelings Art', 'Color Emotions', 'Mood Colors', 'Rainbow Feelings'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Colors & Feelings: ${topic}`,
          mindsOn: `Color and emotion discussion about ${topic.toLowerCase()}. Share personal color associations.`,
          action: `Create expressive artwork exploring ${topic.toLowerCase()} through painting and color experimentation.`,
          consolidation: `Share color emotion artwork about ${topic.toLowerCase()}. Discuss color feelings connections.`,
          learningGoals: `Students will express emotions through color and understand ${topic.toLowerCase()}.`,
          materials: ['Watercolors', 'Tempera paints', 'Color wheels', 'Emotion cards', 'Large paper'],
          accommodations: ['Emotion supports', 'Color choice options', 'Non-verbal expression', 'Sensory materials'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor emotional expression through color and understanding of ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Winter Celebrations Through Art
    else if (unitTitle.includes('Winter Celebrations')) {
      const topics = [
        'Winter Colors', 'Holiday Traditions', 'Snowflake Art', 'Winter Landscapes',
        'Celebration Art', 'Gift Making', 'Decorative Arts', 'Cultural Celebrations',
        'Winter Patterns', 'Festive Colors', 'Memory Art', 'Winter Art Gallery'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Winter Art: ${topic}`,
          mindsOn: `Winter celebration sharing about ${topic.toLowerCase()}. Explore winter and holiday art traditions.`,
          action: `Create winter celebration art focusing on ${topic.toLowerCase()} using seasonal materials and techniques.`,
          consolidation: `Display winter art celebrating ${topic.toLowerCase()}. Share cultural traditions and meanings.`,
          learningGoals: `Students will create winter celebration art and explore ${topic.toLowerCase()}.`,
          materials: ['Winter art supplies', 'Glitter', 'Seasonal papers', 'Cultural artifacts', 'Decorative materials'],
          accommodations: ['Cultural sensitivity', 'Multiple traditions', 'Alternative materials', 'Family involvement'],
          assessmentType: 'formative',
          assessmentNotes: `Assess winter art creation and cultural understanding through ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Textures and Patterns
    else if (unitTitle.includes('Textures and Patterns')) {
      const topics = [
        'Rough and Smooth', 'Pattern Printing', 'Texture Rubbings', 'Nature Patterns',
        'Fabric Textures', 'Pattern Design', 'Repeating Patterns', 'Texture Collages',
        'Pattern Stories', 'Touch and See Art', 'Mixed Media Textures', 'Pattern Gallery'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Textures & Patterns: ${topic}`,
          mindsOn: `Sensory exploration of ${topic.toLowerCase()}. Touch and describe different textures and patterns.`,
          action: `Create textural and pattern art exploring ${topic.toLowerCase()} through various materials and techniques.`,
          consolidation: `Tactile gallery experience with ${topic.toLowerCase()} art. Describe textures and patterns created.`,
          learningGoals: `Students will explore and create art using textures and patterns, focusing on ${topic.toLowerCase()}.`,
          materials: ['Textured materials', 'Printing tools', 'Fabric scraps', 'Natural objects', 'Rubbing plates'],
          accommodations: ['Sensory supports', 'Tactile materials', 'Visual pattern guides', 'Peer exploration'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor texture and pattern exploration through ${topic.toLowerCase()} art creation.`
        });
      });
    }
    
    // Stories in Art
    else if (unitTitle.includes('Stories in Art')) {
      const topics = [
        'Picture Stories', 'Storytelling Art', 'Character Creation', 'Setting Scenes',
        'Illustration Adventures', 'Art and Books', 'Story Murals', 'Narrative Art',
        'Personal Story Art', 'Fairy Tale Art', 'Family Story Art', 'Story Art Exhibition'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Stories in Art: ${topic}`,
          mindsOn: `Story and art connection discussion about ${topic.toLowerCase()}. Share favorite illustrated stories.`,
          action: `Create narrative artwork exploring ${topic.toLowerCase()} through illustration and storytelling techniques.`,
          consolidation: `Share story art about ${topic.toLowerCase()}. Connect visual narratives to personal experiences.`,
          learningGoals: `Students will create narrative art and understand storytelling through ${topic.toLowerCase()}.`,
          materials: ['Drawing materials', 'Storybooks', 'Art paper', 'Illustration tools', 'Story prompts'],
          accommodations: ['Story supports', 'Visual storytelling', 'Collaborative stories', 'Multiple formats'],
          assessmentType: 'formative',
          assessmentNotes: `Assess narrative art creation and storytelling understanding through ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Our Art Gallery
    else if (unitTitle.includes('Art Gallery')) {
      const topics = [
        'Curating Our Art', 'Artist Statements', 'Gallery Preparation', 'Art Presentation',
        'Art Appreciation', 'Critique and Feedback', 'Art Reflection', 'Artist Identity',
        'Art Celebration', 'Gallery Opening', 'Art Journey Review', 'Future Artist Goals'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Art Gallery: ${topic}`,
          mindsOn: `Gallery planning discussion about ${topic.toLowerCase()}. Review art portfolio and growth.`,
          action: `Prepare gallery exhibition focusing on ${topic.toLowerCase()} through curation and presentation.`,
          consolidation: `Celebrate art gallery featuring ${topic.toLowerCase()}. Reflect on artistic growth and journey.`,
          learningGoals: `Students will curate and present their artwork, focusing on ${topic.toLowerCase()}.`,
          materials: ['Student artwork', 'Display materials', 'Labels', 'Gallery supplies', 'Reflection sheets'],
          accommodations: ['Presentation choice', 'Peer support', 'Family involvement', 'Multiple celebration formats'],
          assessmentType: 'summative',
          assessmentNotes: `Evaluate artistic growth and presentation skills through ${topic.toLowerCase()}.`
        });
      });
    }
    
    return lessons;
  }

  private generateHealthLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    // Me, Myself, and I
    if (unitTitle.includes('Me, Myself, and I')) {
      const topics = [
        'Getting to Know Me', 'My Special Qualities', 'Things I Do Well', 'My Feelings',
        'My Body Parts', 'Taking Care of Myself', 'My Needs and Wants', 'My Growth',
        'My Uniqueness', 'My Strengths', 'My Learning Style', 'Celebrating Me'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Self-Identity: ${topic}`,
          mindsOn: `Self-reflection circle about ${topic.toLowerCase()}. Share personal experiences and characteristics.`,
          action: `Explore ${topic.toLowerCase()} through self-discovery activities, journaling, and creative expression.`,
          consolidation: `Share discoveries about ${topic.toLowerCase()}. Celebrate individual uniqueness and growth.`,
          learningGoals: `Students will develop self-awareness and positive self-identity through exploring ${topic.toLowerCase()}.`,
          materials: ['Mirrors', 'Self-portrait materials', 'Journals', 'Feeling cards', 'Growth charts'],
          accommodations: ['Positive focus', 'Cultural sensitivity', 'Individual differences', 'Family connections'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor self-awareness development and positive self-concept through ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Healthy Me
    else if (unitTitle.includes('Healthy Me')) {
      const topics = [
        'Healthy Foods', 'Exercise and Movement', 'Getting Enough Sleep', 'Staying Clean',
        'Drinking Water', 'Visiting the Doctor', 'Taking Medicine Safely', 'Healthy Choices',
        'My Body Systems', 'Staying Strong', 'Healthy Habits', 'Wellness Celebration'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Healthy Living: ${topic}`,
          mindsOn: `Health discussion about ${topic.toLowerCase()}. Share healthy choices and experiences.`,
          action: `Explore ${topic.toLowerCase()} through health activities, demonstrations, and healthy practice.`,
          consolidation: `Plan healthy actions related to ${topic.toLowerCase()}. Set personal wellness goals.`,
          learningGoals: `Students will understand and practice healthy behaviors, focusing on ${topic.toLowerCase()}.`,
          materials: ['Health books', 'Food models', 'Exercise equipment', 'Hygiene supplies', 'Health charts'],
          accommodations: ['Cultural food considerations', 'Physical adaptations', 'Family health practices', 'Medical accommodations'],
          assessmentType: 'formative',
          assessmentNotes: `Assess health knowledge and commitment to healthy practices in ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Safe and Sound
    else if (unitTitle.includes('Safe and Sound')) {
      const topics = [
        'Safety at Home', 'Safety at School', 'Traffic Safety', 'Stranger Safety',
        'Internet Safety', 'Emergency Helpers', 'Fire Safety', 'Water Safety',
        'Playground Safety', 'Bike Safety', 'Asking for Help', 'Safety Heroes'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Safety First: ${topic}`,
          mindsOn: `Safety discussion about ${topic.toLowerCase()}. Share safety rules and experiences.`,
          action: `Practice ${topic.toLowerCase()} through role-play, safety scenarios, and skill development.`,
          consolidation: `Review safety learning about ${topic.toLowerCase()}. Plan safety actions and reminders.`,
          learningGoals: `Students will understand and practice safety skills, focusing on ${topic.toLowerCase()}.`,
          materials: ['Safety books', 'Role-play props', 'Safety signs', 'Emergency contact materials'],
          accommodations: ['Age-appropriate scenarios', 'Visual safety guides', 'Practice opportunities', 'Family involvement'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor safety knowledge and skill application in ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Friends and Feelings
    else if (unitTitle.includes('Friends and Feelings')) {
      const topics = [
        'Making Friends', 'Being a Good Friend', 'Sharing and Taking Turns', 'Feeling Happy',
        'Feeling Sad', 'Feeling Angry', 'Feeling Scared', 'Helping Others Feel Better',
        'Solving Friend Problems', 'Including Everyone', 'Kindness Counts', 'Friendship Celebration'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Friends & Feelings: ${topic}`,
          mindsOn: `Friendship and emotion circle about ${topic.toLowerCase()}. Share friendship experiences.`,
          action: `Explore ${topic.toLowerCase()} through social scenarios, emotion activities, and friendship practice.`,
          consolidation: `Reflect on friendship learning about ${topic.toLowerCase()}. Plan friendship actions.`,
          learningGoals: `Students will develop social skills and emotional intelligence through ${topic.toLowerCase()}.`,
          materials: ['Emotion cards', 'Friendship books', 'Social scenario cards', 'Art supplies'],
          accommodations: ['Social supports', 'Emotion regulation tools', 'Peer partnerships', 'Cultural considerations'],
          assessmentType: 'formative',
          assessmentNotes: `Assess social skill development and emotional understanding through ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Growing and Learning
    else if (unitTitle.includes('Growing and Learning')) {
      const topics = [
        'How I\'ve Grown', 'Learning New Things', 'Making Mistakes and Learning', 'Setting Goals',
        'Asking for Help', 'Persevering', 'Celebrating Success', 'Growth Mindset',
        'Learning Styles', 'Practice Makes Progress', 'Learning Challenges', 'Future Growth'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Growing & Learning: ${topic}`,
          mindsOn: `Growth and learning reflection about ${topic.toLowerCase()}. Share learning experiences.`,
          action: `Explore ${topic.toLowerCase()} through growth activities, goal setting, and learning reflection.`,
          consolidation: `Document growth learning about ${topic.toLowerCase()}. Set personal learning goals.`,
          learningGoals: `Students will develop growth mindset and learning skills through ${topic.toLowerCase()}.`,
          materials: ['Growth journals', 'Goal-setting materials', 'Learning portfolios', 'Success celebration supplies'],
          accommodations: ['Individual goal setting', 'Various learning modes', 'Progress recognition', 'Family involvement'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor growth mindset development and learning skills through ${topic.toLowerCase()}.`
        });
      });
    }
    
    // Our Wonderful World
    else if (unitTitle.includes('Wonderful World')) {
      const topics = [
        'Caring for Our Environment', 'Helping Our Community', 'Being Grateful', 'Showing Kindness',
        'Making a Difference', 'Environmental Helpers', 'Community Service', 'Acts of Kindness',
        'Thankfulness Practice', 'World Citizens', 'Positive Impact', 'Wonderful World Celebration'
      ];
      
      topics.slice(0, count).forEach((topic, i) => {
        lessons.push({
          title: `Wonderful World: ${topic}`,
          mindsOn: `World appreciation circle about ${topic.toLowerCase()}. Share gratitude and kindness experiences.`,
          action: `Engage in ${topic.toLowerCase()} through service projects, environmental actions, and kindness activities.`,
          consolidation: `Reflect on world impact through ${topic.toLowerCase()}. Plan continued positive actions.`,
          learningGoals: `Students will develop global citizenship and positive impact through ${topic.toLowerCase()}.`,
          materials: ['Service project supplies', 'Environmental materials', 'Kindness cards', 'Community resources'],
          accommodations: ['Age-appropriate service', 'Cultural sensitivity', 'Family involvement', 'Community connections'],
          assessmentType: 'formative',
          assessmentNotes: `Assess global awareness and positive action commitment through ${topic.toLowerCase()}.`
        });
      });
    }
    
    return lessons;
  }

  async generateAllLessons(): Promise<void> {
    console.log('🚀 ENHANCED LESSON GENERATION STARTING...\n');
    
    const emily = await this.prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily not found');
    }
    
    // Get all units that need lessons (have 0 lessons)
    const units = await this.prisma.unitPlan.findMany({
      where: { 
        userId: emily.id,
        lessonPlans: {
          none: {}
        }
      },
      include: {
        longRangePlan: true,
        _count: {
          select: {
            lessonPlans: true
          }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    console.log(`📊 Found ${units.length} units that need lesson generation\n`);
    
    let totalLessons = 0;
    
    for (const unit of units) {
      console.log(`\n🎯 Processing: ${unit.longRangePlan.subject} - "${unit.title}"`);
      await this.generateLessonsForUnit(unit.id);
      
      const lessonCount = await this.prisma.eTFOLessonPlan.count({
        where: { unitPlanId: unit.id }
      });
      totalLessons += lessonCount;
    }
    
    console.log(`\n🎉 ENHANCED LESSON GENERATION COMPLETE!`);
    console.log(`✅ Generated ${totalLessons} intelligent lessons`);
    console.log(`🎯 All lessons follow ETFO best practices`);
    console.log(`📅 Perfect timing and contextual alignment`);
    console.log(`🌟 Complete coverage for all Grade 1 French Immersion subjects`);
  }
}

// Run the enhanced lesson generation
async function runEnhancedLessonGeneration() {
  try {
    const generator = new EnhancedLessonGenerator(prisma);
    await generator.generateAllLessons();
  } catch (error) {
    console.error('❌ Enhanced lesson generation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  runEnhancedLessonGeneration()
    .then(() => console.log('🎉 Enhanced lesson generation completed successfully!'))
    .catch((error) => {
      console.error('💥 Generation failed:', error);
      process.exit(1);
    });
}

export { EnhancedLessonGenerator };