#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function individualizeArtsUnit4() {
  try {
    console.log('🎨 Individualizing Unit 4: Textures and Patterns (12 lessons)...\n');

    // Get Unit 4: Textures and Patterns
    const unit4 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlan: {
          userId: 23,
          subject: 'Arts visuels'
        },
        title: 'Textures and Patterns'
      }
    });

    if (!unit4) {
      throw new Error('Unit 4: Textures and Patterns not found');
    }

    console.log(`Found unit: ${unit4.title} (ID: ${unit4.id})`);

    // Get all lessons for Unit 4
    const unit4Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unit4.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${unit4Lessons.length} lessons to individualize\n`);

    // Define unique texture and pattern techniques for Unit 4 (12 lessons = 3 techniques with 4 lessons each)
    const texturePatternTechniques = [
      // Lessons 1-4: Texture Exploration and Rubbing Techniques
      {
        technique: "Texture Rubbing and Imprinting",
        materials: {
          "Rubbing plates": "Various textured rubbing plates (geometric, organic)",
          "Drawing paper": "18x24 inch lightweight drawing paper",
          "Peeling crayons": "Large crayons with paper removed for side rubbing",
          "Natural materials": "Tree bark, leaves, coins, textured surfaces",
          "Aluminum foil": "Heavy-duty aluminum foil for embossing",
          "Clay tools": "Wooden clay tools for creating impressed textures",
          "Modeling clay": "Air-dry clay for creating texture plates",
          "Rolling pins": "Small acrylic rolling pins for clay flattening",
          "Texture stamps": "Various stamps for repeated pattern making",
          "Collection bags": "Paper bags for texture hunting expeditions"
        },
        technique_steps: [
          "1. Place textured object under thin paper",
          "2. Hold paper firmly to prevent shifting",
          "3. Rub crayon on side using even pressure",
          "4. Overlap rubbings to create complex textures",
          "5. Layer different textures for rich compositions"
        ],
        french_vocabulary: {
          "texture": "texture",
          "rugueux": "rough",
          "lisse": "smooth",
          "frottage": "rubbing",
          "impression": "imprint",
          "surface": "surface"
        }
      },
      // Lessons 5-8: Printmaking and Pattern Repetition
      {
        technique: "Block Printing and Pattern Creation",
        materials: {
          "Foam plates": "Styrofoam plates for carving printing blocks",
          "Printing tools": "Pencils and ballpoint pens for carving",
          "Block printing ink": "Water-based printing ink in multiple colors",
          "Brayers": "4-inch rubber brayers for ink application",
          "Printing paper": "Smooth printing paper cut to various sizes",
          "Newspapers": "For padding printing surface",
          "Pattern templates": "Grid templates for pattern planning",
          "Geometric shapes": "Cut foam shapes for stamping",
          "Sponges": "Natural sponges cut into printing shapes",
          "Paper plates": "For ink palettes and mixing"
        },
        technique_steps: [
          "1. Design simple pattern motif on foam plate",
          "2. Carve design using gentle pressure with tools",
          "3. Apply ink evenly with brayer to raised areas",
          "4. Press paper firmly and evenly onto inked plate",
          "5. Repeat print in grid pattern for overall design"
        ],
        french_vocabulary: {
          "motif": "pattern/motif",
          "répéter": "to repeat",
          "imprimer": "to print",
          "graver": "to carve",
          "relief": "relief",
          "géométrique": "geometric"
        }
      },
      // Lessons 9-12: Mixed Media Texture Collage
      {
        technique: "Textural Collage and Mixed Media",
        materials: {
          "Textured materials": "Sandpaper, bubble wrap, corrugated cardboard",
          "Fabric scraps": "Various textures: velvet, burlap, silk, denim",
          "Natural materials": "Dried leaves, seeds, small twigs, bark pieces",
          "Base boards": "9x12 inch cardboard or canvas boards",
          "Gel medium": "Matte gel medium for strong adhesion",
          "Brushes": "Old brushes for applying medium",
          "Scissors": "Fabric scissors for cutting various materials",
          "Wire mesh": "Fine wire mesh for textural elements",
          "String and yarn": "Various weights and textures of fiber",
          "Protective spray": "Acrylic sealer for preserving collages"
        },
        technique_steps: [
          "1. Plan composition by arranging materials first",
          "2. Start with background textures and build forward",
          "3. Apply gel medium to both surface and material",
          "4. Press materials firmly ensuring good adhesion",
          "5. Layer contrasting textures for visual interest"
        ],
        french_vocabulary: {
          "collage": "collage",
          "matériaux": "materials",
          "contraste": "contrast",
          "adhérer": "to adhere",
          "composition": "composition",
          "couches": "layers"
        }
      }
    ];

    // Enhanced assessment criteria for texture and pattern work
    const textureAssessments = {
      "texture_rubbing": {
        criteria: [
          "☐ Demonstrates proper rubbing technique with even pressure",
          "☐ Creates clear, detailed texture impressions",
          "☐ Identifies and describes different texture qualities",
          "☐ Combines multiple textures effectively in composition",
          "☐ Uses appropriate vocabulary to describe tactile sensations",
          "☐ Names texture qualities in French during exploration"
        ],
        french_assessment: "Évaluation en français: décrit les textures rugueux/lisse, utilise le frottage"
      },
      "pattern_printing": {
        criteria: [
          "☐ Carves clean, printable designs in foam plates",
          "☐ Applies ink evenly for consistent prints",
          "☐ Creates successful repeated patterns",
          "☐ Demonstrates understanding of geometric pattern principles",
          "☐ Maintains registration for pattern alignment",
          "☐ Explains pattern creation process using French art vocabulary"
        ],
        french_assessment: "Évaluation en français: crée des motifs géométriques, explique la répétition"
      },
      "mixed_media_texture": {
        criteria: [
          "☐ Selects materials with complementary textures",
          "☐ Demonstrates proper adhesion techniques",
          "☐ Creates unified composition from diverse materials",
          "☐ Shows understanding of textural contrast principles",
          "☐ Explains artistic choices regarding material selection",
          "☐ Discusses collage composition using French materials vocabulary"
        ],
        french_assessment: "Évaluation en français: utilise divers matériaux, explique le contraste et la composition"
      }
    };

    // Individualize each lesson in Unit 4
    let lessonsUpdated = 0;
    
    for (let i = 0; i < unit4Lessons.length && i < 12; i++) {
      const lesson = unit4Lessons[i];
      const techniqueIndex = Math.floor(i / 4); // 4 lessons per technique
      const technique = texturePatternTechniques[techniqueIndex] || texturePatternTechniques[0];
      const lessonInTechnique = (i % 4) + 1;
      
      // Determine assessment type based on technique
      let assessmentType = "texture_rubbing";
      if (techniqueIndex === 1) assessmentType = "pattern_printing";
      if (techniqueIndex === 2) assessmentType = "mixed_media_texture";
      
      const assessment = textureAssessments[assessmentType];

      // Create detailed, texture-specific materials list
      const detailedMaterials = {
        ...technique.materials,
        "Sensory Exploration": [
          "Texture mystery boxes for blind touch exploration",
          "Vocabulary cards with texture descriptions",
          "Magnifying glasses for close texture observation",
          "Texture books and reference materials"
        ],
        "Safety and Accessibility": [
          "Dust masks for working with textured materials",
          "Non-toxic materials appropriate for all students",
          "Alternative tools for students with fine motor challenges",
          "Sanitizing wipes for shared texture materials"
        ],
        "Extension Activities": [
          "Digital camera for texture documentation",
          "Texture journals for vocabulary building",
          "Nature guides for outdoor texture exploration",
          "Math pattern templates for geometric connections"
        ]
      };

      // Enhanced learning goals specific to texture and pattern exploration
      const enhancedLearningGoals = `Students will master ${technique.technique} while developing tactile awareness and pattern recognition skills.
      
      Texture and Pattern Technique Goals:
      ${technique.technique_steps.join('\n')}
      
      Sensory Development: Students will develop tactile vocabulary and sensory awareness through hands-on exploration.
      
      Mathematical Connections: Understand geometric patterns, symmetry, and repetition through artistic creation.
      
      French Texture/Pattern Vocabulary: ${Object.entries(technique.french_vocabulary).map(([fr, en]) => `${fr} (${en})`).join(', ')}
      
      Scientific Connections: Explore how texture and patterns appear in nature and serve functional purposes.`;

      // Create texture-focused consolidation
      const enhancedConsolidation = `${lesson.consolidation || ''} 
      
      Texture and Pattern Reflection: Students describe their ${technique.technique} process and artistic discoveries.
      
      Sensory Language Development: Use descriptive vocabulary to discuss texture qualities and pattern relationships.
      
      Mathematical Pattern Discussion: Identify geometric patterns and explore concepts of repetition and symmetry.
      
      French Language Integration: ${Object.keys(technique.french_vocabulary).join(', ')} - practice vocabulary through texture exploration.
      
      Scientific Connections: Connect textural discoveries to natural patterns and functional design in nature.`;

      // Update the lesson with texture-specific individualized content
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          materials: detailedMaterials,
          learningGoals: enhancedLearningGoals,
          consolidation: enhancedConsolidation,
          assessmentNotes: assessment.criteria.join('\n') + '\n\n' + assessment.french_assessment,
          differentiationStrategies: {
            ...lesson.differentiationStrategies,
            "texture_pattern_specific": {
              "forStruggling": `Large-handle tools, pre-cut materials, simplified patterns, peer assistance for fine motor tasks`,
              "forAdvanced": `Complex pattern challenges, independent texture exploration, measurement and geometry integration`,
              "forELL": `Visual texture vocabulary cards, hands-on exploration before language, pattern recognition activities`,
              "forSensoryNeeds": `Alternative texture options, sensory breaks available, choice in texture intensity levels`
            }
          },
          // Add science and math cross-curricular connections
          indigenousPerspectives: `Explore traditional Indigenous patterns and textures in Mi'kmaq beadwork, basketry, and quillwork. Learn about the significance of patterns in traditional Indigenous art with cultural respect and understanding.`,
        }
      });

      lessonsUpdated++;
      console.log(`✅ Updated Lesson ${i + 1}: ${lesson.title} with ${technique.technique} (Lesson ${lessonInTechnique} of technique)`);
    }

    console.log(`\n🎉 Successfully individualized ${lessonsUpdated} lessons in Unit 4`);
    console.log('Each lesson now has:');
    console.log('✓ Specific texture and pattern techniques with sensory development focus');
    console.log('✓ Detailed materials list including sensory exploration tools');
    console.log('✓ Enhanced assessment criteria focused on tactile skills and pattern understanding');
    console.log('✓ Integrated French texture and pattern vocabulary');
    console.log('✓ Sensory-sensitive differentiation strategies');
    console.log('✓ Indigenous pattern perspectives and traditional art connections');
    console.log('✓ Mathematical and scientific cross-curricular connections');

  } catch (error) {
    console.error('Error individualizing Unit 4:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeArtsUnit4();