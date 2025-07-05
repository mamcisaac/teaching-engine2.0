/**
 * Puppeteer Mock for Testing
 * Provides mock implementations for Puppeteer browser automation
 */

const mockPage = {
  goto: jest.fn().mockResolvedValue(undefined),
  setContent: jest.fn().mockResolvedValue(undefined),
  pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
  close: jest.fn().mockResolvedValue(undefined),
  screenshot: jest.fn().mockResolvedValue(Buffer.from('fake-screenshot')),
  evaluate: jest.fn().mockResolvedValue({}),
  setViewport: jest.fn().mockResolvedValue(undefined),
  emulateMediaType: jest.fn().mockResolvedValue(undefined),
  waitForLoadState: jest.fn().mockResolvedValue(undefined),
  locator: jest.fn().mockReturnValue({
    textContent: jest.fn().mockResolvedValue('Mock text'),
    click: jest.fn().mockResolvedValue(undefined),
    fill: jest.fn().mockResolvedValue(undefined),
  }),
};

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined),
  pages: jest.fn().mockResolvedValue([mockPage]),
  version: jest.fn().mockReturnValue('MockBrowser/1.0.0'),
  userAgent: jest.fn().mockResolvedValue('MockUserAgent/1.0.0'),
};

const puppeteerMock = {
  launch: jest.fn().mockResolvedValue(mockBrowser),
  connect: jest.fn().mockResolvedValue(mockBrowser),
  createBrowserFetcher: jest.fn().mockReturnValue({
    download: jest.fn().mockResolvedValue('mock-revision'),
    localRevisions: jest.fn().mockReturnValue(['mock-revision']),
  }),
  executablePath: jest.fn().mockReturnValue('/mock/path/chrome'),
  defaultArgs: jest.fn().mockReturnValue(['--mock-arg']),
  
  // Common page methods
  Page: jest.fn(),
  Browser: jest.fn(),
  
  // Export the mock instances for direct access in tests
  mockBrowser,
  mockPage,
};

// Default export for ES modules
export default puppeteerMock;

// Named exports for CommonJS compatibility
export const launch = puppeteerMock.launch;
export const connect = puppeteerMock.connect;
export const createBrowserFetcher = puppeteerMock.createBrowserFetcher;
export const executablePath = puppeteerMock.executablePath;
export const defaultArgs = puppeteerMock.defaultArgs;
export const Page = puppeteerMock.Page;
export const Browser = puppeteerMock.Browser;

// For direct import access
export { mockBrowser, mockPage };

// CommonJS compatibility
module.exports = puppeteerMock;