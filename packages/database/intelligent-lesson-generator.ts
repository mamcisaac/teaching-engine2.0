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

class IntelligentLessonGenerator {
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
    const targetLessons = Math.min(Math.max(schoolDays * 1.2, 5), 20); // 1-2 lessons per day, min 5, max 20

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
    
    if (unitTitle.includes('Bienvenue')) {
      // Welcome unit lessons
      const welcomeTopics = [
        'Greetings and Introductions',
        'Classroom Vocabulary',
        'Learning Routines',
        'Making Friends',
        'School Helpers',
        'Classroom Rules',
        'French Sounds',
        'Our French Journey Begins'
      ];
      
      for (let i = 0; i < Math.min(count, welcomeTopics.length); i++) {
        lessons.push({
          title: `Welcome Lesson: ${welcomeTopics[i]}`,
          titleFr: `Leçon d'accueil: ${welcomeTopics[i]}`,
          mindsOn: `Circle time with French greeting song. Activate prior knowledge about ${welcomeTopics[i].toLowerCase()}.`,
          action: `Interactive exploration of ${welcomeTopics[i].toLowerCase()} through games, pictures, and movement. Practice new vocabulary with partners.`,
          consolidation: `Share learning with class. Practice new French words together. Preview tomorrow's learning.`,
          mindsOnFr: `Cercle de bienvenue avec chanson de salutation française. Activer les connaissances antérieures.`,
          actionFr: `Exploration interactive du vocabulaire avec jeux, images et mouvement. Pratique avec partenaires.`,
          consolidationFr: `Partage des apprentissages. Pratique des nouveaux mots français ensemble.`,
          learningGoals: `Students will use basic French greetings and ${welcomeTopics[i].toLowerCase()} vocabulary in classroom interactions.`,
          materials: ['French picture cards', 'Chart paper', 'Audio equipment', 'Name tags'],
          accommodations: ['Visual supports', 'Repetition', 'Peer support', 'Extra processing time'],
          assessmentType: 'formative',
          assessmentNotes: `Observe student comfort with French greetings and participation in ${welcomeTopics[i].toLowerCase()} activities.`
        });
      }
    } else if (unitTitle.includes('famille')) {
      // Family unit lessons
      const familyTopics = [
        'Family Members',
        'Family Traditions',
        'Family Photos',
        'Family Stories',
        'Describing Family',
        'Family Celebrations'
      ];
      
      for (let i = 0; i < Math.min(count, familyTopics.length); i++) {
        lessons.push({
          title: `Family Focus: ${familyTopics[i]}`,
          titleFr: `Focus famille: ${familyTopics[i]}`,
          mindsOn: `Share family photos. Introduce ${familyTopics[i].toLowerCase()} vocabulary through songs and visuals.`,
          action: `Interactive activities with ${familyTopics[i].toLowerCase()}. Create family trees, practice descriptions, role-play family scenarios.`,
          consolidation: `Present family work to class. Reflect on learning about families. Connect to next lesson.`,
          learningGoals: `Students will describe their family using French vocabulary for ${familyTopics[i].toLowerCase()}.`,
          materials: ['Family photos', 'French vocabulary cards', 'Art supplies', 'Chart paper'],
          accommodations: ['Picture supports', 'Sentence frames', 'Partner assistance', 'Cultural sensitivity'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor use of family vocabulary and comfort sharing about ${familyTopics[i].toLowerCase()}.`
        });
      }
    } else if (unitTitle.includes('automne')) {
      const fallTopics = ['Fall Colors', 'Autumn Leaves', 'Harvest Time', 'Thanksgiving', 'Halloween Fun', 'Fall Weather', 'Autumn Animals', 'Fall Foods', 'Seasonal Changes', 'Gratitude', 'Fall Festivals', 'Preparing for Winter'];
      for (let i = 0; i < Math.min(count, fallTopics.length); i++) {
        lessons.push({
          title: `Fall Celebrations: ${fallTopics[i]}`,
          titleFr: `Célébrations d'automne: ${fallTopics[i]}`,
          mindsOn: `Autumn circle with seasonal objects. Explore ${fallTopics[i].toLowerCase()} vocabulary in French.`,
          action: `Hands-on activities celebrating ${fallTopics[i].toLowerCase()} through crafts, songs, and stories.`,
          consolidation: `Share autumn creations. Practice thanksgiving expressions in French.`,
          learningGoals: `Students will express ideas about ${fallTopics[i].toLowerCase()} using French autumn vocabulary.`,
          materials: ['Fall leaves', 'Seasonal objects', 'Art supplies', 'French autumn songs'],
          accommodations: ['Seasonal vocabulary supports', 'Cultural celebration awareness', 'Visual autumn displays'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor French vocabulary use for ${fallTopics[i].toLowerCase()} and seasonal expressions.`
        });
      }
    } else if (unitTitle.includes('hiver')) {
      const winterTopics = ['Winter Weather', 'Snow Activities', 'Winter Animals', 'Holiday Traditions', 'Winter Clothing', 'Cozy Winter Days', 'Winter Sports', 'Hot Chocolate Time', 'Winter Stories', 'New Year Wishes', 'Winter Safety', 'Magical Winter'];
      for (let i = 0; i < Math.min(count, winterTopics.length); i++) {
        lessons.push({
          title: `Magical Winter: ${winterTopics[i]}`,
          titleFr: `Hiver magique: ${winterTopics[i]}`,
          mindsOn: `Winter wonder circle. Share experiences with ${winterTopics[i].toLowerCase()} in French.`,
          action: `Interactive winter activities exploring ${winterTopics[i].toLowerCase()} through drama, art, and games.`,
          consolidation: `Present winter learning. Practice expressing winter feelings in French.`,
          learningGoals: `Students will communicate about ${winterTopics[i].toLowerCase()} using French winter vocabulary.`,
          materials: ['Winter clothing items', 'Snow pictures', 'Winter books', 'Seasonal props'],
          accommodations: ['Winter vocabulary cards', 'Cultural winter tradition awareness', 'Warm classroom activities'],
          assessmentType: 'formative',
          assessmentNotes: `Assess French communication about ${winterTopics[i].toLowerCase()} and winter experiences.`
        });
      }
    } else if (unitTitle.includes('animaux')) {
      const animalTopics = ['Farm Animals', 'Wild Animals', 'Pet Care', 'Animal Sounds', 'Animal Homes', 'Baby Animals', 'Animal Movements', 'Animal Foods', 'Helping Animals', 'Zoo Animals', 'Ocean Animals', 'Forest Friends'];
      for (let i = 0; i < Math.min(count, animalTopics.length); i++) {
        lessons.push({
          title: `Animal Friends: ${animalTopics[i]}`,
          titleFr: `Amis animaux: ${animalTopics[i]}`,
          mindsOn: `Animal sound circle. Introduce ${animalTopics[i].toLowerCase()} vocabulary with movements.`,
          action: `Interactive animal exploration of ${animalTopics[i].toLowerCase()} through dramatic play and research.`,
          consolidation: `Share animal discoveries. Practice animal descriptions in French.`,
          learningGoals: `Students will describe ${animalTopics[i].toLowerCase()} using French animal vocabulary.`,
          materials: ['Animal pictures', 'Animal sounds audio', 'Animal books', 'Movement props'],
          accommodations: ['Animal picture supports', 'Sound and movement integration', 'Varied animal examples'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor French vocabulary use for ${animalTopics[i].toLowerCase()} and animal descriptions.`
        });
      }
    } else if (unitTitle.includes('communauté')) {
      const communityTopics = ['Our Neighborhood', 'Community Helpers', 'Local Businesses', 'Parks and Places', 'Getting Around', 'Community Events', 'Helping Our Community', 'Special Places', 'Community Rules', 'Neighbors', 'Community Safety', 'Making a Difference'];
      for (let i = 0; i < Math.min(count, communityTopics.length); i++) {
        lessons.push({
          title: `My Community: ${communityTopics[i]}`,
          titleFr: `Ma communauté: ${communityTopics[i]}`,
          mindsOn: `Community circle discussion. Share knowledge about ${communityTopics[i].toLowerCase()}.`,
          action: `Explore ${communityTopics[i].toLowerCase()} through mapping, role-play, and community walks.`,
          consolidation: `Present community learning. Practice community vocabulary in French.`,
          learningGoals: `Students will identify ${communityTopics[i].toLowerCase()} and their role in our community.`,
          materials: ['Community maps', 'Helper pictures', 'Role-play props', 'Local photos'],
          accommodations: ['Visual community supports', 'Local example variety', 'Cultural community awareness'],
          assessmentType: 'formative',
          assessmentNotes: `Assess understanding of ${communityTopics[i].toLowerCase()} and community connections.`
        });
      }
    } else if (unitTitle.includes('printemps')) {
      const springTopics = ['Spring Flowers', 'Growing Gardens', 'Baby Animals', 'Spring Weather', 'Easter Fun', 'Planting Seeds', 'Spring Cleaning', 'Outdoor Adventures', 'Spring Colors', 'New Beginnings', 'Earth Day', 'Spring Celebrations'];
      for (let i = 0; i < Math.min(count, springTopics.length); i++) {
        lessons.push({
          title: `Spring Blooms: ${springTopics[i]}`,
          titleFr: `Printemps fleuri: ${springTopics[i]}`,
          mindsOn: `Spring nature circle. Observe ${springTopics[i].toLowerCase()} changes around us.`,
          action: `Hands-on spring activities exploring ${springTopics[i].toLowerCase()} through gardening and nature study.`,
          consolidation: `Share spring discoveries. Practice spring vocabulary in French.`,
          learningGoals: `Students will express observations about ${springTopics[i].toLowerCase()} using French spring vocabulary.`,
          materials: ['Seeds', 'Spring flowers', 'Garden tools', 'Nature journals'],
          accommodations: ['Spring vocabulary supports', 'Outdoor/indoor options', 'Sensory spring experiences'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor French expression of ${springTopics[i].toLowerCase()} observations and spring changes.`
        });
      }
    } else if (unitTitle.includes('Célébrons')) {
      const celebrationTopics = ['Our Growth', 'Learning Journey', 'Favorite Memories', 'New Skills', 'Friendship Celebrations', 'Year-End Reflection', 'Summer Plans', 'Graduation Prep', 'Thank You Notes', 'Final Presentations', 'School Memories', 'Looking Ahead'];
      for (let i = 0; i < Math.min(count, celebrationTopics.length); i++) {
        lessons.push({
          title: `Celebrating Learning: ${celebrationTopics[i]}`,
          titleFr: `Célébrons nos apprentissages: ${celebrationTopics[i]}`,
          mindsOn: `Celebration circle reflecting on ${celebrationTopics[i].toLowerCase()} throughout the year.`,
          action: `Create celebration projects about ${celebrationTopics[i].toLowerCase()} showing our growth.`,
          consolidation: `Share ${celebrationTopics[i].toLowerCase()} presentations. Celebrate our French learning journey.`,
          learningGoals: `Students will reflect on ${celebrationTopics[i].toLowerCase()} and express growth in French.`,
          materials: ['Portfolio work', 'Celebration supplies', 'Memory books', 'Art materials'],
          accommodations: ['Growth portfolio supports', 'Celebration choice options', 'Individual reflection time'],
          assessmentType: 'summative',
          assessmentNotes: `Assess year-long growth in French learning and ${celebrationTopics[i].toLowerCase()}.`
        });
      }
    }
    
    return lessons;
  }

  private generateMathLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    if (unitTitle.includes('Numbers All Around')) {
      const numberTopics = [
        'Counting to 10',
        'Number Recognition',
        'Number Formation',
        'Comparing Numbers',
        'Numbers in Our World',
        'Number Patterns'
      ];
      
      for (let i = 0; i < Math.min(count, numberTopics.length); i++) {
        lessons.push({
          title: `Numbers Exploration: ${numberTopics[i]}`,
          mindsOn: `Number warm-up with counting songs. Explore ${numberTopics[i].toLowerCase()} with manipulatives.`,
          action: `Hands-on investigation of ${numberTopics[i].toLowerCase()} using concrete materials, games, and problem-solving.`,
          consolidation: `Share discoveries about ${numberTopics[i].toLowerCase()}. Math journal reflection. Connect to daily life.`,
          learningGoals: `Students will demonstrate understanding of ${numberTopics[i].toLowerCase()} through concrete exploration.`,
          materials: ['Counting bears', 'Number cards', 'Math manipulatives', 'Math journals'],
          accommodations: ['Extra manipulatives', 'Visual number lines', 'Partner support', 'Extended time'],
          assessmentType: 'formative',
          assessmentNotes: `Observe student understanding of ${numberTopics[i].toLowerCase()} through manipulative use and explanations.`
        });
      }
    } else if (unitTitle.includes('Making Sense')) {
      const senseTopics = ['Number Bonds to 5', 'Number Bonds to 10', 'Part-Whole Relationships', 'Subitizing', 'Number Fluency', 'Comparing Sets', 'Ordering Numbers', 'Number Stories', 'Estimation', 'Number Games', 'Math Talk', 'Problem Solving'];
      for (let i = 0; i < Math.min(count, senseTopics.length); i++) {
        lessons.push({
          title: `Number Sense: ${senseTopics[i]}`,
          mindsOn: `Math warm-up with ${senseTopics[i].toLowerCase()}. Quick number activities with manipulatives.`,
          action: `Explore ${senseTopics[i].toLowerCase()} through games, investigations, and concrete materials.`,
          consolidation: `Share math thinking about ${senseTopics[i].toLowerCase()}. Record strategies in math journals.`,
          learningGoals: `Students will develop number sense with ${senseTopics[i].toLowerCase()} through hands-on exploration.`,
          materials: ['Ten frames', 'Counting bears', 'Number lines', 'Math games', 'Dice'],
          accommodations: ['Visual supports', 'Concrete materials', 'Number charts', 'Extra practice time'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor development of ${senseTopics[i].toLowerCase()} and mathematical reasoning.`
        });
      }
    } else if (unitTitle.includes('Patterns and Shapes')) {
      const patternTopics = ['AB Patterns', 'Color Patterns', 'Shape Patterns', '2D Shapes', '3D Shapes', 'Shape Sorting', 'Pattern Extension', 'Creating Patterns', 'Symmetry', 'Shape Hunt', 'Pattern Stories', 'Geometric Art'];
      for (let i = 0; i < Math.min(count, patternTopics.length); i++) {
        lessons.push({
          title: `Patterns & Shapes: ${patternTopics[i]}`,
          mindsOn: `Pattern warm-up with ${patternTopics[i].toLowerCase()}. Explore patterns in our environment.`,
          action: `Hands-on investigation of ${patternTopics[i].toLowerCase()} using manipulatives and art materials.`,
          consolidation: `Share pattern discoveries about ${patternTopics[i].toLowerCase()}. Create pattern galleries.`,
          learningGoals: `Students will identify and create ${patternTopics[i].toLowerCase()} through concrete exploration.`,
          materials: ['Pattern blocks', 'Shape manipulatives', 'Art supplies', 'Pattern cards'],
          accommodations: ['Visual pattern supports', 'Tactile materials', 'Step-by-step guides', 'Partner work'],
          assessmentType: 'formative',
          assessmentNotes: `Assess understanding of ${patternTopics[i].toLowerCase()} and pattern reasoning.`
        });
      }
    } else if (unitTitle.includes('Adding and Subtracting')) {
      const addSubTopics = ['Addition Stories', 'Subtraction Stories', 'Using Manipulatives', 'Number Line Addition', 'Number Line Subtraction', 'Fact Families', 'Mental Math', 'Problem Solving', 'Real-World Math', 'Math Strategies', 'Explaining Thinking', 'Math Games'];
      for (let i = 0; i < Math.min(count, addSubTopics.length); i++) {
        lessons.push({
          title: `Addition & Subtraction: ${addSubTopics[i]}`,
          mindsOn: `Math story warm-up with ${addSubTopics[i].toLowerCase()}. Act out math situations.`,
          action: `Explore ${addSubTopics[i].toLowerCase()} through concrete materials and real-world problems.`,
          consolidation: `Share math strategies for ${addSubTopics[i].toLowerCase()}. Reflect on problem-solving.`,
          learningGoals: `Students will solve problems using ${addSubTopics[i].toLowerCase()} with concrete materials.`,
          materials: ['Counting bears', 'Number lines', 'Math mats', 'Story problem cards'],
          accommodations: ['Concrete manipulatives', 'Visual supports', 'Story acting', 'Extended time'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor problem-solving with ${addSubTopics[i].toLowerCase()} and strategy development.`
        });
      }
    } else if (unitTitle.includes('Mental Math')) {
      const mentalTopics = ['Quick Recall', 'Number Combinations', 'Counting On', 'Counting Back', 'Doubles Facts', 'Near Doubles', 'Making 10', 'Friendly Numbers', 'Estimation', 'Mental Strategies', 'Math Fluency', 'Speed Practice'];
      for (let i = 0; i < Math.min(count, mentalTopics.length); i++) {
        lessons.push({
          title: `Mental Math: ${mentalTopics[i]}`,
          mindsOn: `Quick mental math with ${mentalTopics[i].toLowerCase()}. Number talk and reasoning.`,
          action: `Practice ${mentalTopics[i].toLowerCase()} through games, activities, and strategy sharing.`,
          consolidation: `Reflect on ${mentalTopics[i].toLowerCase()} strategies. Set personal math goals.`,
          learningGoals: `Students will develop mental math fluency with ${mentalTopics[i].toLowerCase()}.`,
          materials: ['Number cards', 'Math games', 'Timer', 'Strategy charts'],
          accommodations: ['Visual strategy supports', 'Extra practice time', 'Concrete backup', 'Individual pacing'],
          assessmentType: 'formative',
          assessmentNotes: `Assess mental math development with ${mentalTopics[i].toLowerCase()} and strategy use.`
        });
      }
    } else if (unitTitle.includes('Measurement')) {
      const measureTopics = ['Length Comparison', 'Height Measurement', 'Weight Comparison', 'Capacity Exploration', 'Time Telling', 'Calendar Math', 'Measurement Tools', 'Standard Units', 'Non-Standard Units', 'Measurement Games', 'Real-World Measuring', 'Measurement Projects'];
      for (let i = 0; i < Math.min(count, measureTopics.length); i++) {
        lessons.push({
          title: `Measurement: ${measureTopics[i]}`,
          mindsOn: `Measurement exploration with ${measureTopics[i].toLowerCase()}. Wonder about size and quantity.`,
          action: `Hands-on measurement activities with ${measureTopics[i].toLowerCase()} using various tools.`,
          consolidation: `Share measurement discoveries about ${measureTopics[i].toLowerCase()}. Compare results.`,
          learningGoals: `Students will explore ${measureTopics[i].toLowerCase()} through hands-on measurement activities.`,
          materials: ['Measuring tools', 'Rulers', 'Balance scales', 'Containers', 'Clocks'],
          accommodations: ['Large measuring tools', 'Clear demonstrations', 'Partner measuring', 'Extra exploration time'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding of ${measureTopics[i].toLowerCase()} and measurement concepts.`
        });
      }
    } else if (unitTitle.includes('Problem Solving')) {
      const problemTopics = ['Understanding Problems', 'Problem Strategies', 'Draw a Picture', 'Act It Out', 'Make a Table', 'Find Patterns', 'Guess and Check', 'Work Backwards', 'Make it Simpler', 'Check Solutions', 'Explain Thinking', 'Create Problems'];
      for (let i = 0; i < Math.min(count, problemTopics.length); i++) {
        lessons.push({
          title: `Problem Solving: ${problemTopics[i]}`,
          mindsOn: `Problem-solving warm-up with ${problemTopics[i].toLowerCase()}. Discuss strategy thinking.`,
          action: `Practice ${problemTopics[i].toLowerCase()} with various problems and strategy exploration.`,
          consolidation: `Share problem-solving thinking about ${problemTopics[i].toLowerCase()}. Celebrate strategies.`,
          learningGoals: `Students will apply ${problemTopics[i].toLowerCase()} to solve mathematical problems.`,
          materials: ['Problem cards', 'Manipulatives', 'Chart paper', 'Strategy posters'],
          accommodations: ['Visual strategy supports', 'Concrete materials', 'Step-by-step guides', 'Think-aloud modeling'],
          assessmentType: 'formative',
          assessmentNotes: `Assess problem-solving with ${problemTopics[i].toLowerCase()} and mathematical reasoning.`
        });
      }
    } else if (unitTitle.includes('Math Celebration')) {
      const celebrationTopics = ['Math Growth', 'Favorite Strategies', 'Math Games Day', 'Number Stories', 'Math Art', 'Problem Solving Show', 'Math Journals Review', 'Goal Setting', 'Math Appreciation', 'Summer Math', 'Grade 2 Preview', 'Math Memories'];
      for (let i = 0; i < Math.min(count, celebrationTopics.length); i++) {
        lessons.push({
          title: `Math Celebration: ${celebrationTopics[i]}`,
          mindsOn: `Math celebration circle with ${celebrationTopics[i].toLowerCase()}. Reflect on learning journey.`,
          action: `Celebrate math learning through ${celebrationTopics[i].toLowerCase()} activities and presentations.`,
          consolidation: `Share ${celebrationTopics[i].toLowerCase()} celebrations. Look ahead to continued math learning.`,
          learningGoals: `Students will celebrate their growth in ${celebrationTopics[i].toLowerCase()} and mathematical thinking.`,
          materials: ['Math portfolios', 'Celebration supplies', 'Games', 'Art materials'],
          accommodations: ['Choice of celebration activities', 'Portfolio supports', 'Individual reflection options'],
          assessmentType: 'summative',
          assessmentNotes: `Assess year-long math growth and understanding of ${celebrationTopics[i].toLowerCase()}.`
        });
      }
    }
    
    return lessons;
  }

  private generateScienceLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    if (unitTitle.includes('School Environment')) {
      const scienceTopics = [
        'Our School Habitat',
        'Living and Non-Living',
        'Observation Skills',
        'Scientific Tools',
        'Recording Observations',
        'Sharing Discoveries'
      ];
      
      for (let i = 0; i < Math.min(count, scienceTopics.length); i++) {
        lessons.push({
          title: `Science Investigation: ${scienceTopics[i]}`,
          mindsOn: `Wonder walk around school. Question generation about ${scienceTopics[i].toLowerCase()}.`,
          action: `Hands-on investigation of ${scienceTopics[i].toLowerCase()}. Use scientific tools and methods.`,
          consolidation: `Record findings in science journals. Share discoveries with class. Plan next investigation.`,
          learningGoals: `Students will investigate ${scienceTopics[i].toLowerCase()} using scientific inquiry methods.`,
          materials: ['Magnifying glasses', 'Science journals', 'Clipboards', 'Collection containers'],
          accommodations: ['Picture guides', 'Partner investigations', 'Modified recording sheets', 'Extra time'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor scientific thinking and observation skills during ${scienceTopics[i].toLowerCase()} investigation.`
        });
      }
    } else if (unitTitle.includes('Fall Changes')) {
      const fallTopics = ['Leaf Changes', 'Weather Patterns', 'Animal Preparations', 'Plant Changes', 'Seasonal Observations', 'Migration', 'Hibernation Prep', 'Seed Dispersal', 'Temperature Changes', 'Daylight Changes', 'Fall Experiments', 'Nature Collections'];
      for (let i = 0; i < Math.min(count, fallTopics.length); i++) {
        lessons.push({
          title: `Fall Science: ${fallTopics[i]}`,
          mindsOn: `Nature observation walk for ${fallTopics[i].toLowerCase()}. Wonder about seasonal changes.`,
          action: `Scientific investigation of ${fallTopics[i].toLowerCase()} through experiments and observations.`,
          consolidation: `Record ${fallTopics[i].toLowerCase()} findings. Share scientific discoveries about fall.`,
          learningGoals: `Students will investigate ${fallTopics[i].toLowerCase()} using scientific observation and recording.`,
          materials: ['Fall specimens', 'Thermometers', 'Collection bags', 'Science journals', 'Magnifiers'],
          accommodations: ['Outdoor/indoor options', 'Partner observations', 'Picture recording sheets', 'Sensory exploration'],
          assessmentType: 'formative',
          assessmentNotes: `Assess scientific observation skills and understanding of ${fallTopics[i].toLowerCase()}.`
        });
      }
    } else if (unitTitle.includes('Energy')) {
      const energyTopics = ['Light Sources', 'Sound Exploration', 'Movement Energy', 'Heat and Cold', 'Electricity Safety', 'Wind Power', 'Water Power', 'Energy in Our Bodies', 'Simple Machines', 'Energy Games', 'Energy Conservation', 'Renewable Energy'];
      for (let i = 0; i < Math.min(count, energyTopics.length); i++) {
        lessons.push({
          title: `Energy Exploration: ${energyTopics[i]}`,
          mindsOn: `Energy discovery station with ${energyTopics[i].toLowerCase()}. Wonder about how energy works.`,
          action: `Hands-on investigation of ${energyTopics[i].toLowerCase()} through safe experiments and exploration.`,
          consolidation: `Share energy discoveries about ${energyTopics[i].toLowerCase()}. Connect to daily life.`,
          learningGoals: `Students will explore ${energyTopics[i].toLowerCase()} through safe scientific investigation.`,
          materials: ['Flashlights', 'Musical instruments', 'Simple machines', 'Safety equipment'],
          accommodations: ['Safety demonstrations', 'Partner investigations', 'Visual safety guides', 'Hands-on exploration'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding of ${energyTopics[i].toLowerCase()} and energy concepts.`
        });
      }
    } else if (unitTitle.includes('Winter Wonders')) {
      const winterTopics = ['Snow Science', 'Ice Experiments', 'Winter Weather', 'Animal Adaptations', 'Plant Dormancy', 'Winter Survival', 'Freezing and Melting', 'Winter Clothing Science', 'Indoor/Outdoor Temperatures', 'Winter Safety', 'Insulation', 'Winter Investigations'];
      for (let i = 0; i < Math.min(count, winterTopics.length); i++) {
        lessons.push({
          title: `Winter Science: ${winterTopics[i]}`,
          mindsOn: `Winter wonder exploration with ${winterTopics[i].toLowerCase()}. Generate winter science questions.`,
          action: `Scientific investigation of ${winterTopics[i].toLowerCase()} through safe winter experiments.`,
          consolidation: `Record winter science findings about ${winterTopics[i].toLowerCase()}. Share winter discoveries.`,
          learningGoals: `Students will investigate ${winterTopics[i].toLowerCase()} using winter science observations.`,
          materials: ['Ice', 'Snow samples', 'Thermometers', 'Insulation materials', 'Winter clothing'],
          accommodations: ['Indoor alternatives', 'Safety considerations', 'Warm-up breaks', 'Visual winter supports'],
          assessmentType: 'formative',
          assessmentNotes: `Assess scientific understanding of ${winterTopics[i].toLowerCase()} and winter phenomena.`
        });
      }
    } else if (unitTitle.includes('Growing and Changing')) {
      const growthTopics = ['Plant Life Cycles', 'Animal Life Cycles', 'Seed Germination', 'Growth Observations', 'Measuring Growth', 'Recording Changes', 'Caring for Living Things', 'Growth Needs', 'Growth Patterns', 'Life Cycle Stages', 'Growth Experiments', 'Growth Celebrations'];
      for (let i = 0; i < Math.min(count, growthTopics.length); i++) {
        lessons.push({
          title: `Growth Science: ${growthTopics[i]}`,
          mindsOn: `Growth observation circle with ${growthTopics[i].toLowerCase()}. Wonder about how things grow.`,
          action: `Scientific investigation of ${growthTopics[i].toLowerCase()} through growth experiments and observations.`,
          consolidation: `Record growth findings about ${growthTopics[i].toLowerCase()}. Celebrate growth discoveries.`,
          learningGoals: `Students will investigate ${growthTopics[i].toLowerCase()} through scientific observation and care.`,
          materials: ['Seeds', 'Planting supplies', 'Measuring tools', 'Growth charts', 'Care materials'],
          accommodations: ['Growth picture supports', 'Partner care responsibilities', 'Sensory exploration', 'Multiple examples'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding of ${growthTopics[i].toLowerCase()} and growth science concepts.`
        });
      }
    } else if (unitTitle.includes('Spring Awakening')) {
      const springTopics = ['Spring Changes', 'New Growth', 'Baby Animals', 'Flower Parts', 'Pollination', 'Spring Weather', 'Migration Return', 'Nest Building', 'Spring Planting', 'Outdoor Exploration', 'Spring Experiments', 'Nature Awakening'];
      for (let i = 0; i < Math.min(count, springTopics.length); i++) {
        lessons.push({
          title: `Spring Science: ${springTopics[i]}`,
          mindsOn: `Spring nature walk observing ${springTopics[i].toLowerCase()}. Generate spring science questions.`,
          action: `Scientific exploration of ${springTopics[i].toLowerCase()} through outdoor investigations and experiments.`,
          consolidation: `Record spring findings about ${springTopics[i].toLowerCase()}. Share spring science discoveries.`,
          learningGoals: `Students will investigate ${springTopics[i].toLowerCase()} through spring science observations.`,
          materials: ['Spring specimens', 'Magnifiers', 'Collection containers', 'Planting materials', 'Science journals'],
          accommodations: ['Indoor/outdoor options', 'Spring picture supports', 'Partner explorations', 'Sensory spring experiences'],
          assessmentType: 'formative',
          assessmentNotes: `Assess scientific observation of ${springTopics[i].toLowerCase()} and spring phenomena.`
        });
      }
    } else if (unitTitle.includes('Impact on Nature')) {
      const impactTopics = ['Reduce, Reuse, Recycle', 'Caring for Earth', 'Pollution Awareness', 'Conservation', 'Protecting Animals', 'Saving Water', 'Saving Energy', 'Litter Prevention', 'Habitat Protection', 'Earth-Friendly Choices', 'Environmental Heroes', 'Taking Action'];
      for (let i = 0; i < Math.min(count, impactTopics.length); i++) {
        lessons.push({
          title: `Environmental Science: ${impactTopics[i]}`,
          mindsOn: `Environmental awareness circle about ${impactTopics[i].toLowerCase()}. Share earth-friendly ideas.`,
          action: `Investigation of ${impactTopics[i].toLowerCase()} through action projects and environmental exploration.`,
          consolidation: `Share environmental learning about ${impactTopics[i].toLowerCase()}. Commit to earth actions.`,
          learningGoals: `Students will understand ${impactTopics[i].toLowerCase()} and ways to help the environment.`,
          materials: ['Recycling materials', 'Action project supplies', 'Environmental books', 'Earth pictures'],
          accommodations: ['Action choice options', 'Visual environmental supports', 'Family connection projects', 'Concrete examples'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding of ${impactTopics[i].toLowerCase()} and environmental responsibility.`
        });
      }
    }
    
    return lessons;
  }

  private generateSocialStudiesLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    if (unitTitle.includes('Family and Our Class')) {
      const topics = ['My Family Story', 'Family Traditions', 'Classroom Family', 'Community Helpers', 'Special People', 'Family Rules', 'School Rules', 'Helping Others', 'Family Celebrations', 'Class Celebrations', 'Respect and Kindness', 'Our Diverse Families'];
      for (let i = 0; i < Math.min(count, topics.length); i++) {
        lessons.push({
          title: `Family & Class: ${topics[i]}`,
          mindsOn: `Circle sharing about ${topics[i].toLowerCase()}. Activate prior knowledge through photos and stories.`,
          action: `Interactive exploration of ${topics[i].toLowerCase()} through role-play, mapping, and creative activities.`,
          consolidation: `Share learning about ${topics[i].toLowerCase()}. Make connections to our classroom family.`,
          learningGoals: `Students will understand ${topics[i].toLowerCase()} and their role in family and classroom communities.`,
          materials: ['Photos', 'Chart paper', 'Art supplies', 'Books about families'],
          accommodations: ['Visual supports', 'Diverse family examples', 'Cultural sensitivity', 'Extra time'],
          assessmentType: 'formative',
          assessmentNotes: `Observe understanding of ${topics[i].toLowerCase()} and respectful discussion of family diversity.`
        });
      }
    } else if (unitTitle.includes('Rights and Responsibilities')) {
      const topics = ['My Rights', 'My Responsibilities', 'Classroom Rights', 'School Responsibilities', 'Fair Play', 'Taking Turns', 'Helping Others', 'Being Safe', 'Making Choices', 'Problem Solving', 'Being Honest', 'Caring for Others'];
      for (let i = 0; i < Math.min(count, topics.length); i++) {
        lessons.push({
          title: `Rights & Responsibilities: ${topics[i]}`,
          mindsOn: `Discussion circle about ${topics[i].toLowerCase()}. Share examples from daily life.`,
          action: `Role-play scenarios about ${topics[i].toLowerCase()}. Practice making good choices.`,
          consolidation: `Reflect on ${topics[i].toLowerCase()}. Create classroom agreements together.`,
          learningGoals: `Students will demonstrate understanding of ${topics[i].toLowerCase()} in school and community.`,
          materials: ['Scenario cards', 'Chart paper', 'Role-play props', 'Agreement templates'],
          accommodations: ['Picture supports', 'Simple language', 'Partner support', 'Clear examples'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding of ${topics[i].toLowerCase()} through discussions and role-play.`
        });
      }
    }
    
    return lessons;
  }

  private generateArtsLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    if (unitTitle.includes('Discovering Art')) {
      const topics = ['Art All Around Us', 'Colors in Nature', 'Lines and Shapes', 'Textures We Touch', 'Art Tools', 'Famous Artists', 'Art in Our School', 'Creating Together', 'Art Stories', 'My Art Voice', 'Art Gallery Walk', 'Sharing Our Art'];
      for (let i = 0; i < Math.min(count, topics.length); i++) {
        lessons.push({
          title: `Art Discovery: ${topics[i]}`,
          mindsOn: `Art observation walk. Wonder about ${topics[i].toLowerCase()} in our environment.`,
          action: `Hands-on exploration of ${topics[i].toLowerCase()} through various art materials and techniques.`,
          consolidation: `Gallery walk to share ${topics[i].toLowerCase()} creations. Reflect on artistic choices.`,
          learningGoals: `Students will explore ${topics[i].toLowerCase()} through artistic expression and observation.`,
          materials: ['Art supplies', 'Natural materials', 'Artist examples', 'Display space'],
          accommodations: ['Adaptive tools', 'Various textures', 'Extra time', 'Process over product'],
          assessmentType: 'formative',
          assessmentNotes: `Observe artistic exploration and communication about ${topics[i].toLowerCase()}.`
        });
      }
    } else if (unitTitle.includes('Colors and Feelings')) {
      const topics = ['Happy Colors', 'Sad Colors', 'Angry Colors', 'Calm Colors', 'Color Mixing', 'Warm Colors', 'Cool Colors', 'Favorite Colors', 'Color Stories', 'Emotions in Art', 'Color Patterns', 'Rainbow Art'];
      for (let i = 0; i < Math.min(count, topics.length); i++) {
        lessons.push({
          title: `Colors & Feelings: ${topics[i]}`,
          mindsOn: `Color emotion circle. Share feelings about ${topics[i].toLowerCase()}.`,
          action: `Create art expressing ${topics[i].toLowerCase()} through painting, drawing, and mixed media.`,
          consolidation: `Share color emotion artwork. Discuss how ${topics[i].toLowerCase()} make us feel.`,
          learningGoals: `Students will express emotions through ${topics[i].toLowerCase()} in artistic creation.`,
          materials: ['Paints', 'Brushes', 'Paper', 'Color wheels', 'Emotion cards'],
          accommodations: ['Large brushes', 'Color labels', 'Emotion supports', 'Choice of media'],
          assessmentType: 'formative',
          assessmentNotes: `Observe connection between ${topics[i].toLowerCase()} and emotional expression.`
        });
      }
    }
    
    return lessons;
  }

  private generateHealthLessons(unitTitle: string, count: number): LessonTemplate[] {
    const lessons: LessonTemplate[] = [];
    
    if (unitTitle.includes('Me, Myself')) {
      const topics = ['My Body', 'My Feelings', 'My Strengths', 'My Interests', 'My Family', 'My Friends', 'Growing and Changing', 'Being Unique', 'Self-Care', 'Healthy Choices', 'My Goals', 'Celebrating Me'];
      for (let i = 0; i < Math.min(count, topics.length); i++) {
        lessons.push({
          title: `Self Discovery: ${topics[i]}`,
          mindsOn: `Self-reflection circle about ${topics[i].toLowerCase()}. Share personal experiences safely.`,
          action: `Interactive activities exploring ${topics[i].toLowerCase()} through self-portraits, journals, and games.`,
          consolidation: `Share learning about ${topics[i].toLowerCase()}. Set personal goals for growth.`,
          learningGoals: `Students will develop self-awareness about ${topics[i].toLowerCase()} and personal identity.`,
          materials: ['Mirrors', 'Journals', 'Art supplies', 'Feeling cards', 'Photos'],
          accommodations: ['Privacy options', 'Cultural sensitivity', 'Family structure awareness', 'Extra support'],
          assessmentType: 'formative',
          assessmentNotes: `Observe self-awareness development and comfort discussing ${topics[i].toLowerCase()}.`
        });
      }
    } else if (unitTitle.includes('Healthy Me')) {
      const topics = ['Healthy Foods', 'Exercise Fun', 'Clean Hands', 'Brushing Teeth', 'Getting Sleep', 'Drinking Water', 'Safe Play', 'Asking for Help', 'Doctor Visits', 'Medicine Safety', 'Staying Safe', 'Healthy Habits'];
      for (let i = 0; i < Math.min(count, topics.length); i++) {
        lessons.push({
          title: `Healthy Living: ${topics[i]}`,
          mindsOn: `Health circle discussion about ${topics[i].toLowerCase()}. Share healthy habits.`,
          action: `Hands-on activities practicing ${topics[i].toLowerCase()} through role-play and demonstrations.`,
          consolidation: `Commit to ${topics[i].toLowerCase()} practices. Create health goal charts.`,
          learningGoals: `Students will practice ${topics[i].toLowerCase()} for personal health and wellness.`,
          materials: ['Health posters', 'Role-play props', 'Chart paper', 'Healthy snacks'],
          accommodations: ['Cultural food considerations', 'Family practice variations', 'Clear demonstrations', 'Visual supports'],
          assessmentType: 'formative',
          assessmentNotes: `Monitor understanding and practice of ${topics[i].toLowerCase()} health habits.`
        });
      }
    }
    
    return lessons;
  }

  async generateAllLessons(): Promise<void> {
    console.log('🚀 INTELLIGENT LESSON GENERATION STARTING...\n');
    
    const emily = await this.prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily not found');
    }
    
    // Get all units
    const units = await this.prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    console.log(`📊 Found ${units.length} units to generate lessons for\n`);
    
    let totalLessons = 0;
    
    for (const unit of units) {
      await this.generateLessonsForUnit(unit.id);
      
      const lessonCount = await this.prisma.eTFOLessonPlan.count({
        where: { unitPlanId: unit.id }
      });
      totalLessons += lessonCount;
    }
    
    console.log(`\n🎉 LESSON GENERATION COMPLETE!`);
    console.log(`✅ Generated ${totalLessons} intelligent lessons`);
    console.log(`🎯 All lessons follow ETFO best practices`);
    console.log(`📅 Perfect timing and contextual alignment`);
  }
}

// Run the intelligent lesson generation
async function runLessonGeneration() {
  try {
    const generator = new IntelligentLessonGenerator(prisma);
    await generator.generateAllLessons();
  } catch (error) {
    console.error('❌ Lesson generation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  runLessonGeneration()
    .then(() => console.log('🎉 Intelligent lesson generation completed successfully!'))
    .catch((error) => {
      console.error('💥 Generation failed:', error);
      process.exit(1);
    });
}

export { IntelligentLessonGenerator };