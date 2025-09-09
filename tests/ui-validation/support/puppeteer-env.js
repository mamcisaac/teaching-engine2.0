const NodeEnvironment = require('jest-environment-node').TestEnvironment;
const puppeteer = require('puppeteer');

class PuppeteerEnv extends NodeEnvironment {
  async setup() {
    await super.setup();
    
    // Share one browser instance across all tests
    if (!this.global.__BROWSER__) {
      this.global.__BROWSER__ = await puppeteer.launch({
        headless: process.env.PUPPETEER_HEADLESS !== 'false',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    this.global.browser = this.global.__BROWSER__;
  }

  async teardown() {
    // Close browser to prevent Jest from not exiting
    if (this.global.__BROWSER__) {
      await this.global.__BROWSER__.close();
      this.global.__BROWSER__ = undefined;
    }
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = PuppeteerEnv;