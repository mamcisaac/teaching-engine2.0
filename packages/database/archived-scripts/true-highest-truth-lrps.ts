#!/usr/bin/env tsx

/**
 * CREATE TRUE HIGHEST TRUTH LRPS
 * Actually high-level strategic documents, not operational plans
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createTrueHighestTruth() {
  console.log('🌟 CREATING TRUE HIGHEST TRUTH LRPS\n');
  console.log('Strategic guidance, not operational details\n');
  console.log('=========================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  // MATHEMATICS - TRUE HIGH LEVEL
  console.log('📐 PERFECTING MATHEMATICS AS TRUE HIGH-LEVEL LRP...\n');
  
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (mathLRP) {
    await prisma.longRangePlan.update({
      where: { id: mathLRP.id },
      data: {
        title: 'Mathematics Grade 1 Long Range Plan',
        
        goals: `YEAR-LONG MATHEMATICAL JOURNEY

Core Philosophy:
• Concrete to pictorial to abstract progression
• Mathematical thinking through play and exploration
• Building number sense as foundation for all mathematics
• French vocabulary introduced progressively
• Joy and confidence in mathematics

Term 1 (Sept-Jan): FOUNDATIONS
Focus: Number sense to 20, patterns, sorting
Key concepts: Counting, comparing, representing numbers
Approach: Manipulatives, games, daily number routines

Term 2 (Feb-June): OPERATIONS & APPLICATIONS  
Focus: Addition/subtraction within 10, measurement, geometry
Key concepts: Operations, spatial sense, problem solving
Approach: Story problems, real-world connections, math talks`,
        
        themes: [
          'Number sense and numeration',
          'Patterns and relationships',
          'Measurement',
          'Geometry and spatial sense',
          'Data management and probability'
        ],
        
        overarchingQuestions: `ESSENTIAL QUESTIONS FOR THE YEAR

• How do numbers help us understand our world?
• What patterns do we see around us?
• How can we show our mathematical thinking?
• Why are there different ways to solve problems?
• How do we know if an answer makes sense?`,
        
        assessmentOverview: `ASSESSMENT PHILOSOPHY

Formative Assessment:
• Observations during exploration
• Conversations about mathematical thinking
• Documentation of learning through photos/videos

Summative Assessment:
• Performance tasks
• Portfolio development
• Growth over time documentation

No traditional tests in Grade 1
Focus on mathematical thinking, not just answers`,
        
        resourceNeeds: `RESOURCE CATEGORIES

Manipulatives:
• Counting materials
• Base-10 materials
• Pattern blocks
• Measurement tools

Technology:
• Math apps for practice
• Interactive whiteboard resources

Literature:
• Counting books
• Math stories
• Problem-solving books

Games:
• Number games
• Strategy games
• Spatial reasoning activities`,
        
        professionalGoals: `TEACHER REFLECTION THEMES

• Creating a math-positive classroom culture
• Differentiating for diverse learners
• Integrating math across the curriculum
• Building problem-solving resilience
• Supporting mathematical communication in French`
      }
    });
    console.log('✅ Mathematics LRP now truly high-level\n');
  }
  
  // FRANÇAIS - TRUE HIGH LEVEL
  console.log('📚 PERFECTING FRANÇAIS AS TRUE HIGH-LEVEL LRP...\n');
  
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Français langue première',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (frenchLRP) {
    await prisma.longRangePlan.update({
      where: { id: frenchLRP.id },
      data: {
        title: 'French Language Arts Grade 1 Long Range Plan',
        
        goals: `LITERACY DEVELOPMENT JOURNEY

Core Philosophy:
• Oral language as foundation for literacy
• Balanced literacy approach
• Authentic purposes for reading and writing
• French immersion context respected
• Literature-rich environment

Term 1 (Sept-Jan): FOUNDATIONS
Focus: Oral language, phonemic awareness, letter recognition
Reading: Shared reading, predictable texts, environmental print
Writing: Drawing with labels, shared writing, letter formation
Speaking/Listening: Class discussions, storytelling, songs

Term 2 (Feb-June): GROWING INDEPENDENCE
Focus: Decoding strategies, comprehension, writing development
Reading: Guided reading groups, independent reading
Writing: Simple sentences, personal narratives, journals
Speaking/Listening: Presentations, reader's theatre, poetry`,
        
        themes: [
          'Oral communication',
          'Reading comprehension',
          'Writing development',
          'Media literacy',
          'French language conventions'
        ],
        
        overarchingQuestions: `ESSENTIAL QUESTIONS FOR THE YEAR

• How do we communicate our ideas?
• Why do we read?
• How do stories help us understand the world?
• What makes writing powerful?
• How does language connect us?`,
        
        assessmentOverview: `ASSESSMENT PHILOSOPHY

Reading Assessment:
• Running records
• Reading conferences
• Comprehension conversations

Writing Assessment:
• Writing samples over time
• Writing conferences
• Portfolio development

Oral Language:
• Anecdotal observations
• Oral presentations
• Collaborative discussions

Focus on growth and development, not grades`,
        
        resourceNeeds: `RESOURCE CATEGORIES

Books:
• Leveled readers (variety of levels)
• Read-alouds
• Big books
• Non-fiction texts
• Poetry collections

Writing Materials:
• Variety of paper
• Writing tools
• Word walls
• Personal dictionaries

Oral Language:
• Listening center
• Recording devices
• Drama materials
• Songs and rhymes`,
        
        professionalGoals: `TEACHER REFLECTION THEMES

• Supporting emergent bilingual learners
• Fostering a love of reading
• Scaffolding writing development
• Building oral language confidence
• Creating authentic literacy experiences`
      }
    });
    console.log('✅ Français LRP now truly high-level\n');
  }
  
  // SCIENCES - TRUE HIGH LEVEL
  console.log('🔬 PERFECTING SCIENCES AS TRUE HIGH-LEVEL LRP...\n');
  
  const sciencesLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Sciences de la nature',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (sciencesLRP) {
    await prisma.longRangePlan.update({
      where: { id: sciencesLRP.id },
      data: {
        title: 'Science Grade 1 Long Range Plan',
        
        goals: `SCIENTIFIC EXPLORATION JOURNEY

Core Philosophy:
• Inquiry-based learning
• Hands-on exploration
• Scientific thinking development
• Connection to PEI environment
• Wonder and curiosity cultivation

Fall Term: OBSERVING OUR WORLD
Focus: Scientific skills, living things, seasonal changes
Big ideas: Observation, classification, patterns in nature
PEI connections: Local ecosystems, seasonal changes

Winter Term: HOW THINGS WORK
Focus: Materials, forces, energy
Big ideas: Properties, cause and effect, simple machines
PEI connections: Weather phenomena, ice and snow

Spring Term: CYCLES AND SYSTEMS
Focus: Life cycles, water, Earth and space
Big ideas: Change over time, interconnections
PEI connections: Ocean systems, local wildlife`,
        
        themes: [
          'Scientific inquiry skills',
          'Life systems',
          'Matter and materials',
          'Energy and forces',
          'Earth and space systems'
        ],
        
        overarchingQuestions: `ESSENTIAL QUESTIONS FOR THE YEAR

• How do scientists explore the world?
• What patterns exist in nature?
• How do living things meet their needs?
• How do things move and change?
• How are we connected to our environment?`,
        
        assessmentOverview: `ASSESSMENT PHILOSOPHY

Process Skills:
• Observation abilities
• Question formulation
• Prediction and hypothesis
• Communication of findings

Content Understanding:
• Demonstrations of understanding
• Application to new situations
• Connections to real world

Documentation:
• Science journals (drawings and labels)
• Photo documentation
• Group presentations

Emphasis on exploration and discovery`,
        
        resourceNeeds: `RESOURCE CATEGORIES

Exploration Tools:
• Magnification tools
• Measurement tools
• Collection materials
• Recording tools

Natural Materials:
• Seasonal collections
• Living things for observation
• Earth materials

Investigation Supplies:
• Simple machines
• Water investigation materials
• Light and sound materials

PEI Resources:
• Local field sites
• Community experts
• Environmental materials`,
        
        professionalGoals: `TEACHER REFLECTION THEMES

• Fostering scientific thinking
• Managing hands-on investigations
• Connecting to PEI context
• Supporting French vocabulary in science
• Encouraging wonder and questioning`
      }
    });
    console.log('✅ Sciences LRP now truly high-level\n');
  }
  
  console.log('🎯 TRUE HIGHEST TRUTH ACHIEVED!\n');
  console.log('These LRPs now:');
  console.log('  ✓ Provide strategic direction');
  console.log('  ✓ Identify big ideas and themes');
  console.log('  ✓ Outline assessment philosophy');
  console.log('  ✓ Suggest resource categories');
  console.log('  ✓ Leave operational details to unit planners');
  console.log('  ✓ Focus on year-long progression');
  console.log('  ✓ Trust professional judgment\n');
  
  console.log('Unit planners can now develop:');
  console.log('  → Specific materials and quantities');
  console.log('  → Daily routines and schedules');
  console.log('  → Detailed activity sequences');
  console.log('  → Assessment tools and rubrics');
  console.log('  → Week-by-week progressions\n');
  
  await prisma.$disconnect();
}

createTrueHighestTruth().catch(console.error);