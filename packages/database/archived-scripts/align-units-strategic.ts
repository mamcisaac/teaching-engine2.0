#!/usr/bin/env tsx

/**
 * ALIGN UNIT PLANS WITH HIGH-LEVEL STRATEGIC LRPS
 * Units bridge between strategic LRPs and operational lessons
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function alignUnitsStrategic() {
  console.log('🔄 ALIGNING UNIT PLANS WITH STRATEGIC LRPS\n');
  console.log('Units provide tactical guidance, not operational details\n');
  console.log('=================================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  // UPDATE MATH UNITS
  console.log('📐 Updating Mathematics Units...\n');
  
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      userId: emily.id
    },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (mathLRP) {
    const mathUnits = [
      {
        title: 'Building Our Math Community',
        bigIdeas: 'Mathematics is everywhere. We are all mathematicians.',
        assessmentPlan: 'Baseline observations of number sense, oral counting assessments',
        description: 'Establishing routines, exploring materials, numbers to 5'
      },
      {
        title: 'Numbers All Around Us',
        bigIdeas: 'Numbers help us describe and understand our world.',
        assessmentPlan: 'Counting collections documentation, number recognition checks',
        description: 'Numbers to 10, comparing quantities, simple patterns'
      },
      {
        title: 'Patterns and Relationships',
        bigIdeas: 'Patterns help us make predictions and solve problems.',
        assessmentPlan: 'Pattern creation tasks, sorting activities documentation',
        description: 'Repeating patterns, sorting and classifying, number relationships'
      },
      {
        title: 'Celebrations with Numbers',
        bigIdeas: 'Mathematics connects to our celebrations and traditions.',
        assessmentPlan: 'Portfolio entries, family math sharing',
        description: 'Calendar patterns, shapes in celebrations, festive problem solving'
      },
      {
        title: 'Introduction to Operations',
        bigIdeas: 'Addition means putting together. Subtraction means taking away.',
        assessmentPlan: 'Story problem demonstrations, operation understanding checks',
        description: 'Combining and separating, introduction to symbols, story problems'
      },
      {
        title: 'Building Fluency',
        bigIdeas: 'There are many strategies for solving problems.',
        assessmentPlan: 'Strategy observations, math talk participation',
        description: 'Mental math strategies, fact families, problem solving approaches'
      },
      {
        title: 'Exploring Measurement',
        bigIdeas: 'We can measure and compare things in many ways.',
        assessmentPlan: 'Measurement investigations, comparison tasks',
        description: 'Length, mass, capacity, time concepts'
      },
      {
        title: 'Geometry in Our World',
        bigIdeas: 'Shapes and spatial relationships are everywhere.',
        assessmentPlan: 'Shape hunt documentation, building challenges',
        description: '2D and 3D shapes, spatial vocabulary, position and movement'
      },
      {
        title: 'Data and Stories',
        bigIdeas: 'We can collect and share information in organized ways.',
        assessmentPlan: 'Graph creation, data interpretation discussions',
        description: 'Surveys, graphing, interpreting data, probability language'
      },
      {
        title: 'Celebrating Our Learning',
        bigIdeas: 'We have grown as mathematicians this year.',
        assessmentPlan: 'Portfolio review, growth celebrations',
        description: 'Review and consolidation, math games, showcase preparations'
      }
    ];
    
    for (let i = 0; i < mathLRP.unitPlans.length && i < mathUnits.length; i++) {
      await prisma.unitPlan.update({
        where: { id: mathLRP.unitPlans[i].id },
        data: {
          title: mathUnits[i].title,
          bigIdeas: mathUnits[i].bigIdeas,
          assessmentPlan: mathUnits[i].assessmentPlan,
          description: mathUnits[i].description
        }
      });
    }
    console.log('✅ Mathematics units aligned with strategic approach\n');
  }
  
  // UPDATE FRENCH UNITS
  console.log('📚 Updating Français Units...\n');
  
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Français langue première',
      academicYear: '2025-2026',
      userId: emily.id
    },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (frenchLRP) {
    const frenchUnits = [
      {
        title: 'Building Our Language Community',
        bigIdeas: 'We communicate in many ways. French connects us.',
        assessmentPlan: 'Oral language samples, initial literacy observations',
        description: 'Oral language development, classroom French, introduction to print'
      },
      {
        title: 'Discovering Letters and Sounds',
        bigIdeas: 'Letters represent sounds. Sounds make words.',
        assessmentPlan: 'Letter recognition assessments, sound-symbol checks',
        description: 'Alphabet introduction, initial sounds, environmental print'
      },
      {
        title: 'Making Meaning',
        bigIdeas: 'Reading is thinking. We use many strategies to understand.',
        assessmentPlan: 'Reading behaviors observation, strategy use documentation',
        description: 'Shared reading, prediction, using pictures, beginning sight words'
      },
      {
        title: 'Stories and Celebrations',
        bigIdeas: 'Stories help us celebrate and understand traditions.',
        assessmentPlan: 'Comprehension conversations, retelling assessments',
        description: 'Holiday stories, family traditions, oral storytelling'
      },
      {
        title: 'Growing as Readers',
        bigIdeas: 'Readers use many strategies. Practice helps us improve.',
        assessmentPlan: 'Running records, guided reading observations',
        description: 'Guided reading launch, decoding strategies, fluency building'
      },
      {
        title: 'Writers Share Ideas',
        bigIdeas: 'Writing communicates our thoughts. We are all authors.',
        assessmentPlan: 'Writing samples, writing process observations',
        description: 'Personal narratives, sentence structure, author\'s craft'
      },
      {
        title: 'Reading to Learn',
        bigIdeas: 'Books teach us about the world. Non-fiction has special features.',
        assessmentPlan: 'Information comprehension, feature identification',
        description: 'Non-fiction exploration, research skills, fact vs. fiction'
      },
      {
        title: 'Poetry and Performance',
        bigIdeas: 'Language has rhythm and beauty. We can perform texts.',
        assessmentPlan: 'Oral presentation rubric, expression assessment',
        description: 'Poetry exploration, reader\'s theatre, oral expression'
      },
      {
        title: 'Expanding Our Writing',
        bigIdeas: 'Writers write for different purposes and audiences.',
        assessmentPlan: 'Genre variety in portfolio, audience awareness',
        description: 'Different text forms, writing for real purposes, revision introduction'
      },
      {
        title: 'Celebrating Literacy',
        bigIdeas: 'We are readers and writers. Our growth is worth celebrating.',
        assessmentPlan: 'Portfolio conferences, growth documentation',
        description: 'Author celebrations, reading performances, summer reading preparation'
      }
    ];
    
    for (let i = 0; i < frenchLRP.unitPlans.length && i < frenchUnits.length; i++) {
      await prisma.unitPlan.update({
        where: { id: frenchLRP.unitPlans[i].id },
        data: {
          title: frenchUnits[i].title,
          bigIdeas: frenchUnits[i].bigIdeas,
          assessmentPlan: frenchUnits[i].assessmentPlan,
          description: frenchUnits[i].description
        }
      });
    }
    console.log('✅ Français units aligned with strategic approach\n');
  }
  
  // UPDATE SCIENCES UNITS
  console.log('🔬 Updating Sciences Units...\n');
  
  const sciencesLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Sciences de la nature',
      academicYear: '2025-2026',
      userId: emily.id
    },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (sciencesLRP) {
    const scienceUnits = [
      {
        title: 'Becoming Scientists',
        bigIdeas: 'Scientists observe and ask questions. We are all scientists.',
        assessmentPlan: 'Observation skill development, question formulation',
        description: 'Scientific skills, tools for observation, wonder and inquiry'
      },
      {
        title: 'Fall Investigations',
        bigIdeas: 'Seasons bring changes. Living things respond to seasons.',
        assessmentPlan: 'Seasonal observation journals, classification activities',
        description: 'Seasonal changes, leaf study, animal preparations for winter'
      },
      {
        title: 'Needs of Living Things',
        bigIdeas: 'All living things have needs. We can help living things thrive.',
        assessmentPlan: 'Plant growth documentation, needs identification',
        description: 'Plant and animal needs, habitat exploration, care and responsibility'
      },
      {
        title: 'Materials and Their Properties',
        bigIdeas: 'Materials have different properties. Properties determine use.',
        assessmentPlan: 'Property exploration records, building challenges',
        description: 'Exploring properties, sorting materials, building and testing'
      },
      {
        title: 'Forces and Movement',
        bigIdeas: 'Forces make things move. We can predict and control movement.',
        assessmentPlan: 'Motion investigations, prediction accuracy',
        description: 'Push and pull, gravity, simple machines in daily life'
      },
      {
        title: 'Light and Shadow',
        bigIdeas: 'Light travels and creates shadows. We can manipulate light.',
        assessmentPlan: 'Shadow investigations, light exploration documentation',
        description: 'Light sources, shadow formation, transparency and opacity'
      },
      {
        title: 'Sound and Vibration',
        bigIdeas: 'Sound is vibration. We can create and change sounds.',
        assessmentPlan: 'Sound exploration records, instrument creation',
        description: 'How sound is made, pitch and volume, making music'
      },
      {
        title: 'Spring Changes',
        bigIdeas: 'Spring brings new life. We can observe growth and change.',
        assessmentPlan: 'Growth documentation, lifecycle observations',
        description: 'Signs of spring, plant growth, baby animals, lifecycle basics'
      },
      {
        title: 'Water in Our World',
        bigIdeas: 'Water is essential for life. Water moves and changes.',
        assessmentPlan: 'Water cycle understanding, conservation awareness',
        description: 'Water properties, water cycle basics, ocean connections'
      },
      {
        title: 'Science Celebration',
        bigIdeas: 'We have grown as scientists. Science helps us understand our world.',
        assessmentPlan: 'Science fair presentations, favorite investigations',
        description: 'Reviewing discoveries, showcasing learning, summer explorations'
      }
    ];
    
    for (let i = 0; i < sciencesLRP.unitPlans.length && i < scienceUnits.length; i++) {
      await prisma.unitPlan.update({
        where: { id: sciencesLRP.unitPlans[i].id },
        data: {
          title: scienceUnits[i].title,
          bigIdeas: scienceUnits[i].bigIdeas,
          assessmentPlan: scienceUnits[i].assessmentPlan,
          description: scienceUnits[i].description
        }
      });
    }
    console.log('✅ Sciences units aligned with strategic approach\n');
  }
  
  console.log('🎯 PERFECT HIERARCHY ACHIEVED!\n');
  console.log('LRP Level (Strategic):');
  console.log('  • Year-long vision and philosophy');
  console.log('  • Big ideas and essential questions');
  console.log('  • Assessment philosophy');
  console.log('  • Resource categories\n');
  
  console.log('Unit Level (Tactical):');
  console.log('  • Monthly/bi-weekly focus');
  console.log('  • Specific big ideas');
  console.log('  • Assessment approaches');
  console.log('  • General content areas\n');
  
  console.log('Lesson Level (Operational):');
  console.log('  • Daily activities');
  console.log('  • Specific materials');
  console.log('  • Timing and routines');
  console.log('  • Detailed procedures\n');
  
  await prisma.$disconnect();
}

alignUnitsStrategic().catch(console.error);