import { renderTemplate } from '../src/services/newsletterGenerator';

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
});
