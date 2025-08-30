/**
 * Quick Demo Test - ETFO Student Assessment System
 * A fast 2-minute test to validate core functionality
 */

const puppeteer = require('puppeteer');

describe('ETFO Student Assessment System - Quick Demo', () => {
  let browser;
  let page;
  
  const CLIENT_URL = process.env.TEST_CLIENT_URL || 'http://localhost:5173';
  const API_URL = process.env.TEST_API_URL || 'http://localhost:3000';
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS === 'true',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });
  
  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });
  
  test('Server health check', async () => {
    const response = await page.goto(`${API_URL}/api/health`);
    expect(response.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('ok');
  });
  
  test('Client loads successfully', async () => {
    await page.goto(CLIENT_URL, { waitUntil: 'networkidle2' });
    const title = await page.title();
    expect(title).toBeTruthy();
  });
  
  test('Navigate to Students page', async () => {
    await page.goto(`${CLIENT_URL}/students`, { waitUntil: 'networkidle2' });
    
    // Check if page loaded
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Check for page header
    const pageContent = await page.content();
    expect(pageContent).toContain('Students');
    
    // Check for add student button
    const addButton = await page.$('[data-testid="add-student-btn"]');
    expect(addButton).toBeTruthy();
  });
  
  test('Navigate to Assessment page', async () => {
    await page.goto(`${CLIENT_URL}/assessment`, { waitUntil: 'networkidle2' });
    
    // Check if page loaded
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Check for page header
    const pageContent = await page.content();
    expect(pageContent).toContain('Assessment');
    
    // Check for quick assessment button
    const quickAssessmentBtn = await page.$('[data-testid="quick-assessment-btn"]');
    expect(quickAssessmentBtn).toBeTruthy();
  });
  
  test('Navigate to Artifacts page', async () => {
    await page.goto(`${CLIENT_URL}/artifacts`, { waitUntil: 'networkidle2' });
    
    // Check if page loaded
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Check for page header
    const pageContent = await page.content();
    expect(pageContent).toContain('Artifacts');
    
    // Check for upload button
    const uploadBtn = await page.$('[data-testid="upload-artifacts-btn"]');
    expect(uploadBtn).toBeTruthy();
  });
  
  test('Navigate to Analytics page', async () => {
    await page.goto(`${CLIENT_URL}/analytics`, { waitUntil: 'networkidle2' });
    
    // Check if page loaded
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Check for page header
    const pageContent = await page.content();
    expect(pageContent).toContain('Analytics');
    
    // Check for date filter
    const dateFilter = await page.$('[data-testid="date-range-filter"]');
    expect(dateFilter).toBeTruthy();
  });
  
  test('Navigate to Reports page', async () => {
    await page.goto(`${CLIENT_URL}/reports`, { waitUntil: 'networkidle2' });
    
    // Check if page loaded
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Check for page header
    const pageContent = await page.content();
    expect(pageContent).toContain('Reports');
    
    // Check for generate report button
    const generateBtn = await page.$('[data-testid="generate-report-btn"]');
    expect(generateBtn).toBeTruthy();
  });
  
  test('Add a student', async () => {
    await page.goto(`${CLIENT_URL}/students`, { waitUntil: 'networkidle2' });
    
    // Click add student button
    await page.click('[data-testid="add-student-btn"]');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    
    // Fill in student form
    await page.type('[data-testid="student-firstname"]', 'Test');
    await page.type('[data-testid="student-lastname"]', 'Student');
    await page.type('[data-testid="student-id"]', 'TEST001');
    await page.type('[data-testid="student-dob"]', '2018-01-01');
    
    // Save student
    await page.click('[data-testid="save-student-btn"]');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Verify student was added
    const pageContent = await page.content();
    expect(pageContent).toContain('Test Student');
  });
  
  test('Record an assessment', async () => {
    await page.goto(`${CLIENT_URL}/assessment`, { waitUntil: 'networkidle2' });
    
    // Click quick assessment button
    await page.click('[data-testid="quick-assessment-btn"]');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    
    // Select student
    const studentSelect = await page.$('[data-testid="assessment-student"]');
    if (studentSelect) {
      await page.select('[data-testid="assessment-student"]', 'student-');
    }
    
    // Select subject
    const subjectSelect = await page.$('[data-testid="assessment-subject"]');
    if (subjectSelect) {
      await page.select('[data-testid="assessment-subject"]', 'Français (Immersion)');
    }
    
    // Fill in expectation
    await page.type('[data-testid="assessment-expectation"]', 'Can count to 10 in French');
    
    // Select mastery level
    await page.click('[data-testid="level-meeting"]');
    
    // Select evidence type
    await page.click('[data-testid="evidence-observation"]');
    
    // Add description
    await page.type('[data-testid="assessment-description"]', 'Student demonstrated counting during circle time');
    
    // Save assessment
    await page.click('[data-testid="save-assessment-btn"]');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Verify assessment was saved
    const pageContent = await page.content();
    expect(pageContent).toContain('Recent Assessments');
  });
});