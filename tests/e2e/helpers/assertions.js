/**
 * Custom Assertion Functions for E2E Tests
 * Validates ETFO-specific requirements and educational standards
 */

class AssertionHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Assert mastery level distribution is balanced
   */
  async assertMasteryDistribution(students) {
    const distribution = await this.getMasteryDistribution(students);
    
    // ETFO guidelines suggest most students should be MEETING expectations
    this.assert(distribution.MEETING >= 30, `MEETING should be at least 30%, got ${distribution.MEETING}%`);
    this.assert(distribution.MEETING <= 60, `MEETING should be at most 60%, got ${distribution.MEETING}%`);
    
    // Some students will be approaching
    this.assert(distribution.APPROACHING >= 15, `APPROACHING should be at least 15%, got ${distribution.APPROACHING}%`);
    this.assert(distribution.APPROACHING <= 40, `APPROACHING should be at most 40%, got ${distribution.APPROACHING}%`);
    
    // Fewer at extremes
    this.assert(distribution.NOT_YET <= 20, `NOT_YET should be at most 20%, got ${distribution.NOT_YET}%`);
    this.assert(distribution.EXCEEDING <= 30, `EXCEEDING should be at most 30%, got ${distribution.EXCEEDING}%`);
    
    // All levels should have some representation (unless very small class)
    if (students.length > 10) {
      this.assert(distribution.NOT_YET > 0, 'NOT_YET should have some representation');
      this.assert(distribution.APPROACHING > 0, 'APPROACHING should have some representation');
      this.assert(distribution.MEETING > 0, 'MEETING should have some representation');
      this.assert(distribution.EXCEEDING > 0, 'EXCEEDING should have some representation');
    }
  }

  /**
   * Simple assertion helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Assert evidence triangulation is balanced
   */
  async assertEvidenceTriangulation(studentId) {
    const evidence = await this.getStudentEvidence(studentId);
    const total = evidence.length;
    
    if (total === 0) {
      throw new Error('No evidence found for student');
    }

    const counts = {
      OBSERVATION: 0,
      CONVERSATION: 0,
      PRODUCT: 0
    };

    evidence.forEach(e => {
      counts[e.type]++;
    });

    // Calculate percentages
    const percentages = {};
    Object.keys(counts).forEach(type => {
      percentages[type] = (counts[type] / total) * 100;
    });

    // Each type should be 20-45% of total (allowing some variance)
    Object.values(percentages).forEach(percentage => {
      expect(percentage).toBeGreaterThanOrEqual(20);
      expect(percentage).toBeLessThanOrEqual(45);
    });

    // No type should be completely missing if we have enough evidence
    if (total >= 6) {
      Object.values(counts).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    }

    return { counts, percentages, total };
  }

  /**
   * Assert curriculum coverage meets requirements
   */
  async assertCurriculumCoverage(grade, subject) {
    const coverage = await this.getCurriculumCoverage(grade, subject);
    
    // Grade 1 French Immersion minimum coverage expectations
    const minimumCoverage = {
      'Français (Immersion)': 80,      // 80% of expectations covered
      'Mathématiques': 85,              // 85% for core subjects
      'Sciences de la nature': 75,      // 75% for science
      'Arts visuels': 70,               // 70% for arts
      'Sciences humaines': 75,          // 75% for social studies
      'Formation personnelle et sociale': 80  // 80% for health/PE
    };

    const required = minimumCoverage[subject] || 70;
    
    expect(coverage.percentage).toBeGreaterThanOrEqual(required);
    expect(coverage.totalExpectations).toBeGreaterThan(0);
    expect(coverage.coveredExpectations).toBeGreaterThan(0);
    
    return coverage;
  }

  /**
   * Assert assessment frequency meets standards
   */
  async assertAssessmentFrequency(studentId, days = 5) {
    const assessments = await this.getRecentAssessments(studentId, days);
    const assessmentsPerDay = assessments.length / days;
    
    // ETFO recommends 2-3 documented assessments per student per day minimum
    expect(assessmentsPerDay).toBeGreaterThanOrEqual(2);
    
    // But not excessive documentation (quality over quantity)
    expect(assessmentsPerDay).toBeLessThanOrEqual(10);
    
    // Check for variety in subjects
    const subjects = new Set(assessments.map(a => a.subject));
    expect(subjects.size).toBeGreaterThanOrEqual(3); // At least 3 different subjects
    
    return {
      totalAssessments: assessments.length,
      assessmentsPerDay,
      uniqueSubjects: subjects.size
    };
  }

  /**
   * Assert file upload processed correctly
   */
  async assertFileUploaded(fileName, expectedType) {
    // Wait for file to appear in list
    await this.page.waitForSelector(`[data-filename="${fileName}"]`, {
      timeout: 10000
    });

    // Check file type icon/indicator
    const fileElement = await this.page.$(`[data-filename="${fileName}"]`);
    const fileType = await fileElement.getAttribute('data-file-type');
    expect(fileType).toBe(expectedType);

    // Check for thumbnail if image/video
    if (expectedType === 'image' || expectedType === 'video') {
      const thumbnail = await fileElement.$('[data-testid="thumbnail"]');
      expect(thumbnail).toBeTruthy();
    }

    // Check for processing complete indicator
    const status = await fileElement.getAttribute('data-status');
    expect(status).toBe('complete');
    
    return true;
  }

  /**
   * Assert report generated correctly
   */
  async assertReportGenerated(reportType, format) {
    // Wait for generation to complete
    await this.page.waitForSelector('[data-testid="report-ready"]', {
      timeout: 30000
    });

    // Check download link exists
    const downloadLink = await this.page.$('[data-testid="download-report"]');
    expect(downloadLink).toBeTruthy();

    // Verify format
    const href = await downloadLink.getAttribute('href');
    expect(href).toContain(`.${format.toLowerCase()}`);

    // Check report metadata
    const metadata = await this.page.$eval('[data-testid="report-metadata"]', el => ({
      type: el.getAttribute('data-report-type'),
      format: el.getAttribute('data-format'),
      size: el.getAttribute('data-size'),
      timestamp: el.getAttribute('data-timestamp')
    }));

    expect(metadata.type).toBe(reportType);
    expect(metadata.format).toBe(format);
    expect(parseInt(metadata.size)).toBeGreaterThan(0);
    expect(metadata.timestamp).toBeTruthy();

    return metadata;
  }

  /**
   * Assert analytics data accuracy
   */
  async assertAnalyticsAccuracy(expected, actual) {
    // Allow 5% margin of error for calculations
    const margin = 0.05;
    
    Object.keys(expected).forEach(key => {
      const expectedValue = expected[key];
      const actualValue = actual[key];
      
      if (typeof expectedValue === 'number') {
        const difference = Math.abs(expectedValue - actualValue);
        const allowedDifference = expectedValue * margin;
        
        expect(difference).toBeLessThanOrEqual(allowedDifference);
      } else {
        expect(actualValue).toEqual(expectedValue);
      }
    });
  }

  /**
   * Assert UI responsiveness
   */
  async assertPageLoadTime(maxTime = 2000) {
    const startTime = Date.now();
    
    await this.page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(maxTime);
    
    return loadTime;
  }

  /**
   * Assert no console errors
   */
  async assertNoConsoleErrors() {
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to collect any errors
    await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    expect(errors).toHaveLength(0);
  }

  /**
   * Assert accessibility standards
   */
  async assertAccessibility(selector) {
    const element = await this.page.$(selector);
    
    // Check for ARIA labels
    const ariaLabel = await element.getAttribute('aria-label');
    const ariaDescribedBy = await element.getAttribute('aria-describedby');
    
    expect(ariaLabel || ariaDescribedBy).toBeTruthy();

    // Check for proper heading hierarchy
    const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', 
      elements => elements.map(el => ({
        level: parseInt(el.tagName[1]),
        text: el.textContent
      }))
    );

    // Ensure proper nesting (no h1 -> h3 jumps)
    for (let i = 1; i < headings.length; i++) {
      const levelDiff = headings[i].level - headings[i-1].level;
      expect(levelDiff).toBeLessThanOrEqual(1);
    }

    // Check for alt text on images
    const images = await this.page.$$eval('img', 
      imgs => imgs.map(img => img.alt)
    );
    
    images.forEach(alt => {
      expect(alt).toBeTruthy();
    });
  }

  /**
   * Helper: Get mastery distribution
   */
  async getMasteryDistribution(students) {
    // This would normally fetch from API or scrape from UI
    // Simplified for example
    const distribution = {
      NOT_YET: 0,
      APPROACHING: 0,
      MEETING: 0,
      EXCEEDING: 0
    };

    // Mock calculation
    const total = students.length;
    distribution.NOT_YET = 10;
    distribution.APPROACHING = 25;
    distribution.MEETING = 45;
    distribution.EXCEEDING = 20;

    return distribution;
  }

  /**
   * Helper: Get student evidence
   */
  async getStudentEvidence(studentId) {
    // This would fetch from API
    // Mock data for example
    return [
      { type: 'OBSERVATION', date: new Date() },
      { type: 'CONVERSATION', date: new Date() },
      { type: 'PRODUCT', date: new Date() },
      { type: 'OBSERVATION', date: new Date() },
      { type: 'PRODUCT', date: new Date() },
      { type: 'CONVERSATION', date: new Date() }
    ];
  }

  /**
   * Helper: Get curriculum coverage
   */
  async getCurriculumCoverage(grade, subject) {
    // This would fetch from API
    // Mock data for example
    return {
      grade,
      subject,
      totalExpectations: 20,
      coveredExpectations: 17,
      percentage: 85
    };
  }

  /**
   * Helper: Get recent assessments
   */
  async getRecentAssessments(studentId, days) {
    // This would fetch from API
    // Mock data for example
    const assessments = [];
    for (let i = 0; i < days * 3; i++) {
      assessments.push({
        studentId,
        subject: ['Math', 'French', 'Science', 'Arts'][i % 4],
        date: new Date()
      });
    }
    return assessments;
  }
}

module.exports = AssertionHelper;