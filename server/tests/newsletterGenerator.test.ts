import { renderTemplate, generateNewsletterDraft } from '../src/services/newsletterGenerator';
import { prisma } from '../src/prisma';

describe('newsletter template renderer', () => {
  it('renders weekly and monthly templates', () => {
    const weekly = renderTemplate('weekly', { title: 'T', content: 'C' });
    const monthly = renderTemplate('monthly', { title: 'T', content: 'C' });
    expect(weekly).toContain('T');
    expect(monthly).toContain('T');
  });

  it('throws on invalid template name', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => renderTemplate('bad' as any, { title: 'T', content: 'C' })).toThrow(
      'Invalid template',
    );
  });

  it('includes progress summary in draft', async () => {
    await prisma.newsletter.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();

    const subj = await prisma.subject.create({ data: { name: 'Prog' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M', subjectId: subj.id },
    });
    await prisma.activity.create({
      data: { title: 'A', milestoneId: milestone.id, completedAt: new Date() },
    });

    const draft = await generateNewsletterDraft('2024-01-01', '2024-01-07');
    expect(draft.content).toContain('Progress');
  });
});
