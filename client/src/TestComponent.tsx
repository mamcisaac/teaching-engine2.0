import React from 'react';

export function TestComponent(): React.ReactElement {
  console.log('[TestComponent] Rendering test component');
  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <h1>Test Component Loaded!</h1>
      <p>If you can see this, React is working.</p>
    </div>
  );
}