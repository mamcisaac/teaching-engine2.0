#!/usr/bin/env tsx

/**
 * FIX ARTS VISUELS AND FORMATION PERSONNELLE
 * Create proper 10-unit structure with correct hours
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixArtsAndFPS() {
  console.log('🔧 FIXING ARTS VISUELS AND FORMATION PERSONNELLE\n');
  console.log('==============================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    console.log('ERROR: Emily not found');
    return;
  }
  
  // FIX ARTS VISUELS (45 hours)
  console.log('🎨 FIXING ARTS VISUELS...\n');
  
  const artsLRP = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Arts visuels',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (artsLRP) {
    // Get expectations
    const artsExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Delete existing units
    await prisma.unitPlan.deleteMany({
      where: { longRangePlanId: artsLRP.id }
    });
    
    // Create new units with proper hours (total: 45)
    const artsUnits = [
      {
        title: 'Moi, l\'artiste / Me, the Artist',
        hours: 4,
        start: new Date('2025-09-03'),
        end: new Date('2025-09-30'),
        description: 'SEPT: Self-portraits, exploring materials, basic shapes'
      },
      {
        title: 'Couleurs d\'automne / Fall Colors',
        hours: 5,
        start: new Date('2025-10-01'),
        end: new Date('2025-10-31'),
        description: 'OCT: Leaf prints, pumpkins, PEI beach treasures in art'
      },
      {
        title: 'Textures et motifs / Textures and Patterns',
        hours: 5,
        start: new Date('2025-11-03'),
        end: new Date('2025-11-28'),
        description: 'NOV: Collage, weaving, Remembrance poppies'
      },
      {
        title: 'Art des fêtes / Holiday Art',
        hours: 4,
        start: new Date('2025-12-01'),
        end: new Date('2025-12-19'),
        description: 'DEC: Gifts for families, 3D constructions, celebrations'
      },
      {
        title: 'Merveilles d\'hiver / Winter Wonders',
        hours: 5,
        start: new Date('2026-01-06'),
        end: new Date('2026-01-30'),
        description: 'JAN: Snow scenes, color mixing, resist art techniques'
      },
      {
        title: 'Formes et symétrie / Shapes and Symmetry',
        hours: 5,
        start: new Date('2026-02-02'),
        end: new Date('2026-02-27'),
        description: 'FEB: Valentine art, geometric shapes, symmetry'
      },
      {
        title: 'Couleurs du printemps / Spring Colors',
        hours: 4,
        start: new Date('2026-03-02'),
        end: new Date('2026-03-20'),
        description: 'MAR: Flowers, rainbows, watercolor techniques'
      },
      {
        title: 'L\'océan et la plage / Ocean and Beach',
        hours: 5,
        start: new Date('2026-04-01'),
        end: new Date('2026-04-30'),
        description: 'APR: Fish, seascapes, mixed media with sand and shells'
      },
      {
        title: 'Jardins et croissance / Gardens and Growth',
        hours: 6,
        start: new Date('2026-05-01'),
        end: new Date('2026-05-29'),
        description: 'MAY: Flower paintings, bugs, nature sketching outside'
      },
      {
        title: 'Célébration d\'été / Summer Celebration',
        hours: 2,
        start: new Date('2026-06-01'),
        end: new Date('2026-06-25'),
        description: 'JUNE: Memory books, portfolio review, art show'
      }
    ];
    
    for (const unitSpec of artsUnits) {
      const unit = await prisma.unitPlan.create({
        data: {
          userId: emily.id,
          longRangePlanId: artsLRP.id,
          title: unitSpec.title,
          titleFr: unitSpec.title.split(' / ')[0],
          estimatedHours: unitSpec.hours,
          startDate: unitSpec.start,
          endDate: unitSpec.end,
          description: unitSpec.description,
          bigIdeas: 'Creative expression through visual arts',
          assessmentPlan: 'Process photos, portfolios, artist statements (oral)'
        }
      });
      
      // Link some expectations
      const expToLink = artsExpectations.slice(0, 3);
      for (const exp of expToLink) {
        await prisma.unitPlanExpectation.create({
          data: {
            unitPlanId: unit.id,
            expectationId: exp.id
          }
        });
      }
      
      console.log(`✓ Created: ${unitSpec.title} (${unitSpec.hours}h)`);
    }
    
    const artsTotal = artsUnits.reduce((sum, u) => sum + u.hours, 0);
    console.log(`\nArts visuels total: ${artsTotal}/45 hours\n`);
  }
  
  // FIX FORMATION PERSONNELLE (30 hours)
  console.log('🌱 FIXING FORMATION PERSONNELLE...\n');
  
  const fpsLRP = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Formation personnelle et sociale',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (fpsLRP) {
    // Get expectations
    const fpsExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Formation personnelle et sociale',
        grade: 1
      }
    });
    
    // Delete existing units
    await prisma.unitPlan.deleteMany({
      where: { longRangePlanId: fpsLRP.id }
    });
    
    // Create new units with proper hours (total: 30)
    const fpsUnits = [
      {
        title: 'Prêt pour l\'école / School Ready',
        hours: 3,
        start: new Date('2025-09-03'),
        end: new Date('2025-09-30'),
        description: 'SEPT: Routines, transitions, making friends, naming feelings'
      },
      {
        title: 'Coopération / Cooperation',
        hours: 3,
        start: new Date('2025-10-01'),
        end: new Date('2025-10-31'),
        description: 'OCT: Sharing, taking turns, playing together, frustration tolerance'
      },
      {
        title: 'Empathie / Empathy',
        hours: 3,
        start: new Date('2025-11-03'),
        end: new Date('2025-11-28'),
        description: 'NOV: Understanding others, helping friends, kindness month'
      },
      {
        title: 'Célébrer ensemble / Celebrating Together',
        hours: 3,
        start: new Date('2025-12-01'),
        end: new Date('2025-12-19'),
        description: 'DEC: Gratitude, including everyone, managing excitement'
      },
      {
        title: 'Nouveaux débuts / New Beginnings',
        hours: 3,
        start: new Date('2026-01-06'),
        end: new Date('2026-01-30'),
        description: 'JAN: Simple goals, conflict resolution, using words not hands'
      },
      {
        title: 'L\'amitié / Friendship',
        hours: 3,
        start: new Date('2026-02-02'),
        end: new Date('2026-02-27'),
        description: 'FEB: Being a good friend, problem-solving, managing hurt feelings'
      },
      {
        title: 'Persévérance / Perseverance',
        hours: 3,
        start: new Date('2026-03-02'),
        end: new Date('2026-03-20'),
        description: 'MAR: Not giving up, encouraging others, growth mindset'
      },
      {
        title: 'Responsabilité / Responsibility',
        hours: 3,
        start: new Date('2026-04-01'),
        end: new Date('2026-04-30'),
        description: 'APR: Classroom jobs, contributing to community, pride in helping'
      },
      {
        title: 'Changements et croissance / Changes and Growth',
        hours: 4,
        start: new Date('2026-05-01'),
        end: new Date('2026-05-29'),
        description: 'MAY: Adaptability, transitions, preparing for Grade 2'
      },
      {
        title: 'Célébration / Celebration',
        hours: 2,
        start: new Date('2026-06-01'),
        end: new Date('2026-06-25'),
        description: 'JUNE: Reflection, appreciating classmates, summer transitions'
      }
    ];
    
    for (const unitSpec of fpsUnits) {
      const unit = await prisma.unitPlan.create({
        data: {
          userId: emily.id,
          longRangePlanId: fpsLRP.id,
          title: unitSpec.title,
          titleFr: unitSpec.title.split(' / ')[0],
          estimatedHours: unitSpec.hours,
          startDate: unitSpec.start,
          endDate: unitSpec.end,
          description: unitSpec.description,
          bigIdeas: 'Growing as individuals and community members',
          assessmentPlan: 'Observation, anecdotal notes, growth stories'
        }
      });
      
      // Link some expectations
      const expToLink = fpsExpectations.slice(0, 2);
      for (const exp of expToLink) {
        await prisma.unitPlanExpectation.create({
          data: {
            unitPlanId: unit.id,
            expectationId: exp.id
          }
        });
      }
      
      console.log(`✓ Created: ${unitSpec.title} (${unitSpec.hours}h)`);
    }
    
    const fpsTotal = fpsUnits.reduce((sum, u) => sum + u.hours, 0);
    console.log(`\nFormation personnelle total: ${fpsTotal}/30 hours\n`);
  }
  
  console.log('✅ BOTH SUBJECTS NOW FIXED!\n');
  console.log('Arts visuels: 45 hours across 10 units');
  console.log('Formation personnelle: 30 hours across 10 units\n');
  
  await prisma.$disconnect();
}

fixArtsAndFPS().catch(console.error);