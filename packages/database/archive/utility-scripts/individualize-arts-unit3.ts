#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function individualizeArtsUnit3() {
  try {
    console.log('🎨 Individualizing Unit 3: Winter Celebrations Through Art (12 lessons)...\n');

    // Get Unit 3: Winter Celebrations Through Art
    const unit3 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlan: {
          userId: 23,
          subject: 'Arts visuels'
        },
        title: 'Winter Celebrations Through Art'
      }
    });

    if (!unit3) {
      throw new Error('Unit 3: Winter Celebrations Through Art not found');
    }

    console.log(`Found unit: ${unit3.title} (ID: ${unit3.id})`);

    // Get all lessons for Unit 3
    const unit3Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unit3.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${unit3Lessons.length} lessons to individualize\n`);

    // Define unique winter celebration techniques for Unit 3 (12 lessons = 3 techniques with 4 lessons each)
    const winterTechniques = [
      // Lessons 1-4: Snowflake and Ice Art
      {
        technique: "Symmetrical Paper Cutting and Ice Crystal Art",
        materials: {
          "White paper": "8.5x11 inch bright white copy paper",
          "Metallic paper": "Silver and blue metallic origami paper",
          "Child-safe scissors": "Pointed-tip scissors for detailed cutting",
          "Snowflake templates": "Various symmetrical patterns for tracing",
          "Silver glitter": "Fine silver craft glitter for ice effects",
          "Glue sticks": "Clear-drying glue sticks",
          "Blue watercolors": "Various shades of blue watercolor paint",
          "Salt": "Table salt for crystalline texture effects",
          "Toothpicks": "For detailed pattern making in wet paint",
          "Magnifying glasses": "To observe real snowflake images"
        },
        technique_steps: [
          "1. Fold paper into triangular sections for symmetry",
          "2. Create small cuts along folded edges",
          "3. Unfold carefully to reveal symmetrical patterns",
          "4. Apply watercolor washes while paper is slightly damp",
          "5. Add salt while paint is wet for crystalline effects"
        ],
        french_vocabulary: {
          "flocon": "snowflake",
          "symétrie": "symmetry",
          "cristal": "crystal",
          "plier": "to fold",
          "découper": "to cut",
          "hiver": "winter"
        }
      },
      // Lessons 5-8: Holiday Light and Glow Effects
      {
        technique: "Resist Art and Light Effects",
        materials: {
          "White crayons": "White crayons for resist technique",
          "Oil pastels": "Yellow, orange, red oil pastels for warmth",
          "Black paper": "9x12 inch black construction paper",
          "Watercolor paints": "Warm colors: yellow, orange, red, pink",
          "Brushes": "#10 and #12 flat watercolor brushes",
          "Masking tape": "Artist tape for creating light beam effects",
          "Gold paint pens": "Fine-tip gold metallic pens",
          "Tissue paper": "Yellow and orange tissue paper for layering",
          "Spray bottles": "For creating atmospheric effects",
          "Cotton swabs": "For blending and highlighting"
        },
        technique_steps: [
          "1. Draw light sources with white crayon pressure",
          "2. Apply masking tape for clean light beam edges",
          "3. Paint warm watercolors over crayon resist areas",
          "4. Remove tape while paint is slightly damp",
          "5. Add gold highlights with metallic pens when dry"
        ],
        french_vocabulary: {
          "lumière": "light",
          "brillant": "bright",
          "chaleur": "warmth",
          "résister": "to resist",
          "rayons": "rays",
          "célébration": "celebration"
        }
      },
      // Lessons 9-12: Cultural Winter Traditions
      {
        technique: "Mixed Media Cultural Celebration Art",
        materials: {
          "Fabric scraps": "Traditional pattern fabrics from various cultures",
          "Embroidery thread": "Red, green, gold embroidery floss",
          "Cardboard base": "8x10 inch sturdy cardboard for mounting",
          "Cultural images": "Photos of winter celebrations worldwide",
          "Metallic markers": "Gold and silver permanent markers",
          "Sequins and beads": "Small decorative elements for traditions",
          "Mod Podge": "Matte medium for adhering fabric pieces",
          "Foam brushes": "1-inch foam brushes for medium application",
          "Hole punch": "Single-hole punch for threading details",
          "Cultural music": "Instrumental holiday music from various traditions"
        },
        technique_steps: [
          "1. Research winter celebration from chosen culture",
          "2. Select fabric patterns that represent cultural elements",
          "3. Arrange composition honoring cultural traditions",
          "4. Layer materials from background to foreground",
          "5. Add personal touches while respecting cultural authenticity"
        ],
        french_vocabulary: {
          "tradition": "tradition",
          "culture": "culture",
          "respecter": "to respect",
          "honorer": "to honor",
          "partager": "to share",
          "communauté": "community"
        }
      }
    ];

    // Enhanced assessment criteria for winter celebration art
    const winterAssessments = {
      "symmetrical_cutting": {
        criteria: [
          "☐ Demonstrates understanding of symmetrical design principles",
          "☐ Uses scissors safely and effectively for detailed cutting",
          "☐ Creates successful watercolor wash techniques",
          "☐ Applies salt texture effects appropriately",
          "☐ Explains symmetry concept using mathematical vocabulary",
          "☐ Uses French winter vocabulary during creation and reflection"
        ],
        french_assessment: "Évaluation en français: comprend la symétrie, utilise le vocabulaire d'hiver"
      },
      "resist_techniques": {
        criteria: [
          "☐ Successfully executes crayon resist technique",
          "☐ Creates effective light and glow effects",
          "☐ Demonstrates proper masking tape application",
          "☐ Blends warm colors to suggest light and warmth",
          "☐ Adds effective highlighting with metallic pens",
          "☐ Describes light effects using French celebration vocabulary"
        ],
        french_assessment: "Évaluation en français: crée des effets de lumière, utilise le vocabulaire des célébrations"
      },
      "cultural_celebration": {
        criteria: [
          "☐ Shows respect and understanding of chosen cultural tradition",
          "☐ Demonstrates mixed media layering techniques",
          "☐ Integrates cultural elements authentically",
          "☐ Explains cultural significance with sensitivity",
          "☐ Collaborates respectfully when sharing cultural knowledge",
          "☐ Uses French vocabulary for community and sharing concepts"
        ],
        french_assessment: "Évaluation en français: respecte les traditions, partage en communauté"
      }
    };

    // Individualize each lesson in Unit 3
    let lessonsUpdated = 0;
    
    for (let i = 0; i < unit3Lessons.length && i < 12; i++) {
      const lesson = unit3Lessons[i];
      const techniqueIndex = Math.floor(i / 4); // 4 lessons per technique
      const technique = winterTechniques[techniqueIndex] || winterTechniques[0];
      const lessonInTechnique = (i % 4) + 1;
      
      // Determine assessment type based on technique
      let assessmentType = "symmetrical_cutting";
      if (techniqueIndex === 1) assessmentType = "resist_techniques";
      if (techniqueIndex === 2) assessmentType = "cultural_celebration";
      
      const assessment = winterAssessments[assessmentType];

      // Create detailed, winter-specific materials list
      const detailedMaterials = {
        ...technique.materials,
        "Winter Context Materials": [
          "Real snowflake photographs for observation",
          "Cultural celebration images from various traditions",
          "Light sources for observing glow effects",
          "Examples of symmetry in winter nature"
        ],
        "Safety Considerations": [
          "Scissors safety rules prominently displayed",
          "Non-toxic materials only",
          "Adequate ventilation for adhesives",
          "Clean-up stations for sticky materials"
        ],
        "Cultural Sensitivity": [
          "Respectful representation guidelines",
          "Multiple cultural examples available",
          "Family input welcomed for authentic details",
          "Focus on appreciation rather than appropriation"
        ]
      };

      // Enhanced learning goals specific to winter celebrations
      const enhancedLearningGoals = `Students will master ${technique.technique} while exploring winter celebrations and cultural traditions.
      
      Winter Art Technique Goals:
      ${technique.technique_steps.join('\n')}
      
      Cultural Understanding: Students will explore how different cultures celebrate winter while creating respectful artistic representations.
      
      Mathematical Connections: Understand symmetry, patterns, and geometric concepts through art creation.
      
      French Winter Vocabulary: ${Object.entries(technique.french_vocabulary).map(([fr, en]) => `${fr} (${en})`).join(', ')}
      
      Community Connections: Connect to local winter traditions and celebrations in our Maritime community.`;

      // Create winter-themed consolidation
      const enhancedConsolidation = `${lesson.consolidation || ''} 
      
      Winter Celebration Sharing: Students present their ${technique.technique} work and explain their artistic choices.
      
      Cultural Appreciation: Discuss different winter traditions respectfully and share family celebrations.
      
      Mathematical Reflection: Identify symmetry and patterns in winter art and nature.
      
      French Language Integration: ${Object.keys(technique.french_vocabulary).join(', ')} - use vocabulary in sharing circle.
      
      Seasonal Connection: Connect artwork to seasonal changes and community celebrations.`;

      // Update the lesson with winter-specific individualized content
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          materials: detailedMaterials,
          learningGoals: enhancedLearningGoals,
          consolidation: enhancedConsolidation,
          assessmentNotes: assessment.criteria.join('\n') + '\n\n' + assessment.french_assessment,
          differentiationStrategies: {
            ...lesson.differentiationStrategies,
            "winter_celebration_specific": {
              "forStruggling": `Pre-cut shapes available, simplified patterns, step-by-step visual guides`,
              "forAdvanced": `Independent cultural research, complex symmetrical patterns, peer teaching opportunities`,
              "forELL": `Visual cultural examples, translated celebration names, family tradition sharing encouraged`,
              "forCulturalSensitivity": `Multiple tradition examples, family input valued, focus on appreciation and respect`
            }
          },
          // Add seasonal and cultural cross-curricular connections
          indigenousPerspectives: `Explore how Indigenous communities celebrate winter, including traditional winter solstice ceremonies, seasonal art traditions, and connections to the natural winter cycle. Learn about Mi'kmaq winter traditions with cultural sensitivity and respect.`,
        }
      });

      lessonsUpdated++;
      console.log(`✅ Updated Lesson ${i + 1}: ${lesson.title} with ${technique.technique} (Lesson ${lessonInTechnique} of technique)`);
    }

    console.log(`\n🎉 Successfully individualized ${lessonsUpdated} lessons in Unit 3`);
    console.log('Each lesson now has:');
    console.log('✓ Specific winter celebration techniques with cultural sensitivity');
    console.log('✓ Detailed materials list including cultural context materials');
    console.log('✓ Enhanced assessment criteria focused on technique and cultural understanding');
    console.log('✓ Integrated French winter and celebration vocabulary');
    console.log('✓ Cultural sensitivity differentiation strategies');
    console.log('✓ Indigenous winter perspectives and local Maritime connections');
    console.log('✓ Mathematical concepts (symmetry, patterns) integrated through art');

  } catch (error) {
    console.error('Error individualizing Unit 3:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeArtsUnit3();