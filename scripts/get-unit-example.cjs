#!/usr/bin/env node
const { PrismaClient } = require('@teaching-engine/database');

async function getFullUnitExample() {
  const prisma = new PrismaClient();
  
  try {
    const unit = await prisma.unitPlan.findFirst({
      where: { title: 'Fondations des nombres' },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });
    
    if (!unit) {
      console.log('Unit not found');
      return;
    }
    
    console.log('FULL UNIT DATA FOR PROMPT DESIGN:');
    console.log('='.repeat(60));
    console.log(JSON.stringify({
      id: unit.id,
      title: unit.title,
      subject: unit.longRangePlan.subject,
      startDate: unit.startDate,
      endDate: unit.endDate,
      description: unit.description,
      culminatingTask: unit.culminatingTask,
      bigIdeas: unit.bigIdeas,
      essentialQuestions: unit.essentialQuestions,
      keyVocabulary: unit.keyVocabulary,
      expectations: unit.expectations.map(e => ({
        code: e.expectation.code,
        title: e.expectation.title,
        description: e.expectation.description,
        subject: e.expectation.subject
      }))
    }, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getFullUnitExample();