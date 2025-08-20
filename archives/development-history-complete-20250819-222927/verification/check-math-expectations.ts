import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMathExpectations() {
  try {
    // Get all Grade 1 Math expectations
    const mathExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1
      },
      orderBy: {
        code: 'asc'
      }
    });

    console.log('=== ALL GRADE 1 MATH EXPECTATIONS ===\n');
    console.log(`Total Expectations: ${mathExpectations.length}\n`);

    // Group by strand
    const byStrand: { [key: string]: any[] } = {};
    mathExpectations.forEach(exp => {
      const strand = exp.strand || 'Unknown';
      if (!byStrand[strand]) byStrand[strand] = [];
      byStrand[strand].push(exp);
    });

    Object.keys(byStrand).forEach(strand => {
      console.log(`\n--- ${strand} (${byStrand[strand].length} expectations) ---`);
      byStrand[strand].forEach(exp => {
        console.log(`${exp.code}: ${exp.description.substring(0, 80)}...`);
      });
    });

    // Look for data-related expectations
    console.log('\n=== POTENTIAL DATA/GRAPHING EXPECTATIONS ===');
    const dataKeywords = ['data', 'graph', 'chart', 'sort', 'classify', 'organize', 'collect', 'trier', 'classer', 'organiser', 'donnée', 'graphique', 'diagramme'];
    
    mathExpectations.forEach(exp => {
      const desc = exp.description.toLowerCase();
      if (dataKeywords.some(keyword => desc.includes(keyword))) {
        console.log(`\n${exp.code}: ${exp.description}`);
        console.log(`ID: ${exp.id}`);
        console.log(`Strand: ${exp.strand}`);
      }
    });

    // Check which expectations are already assigned
    const unitExpectations = await prisma.unitPlanExpectation.findMany({
      where: {
        unitPlan: {
          longRangePlanId: 'cmebyc98k0003vjr1svziz0in'
        }
      },
      include: {
        expectation: true
      }
    });

    const assignedIds = new Set(unitExpectations.map(ue => ue.expectationId));
    
    console.log('\n=== UNASSIGNED EXPECTATIONS ===');
    const unassigned = mathExpectations.filter(exp => !assignedIds.has(exp.id));
    if (unassigned.length === 0) {
      console.log('All expectations are already assigned to units!');
    } else {
      unassigned.forEach(exp => {
        console.log(`\n${exp.code}: ${exp.description}`);
        console.log(`ID: ${exp.id}`);
      });
    }

  } catch (error) {
    console.error('Error checking expectations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMathExpectations();