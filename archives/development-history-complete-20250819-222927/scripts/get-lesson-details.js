import { PrismaClient } from './packages/database/dist/index.js';

const prisma = new PrismaClient();

const lessonIds = [
  "cmef0b1cu0001vj43jvi7qtz2",
  "cmef0b1cx0003vj433uqee6mu",
  "cmef0b1d00005vj438ukh71hv",
  "cmef0b1d20007vj43g0a7flzl",
  "cmef0b1d30009vj439u70p8qf",
  "cmef0b1d5000bvj43ktx7374f",
  "cmef0b1d6000dvj43sanjwsmt",
  "cmef0b1d7000fvj43tvzcs6pj",
  "cmef0b1d8000hvj438yhjvnlc",
  "cmef0b1da000jvj43omek3uma",
  "cmef0b1db000lvj430kk9usji",
  "cmef0b1dd000nvj43za3niyfv"
];

async function getLessonDetails() {
  try {
    console.log('Getting details for first lesson:');
    
    const lesson = await prisma.eTFOLessonPlan.findUnique({
      where: {
        id: lessonIds[0]
      }
    });

    console.log(JSON.stringify(lesson, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getLessonDetails();