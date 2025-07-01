/**
 * Mock for pdf-parse library
 */
export default jest.fn().mockImplementation(() =>
  Promise.resolve({
    numpages: 1,
    numrender: 1,
    info: {
      PDFFormatVersion: '1.4',
      IsAcroFormPresent: false,
      IsXFAPresent: false,
    },
    metadata: null,
    version: '1.10.100',
    text: 'Mock PDF content for testing purposes',
  }),
);
