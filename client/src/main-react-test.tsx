// Test React imports step by step
import { logger } from './utils/logger';

logger.info('Starting React test...');

try {
  logger.info('Importing React...');
  import('react').then((React) => {
    logger.info('React imported successfully', { hasReact: !!React });
    
    import('react-dom/client').then((ReactDOM) => {
      logger.info('ReactDOM imported successfully', { hasReactDOM: !!ReactDOM });
      
      const rootElement = document.getElementById('root');
      if (rootElement && ReactDOM.createRoot) {
        logger.info('Creating React root...');
        const root = ReactDOM.createRoot(rootElement);
        
        logger.info('Rendering simple React element...');
        root.render(React.createElement('div', { 
          style: { color: 'green', padding: '20px' } 
        }, React.createElement('h1', null, 'React Works!'), 
           React.createElement('p', null, 'React and ReactDOM loaded successfully')));
        
        logger.info('React element rendered');
      } else {
        logger.error('Root element or createRoot not found');
      }
    }).catch(error => {
      logger.error('ReactDOM import failed', error);
    });
  }).catch(error => {
    logger.error('React import failed', error);
  });
} catch (error) {
  logger.error('Import error', error);
}

export {};