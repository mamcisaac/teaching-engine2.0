// Minimal test without React imports
import { logger } from './utils/logger';

logger.info('Starting simple test...');

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = '<div style="color: blue; padding: 20px;"><h1>Module loading works!</h1><p>This is from main-simple.tsx</p></div>';
  logger.info('DOM updated');
} else {
  logger.error('Root element not found');
}

export {}; // Make this a module