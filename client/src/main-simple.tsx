// Minimal test without React imports
console.log('[main-simple.tsx] Starting...');

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = '<div style="color: blue; padding: 20px;"><h1>Module loading works!</h1><p>This is from main-simple.tsx</p></div>';
  console.log('[main-simple.tsx] DOM updated');
} else {
  console.error('[main-simple.tsx] Root element not found');
}

export {}; // Make this a module