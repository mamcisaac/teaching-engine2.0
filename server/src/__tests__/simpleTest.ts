/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import logger from '../logger.js';

logger.info('Simple test running');

function simpleTest() {
  logger.debug('Test function called');
  return 1 + 1;
}

const result = simpleTest();
logger.info('Test result:', result);

if (result === 2) {
  logger.info('Test passed!');
  process.exit(0);
} else {
  logger.error('Test failed!');
  process.exit(1);
}
