import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addEssentialQuestions() {
  try {
    // Get all units for Emily
    const units = await prisma.unitPlan.findMany({
      where: { userId: 23 },
      select: {
        id: true,
        title: true,
        essentialQuestions: true,
        longRangePlan: {
          select: {
            subject: true
          }
        }
      }
    });

    console.log(`Found ${units.length} units to enhance with essential questions\n`);

    const updates = [];

    // Define essential questions by subject and unit
    const essentialQuestionsByUnit = {
      'Arts visuels': {
        'Colors and Feelings': [
          'Comment les couleurs nous font-elles ressentir différentes émotions?',
          'How can we use colors to tell stories about our feelings?',
          'What happens when we mix different colors together?'
        ],
        'Discovering Art in Our World': [
          'Où trouve-t-on de l\'art dans notre communauté?',
          'How do artists share their ideas with the world?',
          'What makes something a work of art?'
        ],
        'Our Art Gallery': [
          'Comment pouvons-nous partager notre art avec les autres?',
          'What makes an art gallery special?',
          'How do we choose which artwork to display?'
        ],
        'Stories in Art': [
          'Comment les artistes racontent-ils des histoires sans mots?',
          'What stories can we tell through our artwork?',
          'How do pictures help us understand stories?'
        ],
        'Textures and Patterns': [
          'Qu\'est-ce qui rend une texture intéressante à toucher?',
          'How do patterns help us decorate our world?',
          'Where do we find patterns in nature?'
        ],
        'Winter Celebrations Through Art': [
          'Comment l\'art nous aide-t-il à célébrer les saisons?',
          'What winter traditions can we show through art?',
          'How do different cultures celebrate winter?'
        ]
      },
      'Formation personnelle et sociale': {
        'Friends and Feelings': [
          'Qu\'est-ce qui fait un bon ami?',
          'How can we show kindness to others every day?',
          'What should we do when we feel sad or angry?'
        ],
        'Growing and Learning': [
          'Comment grandir nous aide-t-il à apprendre de nouvelles choses?',
          'What new things can I do now that I couldn\'t do before?',
          'How do we learn from our mistakes?'
        ],
        'Healthy Me': [
          'Qu\'est-ce qui aide notre corps à rester fort et en santé?',
          'How can we take care of our minds and bodies?',
          'What healthy choices can we make every day?'
        ],
        'Me, Myself, and I': [
          'Qu\'est-ce qui me rend spécial et unique?',
          'How are we all the same and different?',
          'What are my special talents and interests?'
        ],
        'Our Wonderful World': [
          'Comment pouvons-nous prendre soin de notre planète?',
          'What makes our world beautiful and special?',
          'How can we help protect animals and plants?'
        ],
        'Safe and Sound': [
          'Comment pouvons-nous rester en sécurité à la maison et à l\'école?',
          'Who are the helpers in our community?',
          'What should we do in an emergency?'
        ]
      },
      'Français (Immersion)': {
        'Bienvenue à l\'école!': [
          'Comment dit-on bonjour en français?',
          'What can we discover together in our French classroom?',
          'How do we become a caring French learning community?'
        ],
        'Célébrons nos apprentissages': [
          'Qu\'avons-nous appris cette année en français?',
          'How can we celebrate our French learning journey?',
          'What are we most proud of learning?'
        ],
        'L\'hiver magique': [
          'Qu\'est-ce qui rend l\'hiver magique?',
          'How do we describe winter weather in French?',
          'What winter activities do we enjoy?'
        ],
        'Le printemps en fleurs': [
          'Comment la nature change-t-elle au printemps?',
          'What new life do we see in spring?',
          'How do we celebrate spring in French?'
        ],
        'Les fêtes d\'automne': [
          'Comment célébrons-nous l\'automne?',
          'What autumn traditions do French families enjoy?',
          'How do leaves change color?'
        ],
        'Ma communauté': [
          'Qui sont les gens importants dans ma communauté?',
          'How do community helpers make our lives better?',
          'What places are special in our neighborhood?'
        ],
        'Ma famille et moi': [
          'Qu\'est-ce qui rend ma famille spéciale?',
          'How do families show love and care?',
          'What traditions does my family have?'
        ],
        'Nos amis les animaux': [
          'Comment prenons-nous soin des animaux?',
          'What do animals need to be healthy and happy?',
          'How are animals and people alike and different?'
        ]
      },
      'Mathématiques': {
        'Adding and Subtracting': [
          'Comment l\'addition et la soustraction nous aident-elles chaque jour?',
          'What happens when we put things together or take them apart?',
          'How can we show addition and subtraction in different ways?'
        ],
        'Making Sense of Numbers': [
          'Comment les nombres nous aident-ils à comprendre notre monde?',
          'What can numbers tell us about the things around us?',
          'How do we use numbers every day?'
        ],
        'Math Celebration': [
          'Comment les mathématiques rendent-elles notre vie plus facile?',
          'What math skills are we most proud of learning?',
          'How can we share our math learning with others?'
        ],
        'Measurement Exploration': [
          'Comment mesurons-nous les choses qui nous entourent?',
          'What tools help us measure length, weight, and time?',
          'How do we compare sizes and amounts?'
        ],
        'Mental Math Strategies': [
          'Comment pouvons-nous résoudre des problèmes dans notre tête?',
          'What tricks help us do math quickly?',
          'How do we make numbers easier to work with?'
        ],
        'Numbers All Around Us': [
          'Où voyons-nous des nombres dans notre vie quotidienne?',
          'How do numbers help us organize our world?',
          'What would happen if we didn\'t have numbers?'
        ],
        'Patterns and Shapes': [
          'Comment les motifs et les formes nous aident-ils à comprendre le monde?',
          'Where do we find patterns in nature and our community?',
          'How do shapes fit together?'
        ],
        'Problem Solving Adventures': [
          'Comment résolvons-nous des problèmes comme des détectives?',
          'What strategies help us solve tricky problems?',
          'How do we know if our answer makes sense?'
        ]
      },
      'Sciences de la nature': {
        'Energy in Our Lives': [
          'Comment l\'énergie nous aide-t-elle chaque jour?',
          'Where does energy come from and where does it go?',
          'How can we use energy safely and wisely?'
        ],
        'Fall Changes': [
          'Comment la nature se prépare-t-elle pour l\'hiver?',
          'What signs tell us that fall is here?',
          'How do animals and plants change in autumn?'
        ],
        'Growing and Changing': [
          'Comment tous les êtres vivants grandissent-ils et changent-ils?',
          'What do living things need to grow healthy and strong?',
          'How are baby animals like their parents?'
        ],
        'Our Impact on Nature': [
          'Comment nos actions affectent-elles l\'environnement?',
          'What can we do to help take care of our planet?',
          'How do we reduce, reuse, and recycle?'
        ],
        'Our School Environment': [
          'Comment notre école fait-elle partie de la nature?',
          'What living and non-living things share our school space?',
          'How can we make our school environment better?'
        ],
        'Spring Awakening': [
          'Comment la nature se réveille-t-elle au printemps?',
          'What new life appears when winter ends?',
          'How do we know spring has arrived?'
        ],
        'Winter Wonders': [
          'Comment les animaux et les plantes survivent-ils en hiver?',
          'What makes winter weather special?',
          'How do we stay warm and safe in winter?'
        ]
      },
      'Sciences humaines': {
        'Exploring Our World': [
          'Comment explorons-nous les endroits près et loin de nous?',
          'What makes each place in the world special?',
          'How do maps and globes help us understand our world?'
        ],
        'My Family and Our Class': [
          'Comment ma famille et ma classe sont-elles semblables et différentes?',
          'What traditions make our families and class special?',
          'How do we work together as a community?'
        ],
        'My Story Through Time': [
          'Comment mon histoire personnelle fait-elle partie de l\'histoire plus grande?',
          'What has changed and stayed the same in my life?',
          'How do we remember and share our stories?'
        ],
        'Our Rights and Responsibilities': [
          'Quels sont nos droits et responsabilités en tant que citoyens?',
          'How can we be fair and kind to everyone?',
          'What does it mean to be a good community member?'
        ],
        'Responsible Digital Citizens': [
          'Comment utilisons-nous la technologie de manière sécuritaire?',
          'What are good choices when using computers and tablets?',
          'How do we be kind online and offline?'
        ]
      }
    };

    // Process each unit
    for (const unit of units) {
      const subject = unit.longRangePlan.subject;
      const title = unit.title;
      
      // Check if unit already has essential questions
      const hasEssentialQuestions = unit.essentialQuestions && 
        Array.isArray(unit.essentialQuestions) && 
        unit.essentialQuestions.length > 0;

      if (!hasEssentialQuestions) {
        const subjectQuestions = essentialQuestionsByUnit[subject as keyof typeof essentialQuestionsByUnit];
        let questions: string[] = [];

        if (subjectQuestions && subjectQuestions[title as keyof typeof subjectQuestions]) {
          questions = subjectQuestions[title as keyof typeof subjectQuestions] as string[];
        } else {
          // Fallback generic questions if specific ones not found
          questions = [
            `Qu'est-ce qui est important à apprendre sur ${title.toLowerCase()}?`,
            `How does ${title.toLowerCase()} connect to our daily lives?`,
            `What questions do we have about ${title.toLowerCase()}?`
          ];
        }

        updates.push({
          id: unit.id,
          title: unit.title,
          subject: subject,
          questions: questions
        });
      }
    }

    console.log(`Found ${updates.length} units that need essential questions\n`);

    if (updates.length > 0) {
      console.log('Adding essential questions to units...\n');

      // Apply updates in batches
      const batchSize = 5;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        await Promise.all(batch.map(update => 
          prisma.unitPlan.update({
            where: { id: update.id },
            data: { essentialQuestions: update.questions }
          })
        ));
        
        console.log(`Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);
      }

      console.log(`\nSuccessfully added essential questions to ${updates.length} units\n`);

      // Show examples of what was added
      console.log('=== EXAMPLES OF ESSENTIAL QUESTIONS ADDED ===\n');
      
      Object.entries(essentialQuestionsByUnit).forEach(([subject, subjectUnits]) => {
        console.log(`📚 ${subject}:`);
        const exampleUnit = Object.entries(subjectUnits)[0];
        if (exampleUnit) {
          const [unitTitle, questions] = exampleUnit;
          console.log(`  Unit: ${unitTitle}`);
          questions.forEach((question: string, index: number) => {
            console.log(`    ${index + 1}. ${question}`);
          });
        }
        console.log('');
      });
    }

    // Verify the results
    const verifyUnits = await prisma.unitPlan.findMany({
      where: { userId: 23 },
      select: {
        essentialQuestions: true,
        longRangePlan: {
          select: { subject: true }
        }
      }
    });

    const unitsWithQuestions = verifyUnits.filter(unit => 
      unit.essentialQuestions && 
      Array.isArray(unit.essentialQuestions) && 
      unit.essentialQuestions.length > 0
    );

    console.log(`\n=== VERIFICATION ===`);
    console.log(`Units with essential questions: ${unitsWithQuestions.length}/${verifyUnits.length}`);
    console.log(`Task 2 completion status: ${unitsWithQuestions.length === 40 ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);

  } catch (error) {
    console.error('Error adding essential questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEssentialQuestions();