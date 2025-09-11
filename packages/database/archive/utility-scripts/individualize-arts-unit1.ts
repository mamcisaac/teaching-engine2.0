#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function individualizeArtsUnit1() {
  try {
    console.log('🎨 Individualizing Unit 1: Discovering Art in Our World (24 lessons)...\n');

    // Get Unit 1: Discovering Art in Our World
    const unit1 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlan: {
          userId: 23,
          subject: 'Arts visuels'
        },
        title: 'Discovering Art in Our World'
      }
    });

    if (!unit1) {
      throw new Error('Unit 1: Discovering Art in Our World not found');
    }

    console.log(`Found unit: ${unit1.title} (ID: ${unit1.id})`);

    // Get all lessons for Unit 1
    const unit1Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unit1.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${unit1Lessons.length} lessons to individualize\n`);

    // Define unique art techniques and progressions for Unit 1
    const artTechniques = [
      // Week 1 - Basic Observation and Drawing
      {
        technique: "Observational Drawing",
        materials: {
          "Drawing paper": "12x18 inch white drawing paper",
          "Pencils": "2H, HB, 2B drawing pencils",
          "Erasers": "Kneaded erasers and pink pearl erasers",
          "Blending stumps": "Small and medium blending stumps",
          "Magnifying glasses": "Hand-held magnifying glasses",
          "Reference objects": "Shells, leaves, simple geometric objects"
        },
        technique_steps: [
          "1. Hold pencil correctly for drawing control",
          "2. Practice basic line types: straight, curved, zigzag",
          "3. Observe object carefully before drawing",
          "4. Start with basic shapes, add details gradually",
          "5. Use light pressure for initial sketches"
        ],
        french_vocabulary: {
          "dessiner": "to draw",
          "crayon": "pencil",
          "papier": "paper",
          "regarder": "to look",
          "ligne": "line",
          "forme": "shape"
        }
      },
      // Week 2 - Color Exploration
      {
        technique: "Watercolor Wet-on-Wet",
        materials: {
          "Watercolor paper": "9x12 inch cold-press watercolor paper",
          "Watercolor paints": "Student-grade watercolor set with primary colors",
          "Brushes": "#8 and #12 round watercolor brushes",
          "Water containers": "Two containers (clean/dirty water)",
          "Paper towels": "Absorbent paper towels for blotting",
          "Spray bottles": "Fine mist spray bottles",
          "Salt": "Table salt for texture effects"
        },
        technique_steps: [
          "1. Wet paper completely with clean brush and water",
          "2. Mix paint with water to create flowing consistency",
          "3. Drop paint onto wet surface and watch it flow",
          "4. Tilt paper to guide paint movement",
          "5. Add salt while paint is still wet for texture"
        ],
        french_vocabulary: {
          "peinture": "paint",
          "eau": "water",
          "pinceau": "brush",
          "couleur": "color",
          "mouillé": "wet",
          "mélanger": "to mix"
        }
      },
      // Week 3 - Nature Art and Texture
      {
        technique: "Nature Printmaking",
        materials: {
          "Natural materials": "Fresh leaves, flowers, bark pieces",
          "Printing ink": "Water-based block printing ink in earth tones",
          "Brayers": "4-inch rubber brayers for ink application",
          "Printing paper": "Rice paper or newsprint for delicate prints",
          "Glass plates": "8x10 inch glass plates for ink rolling",
          "Protective covering": "Newspaper and plastic sheets",
          "Collection bags": "Paper bags for nature collecting"
        },
        technique_steps: [
          "1. Collect fresh, flat natural materials",
          "2. Roll ink evenly on glass plate with brayer",
          "3. Apply thin layer of ink to natural object",
          "4. Place inked object on paper, press gently",
          "5. Lift carefully to reveal natural print"
        ],
        french_vocabulary: {
          "nature": "nature",
          "feuille": "leaf",
          "fleur": "flower",
          "imprimer": "to print",
          "presser": "to press",
          "naturel": "natural"
        }
      },
      // Week 4 - Collage and Mixed Media
      {
        technique: "Mixed Media Collage",
        materials: {
          "Background paper": "12x18 inch colored construction paper",
          "Magazine images": "Cut-out images from nature magazines",
          "Fabric scraps": "Various textured fabric pieces",
          "Tissue paper": "Colored tissue paper in nature tones",
          "Glue sticks": "Large glue sticks for paper adhering",
          "Mod Podge": "Matte medium for layering and sealing",
          "Foam brushes": "1-inch foam brushes for medium application",
          "Scissors": "Child-safe scissors with good cutting edge"
        },
        technique_steps: [
          "1. Plan composition by arranging materials first",
          "2. Start with largest background pieces",
          "3. Layer materials from back to front",
          "4. Apply adhesive to small areas at a time",
          "5. Seal final composition with thin Mod Podge layer"
        ],
        french_vocabulary: {
          "collage": "collage",
          "papier": "paper",
          "tissu": "fabric",
          "coller": "to glue",
          "couper": "to cut",
          "arrangement": "arrangement"
        }
      }
    ];

    // Enhanced assessment criteria for each lesson type
    const enhancedAssessments = {
      "observational": {
        criteria: [
          "☐ Demonstrates careful observation through accurate details",
          "☐ Shows proper pencil grip and control techniques",
          "☐ Uses appropriate line weight and pressure variation",
          "☐ Completes drawing process from start to finish",
          "☐ Describes observations using art vocabulary",
          "☐ Shows improvement in drawing accuracy over time"
        ],
        french_assessment: "Évaluation en français: observe attentivement, utilise le crayon correctement"
      },
      "color_exploration": {
        criteria: [
          "☐ Understands wet-on-wet watercolor technique",
          "☐ Demonstrates proper brush loading and water control",
          "☐ Creates successful color mixing and blending",
          "☐ Maintains clean water containers during work",
          "☐ Experiments with salt texture effects",
          "☐ Names colors in French during discussion"
        ],
        french_assessment: "Évaluation en français: mélange les couleurs, utilise l'eau et le pinceau"
      },
      "nature_printing": {
        criteria: [
          "☐ Selects appropriate natural materials for printing",
          "☐ Applies ink evenly using brayer technique",
          "☐ Creates clear, detailed nature prints",
          "☐ Demonstrates proper printing pressure",
          "☐ Compares printed results with original objects",
          "☐ Uses French nature vocabulary in reflection"
        ],
        french_assessment: "Évaluation en français: utilise matériaux naturels, imprime soigneusement"
      },
      "mixed_media": {
        criteria: [
          "☐ Plans composition before permanent adhering",
          "☐ Demonstrates layering techniques effectively",
          "☐ Uses adhesives appropriately for different materials",
          "☐ Creates unified composition with varied textures",
          "☐ Explains artistic choices using collage vocabulary",
          "☐ Integrates French art terms in artist statement"
        ],
        french_assessment: "Évaluation en français: crée un collage, explique ses choix artistiques"
      }
    };

    // Individualize each lesson
    let lessonsUpdated = 0;
    
    for (let i = 0; i < unit1Lessons.length && i < 24; i++) {
      const lesson = unit1Lessons[i];
      const weekNumber = Math.floor(i / 6) + 1;
      const techniqueIndex = Math.floor(i / 6);
      const technique = artTechniques[techniqueIndex] || artTechniques[0];
      
      // Determine assessment type based on lesson content
      let assessmentType = "observational";
      if (lesson.title.toLowerCase().includes("color")) assessmentType = "color_exploration";
      if (lesson.title.toLowerCase().includes("nature")) assessmentType = "nature_printing";
      if (lesson.title.toLowerCase().includes("community") || lesson.title.toLowerCase().includes("mural")) assessmentType = "mixed_media";
      
      const assessment = enhancedAssessments[assessmentType];

      // Create detailed, unique materials list
      const detailedMaterials = {
        ...technique.materials,
        "Preparation": [
          "Pre-cut materials to appropriate sizes",
          "Set up workstations with all tools",
          "Prepare demonstration materials",
          "Organize cleanup supplies"
        ],
        "Cleanup": [
          "Wet wipes for hands",
          "Soap and water access",
          "Drying racks for artwork",
          "Storage folders for completed work"
        ]
      };

      // Enhanced learning goals with technique specifics
      const enhancedLearningGoals = `Students will master ${technique.technique} while exploring ${lesson.title}. 
      
      Specific technique goals:
      ${technique.technique_steps.join('\n')}
      
      Vocabulary goals (French): ${Object.entries(technique.french_vocabulary).map(([fr, en]) => `${fr} (${en})`).join(', ')}`;

      // Create unique consolidation with technique reflection
      const enhancedConsolidation = `${lesson.consolidation || ''} 
      
      Technique reflection: Students demonstrate ${technique.technique} mastery by explaining their process using French art vocabulary. 
      Gallery walk focuses on technique execution and artistic expression.
      
      French vocabulary review: ${Object.keys(technique.french_vocabulary).join(', ')}`;

      // Update the lesson with individualized content
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          materials: detailedMaterials,
          learningGoals: enhancedLearningGoals,
          consolidation: enhancedConsolidation,
          assessmentNotes: assessment.criteria.join('\n') + '\n\n' + assessment.french_assessment,
          differentiationStrategies: {
            ...lesson.differentiationStrategies,
            "technique_specific": {
              "forStruggling": `Simplified ${technique.technique} steps, pre-prepared materials, peer buddy system`,
              "forAdvanced": `Advanced ${technique.technique} variations, independent exploration, teaching others`,
              "forELL": `Visual technique cards, French-English vocabulary sheet, non-verbal demonstration`
            }
          },
          // Add technique-specific cross-curricular connections
          indigenousPerspectives: `Explore how ${technique.technique} appears in Indigenous art traditions. Connect to local Mi'kmaq artistic practices where appropriate.`,
        }
      });

      lessonsUpdated++;
      console.log(`✅ Updated Lesson ${i + 1}: ${lesson.title} with ${technique.technique}`);
    }

    console.log(`\n🎉 Successfully individualized ${lessonsUpdated} lessons in Unit 1`);
    console.log('Each lesson now has:');
    console.log('✓ Specific art technique with step-by-step instructions');
    console.log('✓ Detailed materials list with quantities and preparation notes');
    console.log('✓ Enhanced assessment criteria specific to the technique');
    console.log('✓ Integrated French art vocabulary');
    console.log('✓ Technique-specific differentiation strategies');
    console.log('✓ Indigenous perspectives connections');

  } catch (error) {
    console.error('Error individualizing Unit 1:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeArtsUnit1();