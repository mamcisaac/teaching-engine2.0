import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps): React.ReactElement {
  const navigate = useNavigate();

  return (
    <nav style={{ 
      fontSize: '14px', 
      color: '#6b7280',
      marginBottom: '20px',
      padding: '10px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span style={{ color: '#9ca3af' }}>→</span>
            )}
            {item.path ? (
              <button
                onClick={() => navigate(item.path!)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0'
                }}
              >
                {item.label}
              </button>
            ) : (
              <span style={{ color: '#374151', fontWeight: '500' }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}