/**
 * Simple Assertion Helper for E2E Tests
 * Provides basic assertion functionality without Jest dependency
 */

class SimpleAssertionHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Basic assertion method
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Assert element exists
   */
  async assertElementExists(selector) {
    const element = await this.page.$(selector);
    this.assert(element !== null, `Element not found: ${selector}`);
    return element;
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(selector, expectedText) {
    const element = await this.assertElementExists(selector);
    const text = await element.textContent();
    this.assert(
      text.includes(expectedText), 
      `Element ${selector} does not contain text "${expectedText}". Found: "${text}"`
    );
  }

  /**
   * Assert page title
   */
  async assertTitle(expectedTitle) {
    const title = await this.page.title();
    this.assert(
      title === expectedTitle,
      `Page title mismatch. Expected: "${expectedTitle}", Got: "${title}"`
    );
  }

  /**
   * Assert URL contains string
   */
  async assertUrlContains(expectedString) {
    const url = this.page.url();
    this.assert(
      url.includes(expectedString),
      `URL does not contain "${expectedString}". Current URL: ${url}`
    );
  }

  /**
   * Assert element is visible
   */
  async assertVisible(selector) {
    const isVisible = await this.page.isVisible(selector);
    this.assert(isVisible, `Element is not visible: ${selector}`);
  }

  /**
   * Assert element is hidden
   */
  async assertHidden(selector) {
    const isVisible = await this.page.isVisible(selector);
    this.assert(!isVisible, `Element is visible but should be hidden: ${selector}`);
  }

  /**
   * Assert value equals
   */
  assertEquals(actual, expected, message = '') {
    this.assert(
      actual === expected,
      `${message} Expected: ${expected}, Got: ${actual}`
    );
  }

  /**
   * Assert value is greater than
   */
  assertGreaterThan(actual, expected, message = '') {
    this.assert(
      actual > expected,
      `${message} Expected ${actual} to be greater than ${expected}`
    );
  }

  /**
   * Assert value is less than
   */
  assertLessThan(actual, expected, message = '') {
    this.assert(
      actual < expected,
      `${message} Expected ${actual} to be less than ${expected}`
    );
  }

  /**
   * Assert value is between (inclusive)
   */
  assertBetween(actual, min, max, message = '') {
    this.assert(
      actual >= min && actual <= max,
      `${message} Expected ${actual} to be between ${min} and ${max}`
    );
  }

  /**
   * Assert array contains value
   */
  assertArrayContains(array, value, message = '') {
    this.assert(
      array.includes(value),
      `${message} Array does not contain value: ${value}`
    );
  }

  /**
   * Assert object has property
   */
  assertHasProperty(obj, property, message = '') {
    this.assert(
      property in obj,
      `${message} Object does not have property: ${property}`
    );
  }

  /**
   * Assert mastery distribution is balanced (ETFO specific)
   */
  async assertMasteryDistribution(distribution) {
    // ETFO guidelines suggest most students should be MEETING expectations
    this.assertBetween(distribution.MEETING, 30, 60, 'MEETING percentage');
    
    // Some students will be approaching
    this.assertBetween(distribution.APPROACHING, 15, 40, 'APPROACHING percentage');
    
    // Fewer at extremes
    this.assertLessThan(distribution.NOT_YET, 20, 'NOT_YET percentage');
    this.assertLessThan(distribution.EXCEEDING, 30, 'EXCEEDING percentage');
  }

  /**
   * Assert evidence triangulation is balanced
   */
  async assertEvidenceTriangulation(evidence) {
    const total = evidence.observation + evidence.conversation + evidence.product;
    
    if (total === 0) {
      throw new Error('No evidence found');
    }
    
    // Each type should be 20-45% of total (allowing some flexibility)
    const observationPercent = (evidence.observation / total) * 100;
    const conversationPercent = (evidence.conversation / total) * 100;
    const productPercent = (evidence.product / total) * 100;
    
    this.assertBetween(observationPercent, 20, 45, 'Observation percentage');
    this.assertBetween(conversationPercent, 20, 45, 'Conversation percentage');
    this.assertBetween(productPercent, 20, 45, 'Product percentage');
  }

  /**
   * Assert French language support
   */
  async assertFrenchContent(selector) {
    const element = await this.assertElementExists(selector);
    const text = await element.textContent();
    
    // Check for common French characters and words
    const hasFrenchChars = /[àâäçèéêëîïôùûü]/i.test(text);
    const hasFrenchWords = /(le|la|les|de|du|des|un|une|et|ou|avec|pour)/i.test(text);
    
    this.assert(
      hasFrenchChars || hasFrenchWords,
      `Element ${selector} does not appear to contain French content`
    );
  }

  /**
   * Wait for success message
   */
  async waitForSuccess() {
    try {
      await this.page.waitForSelector('[data-testid="success-message"], .success-message, .toast-success', {
        timeout: 5000
      });
      return true;
    } catch (error) {
      console.warn('No success message found, continuing...');
      return false;
    }
  }

  /**
   * Check if element exists
   */
  async exists(selector) {
    const element = await this.page.$(selector);
    return element !== null;
  }
}

module.exports = SimpleAssertionHelper;