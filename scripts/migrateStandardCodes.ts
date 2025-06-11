import { prisma } from '@teaching-engine/database';

async function main() {
  const milestones = await prisma.milestone.findMany();
  for (const m of milestones) {
    const codes: string[] = Array.isArray(m.standardCodes)
      ? (m.standardCodes as unknown as string[])
      : [];
    for (const code of codes) {
      const outcome = await prisma.outcome.upsert({
        where: { code },
        update: {},
        create: { subject: 'FRA', grade: 1, code, description: '' },
      });
      await prisma.milestoneOutcome
        .create({
          data: { milestoneId: m.id, outcomeId: outcome.id },
        })
        .catch(() => {});
    }
    if (codes.length > 0) {
      await prisma.milestone.update({
        where: { id: m.id },
        data: { standardCodes: [] },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
