import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function examineLessonContent() {
  try {
    console.log('🔍 Examining detailed lesson content for Emily McIsaac...\n');

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

    // Get a sample of lessons from each unit to examine content
    const fpsLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          longRangePlan: {
            subject: 'Formation personnelle et sociale'
          }
        }
      },
      include: {
        unitPlan: {
          select: {
            title: true,
            startDate: true
          }
        }
      },
      orderBy: [
        {
          unitPlan: {
            startDate: 'asc'
          }
        },
        {
          date: 'asc'
        }
      ]
    });

    console.log(`📊 Found ${fpsLessons.length} total FPS lessons\n`);

    // Group lessons by unit
    const lessonsByUnit = fpsLessons.reduce((acc, lesson) => {
      const unitTitle = lesson.unitPlan.title;
      if (!acc[unitTitle]) {
        acc[unitTitle] = [];
      }
      acc[unitTitle].push(lesson);
      return acc;
    }, {} as Record<string, typeof fpsLessons>);

    // Check for identical content across lessons
    console.log('🔍 EXAMINING CONTENT DUPLICATION:\n');

    for (const [unitTitle, lessons] of Object.entries(lessonsByUnit)) {
      console.log(`📚 Unit: ${unitTitle} (${lessons.length} lessons)`);
      
      // Check Indigenous perspectives
      const indigenousPerspectives = lessons.map(l => l.indigenousPerspectives).filter(Boolean);
      const uniqueIndigenous = new Set(indigenousPerspectives);
      
      console.log(`   🏛️  Indigenous perspectives:`);
      console.log(`      Total: ${indigenousPerspectives.length}`);
      console.log(`      Unique: ${uniqueIndigenous.size}`);
      
      if (uniqueIndigenous.size === 1 && indigenousPerspectives.length > 1) {
        console.log(`      ⚠️  ALL ${lessons.length} lessons have IDENTICAL Indigenous perspectives`);
        console.log(`      Content (${indigenousPerspectives[0]?.length} chars): "${indigenousPerspectives[0]?.substring(0, 100)}..."`);
      } else if (uniqueIndigenous.size < indigenousPerspectives.length) {
        console.log(`      ⚠️  Some duplicate content found`);
      } else {
        console.log(`      ✅ All perspectives are unique`);
      }

      // Check assessment notes
      const assessmentNotes = lessons.map(l => l.assessmentNotes).filter(Boolean);
      const uniqueAssessments = new Set(assessmentNotes);
      
      console.log(`   📋 Assessment notes:`);
      console.log(`      Total: ${assessmentNotes.length}`);
      console.log(`      Unique: ${uniqueAssessments.size}`);
      
      if (uniqueAssessments.size === 1 && assessmentNotes.length > 1) {
        console.log(`      ⚠️  ALL ${lessons.length} lessons have IDENTICAL assessment notes`);
        console.log(`      Content (${assessmentNotes[0]?.length} chars): "${assessmentNotes[0]?.substring(0, 100)}..."`);
      } else if (uniqueAssessments.size < assessmentNotes.length) {
        console.log(`      ⚠️  Some duplicate content found`);
      } else {
        console.log(`      ✅ All assessments are unique`);
      }

      // Check materials
      const materials = lessons.map(l => l.materials).filter(Boolean);
      const uniqueMaterials = new Set(materials);
      
      console.log(`   📦 Materials lists:`);
      console.log(`      Total: ${materials.length}`);
      console.log(`      Unique: ${uniqueMaterials.size}`);
      
      if (uniqueMaterials.size === 1 && materials.length > 1) {
        console.log(`      ⚠️  ALL ${lessons.length} lessons have IDENTICAL materials`);
      } else if (uniqueMaterials.size < materials.length) {
        console.log(`      ⚠️  Some duplicate content found`);
      } else {
        console.log(`      ✅ All materials lists are unique`);
      }

      console.log('');
    }

    // Show first 3 lessons from Unit 1 for detailed examination
    const unit1Lessons = lessonsByUnit['Me, Myself, and I']?.slice(0, 3) || [];
    
    if (unit1Lessons.length > 0) {
      console.log('\n📋 DETAILED SAMPLE - First 3 lessons from "Me, Myself, and I":\n');
      
      unit1Lessons.forEach((lesson, index) => {
        console.log(`Lesson ${index + 1}: ${lesson.title}`);
        console.log(`Indigenous Perspectives (${lesson.indigenousPerspectives?.length || 0} chars):`);
        console.log(`"${lesson.indigenousPerspectives?.substring(0, 200)}..."`);
        console.log(`Assessment Notes (${lesson.assessmentNotes?.length || 0} chars):`);
        console.log(`"${lesson.assessmentNotes?.substring(0, 200)}..."`);
        console.log(`Materials: ${lesson.materials}`);
        console.log('---\n');
      });
    }

    return {
      totalLessons: fpsLessons.length,
      lessonsByUnit
    };

  } catch (error) {
    console.error('❌ Error examining lesson content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

examineLessonContent();