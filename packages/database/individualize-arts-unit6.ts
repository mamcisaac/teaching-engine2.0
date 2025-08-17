#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function individualizeArtsUnit6() {
  try {
    console.log('🎨 Individualizing Unit 6: Our Art Gallery (12 lessons)...\n');

    // Get Unit 6: Our Art Gallery
    const unit6 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlan: {
          userId: 23,
          subject: 'Arts visuels'
        },
        title: 'Our Art Gallery'
      }
    });

    if (!unit6) {
      throw new Error('Unit 6: Our Art Gallery not found');
    }

    console.log(`Found unit: ${unit6.title} (ID: ${unit6.id})`);

    // Get all lessons for Unit 6
    const unit6Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unit6.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${unit6Lessons.length} lessons to individualize\n`);

    // Define unique gallery curation and art appreciation techniques for Unit 6 (12 lessons = 3 techniques with 4 lessons each)
    const galleryTechniques = [
      // Lessons 1-4: Portfolio Development and Reflection
      {
        technique: "Portfolio Curation and Artistic Reflection",
        materials: {
          "Portfolio folders": "Large portfolio folders (18x24 inches) for artwork storage",
          "Reflection sheets": "Guided reflection questionnaires and templates",
          "Assessment rubrics": "Student-friendly self-assessment rubrics",
          "Documentation tools": "Digital cameras or tablets for portfolio photos",
          "Artist statement templates": "Age-appropriate artist statement guides",
          "Magnifying glasses": "For detailed artwork examination",
          "Archival sleeves": "Protective sleeves for precious artwork",
          "Label makers": "For creating professional artwork labels",
          "Colored pens": "Fine-tip colored pens for reflection writing",
          "Progress tracking charts": "Visual progress tracking templates"
        },
        technique_steps: [
          "1. Review all artwork created throughout the year",
          "2. Select pieces that show growth and learning",
          "3. Organize selected works chronologically or thematically",
          "4. Write reflection statements about artistic journey",
          "5. Create professional presentation of portfolio"
        ],
        french_vocabulary: {
          "portfolio": "portfolio",
          "réflexion": "reflection",
          "progrès": "progress",
          "croissance": "growth",
          "sélectionner": "to select",
          "organiser": "to organize"
        }
      },
      // Lessons 5-8: Gallery Design and Exhibition Planning
      {
        technique: "Exhibition Design and Gallery Setup",
        materials: {
          "Display boards": "Foam core boards for mounting artwork",
          "Mounting materials": "Double-sided tape, mounting corners, adhesive strips",
          "Gallery lighting": "Portable LED spotlights for artwork illumination",
          "Pedestals": "Small display pedestals for 3D artworks",
          "Gallery signs": "Professional-looking title cards and signs",
          "Velcro strips": "For changeable display arrangements",
          "Gallery rope": "For creating gallery viewing paths",
          "Floor markers": "Tape for marking optimal viewing distances",
          "Guest book": "Gallery visitor sign-in book",
          "Informational placards": "Artist biography and technique description cards"
        },
        technique_steps: [
          "1. Plan gallery layout considering traffic flow and viewing",
          "2. Group artworks by theme, technique, or chronology",
          "3. Mount artworks professionally on display boards",
          "4. Position lighting to enhance artwork visibility",
          "5. Create informational materials for gallery visitors"
        ],
        french_vocabulary: {
          "galerie": "gallery",
          "exposition": "exhibition",
          "affichage": "display",
          "présentation": "presentation",
          "visiteur": "visitor",
          "arrangement": "arrangement"
        }
      },
      // Lessons 9-12: Art Appreciation and Community Sharing
      {
        technique: "Art Appreciation and Community Engagement",
        materials: {
          "Art books": "Large format art books with diverse artists and styles",
          "Artist biography cards": "Information cards about famous artists",
          "Magnifying glasses": "For examining artistic details and techniques",
          "Comparison charts": "For comparing different artistic styles and periods",
          "Invitation templates": "For inviting families and community to gallery",
          "Thank you cards": "For expressing gratitude to gallery visitors",
          "Microphone": "For gallery tour presentations and speeches",
          "Guest chairs": "Comfortable seating for gallery reception",
          "Refreshment supplies": "Simple refreshments for gallery opening",
          "Certificate templates": "Recognition certificates for young artists"
        },
        technique_steps: [
          "1. Study famous artworks and discuss artistic elements",
          "2. Compare personal artwork to professional art examples",
          "3. Practice describing artwork using appropriate vocabulary",
          "4. Plan and host gallery opening for families and community",
          "5. Reflect on artistic growth and set future goals"
        ],
        french_vocabulary: {
          "appréciation": "appreciation",
          "communauté": "community",
          "partager": "to share",
          "célébrer": "to celebrate",
          "remercier": "to thank",
          "fier": "proud"
        }
      }
    ];

    // Enhanced assessment criteria for gallery and appreciation activities
    const galleryAssessments = {
      "portfolio_reflection": {
        criteria: [
          "☐ Demonstrates thoughtful selection of portfolio pieces",
          "☐ Shows evidence of artistic growth and learning",
          "☐ Writes clear, reflective artist statements",
          "☐ Organizes portfolio materials professionally",
          "☐ Uses appropriate art vocabulary in reflections",
          "☐ Reflects on artistic journey using French vocabulary"
        ],
        french_assessment: "Évaluation en français: réfléchit sur les progrès artistiques, organise le portfolio"
      },
      "exhibition_design": {
        criteria: [
          "☐ Plans effective gallery layout with good traffic flow",
          "☐ Mounts and displays artwork professionally",
          "☐ Creates informative and attractive gallery signage",
          "☐ Considers lighting and viewing angles in display",
          "☐ Collaborates effectively in group gallery setup",
          "☐ Presents gallery design using French exhibition vocabulary"
        ],
        french_assessment: "Évaluation en français: planifie l'exposition, utilise le vocabulaire de la galerie"
      },
      "art_appreciation": {
        criteria: [
          "☐ Demonstrates understanding of various artistic styles and techniques",
          "☐ Compares personal work to professional artworks thoughtfully",
          "☐ Uses appropriate art vocabulary when discussing artwork",
          "☐ Shows respect and appreciation for diverse artistic expressions",
          "☐ Engages confidently with gallery visitors and community",
          "☐ Shares artistic appreciation using French community vocabulary"
        ],
        french_assessment: "Évaluation en français: apprécie l'art, partage avec la communauté"
      }
    };

    // Individualize each lesson in Unit 6
    let lessonsUpdated = 0;
    
    for (let i = 0; i < unit6Lessons.length && i < 12; i++) {
      const lesson = unit6Lessons[i];
      const techniqueIndex = Math.floor(i / 4); // 4 lessons per technique
      const technique = galleryTechniques[techniqueIndex] || galleryTechniques[0];
      const lessonInTechnique = (i % 4) + 1;
      
      // Determine assessment type based on technique
      let assessmentType = "portfolio_reflection";
      if (techniqueIndex === 1) assessmentType = "exhibition_design";
      if (techniqueIndex === 2) assessmentType = "art_appreciation";
      
      const assessment = galleryAssessments[assessmentType];

      // Create detailed, gallery-specific materials list
      const detailedMaterials = {
        ...technique.materials,
        "Professional Development": [
          "Gallery etiquette guidelines for young artists",
          "Professional artist examples and career information",
          "Art museum virtual tour resources",
          "Community artist contact information for potential visits"
        ],
        "Family Engagement": [
          "Family invitation templates in multiple languages",
          "Take-home art activity suggestions for families",
          "Portfolio sharing guidelines for families",
          "Community art event information and resources"
        ],
        "Celebration Supplies": [
          "Simple refreshments appropriate for school settings",
          "Photography props for memorable gallery moments",
          "Recognition certificates and achievement awards",
          "Guest book for visitor comments and feedback"
        ]
      };

      // Enhanced learning goals specific to gallery experience and art appreciation
      const enhancedLearningGoals = `Students will master ${technique.technique} while developing art appreciation and presentation skills.
      
      Gallery and Appreciation Goals:
      ${technique.technique_steps.join('\n')}
      
      Professional Skills: Students will learn gallery etiquette, presentation skills, and professional artwork display techniques.
      
      Community Engagement: Connect with families and community through shared artistic celebration.
      
      French Gallery Vocabulary: ${Object.entries(technique.french_vocabulary).map(([fr, en]) => `${fr} (${en})`).join(', ')}
      
      Artistic Growth Recognition: Celebrate individual and collective artistic growth throughout the year.`;

      // Create gallery-focused consolidation
      const enhancedConsolidation = `${lesson.consolidation || ''} 
      
      Gallery Experience Reflection: Students reflect on their ${technique.technique} experience and artistic learning.
      
      Professional Presentation: Practice presenting artwork and discussing artistic choices with confidence.
      
      Community Celebration: Share artistic accomplishments with families and community members.
      
      French Language Integration: ${Object.keys(technique.french_vocabulary).join(', ')} - use gallery vocabulary in presentations.
      
      Year-End Artistic Reflection: Celebrate growth, set future artistic goals, and appreciate collective classroom achievement.`;

      // Update the lesson with gallery-specific individualized content
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          materials: detailedMaterials,
          learningGoals: enhancedLearningGoals,
          consolidation: enhancedConsolidation,
          assessmentNotes: assessment.criteria.join('\n') + '\n\n' + assessment.french_assessment,
          differentiationStrategies: {
            ...lesson.differentiationStrategies,
            "gallery_appreciation_specific": {
              "forStruggling": `Guided portfolio selection, visual reflection templates, peer support for presentation, simplified gallery roles`,
              "forAdvanced": `Leadership roles in gallery setup, independent research on artists, advanced presentation opportunities, peer mentoring`,
              "forELL": `Visual portfolio organization, bilingual gallery labels, family cultural art sharing encouraged, peer translation support`,
              "forSocialAnxiety": `Practice presentation opportunities, choice in presentation format, small group sharing before large group`
            }
          },
          // Add community and cultural celebration connections
          indigenousPerspectives: `Celebrate Indigenous artistic traditions and invite community Elders or Indigenous artists to share traditional Mi'kmaq art forms, connecting student artwork to broader cultural artistic heritage.`,
        }
      });

      lessonsUpdated++;
      console.log(`✅ Updated Lesson ${i + 1}: ${lesson.title} with ${technique.technique} (Lesson ${lessonInTechnique} of technique)`);
    }

    console.log(`\n🎉 Successfully individualized ${lessonsUpdated} lessons in Unit 6`);
    console.log('Each lesson now has:');
    console.log('✓ Specific gallery curation and art appreciation techniques');
    console.log('✓ Detailed materials list including professional presentation tools');
    console.log('✓ Enhanced assessment criteria focused on reflection and presentation skills');
    console.log('✓ Integrated French gallery and appreciation vocabulary');
    console.log('✓ Community engagement and family involvement strategies');
    console.log('✓ Indigenous cultural celebration and community artist connections');
    console.log('✓ Year-end reflection and artistic growth recognition focus');

  } catch (error) {
    console.error('Error individualizing Unit 6:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeArtsUnit6();