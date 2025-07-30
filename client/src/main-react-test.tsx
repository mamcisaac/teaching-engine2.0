// Test React imports step by step
console.log('[main-react-test.tsx] Starting...');

try {
  console.log('[main-react-test.tsx] Importing React...');
  import('react').then((React) => {
    console.log('[main-react-test.tsx] React imported successfully:', React);
    
    import('react-dom/client').then((ReactDOM) => {
      console.log('[main-react-test.tsx] ReactDOM imported successfully:', ReactDOM);
      
      const rootElement = document.getElementById('root');
      if (rootElement && ReactDOM.createRoot) {
        console.log('[main-react-test.tsx] Creating React root...');
        const root = ReactDOM.createRoot(rootElement);
        
        console.log('[main-react-test.tsx] Rendering simple React element...');
        root.render(React.createElement('div', { 
          style: { color: 'green', padding: '20px' } 
        }, React.createElement('h1', null, 'React Works!'), 
           React.createElement('p', null, 'React and ReactDOM loaded successfully')));
        
        console.log('[main-react-test.tsx] React element rendered');
      } else {
        console.error('[main-react-test.tsx] Root element or createRoot not found');
      }
    }).catch(error => {
      console.error('[main-react-test.tsx] ReactDOM import failed:', error);
    });
  }).catch(error => {
    console.error('[main-react-test.tsx] React import failed:', error);
  });
} catch (error) {
  console.error('[main-react-test.tsx] Import error:', error);
}

export {};