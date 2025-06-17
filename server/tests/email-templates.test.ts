import { describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { prisma } from '../src/prisma';
import { getTestEmailService, resetTestEmailService } from './helpers/testEmailService';
import { generateTestEmail, expectEmailContent } from './helpers/emailTestHelper';
import { renderTemplate, NewsletterTemplate } from '../src/services/newsletterGenerator';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../src/index';
import { setEmailHandler, clearEmailHandler } from '../src/services/emailService';

describe('Email Template Tests', () => {
  let testEmailService: ReturnType<typeof getTestEmailService>;
  let teacherToken: string;
  let testUser: {
    email: string;
    password: string;
    name: string;
    role: 'teacher';
  };

  beforeAll(async () => {
    testEmailService = getTestEmailService();
    
    // Set up email handler to capture emails in tests
    setEmailHandler(async (to, subject, text, html, attachment) => {
      await testEmailService.sendEmail(to, subject, text, html, attachment ? {
        filename: attachment.filename,
        content: attachment.content
      } : undefined);
    });
    
    // Create test user
    const id = randomBytes(4).toString('hex');
    testUser = {
      email: `teacher-${id}@example.com`,
      password: `password-${id}`,
      name: `Teacher ${id}`,
      role: 'teacher',
    };
    
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        role: testUser.role,
      },
    });
    
    // Get auth token
    const loginRes = await request(app)
      .post('/api/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });
    
    teacherToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await resetTestEmailService();
    clearEmailHandler();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await testEmailService.clearEmails();
    await prisma.parentContact.deleteMany();
    await prisma.newsletter.deleteMany();
  });

  describe('Newsletter Template Rendering', () => {
    const testTemplateData = {
      title: 'Weekly Newsletter - March 15, 2024',
      content: `
        <h2>This Week's Highlights</h2>
        <p>We had an amazing week filled with learning and fun activities!</p>
        
        <h3>Math Adventures</h3>
        <p>Students explored multiplication through hands-on activities.</p>
        
        <h3>Science Discovery</h3>
        <p>We learned about the water cycle and conducted exciting experiments.</p>
        
        <h3>Upcoming Events</h3>
        <ul>
          <li>Parent-Teacher Conferences: March 20-22</li>
          <li>Spring Break: March 25-29</li>
          <li>Science Fair: April 5</li>
        </ul>
      `,
    };

    it('renders weekly template correctly', async () => {
      const renderedHtml = renderTemplate('weekly', testTemplateData);
      
      expect(renderedHtml).toContain(testTemplateData.title);
      expect(renderedHtml).toContain('Math Adventures');
      expect(renderedHtml).toContain('Science Discovery');
      expect(renderedHtml).toContain('Parent-Teacher Conferences');
      
      // Check for proper HTML structure
      expect(renderedHtml).toContain('<html>');
      expect(renderedHtml).toContain('<body>');
      expect(renderedHtml).toContain('</html>');
      
      // Check for styling
      expect(renderedHtml).toContain('<style>');
      expect(renderedHtml).toMatch(/font-family.*Arial|Helvetica|sans-serif/);
    });

    it('renders monthly template correctly', async () => {
      const monthlyData = {
        title: 'Monthly Newsletter - March 2024',
        content: `
          <h2>March Summary</h2>
          <p>A comprehensive look at our month's achievements.</p>
          
          <h3>Academic Progress</h3>
          <p>Students showed significant improvement in reading comprehension.</p>
          
          <h3>Special Events</h3>
          <p>We celebrated Dr. Seuss Day and Pi Day with themed activities.</p>
        `,
      };

      const renderedHtml = renderTemplate('monthly', monthlyData);
      
      expect(renderedHtml).toContain('Monthly Newsletter - March 2024');
      expect(renderedHtml).toContain('Academic Progress');
      expect(renderedHtml).toContain('Special Events');
      
      // Monthly template should have different styling than weekly
      expect(renderedHtml).toContain('<html>');
      expect(renderedHtml).toContain('<style>');
    });

    it('renders template with custom content correctly', async () => {
      const customData = {
        title: 'Daily Update - March 15, 2024',
        content: `
          <h2>Today's Activities</h2>
          <p>Here's what we accomplished today:</p>
          
          <h3>Morning Circle</h3>
          <p>We discussed the weather and practiced calendar skills.</p>
          
          <h3>Learning Centers</h3>
          <p>Students rotated through reading, math, and art centers.</p>
          
          <h3>Outdoor Time</h3>
          <p>We enjoyed fresh air and physical activity on the playground.</p>
        `,
      };

      const renderedHtml = renderTemplate('weekly', customData);
      
      expect(renderedHtml).toContain('Daily Update - March 15, 2024');
      expect(renderedHtml).toContain('Morning Circle');
      expect(renderedHtml).toContain('Learning Centers');
      expect(renderedHtml).toContain('Outdoor Time');
    });

    it('handles invalid template names gracefully', () => {
      expect(() => {
        renderTemplate('invalid-template' as NewsletterTemplate, testTemplateData);
      }).toThrow('Invalid template');
    });

    it('handles empty content gracefully', async () => {
      const emptyData = {
        title: 'Empty Newsletter',
        content: '',
      };

      const renderedHtml = renderTemplate('weekly', emptyData);
      
      expect(renderedHtml).toContain('Empty Newsletter');
      expect(renderedHtml).toContain('<html>');
      expect(renderedHtml).toContain('<body>');
    });

    it('escapes dangerous HTML in title', async () => {
      const dangerousData = {
        title: 'Security Test <script>alert("xss")</script>',
        content: `
          <h2>Safe Content</h2>
          <p>This is normal paragraph content.</p>
        `,
      };

      const renderedHtml = renderTemplate('weekly', dangerousData);
      
      // Title should be escaped
      expect(renderedHtml).toContain('Security Test &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(renderedHtml).not.toContain('<script>alert("xss")</script>');
      
      // Content should be preserved as HTML
      expect(renderedHtml).toContain('<h2>Safe Content</h2>');
    });

    it('preserves HTML formatting in content', async () => {
      const formattedData = {
        title: 'Formatted Newsletter',
        content: `
          <h2>Bold and <em>Italic</em> Text</h2>
          <p>This paragraph has <strong>bold</strong> and <em>italic</em> text.</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2 with <a href="https://example.com">a link</a></li>
          </ul>
          <blockquote>
            "Education is the most powerful weapon which you can use to change the world."
          </blockquote>
        `,
      };

      const renderedHtml = renderTemplate('weekly', formattedData);
      
      expect(renderedHtml).toContain('<strong>bold</strong>');
      expect(renderedHtml).toContain('<em>italic</em>');
      expect(renderedHtml).toContain('<ul>');
      expect(renderedHtml).toContain('<li>');
      expect(renderedHtml).toContain('<a href="https://example.com">');
      expect(renderedHtml).toContain('<blockquote>');
    });
  });

  describe('Email Template Integration with Newsletter Sending', () => {
    it('sends newsletter with weekly template and verifies rendering', async () => {
      // Create parent contact
      const parentContact = await prisma.parentContact.create({
        data: {
          name: 'Template Parent',
          email: generateTestEmail(),
          studentName: 'Template Student',
        },
      });

      // Create newsletter using weekly template
      const newsletterData = {
        title: 'Weekly Template Test',
        content: `
          <h2>Weekly Highlights</h2>
          <p>This newsletter tests template rendering in emails.</p>
          <h3>Academic Updates</h3>
          <p>Students are making great progress in all subjects.</p>
        `,
        template: 'weekly',
      };

      const createRes = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(newsletterData);

      expect(createRes.status).toBe(201);
      const newsletterId = createRes.body.id;

      // Send the newsletter
      const sendRes = await request(app)
        .post(`/api/newsletters/${newsletterId}/send`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.sent).toBe(1);

      // Verify email was sent with proper template rendering
      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);

      const email = emails[0];
      expectEmailContent(email, {
        to: [parentContact.email],
        subject: 'Weekly Template Test',
      });

      // Verify the attachment contains the rendered template
      expect(email.attachments).toHaveLength(1);
      const attachment = email.attachments![0];
      expect(attachment.filename).toBe('newsletter.pdf');
      expect(attachment.content.length).toBeGreaterThan(0);
    });

    it('generates newsletter with template and sends it', async () => {
      // Create some test data for newsletter generation
      const subject = await prisma.subject.create({
        data: { name: 'Test Subject' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Test Milestone',
          subjectId: subject.id,
        },
      });

      const user = await prisma.user.findFirst({ where: { email: testUser.email } });
      await prisma.activity.create({
        data: {
          title: 'Test Activity',
          milestoneId: milestone.id,
          userId: user?.id,
        },
      });

      // Create parent contact
      const parentContact = await prisma.parentContact.create({
        data: {
          name: 'Generated Parent',
          email: generateTestEmail(),
          studentName: 'Generated Student',
        },
      });

      // Generate newsletter
      const generateRes = await request(app)
        .post('/api/newsletters/generate')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          startDate: '2024-03-11T00:00:00.000Z',
          endDate: '2024-03-15T23:59:59.999Z',
          template: 'weekly',
          includePhotos: false,
        });

      expect(generateRes.status).toBe(201);
      const newsletterId = generateRes.body.id;

      // Send the generated newsletter
      const sendRes = await request(app)
        .post(`/api/newsletters/${newsletterId}/send`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.sent).toBe(1);

      // Verify email was sent
      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);

      const email = emails[0];
      expect(email.to).toContain(parentContact.email);
      expect(email.attachments).toHaveLength(1);
    });
  });

  describe('Template Performance and Edge Cases', () => {
    it('handles large content efficiently', async () => {
      // Generate large content
      const largeContent = Array(1000)
        .fill(0)
        .map((_, i) => `<p>This is paragraph ${i + 1} with some content.</p>`)
        .join('\n');

      const largeData = {
        title: 'Large Newsletter',
        content: largeContent,
      };

      const startTime = Date.now();
      const renderedHtml = renderTemplate('weekly', largeData);
      const endTime = Date.now();

      expect(renderedHtml).toContain('Large Newsletter');
      expect(renderedHtml).toContain('paragraph 1');
      expect(renderedHtml).toContain('paragraph 1000');
      
      // Should render quickly (less than 1 second for 1000 paragraphs)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('handles special characters in templates', async () => {
      const specialCharData = {
        title: 'Spécial Chäractërs & Émojis 🎉',
        content: `
          <h2>Français: àáâãäåæçèéêëìíîïñòóôõöøùúûüý</h2>
          <p>Español: ¡¿ñáéíóúü!</p>
          <p>Symbols: &amp; &lt; &gt; &quot; &apos;</p>
          <p>Emojis: 📚 ✏️ 🎨 🔬 🏫</p>
        `,
      };

      const renderedHtml = renderTemplate('weekly', specialCharData);
      
      expect(renderedHtml).toContain('Spécial Chäractërs');
      expect(renderedHtml).toContain('🎉');
      expect(renderedHtml).toContain('àáâãäåæçèéêë');
      expect(renderedHtml).toContain('📚');
    });

    it('maintains template consistency across multiple renders', async () => {
      const testData = {
        title: 'Consistency Test',
        content: '<p>Same content every time</p>',
      };

      const render1 = renderTemplate('weekly', testData);
      const render2 = renderTemplate('weekly', testData);
      const render3 = renderTemplate('weekly', testData);

      expect(render1).toBe(render2);
      expect(render2).toBe(render3);
    });
  });
});