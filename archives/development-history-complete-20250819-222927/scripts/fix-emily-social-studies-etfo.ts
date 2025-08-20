import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmilySocialStudiesETFO() {
  console.log('🔧 Fixing ALL 84 Social Studies lessons for Emily McIsaac (ID 23) - ETFO Compliance...\n');

  // Find all Social Studies lessons for Emily McIsaac
  const socialStudiesLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlan: {
          subject: 'Sciences humaines'
        }
      }
    },
    include: {
      unitPlan: {
        select: {
          title: true,
          longRangePlan: {
            select: {
              subject: true
            }
          }
        }
      }
    },
    orderBy: [
      { unitPlan: { title: 'asc' } },
      { title: 'asc' }
    ]
  });

  console.log(`📊 Found ${socialStudiesLessons.length} Social Studies lessons to fix\n`);

  if (socialStudiesLessons.length === 0) {
    console.log('❌ No Social Studies lessons found for Emily McIsaac (ID 23)');
    return;
  }

  // ETFO-compliant differentiation strategies for Social Studies
  const socialStudiesDifferentiation = {
    forStruggling: "Visual maps, simplified texts, peer partnerships, graphic organizers",
    forIEP: "Modified research tasks per IEP, alternative presentations, extended time",
    forELL: "Visual vocabulary, cultural connections, first language resources",
    forAdvanced: "Extended research, leadership in group work, complex investigations"
  };

  // Social Studies specific Mi'kmaq perspectives (100+ chars)
  const mikmaqPerspectives = [
    "Explore Mi'kmaq traditional governance systems and decision-making processes that emphasize consensus and community well-being. Learn about the role of Elders in guiding communities and how Mi'kmaq peoples have maintained their cultural identity and territory stewardship for thousands of years.",
    "Connect to Mi'kmaq concepts of community responsibility and the interconnectedness of all people. Discuss how Mi'kmaq traditions emphasize collective well-being, respect for all living things, and the importance of sharing knowledge and resources within the community for the benefit of all generations.",
    "Learn about Mi'kmaq territorial knowledge and the historical significance of Epekwitk (Prince Edward Island) as part of traditional Mi'kmaq territory. Explore how Mi'kmaq peoples have been stewards of this land for millennia and continue to contribute to Island communities today.",
    "Examine Mi'kmaq oral traditions and storytelling as ways of preserving community history and cultural values. Discuss how stories, songs, and ceremonies help pass down important knowledge about relationships, responsibilities, and connections to the land and community.",
    "Investigate Mi'kmaq approaches to conflict resolution and community harmony that focus on restoration, understanding, and maintaining relationships. Learn how these traditional practices can inform modern approaches to building inclusive and respectful communities."
  ];

  // Social Studies specific assessment notes with observable checkboxes
  const socialStudiesAssessmentNotes = [
    "Observable assessment for social studies skills:\n☐ Student demonstrates understanding of community concepts\n☐ Shows respect for diverse perspectives and cultures\n☐ Participates actively in class discussions\n☐ Uses appropriate social studies vocabulary\n☐ Makes connections between past and present\n☐ Shows empathy and understanding for others\n☐ Demonstrates citizenship skills in classroom community",
    "Observable assessment for rights and responsibilities:\n☐ Student identifies basic rights and responsibilities\n☐ Shows understanding of fairness and equality\n☐ Demonstrates respectful behavior toward classmates\n☐ Participates in problem-solving activities\n☐ Uses conflict resolution strategies\n☐ Shows understanding of rules and their purpose\n☐ Demonstrates caring and consideration for others",
    "Observable assessment for cultural understanding:\n☐ Student shows interest in learning about different cultures\n☐ Demonstrates respect for cultural diversity\n☐ Makes connections between different cultural practices\n☐ Shows understanding of similarities and differences\n☐ Participates respectfully in cultural discussions\n☐ Uses inclusive language when discussing cultures\n☐ Demonstrates curiosity about the world around them",
    "Observable assessment for historical thinking:\n☐ Student demonstrates understanding of chronology\n☐ Shows ability to sequence events\n☐ Makes connections between past and present\n☐ Shows interest in family and community history\n☐ Uses historical vocabulary appropriately\n☐ Demonstrates understanding of change over time\n☐ Shows appreciation for different historical perspectives",
    "Observable assessment for digital citizenship:\n☐ Student demonstrates safe online behavior\n☐ Shows understanding of digital footprints\n☐ Uses technology respectfully and responsibly\n☐ Demonstrates ability to communicate appropriately online\n☐ Shows awareness of online safety rules\n☐ Uses digital tools effectively for learning\n☐ Demonstrates understanding of digital respect and kindness"
  ];

  let updatedCount = 0;
  let errors = 0;

  console.log('🔄 Starting lesson updates...\n');

  for (const lesson of socialStudiesLessons) {
    try {
      // Determine which Mi'kmaq perspective and assessment to use based on unit
      let mikmaqPerspective: string;
      let assessmentNote: string;
      
      if (lesson.unitPlan.title.includes('Family and Our Class')) {
        mikmaqPerspective = mikmaqPerspectives[1]; // Community responsibility
        assessmentNote = socialStudiesAssessmentNotes[0]; // Community concepts
      } else if (lesson.unitPlan.title.includes('Rights and Responsibilities')) {
        mikmaqPerspective = mikmaqPerspectives[4]; // Conflict resolution
        assessmentNote = socialStudiesAssessmentNotes[1]; // Rights and responsibilities
      } else if (lesson.unitPlan.title.includes('Story Through Time')) {
        mikmaqPerspective = mikmaqPerspectives[3]; // Oral traditions and history
        assessmentNote = socialStudiesAssessmentNotes[3]; // Historical thinking
      } else if (lesson.unitPlan.title.includes('Exploring Our World')) {
        mikmaqPerspective = mikmaqPerspectives[2]; // Territorial knowledge
        assessmentNote = socialStudiesAssessmentNotes[2]; // Cultural understanding
      } else if (lesson.unitPlan.title.includes('Digital Citizens')) {
        mikmaqPerspective = mikmaqPerspectives[0]; // Traditional governance (adapted for digital)
        assessmentNote = socialStudiesAssessmentNotes[4]; // Digital citizenship
      } else {
        mikmaqPerspective = mikmaqPerspectives[0]; // Default
        assessmentNote = socialStudiesAssessmentNotes[0]; // Default
      }

      // Update the lesson with ETFO compliance
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          // 1. Duration: Change from 60 to 45 minutes
          duration: 45,
          
          // 2. Structure timing: Add proper timing to each section
          mindsOn: lesson.mindsOn ? addTiming(lesson.mindsOn, '(8 minutes)') : null,
          action: lesson.action ? addTiming(lesson.action, '(27 minutes)') : null,
          consolidation: lesson.consolidation ? addTiming(lesson.consolidation, '(10 minutes)') : null,
          
          // 3. Differentiation strategies: JSON with 4 types for social studies
          differentiationStrategies: socialStudiesDifferentiation,
          
          // 4. Indigenous perspectives: 100+ chars about Mi'kmaq content
          indigenousPerspectives: mikmaqPerspective,
          
          // 5. Assessment notes: Observable assessment with checkboxes
          assessmentNotes: assessmentNote
        }
      });

      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`✅ Updated ${updatedCount}/${socialStudiesLessons.length} lessons...`);
      }

    } catch (error) {
      console.error(`❌ Error updating lesson "${lesson.title}":`, error);
      errors++;
    }
  }

  console.log(`\n🎉 ETFO COMPLIANCE UPDATE COMPLETE!`);
  console.log(`===============================`);
  console.log(`✅ Successfully updated: ${updatedCount} lessons`);
  console.log(`❌ Errors: ${errors} lessons`);
  console.log(`📊 Total processed: ${socialStudiesLessons.length} lessons`);

  if (updatedCount === socialStudiesLessons.length && errors === 0) {
    console.log(`\n🎯 PERFECT! All 84 Social Studies lessons are now ETFO-compliant:`);
    console.log(`• Duration: 60 → 45 minutes`);
    console.log(`• Structure timing: Added (8/27/10 minutes)`);
    console.log(`• Differentiation: Added JSON with 4 social studies types`);
    console.log(`• Indigenous perspectives: Added Mi'kmaq content (100+ chars)`);
    console.log(`• Assessment notes: Added observable assessment with checkboxes`);
  }

  // Final verification
  console.log(`\n🔍 Performing verification check...`);
  
  const verificationLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlan: {
          subject: 'Sciences humaines'
        }
      }
    },
    select: {
      id: true,
      title: true,
      duration: true,
      mindsOn: true,
      action: true,
      consolidation: true,
      differentiationStrategies: true,
      indigenousPerspectives: true,
      assessmentNotes: true
    }
  });

  let compliantLessons = 0;
  verificationLessons.forEach(lesson => {
    const isCompliant = 
      lesson.duration === 45 &&
      lesson.mindsOn?.includes('(8 minutes)') &&
      lesson.action?.includes('(27 minutes)') &&
      lesson.consolidation?.includes('(10 minutes)') &&
      lesson.differentiationStrategies &&
      lesson.indigenousPerspectives && lesson.indigenousPerspectives.length >= 100 &&
      lesson.assessmentNotes?.includes('☐');
    
    if (isCompliant) compliantLessons++;
  });

  console.log(`✅ ETFO Compliant lessons: ${compliantLessons}/${verificationLessons.length}`);
  console.log(`🎯 Success rate: ${Math.round((compliantLessons / verificationLessons.length) * 100)}%`);
}

function addTiming(content: string, timing: string): string {
  // If timing already exists, replace it
  const existingTimingRegex = /\(\d+\s*minutes?\)/i;
  if (existingTimingRegex.test(content)) {
    return content.replace(existingTimingRegex, timing);
  }
  
  // Otherwise, add timing at the beginning
  return `${timing} ${content}`;
}

// Run the update
fixEmilySocialStudiesETFO()
  .catch((error) => {
    console.error('❌ Error fixing Social Studies lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });