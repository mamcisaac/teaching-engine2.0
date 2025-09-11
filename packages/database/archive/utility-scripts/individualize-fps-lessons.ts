import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create unique Indigenous perspectives for each lesson
function createUniqueIndigenousPerspective(lessonTitle: string, unitTitle: string): string {
  const basePrefix = "Mi'kmaq teachings emphasize ";
  
  // Unit 1: Me, Myself, and I - 24 unique perspectives
  if (unitTitle === 'Me, Myself, and I') {
    switch (lessonTitle) {
      case 'Self-Identity: Getting to Know Me':
        return `${basePrefix}that knowing yourself starts with understanding your place in the circle of all relations. Traditional Mi'kmaq storytelling teaches children that each person has unique gifts given by Creator, and discovering these gifts is a sacred journey that begins with listening to your inner voice and observing how you connect with the natural world.`;
      
      case 'Self Discovery: My Body':
        return `${basePrefix}that the body is a sacred vessel gifted by Creator, housing not just physical form but spirit, emotions, and wisdom. Traditional teachings speak of the body as having its own intelligence - the heart knows love, hands know creation, feet know the earth's rhythms, and the mind knows how to listen to all these teachings.`;
      
      case 'Self-Identity: My Special Qualities':
        return `${basePrefix}that every person carries special medicines - unique qualities that are gifts to share with the community. Traditional Mi'kmaq understanding recognizes that some people are natural healers, others are teachers, some are protectors, and all have essential roles in maintaining balance within the tribal circle.`;
      
      case 'Self Discovery: My Feelings':
        return `${basePrefix}that emotions are sacred messengers from the spirit world, each carrying important teachings. Traditional knowledge teaches that feelings like joy connect us to Creator's love, sadness helps us value what matters, anger signals when boundaries need protection, and fear reminds us to seek wisdom from elders.`;
      
      case 'Self-Identity: Things I Do Well':
        return `${basePrefix}that recognizing your abilities is honoring the gifts Creator placed within you. Traditional Mi'kmaq culture celebrates each person's talents through ceremony and community recognition, understanding that when individuals know their strengths, the whole community becomes stronger and more balanced.`;
      
      case 'Self Discovery: My Strengths':
        return `${basePrefix}that personal strengths are like different medicines in the traditional healing bundle - each one serves a unique purpose in maintaining wellness. Mi'kmaq elders teach that strengths grow stronger when shared with others and used in service to the community's wellbeing.`;
      
      case 'Self-Identity: My Feelings':
        return `${basePrefix}that understanding emotions requires the wisdom of the Four Directions - East teaches hope and new beginnings, South brings trust and innocence, West offers introspection and healing, and North provides wisdom and strength to face all feelings with courage and understanding.`;
      
      case 'Self Discovery: My Interests':
        return `${basePrefix}that what draws your attention and curiosity are spiritual callings toward your life's purpose. Traditional teaching recognizes that children's natural interests often reveal their future roles as healers, storytellers, hunters, artists, or keepers of sacred knowledge within the community.`;
      
      case 'Self-Identity: My Body Parts':
        return `${basePrefix}that each part of the body has sacred purpose and wisdom. Traditional knowledge teaches that eyes are for seeing beauty and truth, ears for listening to Creator's voice in nature, hands for creating and healing, feet for walking the good path, and the heart for loving all relations.`;
      
      case 'Self Discovery: My Family':
        return `${basePrefix}that family extends beyond blood relations to include all beings in creation. Traditional Mi'kmaq understanding recognizes clan relationships, adoption through ceremony, and spiritual kinship with animals, plants, and natural forces as part of one's extended family circle.`;
      
      case 'Self-Identity: Taking Care of Myself':
        return `${basePrefix}that self-care is a sacred responsibility to Creator who gifted you with life. Traditional teachings include caring for body through traditional foods, caring for spirit through ceremony and prayer, caring for mind through learning from elders, and caring for emotions through connection with nature.`;
      
      case 'Self Discovery: My Friends':
        return `${basePrefix}that friendships are sacred bonds that reflect the principle of Msit No'kmaq (we are all related). Traditional friendship teachings include loyalty like the wolf pack, support like the forest community, and the understanding that true friends help each other walk the good path.`;
      
      case 'Self-Identity: My Needs and Wants':
        return `${basePrefix}distinguishing between needs essential for life's balance and wants that may distract from spiritual growth. Traditional wisdom teaches that true needs include clean water, nourishing food, shelter, love, purpose, and connection to Creator, while wants should be considered carefully for their impact on seven generations.`;
      
      case 'Self Discovery: Growing and Changing':
        return `${basePrefix}that growth follows natural cycles like the seasons, each phase bringing new wisdom and responsibilities. Traditional understanding recognizes that children grow in stages - from innocent learners to question-askers to wisdom-seekers, always guided by elders and connected to ancestral knowledge.`;
      
      case 'Self-Identity: My Growth':
        return `${basePrefix}that personal growth is measured not only in physical size but in wisdom gained, kindness shown, and responsibilities accepted within the community. Traditional markers of growth include learning traditional skills, showing respect for elders, and beginning to understand one's role in maintaining tribal harmony.`;
      
      case 'Self Discovery: Being Unique':
        return `${basePrefix}that each person's uniqueness is like a special note in the great song of creation. Traditional teachings recognize that diversity strengthens the community - different gifts, perspectives, and ways of learning all contribute to the wisdom and resilience of the tribal circle.`;
      
      case 'Self-Identity: My Uniqueness':
        return `${basePrefix}celebrating individual gifts while maintaining connection to community values and traditions. Mi'kmaq culture honors unique expressions of creativity, different learning styles, and special talents while ensuring that all uniqueness serves the greater good of maintaining balance and harmony.`;
      
      case 'Self Discovery: Self-Care':
        return `${basePrefix}that caring for yourself honors the sacred life force Creator placed within you. Traditional self-care practices include smudging for spiritual cleansing, spending time in nature for emotional balance, eating traditional foods for physical strength, and learning from elders for mental growth.`;
      
      case 'Self-Identity: My Strengths':
        return `${basePrefix}that recognizing and developing personal strengths is part of preparing to serve your community. Traditional Mi'kmaq education focuses on identifying each child's natural abilities and providing mentorship to develop these gifts for the benefit of future generations.`;
      
      case 'Self Discovery: Healthy Choices':
        return `${basePrefix}that healthy choices honor the sacred gift of life and prepare you to fulfill your purpose in the community. Traditional wisdom teaches that what we eat, how we move, what we think, and how we treat others all contribute to personal and collective wellbeing.`;
      
      case 'Self-Identity: My Learning Style':
        return `${basePrefix}that people learn in different ways, reflecting the diversity of creation itself. Traditional Mi'kmaq education recognizes visual learners who learn through observation, kinesthetic learners who learn through doing, auditory learners who learn through stories, and intuitive learners who learn through spiritual connection.`;
      
      case 'Self Discovery: My Goals':
        return `${basePrefix}that setting intentions and goals is a sacred practice of envisioning your contribution to the seven generations. Traditional goal-setting includes seeking guidance from elders, considering impact on community welfare, and aligning personal aspirations with maintaining balance in the natural world.`;
      
      case 'Self-Identity: Celebrating Me':
        return `${basePrefix}that celebrating yourself is acknowledging Creator's work and expressing gratitude for the unique gifts you've been given. Traditional celebrations include sharing accomplishments with community, offering thanks through ceremony, and committing to use your gifts in service to others.`;
      
      case 'Self Discovery: Celebrating Me':
        return `${basePrefix}that personal celebration should include honoring your ancestors who contributed to who you are, acknowledging your community who supported your growth, and expressing gratitude to Creator for the journey of becoming your authentic self within the circle of all relations.`;
      
      default:
        return `${basePrefix}that understanding oneself begins with knowing your place in the circle of life and your connection to the seven generations. Traditional Mi'kmaq identity development involves understanding your clan responsibilities and the importance of living in balance with all relations.`;
    }
  }
  
  // Add cases for other units here (will be implemented in subsequent steps)
  return `${basePrefix}wellness, community connection, and living in harmony with natural and spiritual laws.`;
}

// Function to create unique assessment criteria for each lesson
function createUniqueAssessmentCriteria(lessonTitle: string, unitTitle: string): string {
  const baseHeader = "Observable social-emotional learning assessment:\n";
  
  // Unit 1: Me, Myself, and I - 24 unique assessment sets
  if (unitTitle === 'Me, Myself, and I') {
    switch (lessonTitle) {
      case 'Self-Identity: Getting to Know Me':
        return `${baseHeader}☐ Shares personal information confidently and appropriately
☐ Shows curiosity about learning new things about themselves
☐ Demonstrates comfort with self-reflection activities
☐ Expresses unique qualities that make them special

Anecdotal observations focus on self-awareness development, comfort with identity exploration, and willingness to share personal information appropriately.`;
      
      case 'Self Discovery: My Body':
        return `${baseHeader}☐ Uses appropriate vocabulary to describe body parts and functions
☐ Shows positive attitude toward their physical self
☐ Demonstrates understanding of body uniqueness and diversity
☐ Exhibits respect for their own and others' physical differences

Anecdotal observations focus on body awareness, positive body image development, and respectful language about physical diversity.`;
      
      case 'Self-Identity: My Special Qualities':
        return `${baseHeader}☐ Identifies at least 3 personal qualities or characteristics
☐ Demonstrates pride in their unique attributes
☐ Shows appreciation for classmates' special qualities
☐ Uses positive language when describing themselves and others

Anecdotal observations focus on self-recognition, positive self-concept development, and ability to celebrate personal uniqueness.`;
      
      case 'Self Discovery: My Feelings':
        return `${baseHeader}☐ Identifies and names various emotions accurately
☐ Connects feelings to specific situations or events
☐ Shows understanding that all feelings are normal and valid
☐ Demonstrates beginning emotional regulation strategies

Anecdotal observations focus on emotional vocabulary development, emotion recognition skills, and early self-regulation abilities.`;
      
      case 'Self-Identity: Things I Do Well':
        return `${baseHeader}☐ Recognizes and articulates personal abilities and talents
☐ Shows confidence when discussing their capabilities
☐ Demonstrates willingness to try activities they're good at
☐ Acknowledges areas where they'd like to improve

Anecdotal observations focus on strength identification, self-efficacy development, and balanced self-assessment abilities.`;
      
      case 'Self Discovery: My Strengths':
        return `${baseHeader}☐ Differentiates between various types of strengths (physical, academic, social)
☐ Provides specific examples of their personal strengths
☐ Shows understanding that everyone has different strengths
☐ Demonstrates willingness to help others using their strengths

Anecdotal observations focus on strength categorization, concrete self-knowledge, and prosocial application of personal abilities.`;
      
      case 'Self-Identity: My Feelings':
        return `${baseHeader}☐ Expresses emotions using appropriate words and expressions
☐ Shows comfort discussing both positive and challenging feelings
☐ Demonstrates understanding of emotion intensity levels
☐ Uses simple strategies to manage strong emotions

Anecdotal observations focus on emotional expression skills, comfort with feeling discussions, and beginning emotion management.`;
      
      case 'Self Discovery: My Interests':
        return `${baseHeader}☐ Clearly communicates activities and topics they enjoy
☐ Shows enthusiasm when discussing their interests
☐ Demonstrates curiosity about new potential interests
☐ Respects and shows interest in others' different preferences

Anecdotal observations focus on interest articulation, passion development, openness to exploration, and respect for diversity.`;
      
      case 'Self-Identity: My Body Parts':
        return `${baseHeader}☐ Accurately identifies and names major body parts
☐ Describes basic functions of different body systems
☐ Shows appreciation for what their body can do
☐ Demonstrates respectful attitudes toward body diversity

Anecdotal observations focus on anatomical knowledge, functional understanding, body gratitude, and inclusive attitudes.`;
      
      case 'Self Discovery: My Family':
        return `${baseHeader}☐ Describes family structure and relationships accurately
☐ Shows appreciation for family members and their roles
☐ Demonstrates understanding that families can be different
☐ Expresses love and connection to family members

Anecdotal observations focus on family recognition, relationship understanding, acceptance of family diversity, and emotional connections.`;
      
      case 'Self-Identity: Taking Care of Myself':
        return `${baseHeader}☐ Identifies specific self-care activities and practices
☐ Demonstrates basic self-care skills during activities
☐ Shows understanding of why self-care is important
☐ Makes connections between self-care and feeling good

Anecdotal observations focus on self-care knowledge, skill demonstration, personal responsibility, and wellness understanding.`;
      
      case 'Self Discovery: My Friends':
        return `${baseHeader}☐ Describes qualities that make a good friend
☐ Shares positive experiences with friends appropriately
☐ Shows understanding of friendship as mutual caring
☐ Demonstrates inclusive attitudes toward making new friends

Anecdotal observations focus on friendship concepts, relationship appreciation, reciprocity understanding, and social inclusion.`;
      
      case 'Self-Identity: My Needs and Wants':
        return `${baseHeader}☐ Distinguishes between basic needs and personal wants
☐ Provides examples of both needs and wants from their life
☐ Shows understanding that needs are more important than wants
☐ Demonstrates gratitude for having needs met

Anecdotal observations focus on need/want differentiation, concrete life applications, priority understanding, and gratitude expression.`;
      
      case 'Self Discovery: Growing and Changing':
        return `${baseHeader}☐ Recognizes ways they have grown and changed over time
☐ Shows excitement about learning and developing new skills
☐ Demonstrates understanding that change is normal and positive
☐ Expresses curiosity about future growth and development

Anecdotal observations focus on growth awareness, development enthusiasm, change acceptance, and future orientation.`;
      
      case 'Self-Identity: My Growth':
        return `${baseHeader}☐ Identifies specific areas where they have grown or improved
☐ Shows pride in their development and achievements
☐ Demonstrates understanding that growth takes time and effort
☐ Sets simple goals for continued growth and learning

Anecdotal observations focus on growth recognition, achievement pride, process understanding, and goal-setting abilities.`;
      
      case 'Self Discovery: Being Unique':
        return `${baseHeader}☐ Articulates what makes them different from others
☐ Shows pride in their individual characteristics and qualities
☐ Demonstrates appreciation for uniqueness in classmates
☐ Exhibits comfort with being different in positive ways

Anecdotal observations focus on uniqueness recognition, individual pride, diversity appreciation, and difference comfort.`;
      
      case 'Self-Identity: My Uniqueness':
        return `${baseHeader}☐ Celebrates personal traits that make them special
☐ Shows confidence in expressing their individual perspective
☐ Demonstrates understanding that uniqueness adds value to groups
☐ Respects and values uniqueness in others

Anecdotal observations focus on trait celebration, perspective confidence, value understanding, and respect for others.`;
      
      case 'Self Discovery: Self-Care':
        return `${baseHeader}☐ Practices basic self-care routines independently
☐ Shows understanding of connection between self-care and health
☐ Demonstrates responsibility for personal hygiene and wellness
☐ Seeks help appropriately when needed for self-care

Anecdotal observations focus on routine independence, health connections, personal responsibility, and appropriate help-seeking.`;
      
      case 'Self-Identity: My Strengths':
        return `${baseHeader}☐ Clearly identifies multiple personal strengths and abilities
☐ Shows confidence when using their strengths in activities
☐ Demonstrates willingness to share strengths to help others
☐ Understands that strengths can be developed through practice

Anecdotal observations focus on strength clarity, confident application, helping behaviors, and growth mindset development.`;
      
      case 'Self Discovery: Healthy Choices':
        return `${baseHeader}☐ Identifies healthy vs. unhealthy choices in various situations
☐ Makes good decisions when presented with health-related options
☐ Shows understanding of how choices affect their wellbeing
☐ Demonstrates motivation to make healthy choices consistently

Anecdotal observations focus on choice identification, decision-making skills, consequence understanding, and healthy motivation.`;
      
      case 'Self-Identity: My Learning Style':
        return `${baseHeader}☐ Recognizes how they learn best (visual, auditory, kinesthetic)
☐ Shows preference for certain types of learning activities
☐ Demonstrates understanding that people learn differently
☐ Uses knowledge of learning style to improve their performance

Anecdotal observations focus on learning awareness, preference recognition, difference understanding, and strategic application.`;
      
      case 'Self Discovery: My Goals':
        return `${baseHeader}☐ Sets realistic and achievable personal goals
☐ Shows motivation and commitment toward reaching goals
☐ Demonstrates understanding that goals require effort and time
☐ Celebrates progress made toward achieving goals

Anecdotal observations focus on goal realism, motivation demonstration, process understanding, and progress celebration.`;
      
      case 'Self-Identity: Celebrating Me':
        return `${baseHeader}☐ Expresses gratitude for their personal gifts and abilities
☐ Shows appropriate pride in accomplishments and growth
☐ Demonstrates ability to celebrate themselves without boasting
☐ Includes others in celebration of personal achievements

Anecdotal observations focus on gratitude expression, appropriate pride, humble celebration, and inclusive achievement sharing.`;
      
      case 'Self Discovery: Celebrating Me':
        return `${baseHeader}☐ Reflects positively on their journey of self-discovery
☐ Shows appreciation for learning about themselves
☐ Demonstrates increased self-confidence and self-awareness
☐ Expresses excitement about continued growth and learning

Anecdotal observations focus on positive reflection, learning appreciation, confidence growth, and future enthusiasm.`;
      
      default:
        return `${baseHeader}☐ Demonstrates positive self-talk and self-awareness
☐ Shows confidence in expressing personal preferences and needs  
☐ Identifies personal strengths and areas for growth
☐ Exhibits self-regulation strategies during activities

Anecdotal observations focus on social-emotional skill development, peer interactions, self-regulation, and personal wellness understanding.`;
    }
  }
  
  // Add cases for other units here (will be implemented in subsequent steps)
  return `${baseHeader}☐ Demonstrates appropriate social-emotional responses
☐ Shows engagement and participation in learning activities
☐ Exhibits positive interactions with peers and adults
☐ Shows personal growth and development indicators

Anecdotal observations focus on social-emotional skill development, peer interactions, self-regulation, and personal wellness understanding.`;
}

async function individualizeUnit1Lessons() {
  try {
    console.log('🎯 INDIVIDUALIZING UNIT 1: "Me, Myself, and I" (24 lessons)...\n');

    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Emily McIsaac'
        }
      }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get Unit 1 lessons
    const unit1Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          title: 'Me, Myself, and I'
        }
      },
      include: {
        unitPlan: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`📚 Found ${unit1Lessons.length} lessons in Unit 1\n`);

    let updatedCount = 0;
    const updatePromises: Promise<any>[] = [];

    for (const lesson of unit1Lessons) {
      const uniqueIndigenousPerspective = createUniqueIndigenousPerspective(lesson.title, lesson.unitPlan.title);
      const uniqueAssessmentCriteria = createUniqueAssessmentCriteria(lesson.title, lesson.unitPlan.title);
      
      console.log(`🔧 Updating: ${lesson.title}`);
      console.log(`   Indigenous Perspective: ${uniqueIndigenousPerspective.length} chars`);
      console.log(`   Assessment Criteria: ${uniqueAssessmentCriteria.length} chars\n`);
      
      const updatePromise = prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          indigenousPerspectives: uniqueIndigenousPerspective,
          assessmentNotes: uniqueAssessmentCriteria
        }
      });
      
      updatePromises.push(updatePromise);
      updatedCount++;
    }

    console.log(`⚡ Executing ${updatePromises.length} lesson updates in parallel...`);
    
    await Promise.all(updatePromises);

    console.log(`\n✅ Successfully individualized ALL ${updatedCount} Unit 1 lessons!`);
    console.log('\n🎯 Unit 1 Individualization Summary:');
    console.log('   ✅ Each lesson now has unique Indigenous perspectives');
    console.log('   ✅ Each lesson now has unique assessment criteria');
    console.log('   ✅ All content connects to specific lesson learning goals');
    console.log('   ✅ Mi\'kmaq teachings are lesson-specific and meaningful');

    // Verification
    console.log('\n🔍 Verification check...');
    const verifiedLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          title: 'Me, Myself, and I'
        }
      },
      select: {
        title: true,
        indigenousPerspectives: true,
        assessmentNotes: true
      }
    });

    const uniqueIndigenous = new Set(verifiedLessons.map(l => l.indigenousPerspectives));
    const uniqueAssessments = new Set(verifiedLessons.map(l => l.assessmentNotes));

    console.log(`\n📊 Verification Results:`);
    console.log(`   🏛️ Indigenous perspectives: ${uniqueIndigenous.size}/24 unique (${uniqueIndigenous.size === 24 ? '✅ SUCCESS' : '⚠️ NEEDS REVIEW'})`);
    console.log(`   📋 Assessment criteria: ${uniqueAssessments.size}/24 unique (${uniqueAssessments.size === 24 ? '✅ SUCCESS' : '⚠️ NEEDS REVIEW'})`);

    return { updatedCount, verification: { uniqueIndigenous: uniqueIndigenous.size, uniqueAssessments: uniqueAssessments.size } };

  } catch (error) {
    console.error('❌ Error individualizing Unit 1 lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeUnit1Lessons();