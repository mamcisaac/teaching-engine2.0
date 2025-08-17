#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function individualizeArtsUnit5() {
  try {
    console.log('🎨 Individualizing Unit 5: Stories in Art (12 lessons)...\n');

    // Get Unit 5: Stories in Art
    const unit5 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlan: {
          userId: 23,
          subject: 'Arts visuels'
        },
        title: 'Stories in Art'
      }
    });

    if (!unit5) {
      throw new Error('Unit 5: Stories in Art not found');
    }

    console.log(`Found unit: ${unit5.title} (ID: ${unit5.id})`);

    // Get all lessons for Unit 5
    const unit5Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unit5.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${unit5Lessons.length} lessons to individualize\n`);

    // Define unique storytelling and illustration techniques for Unit 5 (12 lessons = 3 techniques with 4 lessons each)
    const storyArtTechniques = [
      // Lessons 1-4: Character Design and Development
      {
        technique: "Character Design and Development",
        materials: {
          "Character worksheets": "Pre-designed character development templates",
          "Drawing pencils": "Range of pencils from 2H to 4B for sketching",
          "Colored pencils": "24-color set of colored pencils for character coloring",
          "Drawing paper": "9x12 inch smooth drawing paper",
          "Erasers": "Kneaded and vinyl erasers for corrections",
          "Blending stumps": "Small and medium stumps for shading",
          "Character reference books": "Picture books with diverse characters",
          "Mirrors": "Small hand mirrors for self-portrait reference",
          "Emotion cards": "Visual emotion reference cards",
          "Story prompt cards": "Character situation prompt cards"
        },
        technique_steps: [
          "1. Brainstorm character personality traits and background",
          "2. Sketch basic character shape and proportions",
          "3. Add distinctive features that reflect personality",
          "4. Choose colors that represent character traits",
          "5. Create character in different emotions or situations"
        ],
        french_vocabulary: {
          "personnage": "character",
          "histoire": "story",
          "émotion": "emotion",
          "dessiner": "to draw",
          "créer": "to create",
          "personnalité": "personality"
        }
      },
      // Lessons 5-8: Sequential Art and Comic Strips
      {
        technique: "Sequential Art and Comic Creation",
        materials: {
          "Comic templates": "Pre-divided panel templates in various layouts",
          "Fine-tip markers": "Black fine-tip markers for outlining",
          "Speech bubble templates": "Cut-out speech and thought bubble shapes",
          "Panel rulers": "12-inch rulers for creating straight panel borders",
          "White correction fluid": "For speech bubble text corrections",
          "Colored markers": "Broad-tip markers for coloring panels",
          "Comic examples": "Age-appropriate comic books for reference",
          "Story planning sheets": "Beginning-middle-end planning templates",
          "Letter stencils": "For neat speech bubble lettering",
          "Lightbox or window": "For tracing and refining drawings"
        },
        technique_steps: [
          "1. Plan story sequence using beginning-middle-end structure",
          "2. Divide story into 3-6 panels for comic strip",
          "3. Sketch rough story progression in each panel",
          "4. Add speech bubbles and thought balloons",
          "5. Finalize with clean lines and appropriate coloring"
        ],
        french_vocabulary: {
          "bande dessinée": "comic strip",
          "séquence": "sequence",
          "panneau": "panel",
          "bulle": "speech bubble",
          "raconter": "to tell",
          "aventure": "adventure"
        }
      },
      // Lessons 9-12: Illustration and Visual Narrative
      {
        technique: "Book Illustration and Visual Narrative",
        materials: {
          "Illustration board": "8x10 inch smooth illustration board",
          "Watercolor pencils": "Set of 12 watercolor pencils",
          "Water brushes": "Water brush pens for activating watercolor pencils",
          "Fine detail brushes": "#0 and #2 round detail brushes",
          "Story books": "Wordless picture books for inspiration",
          "Composition frames": "Cardboard viewfinders for composition",
          "Blending paper": "Smooth paper for color blending practice",
          "Fixative spray": "Workable fixative for preserving drawings",
          "Book binding materials": "Cardstock, staples, or string for simple books",
          "Text templates": "Large print text templates for story integration"
        },
        technique_steps: [
          "1. Read or create a simple story requiring illustration",
          "2. Identify key story moments needing visual representation",
          "3. Plan composition using viewfinder frames",
          "4. Create detailed illustration with watercolor pencils",
          "5. Integrate text and image for complete narrative page"
        ],
        french_vocabulary: {
          "illustration": "illustration",
          "narratif": "narrative",
          "livre": "book",
          "page": "page",
          "composer": "to compose",
          "intégrer": "to integrate"
        }
      }
    ];

    // Enhanced assessment criteria for story art techniques
    const storyArtAssessments = {
      "character_design": {
        criteria: [
          "☐ Creates character with distinctive, purposeful features",
          "☐ Demonstrates understanding of character personality through visual choices",
          "☐ Uses appropriate colors to reflect character traits",
          "☐ Shows character in different emotional states effectively",
          "☐ Explains character design choices using art vocabulary",
          "☐ Describes character using French personality and emotion vocabulary"
        ],
        french_assessment: "Évaluation en français: décrit le personnage, utilise le vocabulaire des émotions"
      },
      "sequential_art": {
        criteria: [
          "☐ Creates clear story sequence with beginning, middle, and end",
          "☐ Uses panels effectively to advance narrative",
          "☐ Integrates speech bubbles appropriately with images",
          "☐ Demonstrates understanding of visual storytelling principles",
          "☐ Creates readable, engaging comic strip format",
          "☐ Explains story sequence using French narrative vocabulary"
        ],
        french_assessment: "Évaluation en français: raconte l'histoire en séquence, utilise le vocabulaire narratif"
      },
      "book_illustration": {
        criteria: [
          "☐ Creates illustrations that effectively support story text",
          "☐ Demonstrates strong composition and visual planning",
          "☐ Uses watercolor pencil techniques effectively",
          "☐ Integrates text and image harmoniously",
          "☐ Shows understanding of how illustrations enhance narrative",
          "☐ Presents illustrated story using French book and illustration vocabulary"
        ],
        french_assessment: "Évaluation en français: intègre l'illustration et le texte, utilise le vocabulaire du livre"
      }
    };

    // Individualize each lesson in Unit 5
    let lessonsUpdated = 0;
    
    for (let i = 0; i < unit5Lessons.length && i < 12; i++) {
      const lesson = unit5Lessons[i];
      const techniqueIndex = Math.floor(i / 4); // 4 lessons per technique
      const technique = storyArtTechniques[techniqueIndex] || storyArtTechniques[0];
      const lessonInTechnique = (i % 4) + 1;
      
      // Determine assessment type based on technique
      let assessmentType = "character_design";
      if (techniqueIndex === 1) assessmentType = "sequential_art";
      if (techniqueIndex === 2) assessmentType = "book_illustration";
      
      const assessment = storyArtAssessments[assessmentType];

      // Create detailed, storytelling-specific materials list
      const detailedMaterials = {
        ...technique.materials,
        "Story Development": [
          "Story planning templates and graphic organizers",
          "Picture books with diverse characters and narratives",
          "Cultural story examples from various traditions",
          "Personal story sharing prompts and questions"
        ],
        "Language Integration": [
          "French-English story vocabulary cards",
          "Bilingual picture books for reference",
          "Recording devices for story sharing",
          "Translation support materials"
        ],
        "Presentation Tools": [
          "Document camera for sharing work",
          "Display easels for story presentations",
          "Author's chair for story sharing",
          "Simple book binding and display materials"
        ]
      };

      // Enhanced learning goals specific to visual storytelling
      const enhancedLearningGoals = `Students will master ${technique.technique} while developing visual storytelling and narrative skills.
      
      Visual Storytelling Goals:
      ${technique.technique_steps.join('\n')}
      
      Narrative Development: Students will understand how visual elements support and enhance storytelling.
      
      Language Arts Integration: Connect visual art to reading, writing, and oral communication skills.
      
      French Story Vocabulary: ${Object.entries(technique.french_vocabulary).map(([fr, en]) => `${fr} (${en})`).join(', ')}
      
      Cultural Storytelling: Explore how different cultures use visual art to tell stories and preserve traditions.`;

      // Create storytelling-focused consolidation
      const enhancedConsolidation = `${lesson.consolidation || ''} 
      
      Story Sharing Circle: Students present their ${technique.technique} work and tell their visual stories.
      
      Narrative Reflection: Discuss how visual elements help tell stories and convey meaning.
      
      Language Arts Connection: Connect visual storytelling to reading and writing experiences.
      
      French Language Integration: ${Object.keys(technique.french_vocabulary).join(', ')} - use storytelling vocabulary in presentations.
      
      Cultural Story Exploration: Share family stories and cultural narrative traditions.`;

      // Update the lesson with storytelling-specific individualized content
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          materials: detailedMaterials,
          learningGoals: enhancedLearningGoals,
          consolidation: enhancedConsolidation,
          assessmentNotes: assessment.criteria.join('\n') + '\n\n' + assessment.french_assessment,
          differentiationStrategies: {
            ...lesson.differentiationStrategies,
            "visual_storytelling_specific": {
              "forStruggling": `Story templates provided, simplified character design, peer storytelling support, visual story aids`,
              "forAdvanced": `Complex narrative structures, independent story creation, multi-character stories, advanced illustration techniques`,
              "forELL": `Visual storytelling emphasis, bilingual story options, cultural story sharing encouraged, peer translation support`,
              "forReadingSupport": `Visual story emphasis over text, oral storytelling options, picture-based story planning`
            }
          },
          // Add literacy and cultural cross-curricular connections
          indigenousPerspectives: `Explore traditional Indigenous storytelling through visual art, including petroglyphs, traditional illustrations, and how Mi'kmaq culture uses visual elements to preserve and share stories across generations.`,
        }
      });

      lessonsUpdated++;
      console.log(`✅ Updated Lesson ${i + 1}: ${lesson.title} with ${technique.technique} (Lesson ${lessonInTechnique} of technique)`);
    }

    console.log(`\n🎉 Successfully individualized ${lessonsUpdated} lessons in Unit 5`);
    console.log('Each lesson now has:');
    console.log('✓ Specific visual storytelling techniques with narrative development focus');
    console.log('✓ Detailed materials list including story development and presentation tools');
    console.log('✓ Enhanced assessment criteria focused on visual narrative skills');
    console.log('✓ Integrated French storytelling and character vocabulary');
    console.log('✓ Language arts integration and literacy support strategies');
    console.log('✓ Indigenous storytelling perspectives and cultural narrative traditions');
    console.log('✓ Progressive skill building from character design to complete illustrated narratives');

  } catch (error) {
    console.error('Error individualizing Unit 5:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeArtsUnit5();