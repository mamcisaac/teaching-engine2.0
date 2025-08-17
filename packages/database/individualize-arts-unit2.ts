#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function individualizeArtsUnit2() {
  try {
    console.log('🎨 Individualizing Unit 2: Colors and Feelings (24 lessons)...\n');

    // Get Unit 2: Colors and Feelings
    const unit2 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlan: {
          userId: 23,
          subject: 'Arts visuels'
        },
        title: 'Colors and Feelings'
      }
    });

    if (!unit2) {
      throw new Error('Unit 2: Colors and Feelings not found');
    }

    console.log(`Found unit: ${unit2.title} (ID: ${unit2.id})`);

    // Get all lessons for Unit 2
    const unit2Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unit2.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${unit2Lessons.length} lessons to individualize\n`);

    // Define unique color techniques and progressions for Unit 2
    const colorTechniques = [
      // Week 1 - Primary Color Exploration
      {
        technique: "Primary Color Painting",
        materials: {
          "Primary tempera paints": "Red, blue, yellow liquid tempera paint (8oz bottles)",
          "Palette knives": "Plastic palette knives for paint mixing",
          "Palette paper": "Disposable paper palettes (9x12 inch)",
          "Canvas boards": "8x10 inch pre-primed canvas boards",
          "Brushes": "#6, #10, #14 flat bristle brushes",
          "Water containers": "Large mouth jars for brush cleaning",
          "Paper towels": "Heavy-duty paper towels for brush control",
          "Aprons": "Plastic art aprons for clothing protection"
        },
        technique_steps: [
          "1. Squeeze small amounts of primary colors on palette",
          "2. Keep primary colors separate initially",
          "3. Practice brush loading with single colors",
          "4. Create bold, confident brush strokes",
          "5. Explore texture through brush pressure variation"
        ],
        french_vocabulary: {
          "rouge": "red",
          "bleu": "blue", 
          "jaune": "yellow",
          "primaire": "primary",
          "pinceau": "brush",
          "palette": "palette"
        }
      },
      // Week 2 - Color Mixing and Secondary Colors
      {
        technique: "Color Mixing and Blending",
        materials: {
          "Tempera paints": "Primary colors plus white and black",
          "Mixing trays": "Plastic paint mixing trays with wells",
          "Blending brushes": "#8 flat and #6 round soft brushes",
          "Canvas paper": "12x18 inch canvas-textured paper",
          "Color wheels": "Blank color wheel templates",
          "Wet wipes": "Artist wet wipes for blending",
          "Spray bottles": "Fine mist bottles for paint moisture",
          "Plastic wrap": "For paint preservation between sessions"
        },
        technique_steps: [
          "1. Mix equal amounts of two primary colors",
          "2. Observe color changes gradually during mixing",
          "3. Practice wet-on-wet blending techniques",
          "4. Create smooth color transitions",
          "5. Record discoveries on color wheel"
        ],
        french_vocabulary: {
          "mélanger": "to mix",
          "orange": "orange",
          "vert": "green",
          "violet": "purple",
          "secondaire": "secondary",
          "transition": "transition"
        }
      },
      // Week 3 - Warm and Cool Colors
      {
        technique: "Temperature Color Studies",
        materials: {
          "Warm color paints": "Red, orange, yellow, red-orange, yellow-orange",
          "Cool color paints": "Blue, green, violet, blue-green, blue-violet",
          "Fan brushes": "Small fan brushes for texture effects",
          "Sponge brushes": "Natural sea sponges for dabbing",
          "Texture tools": "Combs, forks, credit cards for mark-making",
          "Heavy paper": "140lb watercolor paper for durability",
          "Masking tape": "Low-tack artist tape for crisp edges",
          "Hair dryer": "Cool setting for quick drying"
        },
        technique_steps: [
          "1. Separate warm and cool color families",
          "2. Create temperature studies side by side",
          "3. Use sponging for atmospheric effects",
          "4. Apply fan brush for texture variation",
          "5. Observe emotional impact of color temperature"
        ],
        french_vocabulary: {
          "chaud": "warm",
          "froid": "cool",
          "température": "temperature",
          "atmosphère": "atmosphere", 
          "émotion": "emotion",
          "sensation": "feeling"
        }
      },
      // Week 4 - Color and Emotion Expression
      {
        technique: "Expressive Color Abstraction",
        materials: {
          "Acrylic paints": "Full spectrum acrylic paint set",
          "Palette knives": "Various sizes of metal palette knives",
          "Canvas boards": "11x14 inch stretched canvas boards",
          "Texture mediums": "Gel medium and texture paste",
          "Emotion cards": "Visual emotion reference cards",
          "Music playlist": "Instrumental music for emotional inspiration",
          "Protective spray": "Workable fixative spray",
          "Display easels": "Table-top easels for presentation"
        },
        technique_steps: [
          "1. Select colors that represent chosen emotion",
          "2. Apply paint with palette knife for thick texture",
          "3. Layer colors to build emotional intensity",
          "4. Use gestural movements to express feelings",
          "5. Step back frequently to assess emotional impact"
        ],
        french_vocabulary: {
          "expression": "expression",
          "sentiment": "feeling",
          "abstrait": "abstract",
          "intensité": "intensity",
          "gestuel": "gestural",
          "impact": "impact"
        }
      }
    ];

    // Enhanced assessment criteria for each color technique
    const colorAssessments = {
      "primary_colors": {
        criteria: [
          "☐ Identifies and names primary colors in French and English",
          "☐ Demonstrates proper brush loading and paint application",
          "☐ Creates bold, confident strokes with primary colors",
          "☐ Maintains clean brush technique between colors",
          "☐ Shows understanding of primary color purity",
          "☐ Uses French color vocabulary during creation process"
        ],
        french_assessment: "Évaluation en français: identifie rouge, bleu, jaune; utilise le pinceau"
      },
      "color_mixing": {
        criteria: [
          "☐ Successfully mixes secondary colors from primaries",
          "☐ Demonstrates smooth blending and transition techniques",
          "☐ Records color discoveries accurately on wheel",
          "☐ Explains color mixing process using art vocabulary",
          "☐ Shows control over paint consistency and wetness",
          "☐ Names secondary colors in French during mixing"
        ],
        french_assessment: "Évaluation en français: mélange les couleurs, crée orange, vert, violet"
      },
      "temperature_studies": {
        criteria: [
          "☐ Distinguishes between warm and cool color families",
          "☐ Creates atmospheric effects using temperature contrast",
          "☐ Demonstrates sponging and fan brush techniques",
          "☐ Shows understanding of color temperature emotions",
          "☐ Uses texture tools effectively for mark-making",
          "☐ Describes temperature feelings in French"
        ],
        french_assessment: "Évaluation en français: comprend chaud/froid, exprime les sensations"
      },
      "expressive_abstraction": {
        criteria: [
          "☐ Selects colors that effectively convey chosen emotion",
          "☐ Demonstrates palette knife techniques for texture",
          "☐ Builds layers to create emotional intensity",
          "☐ Uses gestural movements expressively",
          "☐ Explains color-emotion connections thoughtfully",
          "☐ Presents emotional expression using French vocabulary"
        ],
        french_assessment: "Évaluation en français: exprime l'émotion par la couleur, explique ses choix"
      }
    };

    // Individualize each lesson in Unit 2
    let lessonsUpdated = 0;
    
    for (let i = 0; i < unit2Lessons.length && i < 24; i++) {
      const lesson = unit2Lessons[i];
      const weekNumber = Math.floor(i / 6) + 1;
      const techniqueIndex = Math.floor(i / 6);
      const technique = colorTechniques[techniqueIndex] || colorTechniques[0];
      
      // Determine assessment type based on lesson content and week
      let assessmentType = "primary_colors";
      if (weekNumber === 2) assessmentType = "color_mixing";
      if (weekNumber === 3) assessmentType = "temperature_studies";
      if (weekNumber === 4) assessmentType = "expressive_abstraction";
      
      const assessment = colorAssessments[assessmentType];

      // Create detailed, week-specific materials list
      const detailedMaterials = {
        ...technique.materials,
        "Setup Requirements": [
          "Individual work stations with adequate lighting",
          "Paint mixing areas clearly defined",
          "Water stations for brush cleaning",
          "Drying space for wet artwork"
        ],
        "Safety Considerations": [
          "Non-toxic paints only",
          "Proper ventilation for paint fumes",
          "Aprons or old clothes recommended",
          "Eye wash station accessible"
        ],
        "Extension Materials": [
          "Color reference books and images",
          "Examples of professional artwork using technique",
          "Documentation materials for process photos"
        ]
      };

      // Enhanced learning goals specific to color theory
      const enhancedLearningGoals = `Students will master ${technique.technique} while exploring emotional expression through color.
      
      Color Theory Goals:
      ${technique.technique_steps.join('\n')}
      
      Emotional Expression: Students will connect colors to feelings and learn to express emotions visually.
      
      French Color Vocabulary: ${Object.entries(technique.french_vocabulary).map(([fr, en]) => `${fr} (${en})`).join(', ')}
      
      Cultural Connections: Explore how different cultures use colors to express emotions and traditions.`;

      // Create consolidation focused on color learning
      const enhancedConsolidation = `${lesson.consolidation || ''} 
      
      Color Theory Reflection: Students explain their ${technique.technique} process and color choices.
      
      Emotional Connection: Discuss how colors made them feel and why certain colors were chosen.
      
      French Language Integration: Use color vocabulary in French during sharing circle.
      
      Gallery Walk Focus: ${Object.keys(technique.french_vocabulary).join(', ')} - students identify these elements in peers' work.`;

      // Update the lesson with color-specific individualized content
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          materials: detailedMaterials,
          learningGoals: enhancedLearningGoals,
          consolidation: enhancedConsolidation,
          assessmentNotes: assessment.criteria.join('\n') + '\n\n' + assessment.french_assessment,
          differentiationStrategies: {
            ...lesson.differentiationStrategies,
            "color_specific": {
              "forStruggling": `Color mixing charts provided, pre-mixed colors available, simplified color choices`,
              "forAdvanced": `Explore tertiary colors, independent color experiments, color theory research`,
              "forELL": `Visual color vocabulary cards, color-emotion matching activities, peer translation support`,
              "forColorBlind": `Texture cues added to colors, verbal color descriptions, alternative identification methods`
            }
          },
          // Add color-theory cross-curricular connections
          indigenousPerspectives: `Explore traditional Indigenous color meanings and how different First Nations communities use colors to represent emotions, seasons, and spiritual concepts. Connect to Mi'kmaq color traditions.`,
        }
      });

      lessonsUpdated++;
      console.log(`✅ Updated Lesson ${i + 1}: ${lesson.title} with ${technique.technique} (Week ${weekNumber})`);
    }

    console.log(`\n🎉 Successfully individualized ${lessonsUpdated} lessons in Unit 2`);
    console.log('Each lesson now has:');
    console.log('✓ Specific color theory technique with step-by-step instructions');
    console.log('✓ Detailed materials list including safety considerations');
    console.log('✓ Enhanced assessment criteria focused on color learning');
    console.log('✓ Integrated French color vocabulary');
    console.log('✓ Color-specific differentiation strategies including colorblind accommodations');
    console.log('✓ Indigenous color perspectives and cultural connections');
    console.log('✓ Progressive skill building from primary colors to emotional expression');

  } catch (error) {
    console.error('Error individualizing Unit 2:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeArtsUnit2();