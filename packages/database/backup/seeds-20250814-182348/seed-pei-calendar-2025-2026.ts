#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEICalendar() {
  console.log('📅 Seeding Official PEI 2025-2026 School Calendar...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Clear existing system calendar events for this user
    await prisma.calendarEvent.deleteMany({
      where: {
        teacherId: emily.id,
        source: 'SYSTEM'
      }
    });
    
    console.log('🗑️ Cleared existing system calendar events');
    
    // SEPTEMBER 2025 Events
    const september = [
      {
        title: 'Labour Day',
        titleFr: 'Fête du Travail',
        description: 'No classes - Federal holiday',
        start: new Date('2025-09-01'),
        end: new Date('2025-09-01'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Administrative Day',
        titleFr: 'Journée administrative',
        description: 'No classes - Teacher preparation',
        start: new Date('2025-09-02'),
        end: new Date('2025-09-02'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Teacher Orientation Day',
        titleFr: 'Journée d\'orientation des enseignants',
        description: 'No classes - Teacher orientation and preparation',
        start: new Date('2025-09-03'),
        end: new Date('2025-09-03'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: '🎒 FIRST DAY OF SCHOOL',
        titleFr: '🎒 PREMIER JOUR D\'ÉCOLE',
        description: 'Welcome back! First day for all students',
        start: new Date('2025-09-04'),
        end: new Date('2025-09-04'),
        allDay: true,
        eventType: 'CUSTOM' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'National Day for Truth and Reconciliation',
        titleFr: 'Journée nationale de la vérité et de la réconciliation',
        description: 'No classes - Day of reflection and learning',
        start: new Date('2025-09-30'),
        end: new Date('2025-09-30'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // OCTOBER 2025 Events
    const october = [
      {
        title: 'Professional Learning Day (Provincial PD)',
        titleFr: 'Journée de perfectionnement professionnel',
        description: 'No classes - Provincial professional development',
        start: new Date('2025-10-10'),
        end: new Date('2025-10-10'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Thanksgiving Day',
        titleFr: 'Action de grâce',
        description: 'No classes - Statutory holiday',
        start: new Date('2025-10-13'),
        end: new Date('2025-10-13'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // NOVEMBER 2025 Events
    const november = [
      {
        title: 'PEITF Convention Day 1',
        titleFr: 'Convention PEITF Jour 1',
        description: 'No classes - Teachers\' convention',
        start: new Date('2025-11-06'),
        end: new Date('2025-11-06'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'PEITF Convention Day 2',
        titleFr: 'Convention PEITF Jour 2',
        description: 'No classes - Teachers\' convention',
        start: new Date('2025-11-07'),
        end: new Date('2025-11-07'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Report Card Day',
        titleFr: 'Journée des bulletins',
        description: 'No classes - Teacher administrative day for report cards',
        start: new Date('2025-11-10'),
        end: new Date('2025-11-10'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Remembrance Day',
        titleFr: 'Jour du Souvenir',
        description: 'No classes - Lest we forget',
        start: new Date('2025-11-11'),
        end: new Date('2025-11-11'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Parent-Teacher Interviews',
        titleFr: 'Rencontres parents-enseignants',
        description: 'No classes - Parent-teacher conferences K-12',
        start: new Date('2025-11-21'),
        end: new Date('2025-11-21'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // DECEMBER 2025 Events
    const december = [
      {
        title: '🎄 Last Day Before Winter Break',
        titleFr: '🎄 Dernier jour avant les vacances d\'hiver',
        description: 'Last instructional day of 2025',
        start: new Date('2025-12-19'),
        end: new Date('2025-12-19'),
        allDay: true,
        eventType: 'CUSTOM' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Winter Break Begins',
        titleFr: 'Début des vacances d\'hiver',
        description: 'No classes - Winter holidays begin',
        start: new Date('2025-12-20'),
        end: new Date('2025-12-21'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Professional Learning Day (Joint Staff)',
        titleFr: 'Journée de perfectionnement (personnel)',
        description: 'No classes - Joint staff professional development',
        start: new Date('2025-12-22'),
        end: new Date('2025-12-22'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Winter Break',
        titleFr: 'Vacances d\'hiver',
        description: 'No classes - Winter holidays',
        start: new Date('2025-12-23'),
        end: new Date('2025-12-31'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // JANUARY 2026 Events
    const january = [
      {
        title: 'New Year\'s Day',
        titleFr: 'Jour de l\'An',
        description: 'No classes - Statutory holiday',
        start: new Date('2026-01-01'),
        end: new Date('2026-01-01'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Winter Break Continues',
        titleFr: 'Vacances d\'hiver (suite)',
        description: 'No classes - Winter holidays continue',
        start: new Date('2026-01-02'),
        end: new Date('2026-01-04'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: '🎒 Back to School',
        titleFr: '🎒 Retour à l\'école',
        description: 'First instructional day of 2026',
        start: new Date('2026-01-05'),
        end: new Date('2026-01-05'),
        allDay: true,
        eventType: 'CUSTOM' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // FEBRUARY 2026 Events
    const february = [
      {
        title: 'Administrative Day (High School Only)',
        titleFr: 'Journée administrative (secondaire seulement)',
        description: 'No classes for high school only - Elementary continues',
        start: new Date('2026-02-02'),
        end: new Date('2026-02-02'),
        allDay: true,
        eventType: 'CUSTOM' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Professional Learning Day (School Goals)',
        titleFr: 'Journée de perfectionnement (objectifs scolaires)',
        description: 'No classes - School-based professional development',
        start: new Date('2026-02-13'),
        end: new Date('2026-02-13'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Islander Day',
        titleFr: 'Fête des Insulaires',
        description: 'No classes - Provincial holiday',
        start: new Date('2026-02-16'),
        end: new Date('2026-02-16'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // MARCH 2026 Events
    const march = [
      {
        title: 'Parent-Teacher Interviews (K-9)',
        titleFr: 'Rencontres parents-enseignants (M-9)',
        description: 'No classes - Parent-teacher conferences for K-9',
        start: new Date('2026-03-06'),
        end: new Date('2026-03-06'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: '🌴 March Break Begins',
        titleFr: '🌴 Début de la relâche de mars',
        description: 'No classes - Spring break week',
        start: new Date('2026-03-16'),
        end: new Date('2026-03-20'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: '🎒 Back from March Break',
        titleFr: '🎒 Retour de la relâche',
        description: 'Classes resume after March break',
        start: new Date('2026-03-23'),
        end: new Date('2026-03-23'),
        allDay: true,
        eventType: 'CUSTOM' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // APRIL 2026 Events
    const april = [
      {
        title: 'Good Friday',
        titleFr: 'Vendredi saint',
        description: 'No classes - Religious holiday',
        start: new Date('2026-04-03'),
        end: new Date('2026-04-03'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Easter Monday',
        titleFr: 'Lundi de Pâques',
        description: 'No classes - Religious holiday',
        start: new Date('2026-04-06'),
        end: new Date('2026-04-06'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Professional Learning Day (K-9)',
        titleFr: 'Journée de perfectionnement (M-9)',
        description: 'No classes - Professional development for K-9 teachers',
        start: new Date('2026-04-10'),
        end: new Date('2026-04-10'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // MAY 2026 Events
    const may = [
      {
        title: 'Area Association/CUPE Convention',
        titleFr: 'Convention CUPE',
        description: 'No classes - Staff convention',
        start: new Date('2026-05-01'),
        end: new Date('2026-05-01'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Victoria Day',
        titleFr: 'Fête de la Reine',
        description: 'No classes - National holiday',
        start: new Date('2026-05-18'),
        end: new Date('2026-05-18'),
        allDay: true,
        eventType: 'HOLIDAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // JUNE 2026 Events
    const june = [
      {
        title: 'High School Exams Begin',
        titleFr: 'Début des examens du secondaire',
        description: 'High school exam period begins',
        start: new Date('2026-06-10'),
        end: new Date('2026-06-10'),
        allDay: true,
        eventType: 'CUSTOM' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: '🎓 LAST DAY OF SCHOOL (K-9)',
        titleFr: '🎓 DERNIER JOUR D\'ÉCOLE (M-9)',
        description: 'Last day of classes for K-9 students!',
        start: new Date('2026-06-25'),
        end: new Date('2026-06-25'),
        allDay: true,
        eventType: 'CUSTOM' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Professional Learning Day (School Goals)',
        titleFr: 'Journée de perfectionnement (objectifs scolaires)',
        description: 'No classes - End of year professional development',
        start: new Date('2026-06-26'),
        end: new Date('2026-06-26'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Administrative Day',
        titleFr: 'Journée administrative',
        description: 'Teacher administrative day',
        start: new Date('2026-06-29'),
        end: new Date('2026-06-29'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      },
      {
        title: 'Last Day for Staff',
        titleFr: 'Dernier jour pour le personnel',
        description: 'Administrative day - Last day for teaching staff',
        start: new Date('2026-06-30'),
        end: new Date('2026-06-30'),
        allDay: true,
        eventType: 'PD_DAY' as const,
        source: 'SYSTEM' as const,
        teacherId: emily.id
      }
    ];
    
    // Create all events
    const allEvents = [
      ...september,
      ...october,
      ...november,
      ...december,
      ...january,
      ...february,
      ...march,
      ...april,
      ...may,
      ...june
    ];
    
    console.log(`📌 Creating ${allEvents.length} calendar events...`);
    
    for (const event of allEvents) {
      await prisma.calendarEvent.create({
        data: {
          title: event.titleFr || event.title, // Use French title for Emily's French Immersion class
          description: event.description,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          eventType: event.eventType,
          source: event.source,
          teacherId: event.teacherId
        }
      });
      console.log(`  ✅ ${event.start.toISOString().split('T')[0]}: ${event.title}`);
    }
    
    // Summary statistics
    const stats = {
      totalDays: 195,
      instructionalDays: 181,
      holidays: allEvents.filter(e => e.eventType === 'HOLIDAY').length,
      pdDays: allEvents.filter(e => e.eventType === 'PD_DAY').length,
      specialEvents: allEvents.filter(e => e.eventType === 'CUSTOM').length
    };
    
    console.log('\n📊 CALENDAR INTEGRATION COMPLETE!');
    console.log('=====================================');
    console.log(`📅 School Year: 2025-2026`);
    console.log(`📚 Total School Days: ${stats.totalDays}`);
    console.log(`✏️ Instructional Days: ${stats.instructionalDays}`);
    console.log(`🎉 Holidays: ${stats.holidays}`);
    console.log(`👩‍🏫 PD Days: ${stats.pdDays}`);
    console.log(`⭐ Special Events: ${stats.specialEvents}`);
    console.log('=====================================');
    console.log('\n✅ All PEI 2025-2026 calendar dates have been loaded!');
    console.log('✅ Emily can now see all important dates in her calendar');
    console.log('✅ Unit plans will automatically respect these dates');
    
  } catch (error) {
    console.error('❌ Error seeding calendar:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPEICalendar()
  .then(() => console.log('\n🎉 PEI Calendar seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });