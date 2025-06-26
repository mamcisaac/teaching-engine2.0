import { PrismaClient } from '@teaching-engine/database';
import bcrypt from 'bcryptjs';

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with ETFO-aligned models...');

  // Clear existing data (delete in child-to-parent order to satisfy FK constraints)
  console.log('Clearing existing data...');
  
  // Clear ETFO-aligned models and active tables only
  await prisma.templateRating.deleteMany();
  await prisma.templateVariation.deleteMany();
  await prisma.planTemplate.deleteMany();
  await prisma.studentReflection.deleteMany();
  await prisma.studentGoal.deleteMany();
  await prisma.student.deleteMany();
  await prisma.daybookEntry.deleteMany();
  await prisma.eTFOLessonPlanResource.deleteMany();
  await prisma.eTFOLessonPlanExpectation.deleteMany();
  await prisma.eTFOLessonPlan.deleteMany();
  await prisma.unitPlanResource.deleteMany();
  await prisma.unitPlanExpectation.deleteMany();
  await prisma.unitPlan.deleteMany();
  await prisma.longRangePlanExpectation.deleteMany();
  await prisma.longRangePlan.deleteMany();
  await prisma.curriculumExpectation.deleteMany();
  await prisma.curriculumImport.deleteMany();
  await prisma.parentMessage.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.classRoutine.deleteMany();
  await prisma.subPlanRecord.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Cleared existing data successfully');

  // Create a default user
  const hashedPassword = await bcrypt.hash('Password123!', 12); // Meets security requirements
  const defaultUser = await prisma.user.create({
    data: {
      email: 'teacher@example.com', // Match global setup
      name: 'Test Teacher',
      password: hashedPassword,
      role: 'TEACHER',
      preferredLanguage: 'EN',
    },
  });

  console.log('Created default user:', defaultUser.email);

  // Create sample curriculum expectations for testing
  console.log('Creating curriculum expectations...');
  const mathExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'M1.N1',
      description: 'Count to 20',
      strand: 'Number Sense',
      subject: 'Mathematics',
      grade: 1,
    },
  });

  const languageExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'L1.R1',
      description: 'Read simple texts with understanding',
      strand: 'Reading',
      subject: 'Language',
      grade: 1,
    },
  });

  const scienceExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'S1.L1',
      description: 'Identify characteristics of living things',
      strand: 'Life Systems',
      subject: 'Science',
      grade: 1,
    },
  });

  console.log('Created sample curriculum expectations');

  // Create sample Long Range Plan
  console.log('Creating sample Long Range Plan...');
  const longRangePlan = await prisma.longRangePlan.create({
    data: {
      userId: defaultUser.id,
      title: 'Grade 1 Mathematics Long Range Plan',
      grade: 1,
      subject: 'Mathematics',
      academicYear: '2024-2025',
      term: 'Full Year',
      description: 'Long range plan for Grade 1 Mathematics curriculum',
      goals: 'Students will develop number sense and basic mathematical skills',
      overarchingQuestions: 'How do numbers help us understand our world?',
      expectations: {
        create: {
          expectationId: mathExpectation.id,
          plannedTerm: 'Term 1',
        },
      },
    },
  });

  // Create sample Unit Plan
  console.log('Creating sample Unit Plan...');
  const unitPlan = await prisma.unitPlan.create({
    data: {
      userId: defaultUser.id,
      longRangePlanId: longRangePlan.id,
      title: 'Numbers 1-20',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-02-15'),
      bigIdeas: 'Numbers represent quantity and help us understand the world around us',
      description: 'Introduction to numbers and counting from 1 to 20',
      expectations: {
        create: {
          expectationId: mathExpectation.id,
        },
      },
    },
  });

  // Create sample ETFO Lesson Plan
  console.log('Creating sample ETFO Lesson Plan...');
  const etfoLessonPlan = await prisma.eTFOLessonPlan.create({
    data: {
      userId: defaultUser.id,
      unitPlanId: unitPlan.id,
      title: 'Counting to 10',
      date: new Date('2025-01-20'),
      duration: 60,
      // Denormalized fields for performance
      grade: 1,
      subject: 'Mathematics',
      language: 'en',
      learningGoals: 'Students will count objects to 10 accurately',
      mindsOn: 'Number song and counting fingers',
      action: 'Counting manipulatives in groups',
      consolidation: 'Share counting strategies',
      grouping: 'small group',
      materials: ['counting bears', 'number cards', 'worksheets'],
      expectations: {
        create: {
          expectationId: mathExpectation.id,
        },
      },
    },
  });

  // Create sample students
  console.log('Creating sample students...');
  const student1 = await prisma.student.create({
    data: {
      userId: defaultUser.id,
      firstName: 'Alice',
      lastName: 'Johnson',
      grade: 1,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: defaultUser.id,
      firstName: 'Bob',
      lastName: 'Smith',
      grade: 1,
    },
  });

  // Create sample student goals
  console.log('Creating sample student goals...');
  await prisma.studentGoal.create({
    data: {
      studentId: student1.id,
      text: 'Count to 20 independently',
      unitPlanId: unitPlan.id,
      status: 'active',
    },
  });

  // Create sample daybook entry
  console.log('Creating sample daybook entry...');
  await prisma.daybookEntry.create({
    data: {
      userId: defaultUser.id,
      date: new Date('2025-01-20'),
      lessonPlanId: etfoLessonPlan.id,
      whatWorked: 'Students were excited about counting activities and engaged well',
      whatDidntWork: 'Some students struggled with number recognition',
      nextSteps: 'Provide more visual supports for number recognition',
      studentEngagement: 'High - students actively participated',
      studentSuccesses: 'Alice counted to 15 independently',
      expectations: {
        create: {
          expectationId: mathExpectation.id,
          coverage: 'developing',
        },
      },
    },
  });

  // Create sample class routines
  console.log('Creating sample class routines...');
  await prisma.classRoutine.create({
    data: {
      userId: defaultUser.id,
      title: 'Morning Circle',
      description: 'Daily morning meeting with calendar and weather',
      category: 'MORNING',
      timeOfDay: '09:00',
      priority: 1,
      isActive: true,
    },
  });

  await prisma.classRoutine.create({
    data: {
      userId: defaultUser.id,
      title: 'Silent Reading',
      description: 'Independent reading time',
      category: 'LITERACY',
      timeOfDay: '14:00',
      priority: 2,
      isActive: true,
    },
  });

  // Create sample calendar events
  console.log('Creating sample calendar events...');
  await prisma.calendarEvent.create({
    data: {
      title: 'PA Day',
      start: new Date('2025-02-14'),
      end: new Date('2025-02-14'),
      allDay: true,
      eventType: 'HOLIDAY',
      description: 'Professional Activity Day - No classes',
    },
  });

  await prisma.calendarEvent.create({
    data: {
      title: 'Parent-Teacher Conferences',
      start: new Date('2025-03-15T13:00:00'),
      end: new Date('2025-03-15T17:00:00'),
      eventType: 'CUSTOM',
      description: 'Individual parent-teacher meetings',
    },
  });

  // Create sample parent message
  console.log('Creating sample parent message...');
  await prisma.parentMessage.create({
    data: {
      userId: defaultUser.id,
      title: 'Weekly Update',
      timeframe: 'Week of January 20-24, 2025',
      contentFr: 'Cette semaine, nous avons appris à compter jusqu\'à 10. Les élèves ont participé avec enthousiasme aux activités de mathématiques.',
      contentEn: 'This week, we learned to count to 10. Students participated enthusiastically in mathematics activities.',
    },
  });

  // Create starter templates
  console.log('Creating starter templates...');
  
  // Grade 1 Math - Number Sense Unit Template
  await prisma.planTemplate.create({
    data: {
      title: 'Grade 1 Math - Number Sense Unit',
      titleFr: 'Mathématiques 1re année - Unité de sens du nombre',
      description: 'A comprehensive 2-week unit exploring numbers 1-20 with hands-on activities and assessment opportunities.',
      descriptionFr: 'Une unité complète de 2 semaines explorant les nombres 1-20 avec des activités pratiques et des opportunités d\'évaluation.',
      type: 'UNIT_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Mathematics',
      gradeMin: 1,
      gradeMax: 1,
      isSystem: true,
      isPublic: true,
      estimatedWeeks: 2,
      tags: ['number-sense', 'hands-on', 'primary', 'counting', 'place-value'],
      keywords: ['numbers', 'counting', 'math', 'grade-1', 'manipulatives'],
      content: {
        overview: 'Students will develop number sense by exploring numbers 1-20 through various concrete, pictorial, and abstract activities.',
        bigIdeas: 'Numbers have relationships and patterns. Quantities can be represented in multiple ways.',
        learningGoals: [
          'Count forward and backward from 1 to 20',
          'Recognize and represent numbers in different ways',
          'Compare quantities using more than, less than, equal to',
          'Solve simple addition and subtraction problems using concrete materials'
        ],
        essentialQuestions: [
          'How do we use numbers in our daily lives?',
          'What different ways can we show the same quantity?',
          'How do numbers help us compare amounts?'
        ],
        keyVocabulary: ['number', 'count', 'more', 'less', 'equal', 'add', 'subtract', 'altogether'],
        assessments: [
          {
            type: 'diagnostic',
            description: 'Number recognition and counting assessment',
            timing: 'Beginning of unit'
          },
          {
            type: 'formative',
            description: 'Daily number talks and manipulative explorations',
            timing: 'Throughout unit'
          },
          {
            type: 'summative',
            description: 'Number representation portfolio',
            timing: 'End of unit'
          }
        ],
        differentiationStrategies: {
          forStruggling: [
            'Use concrete manipulatives for all activities',
            'Start with smaller number ranges (1-10)',
            'Provide visual number lines and hundreds charts',
            'Use peer buddies for support'
          ],
          forAdvanced: [
            'Extend to numbers beyond 20',
            'Introduce skip counting patterns',
            'Explore number relationships and patterns',
            'Create their own number problems'
          ],
          forELL: [
            'Use visual supports and gestures',
            'Provide number vocabulary cards with pictures',
            'Use home language connections where possible',
            'Focus on mathematical language development'
          ]
        }
      },
      unitStructure: {
        phases: [
          {
            name: 'Number Recognition & Counting',
            description: 'Building foundational counting skills and number recognition',
            estimatedDays: 4,
            learningGoals: ['Count objects accurately', 'Recognize written numerals 1-20']
          },
          {
            name: 'Number Representations',
            description: 'Exploring different ways to show quantities',
            estimatedDays: 3,
            learningGoals: ['Show numbers using manipulatives, pictures, and symbols']
          },
          {
            name: 'Comparing Quantities',
            description: 'Understanding more than, less than, equal to',
            estimatedDays: 2,
            learningGoals: ['Compare sets of objects', 'Use comparison vocabulary']
          },
          {
            name: 'Adding and Subtracting',
            description: 'Introduction to operations with concrete materials',
            estimatedDays: 3,
            learningGoals: ['Solve simple addition and subtraction problems using objects']
          }
        ],
        resources: [
          { title: 'Counting Bears', type: 'manipulative', notes: '10 bears per student' },
          { title: 'Number Cards 1-20', type: 'printable', notes: 'Laminate for durability' },
          { title: 'Ten Frames', type: 'printable', notes: 'Print on cardstock' }
        ]
      }
    }
  });

  // Grade 3 Language - Poetry Unit Template
  await prisma.planTemplate.create({
    data: {
      title: 'Grade 3 Language - Poetry Unit',
      titleFr: 'Français 3e année - Unité de poésie',
      description: 'A creative 1-week exploration of poetry forms, writing techniques, and performance.',
      descriptionFr: 'Une exploration créative d\'une semaine des formes poétiques, des techniques d\'écriture et de la performance.',
      type: 'UNIT_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Language Arts',
      gradeMin: 3,
      gradeMax: 3,
      isSystem: true,
      isPublic: true,
      estimatedWeeks: 1,
      tags: ['poetry', 'writing', 'language-arts', 'creative', 'performance'],
      keywords: ['poems', 'rhyme', 'rhythm', 'writing', 'language'],
      content: {
        overview: 'Students will explore various forms of poetry, learn about poetic devices, and create their own poems.',
        bigIdeas: 'Poetry is a form of expression that uses language creatively. Words can create images, emotions, and experiences.',
        learningGoals: [
          'Identify different types of poems and their characteristics',
          'Use poetic devices like rhyme, rhythm, and alliteration',
          'Write original poems using various forms',
          'Present poetry with expression and confidence'
        ],
        essentialQuestions: [
          'How do poets use words to create images and feelings?',
          'What makes a poem different from other types of writing?',
          'How can we share poetry to connect with others?'
        ],
        keyVocabulary: ['poem', 'rhyme', 'rhythm', 'stanza', 'verse', 'alliteration', 'metaphor', 'simile'],
        crossCurricularConnections: 'Music (rhythm and beat), Visual Arts (illustrating poems), Drama (performance)'
      },
      unitStructure: {
        phases: [
          {
            name: 'Poetry Exploration',
            description: 'Reading and analyzing different types of poems',
            estimatedDays: 2,
            learningGoals: ['Identify poem characteristics', 'Recognize poetic devices']
          },
          {
            name: 'Writing Workshop',
            description: 'Creating original poems using different forms',
            estimatedDays: 2,
            learningGoals: ['Write haiku, acrostic, and free verse poems']
          },
          {
            name: 'Poetry Café',
            description: 'Sharing and performing student-created poems',
            estimatedDays: 1,
            learningGoals: ['Present poems with expression', 'Give constructive feedback']
          }
        ]
      }
    }
  });

  // Math Problem Solving Lesson Template
  await prisma.planTemplate.create({
    data: {
      title: 'Math Problem Solving Lesson',
      titleFr: 'Leçon de résolution de problèmes mathématiques',
      description: 'A 60-minute lesson focused on developing problem-solving strategies using the three-part lesson structure.',
      descriptionFr: 'Une leçon de 60 minutes axée sur le développement de stratégies de résolution de problèmes en utilisant la structure de leçon en trois parties.',
      type: 'LESSON_PLAN',
      category: 'BY_SKILL',
      subject: 'Mathematics',
      gradeMin: 2,
      gradeMax: 6,
      isSystem: true,
      isPublic: true,
      estimatedMinutes: 60,
      tags: ['problem-solving', 'mathematics', 'three-part-lesson', 'strategies', 'reasoning'],
      keywords: ['problem-solving', 'math', 'strategies', 'thinking', 'reasoning'],
      content: {
        objectives: [
          'Apply problem-solving strategies to solve multi-step problems',
          'Communicate mathematical thinking clearly',
          'Make connections between different problem-solving approaches'
        ],
        materials: [
          'Chart paper and markers',
          'Math manipulatives (blocks, counters)',
          'Problem-solving strategy posters',
          'Student journals'
        ],
        mindsOn: 'Present a visual problem scenario and have students share what they notice and wonder. Activate prior knowledge about problem-solving strategies.',
        action: 'Students work in pairs to solve a multi-step problem using various strategies. Teacher conferences with groups, asking probing questions to extend thinking.',
        consolidation: 'Groups share their solutions and strategies. Class discusses different approaches and makes connections between methods.',
        grouping: 'pairs',
        accommodations: [
          'Provide manipulatives for concrete representation',
          'Offer problems with varying complexity levels',
          'Use visual supports and graphic organizers'
        ],
        assessmentType: 'formative',
        assessmentNotes: 'Observe student strategy use, communication, and reasoning during problem solving'
      },
      lessonStructure: {
        duration: 60,
        sections: [
          {
            name: 'Minds On',
            description: 'Activate prior knowledge and introduce problem',
            timeAllocation: 10,
            activities: ['Visual problem presentation', 'Notice and wonder', 'Strategy review']
          },
          {
            name: 'Action',
            description: 'Collaborative problem solving',
            timeAllocation: 35,
            activities: ['Partner problem solving', 'Teacher conferencing', 'Strategy application']
          },
          {
            name: 'Consolidation',
            description: 'Share solutions and make connections',
            timeAllocation: 15,
            activities: ['Solution sharing', 'Strategy comparison', 'Reflection']
          }
        ]
      }
    }
  });

  // Cross-Curricular Community Helpers Project Template
  await prisma.planTemplate.create({
    data: {
      title: 'Community Helpers Cross-Curricular Project',
      titleFr: 'Projet interdisciplinaire sur les aides communautaires',
      description: 'A comprehensive unit integrating social studies, language arts, and science to explore community helpers and their roles in our society.',
      descriptionFr: 'Une unité complète intégrant les sciences sociales, les arts du langage et les sciences pour explorer les aides communautaires et leurs rôles dans notre société.',
      type: 'UNIT_PLAN',
      category: 'BY_THEME',
      subject: 'Social Studies',
      gradeMin: 1,
      gradeMax: 3,
      isSystem: true,
      isPublic: true,
      estimatedWeeks: 4,
      tags: ['community-helpers', 'cross-curricular', 'social-studies', 'language-arts', 'careers'],
      keywords: ['community', 'helpers', 'jobs', 'careers', 'safety', 'interdisciplinary'],
      content: {
        bigIdeas: [
          'Communities are supported by people with different jobs and responsibilities',
          'Community helpers keep us safe, healthy, and help our community function',
          'We can show appreciation for community helpers through our words and actions'
        ],
        essentialQuestions: [
          'Who are the people that help in our community?',
          'How do community helpers make our lives better?',
          'What skills and tools do different community helpers need?',
          'How can we thank and support community helpers?'
        ],
        learningGoals: [
          'Students will identify various community helpers and their roles',
          'Students will understand how community helpers contribute to safety and well-being',
          'Students will express appreciation for community helpers through various forms of communication',
          'Students will make connections between community helpers and their own future aspirations'
        ],
        successCriteria: [
          'I can name different community helpers and explain what they do',
          'I can describe how community helpers help keep our community safe and healthy',
          'I can write a thank you letter to a community helper',
          'I can share what job I might like to have when I grow up'
        ],
        assessmentPlan: 'Assessment will include observation during discussions, written thank you letters, community helper presentations, and reflection on personal career interests.',
        crossCurricularConnections: 'Language Arts: Writing thank you letters, reading about different careers; Science: Learning about tools and safety equipment; Math: Counting and sorting community helper tools; Art: Drawing community helpers and creating appreciation cards',
        culminatingTask: 'Students will present as a community helper, dressing up and explaining their role to younger students or family members',
        keyVocabulary: ['community', 'helper', 'job', 'career', 'safety', 'service', 'volunteer', 'responsibility'],
        differentiationStrategies: {
          forStruggling: ['Visual supports with pictures of community helpers', 'Partner support during activities', 'Simplified vocabulary'],
          forAdvanced: ['Research additional community helpers not discussed in class', 'Create a community helper book', 'Interview a real community helper'],
          forELL: ['Picture cards with helper names in home language', 'Community helper dramatic play', 'Visual job description cards'],
          forIEP: ['Modified writing expectations', 'Alternative communication methods', 'Sensory-friendly community helper dramatic play']
        },
        indigenousPerspectives: 'Explore traditional roles in Indigenous communities such as Elders, traditional knowledge keepers, and how Indigenous communities care for one another',
        environmentalEducation: 'Discuss community helpers who care for the environment such as park rangers, recycling workers, and conservation officers',
        technologyIntegration: 'Use tablets to research community helpers, create digital thank you cards, and video record community helper presentations'
      }
    }
  });

  // Grade 5 Science - Simple Machines Unit Template
  await prisma.planTemplate.create({
    data: {
      title: 'Grade 5 Science - Simple Machines and Mechanical Systems',
      titleFr: 'Sciences de 5e année - Machines simples et systèmes mécaniques',
      description: 'An inquiry-based unit exploring the six simple machines and how they work together in complex mechanical systems.',
      descriptionFr: 'Une unité basée sur l\'enquête explorant les six machines simples et comment elles fonctionnent ensemble dans des systèmes mécaniques complexes.',
      type: 'UNIT_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Science',
      gradeMin: 5,
      gradeMax: 5,
      isSystem: true,
      isPublic: true,
      estimatedWeeks: 5,
      tags: ['simple-machines', 'science', 'grade-5', 'inquiry', 'mechanical-systems', 'physics'],
      keywords: ['machines', 'lever', 'pulley', 'wheel', 'axle', 'inclined-plane', 'wedge', 'screw', 'force', 'work'],
      content: {
        bigIdeas: [
          'Simple machines help us do work by changing the amount or direction of force needed',
          'Complex machines are combinations of simple machines working together',
          'Understanding how machines work helps us design solutions to everyday problems',
          'Machines have been used throughout history to make work easier and more efficient'
        ],
        essentialQuestions: [
          'How do simple machines make work easier?',
          'What are the six types of simple machines and how do they work?',
          'How are complex machines made up of simple machines?',
          'How can we design and build machines to solve real-world problems?'
        ],
        learningGoals: [
          'Students will identify and explain the function of the six simple machines',
          'Students will investigate how simple machines change force and motion',
          'Students will design and build a complex machine using multiple simple machines',
          'Students will communicate their understanding of how machines work using scientific vocabulary'
        ],
        successCriteria: [
          'I can name and describe the six simple machines (lever, pulley, wheel and axle, inclined plane, wedge, screw)',
          'I can explain how simple machines make work easier by changing force or direction',
          'I can identify simple machines in complex devices around me',
          'I can design and build a machine to solve a specific problem',
          'I can use scientific vocabulary to explain how my machine works'
        ],
        assessmentPlan: 'Assessment will include hands-on investigations, design challenges, scientific drawings with labels, written explanations of machine functions, and peer evaluation of design solutions.',
        crossCurricularConnections: 'Mathematics: Measuring forces, calculating mechanical advantage, geometry of machine parts; Language Arts: Technical writing, research reports on famous inventors; Social Studies: History of machines and their impact on society; Art: Technical drawings and invention sketches',
        culminatingTask: 'Students will design, build, and present a Rube Goldberg machine that accomplishes a simple task using at least four different simple machines',
        keyVocabulary: ['simple machine', 'lever', 'fulcrum', 'pulley', 'wheel and axle', 'inclined plane', 'wedge', 'screw', 'force', 'work', 'mechanical advantage', 'effort', 'load'],
        differentiationStrategies: {
          forStruggling: ['Provide pre-built examples of simple machines', 'Use concrete manipulatives before abstract concepts', 'Partner with stronger students for building activities'],
          forAdvanced: ['Research advanced machines and robotics', 'Calculate actual mechanical advantage ratios', 'Design machines for real community problems'],
          forELL: ['Picture vocabulary cards with machine names', 'Hands-on exploration before verbal explanations', 'Demonstrate rather than just describe machine functions'],
          forIEP: ['Modified building expectations with simpler constructions', 'Alternative ways to show understanding (drawing, demonstration)', 'Peer support during group activities']
        },
        indigenousPerspectives: 'Explore traditional tools and technologies used by Indigenous peoples, such as travois, traditional fishing weirs, and ingenious methods for food processing',
        environmentalEducation: 'Discuss how machines can be designed to be more environmentally friendly, renewable energy machines like wind turbines, and the importance of sustainable design',
        technologyIntegration: 'Use digital simulations of simple machines, create videos explaining machine functions, and research modern applications of simple machines in robotics'
      }
    }
  });

  console.log('✅ Database seeded successfully with ETFO-aligned models!');
  console.log('📊 Created:');
  console.log('  - 1 test user (teacher@test.com / password123)');
  console.log('  - 3 curriculum expectations');
  console.log('  - 1 long range plan');
  console.log('  - 1 unit plan');
  console.log('  - 1 ETFO lesson plan');
  console.log('  - 2 students with sample data');
  console.log('  - 5 starter templates (2 math, 1 language, 1 cross-curricular, 1 science)');
  console.log('  - Sample daybook entries, routines, and calendar events');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });