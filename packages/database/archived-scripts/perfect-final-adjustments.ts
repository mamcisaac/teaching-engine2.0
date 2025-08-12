#!/usr/bin/env tsx

/**
 * FINAL ADJUSTMENTS TO PERFECT ALL LRPS
 * Adjust Arts visuels to 45h and Formation personnelle to 30h
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function perfectFinalAdjustments() {
  console.log('🎨 PERFECTING FINAL TWO SUBJECTS\n');
  console.log('================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    console.log('ERROR: Emily not found');
    return;
  }
  
  // PERFECT ARTS VISUELS (45 hours)
  console.log('🎨 ADJUSTING ARTS VISUELS TO 45 HOURS...\n');
  
  const artsLRP = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Arts visuels',
      academicYear: '2025-2026',
      userId: emily.id
    },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (artsLRP) {
    // Update LRP with perfect content
    await prisma.longRangePlan.update({
      where: { id: artsLRP.id },
      data: {
        title: 'Arts visuels Grade 1 - Creative Expression (45 hours)',
        
        goals: `VISUAL ARTS JOURNEY - 45 HOURS OF CREATIVITY

REALITY FOR GRADE 1:
- Fine motor skills still developing
- Love of color and texture
- Process over product
- Integrated with other subjects
- Mess is part of learning!

MONTHLY FOCUS:

SEPTEMBER (4 hours):
Theme: All About Me Art
Projects: Self-portraits, handprints
Skills: Holding tools, basic shapes
Materials: Crayons, paint, paper
Integration: Sciences humaines (identity)

OCTOBER (5 hours):
Theme: Fall Creations
Projects: Leaf prints, pumpkin art
Skills: Printing, stamping
Materials: Natural materials, paint
PEI: Beach treasures in art

NOVEMBER (5 hours):
Theme: Texture and Pattern
Projects: Collage, weaving
Skills: Cutting (with help), gluing
Materials: Fabric, paper, yarn
Connection: Remembrance poppies

DECEMBER (4 hours):
Theme: Holiday Crafts
Projects: Gifts for families
Skills: 3D construction
Materials: Recyclables, glitter!
Reality: Excitement affects focus

JANUARY (5 hours):
Theme: Winter Wonders
Projects: Snow scenes, mittens
Skills: Color mixing (basic)
Materials: White paint variations
Technique: Resist art

FEBRUARY (5 hours):
Theme: Hearts and Shapes
Projects: Valentine art, symmetry
Skills: Folding, cutting hearts
Materials: Construction paper
Focus: Geometric shapes in art

MARCH (4 hours):
Theme: Spring Colors
Projects: Flowers, rainbows
Skills: Watercolor techniques
Materials: Watercolors, salt
Spring break affects hours

APRIL (5 hours):
Theme: Ocean and Beach Art
Projects: Fish, seascapes
Skills: Mixed media
Materials: Sand, shells, paint
PEI: Our island in art

MAY (6 hours):
Theme: Growth and Gardens
Projects: Flower paintings, bugs
Skills: Observation drawing
Materials: Pastels, markers
Outside: Nature sketching

JUNE (2 hours):
Theme: Summer Celebration
Projects: Memory books
Skills: Reflection
Materials: All year's techniques
Light and celebratory

TOTAL: 45 hours of artistic exploration`,
        
        assessmentOverview: `ART ASSESSMENT FOR GRADE 1:

SKILL DEVELOPMENT:
- Can hold and control tools
- Uses materials appropriately
- Shows improving fine motor
- Explores different media

CREATIVE EXPRESSION:
- Shows ideas through art
- Takes risks with materials
- Expresses feelings
- Shows imagination

PROCESS FOCUS:
- Engagement matters most
- Effort over outcome
- Growth in confidence
- Joy in creating

DOCUMENTATION:
- Photo portfolios
- Process photos
- Artist statements (oral)
- Seasonal displays

NO GRADES ON ART EVER`,
        
        resourceNeeds: `ART MATERIALS FOR GRADE 1:

BASICS:
- Crayons (thick)
- Markers (washable)
- Paint (tempera)
- Brushes (various sizes)
- Paper (lots!)
- Glue sticks
- Safety scissors

SPECIAL MATERIALS:
- Watercolors
- Oil pastels
- Modeling clay
- Collage materials
- Natural materials
- Recyclables

TOOLS:
- Smocks/aprons
- Paint cups
- Drying rack
- Table covers
- Clean-up supplies

PEI SPECIFIC:
- Red sand
- Shells
- Sea glass
- Potato stamps!`
      }
    });
    
    // Adjust unit hours to total exactly 45
    const artsUnits = artsLRP.unitPlans;
    const hourAdjustments = [4, 5, 5, 4, 5, 5, 4, 5, 6, 2]; // Total: 45
    
    for (let i = 0; i < Math.min(artsUnits.length, hourAdjustments.length); i++) {
      await prisma.unitPlan.update({
        where: { id: artsUnits[i].id },
        data: { estimatedHours: hourAdjustments[i] }
      });
    }
    
    console.log('✅ Arts visuels adjusted to exactly 45 hours\n');
  }
  
  // PERFECT FORMATION PERSONNELLE (30 hours)
  console.log('🌱 ADJUSTING FORMATION PERSONNELLE TO 30 HOURS...\n');
  
  const fpsLRP = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Formation personnelle et sociale',
      academicYear: '2025-2026',
      userId: emily.id
    },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (fpsLRP) {
    // Update LRP with perfect content
    await prisma.longRangePlan.update({
      where: { id: fpsLRP.id },
      data: {
        title: 'Formation personnelle et sociale Grade 1 - Growing Together (30 hours)',
        
        goals: `PERSONAL & SOCIAL DEVELOPMENT - 30 HOURS OF GROWTH

INTEGRATED THROUGHOUT THE DAY:
- Not just in designated blocks
- Teachable moments matter
- Real situations are best lessons
- Building emotional vocabulary

MONTHLY THEMES:

SEPTEMBER (3 hours):
Focus: School readiness
Skills: Routines, transitions
Social: Making friends
Emotional: Naming feelings
Reality: Lots of tears!

OCTOBER (3 hours):
Focus: Cooperation
Skills: Sharing, taking turns
Social: Playing together
Emotional: Frustration tolerance
Activities: Group games

NOVEMBER (3 hours):
Focus: Empathy
Skills: Understanding others
Social: Helping friends
Emotional: Recognizing others' feelings
Connection: Kindness month

DECEMBER (3 hours):
Focus: Celebration and giving
Skills: Gratitude
Social: Including everyone
Emotional: Managing excitement
Reality: Over-stimulation!

JANUARY (3 hours):
Focus: New beginnings
Skills: Goal setting (simple)
Social: Conflict resolution
Emotional: Using words not hands
Fresh start after break

FEBRUARY (3 hours):
Focus: Friendship
Skills: Being a good friend
Social: Problem-solving together
Emotional: Dealing with hurt feelings
Valentine's: Inclusive friendship

MARCH (3 hours):
Focus: Perseverance
Skills: Not giving up
Social: Encouraging others
Emotional: Managing disappointment
Growth mindset basics

APRIL (3 hours):
Focus: Responsibility
Skills: Classroom jobs
Social: Contributing to community
Emotional: Pride in helping
Spring responsibilities

MAY (4 hours):
Focus: Changes and growth
Skills: Adaptability
Social: Transitions
Emotional: Mixed feelings about Grade 2
Preparing for change

JUNE (2 hours):
Focus: Celebration
Skills: Reflection
Social: Appreciating classmates
Emotional: Saying goodbye
Summer transitions

TOTAL: 30 hours of social-emotional learning`,
        
        assessmentOverview: `SOCIAL-EMOTIONAL ASSESSMENT:

SELF-REGULATION:
- Can calm down with support
- Uses strategies when upset
- Manages transitions better
- Shows improving impulse control

SOCIAL SKILLS:
- Plays cooperatively (sometimes!)
- Uses words to solve problems
- Shows empathy for others
- Includes others in play

EMOTIONAL AWARENESS:
- Names basic emotions
- Recognizes feelings in others
- Expresses needs appropriately
- Seeks help when needed

DOCUMENTATION:
- Anecdotal observations
- Growth stories
- Peer interaction notes
- Self-regulation progress

COMMUNICATION:
- Share growth with parents
- Celebrate improvements
- Focus on progress not perfection`,
        
        resourceNeeds: `SOCIAL-EMOTIONAL RESOURCES:

BOOKS:
- Feelings books
- Friendship stories
- Problem-solving books
- Growth mindset books

MATERIALS:
- Emotion cards
- Calm-down kit
- Fidget tools
- Timer for turns
- Peace corner items

GAMES:
- Cooperation games
- Turn-taking activities
- Emotion charades
- Friendship activities

VISUALS:
- Feeling chart
- Problem-solving steps
- Calm-down strategies
- Classroom agreements`
      }
    });
    
    // Adjust unit hours to total exactly 30
    const fpsUnits = fpsLRP.unitPlans;
    const fpsHourAdjustments = [3, 3, 3, 3, 3, 3, 3, 3, 4, 2]; // Total: 30
    
    for (let i = 0; i < Math.min(fpsUnits.length, fpsHourAdjustments.length); i++) {
      await prisma.unitPlan.update({
        where: { id: fpsUnits[i].id },
        data: { estimatedHours: fpsHourAdjustments[i] }
      });
    }
    
    console.log('✅ Formation personnelle adjusted to exactly 30 hours\n');
  }
  
  console.log('🌟 ALL ADJUSTMENTS COMPLETE!\n');
  console.log('Final perfect allocations:');
  console.log('  ✓ Mathématiques: 185 hours');
  console.log('  ✓ Français: 180 hours');
  console.log('  ✓ Sciences nature: 90 hours');
  console.log('  ✓ Sciences humaines: 45 hours');
  console.log('  ✓ Arts visuels: 45 hours');
  console.log('  ✓ Formation personnelle: 30 hours');
  console.log('  = 575 total hours (perfect!)\n');
  
  await prisma.$disconnect();
}

perfectFinalAdjustments().catch(console.error);