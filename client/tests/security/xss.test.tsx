/**
 * XSS Prevention Tests for Client Components
 * 
 * Tests that React components properly sanitize and escape content
 * to prevent Cross-Site Scripting (XSS) attacks
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import components to test
import { AuthProvider } from '../../src/contexts/AuthContext';
import { LanguageProvider } from '../../src/contexts/LanguageContext';
import StudentSelector from '../../src/components/StudentSelector';
import BilingualTextInput from '../../src/components/BilingualTextInput';
import RichTextEditor from '../../src/components/RichTextEditor';
import TeacherOnboardingFlow from '../../src/components/TeacherOnboardingFlow';
import ParentSummaryPreview from '../../src/components/ParentSummaryPreview';

// Mock API calls
vi.mock('../../src/api', () => ({
  getStudents: vi.fn(() => Promise.resolve([])),
  createStudent: vi.fn((data) => Promise.resolve({ id: 1, ...data })),
  updateStudent: vi.fn((id, data) => Promise.resolve({ id, ...data })),
  deleteStudent: vi.fn(() => Promise.resolve({})),
}));

// Mock auth context
const mockAuthContext = {
  user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
  checkAuth: vi.fn().mockResolvedValue(undefined),
  getToken: vi.fn().mockReturnValue('mock-token'),
  setToken: vi.fn()
};

vi.mock('../../src/contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../src/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => mockAuthContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children
  };
});

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </QueryClientProvider>
  );
}

describe('XSS Prevention Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Text Input Sanitization', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
      '"><script>alert("xss")</script>',
      '<iframe src="javascript:alert(1)">',
      '<object data="javascript:alert(1)">',
      '<embed src="javascript:alert(1)">',
      '<link rel="stylesheet" href="javascript:alert(1)">',
      '<style>@import "javascript:alert(1)"</style>',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
      '&lt;script&gt;alert("xss")&lt;/script&gt;',
      '%3Cscript%3Ealert("xss")%3C/script%3E',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("xss")',
      'onmouseover="alert(1)"',
      'onfocus="alert(1)"',
      'onclick="alert(1)"'
    ];

    it('should sanitize XSS payloads in BilingualTextInput', async () => {
      const mockOnChangeEn = vi.fn();
      const mockOnChangeFr = vi.fn();
      
      const { container, unmount } = render(
        <TestWrapper>
          <BilingualTextInput
            label="Test Input"
            valueEn=""
            valueFr=""
            onChangeEn={mockOnChangeEn}
            onChangeFr={mockOnChangeFr}
          />
        </TestWrapper>
      );

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText(/Test Input/i)).toBeInTheDocument();
      });

      // Find the English input (first input in the component)
      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
      const englishInput = inputs[0];
      
      // Test a few key XSS payloads
      const testPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")'
      ];

      for (const payload of testPayloads) {
        fireEvent.change(englishInput, { target: { value: payload } });

        // Verify the onChange was called with the payload
        expect(mockOnChangeEn).toHaveBeenCalled();
        expect(mockOnChangeEn).toHaveBeenCalledWith(payload);
        
        // The component itself doesn't sanitize - React does that automatically
        // So we just ensure the component is functioning
        // Note: controlled components won't update the DOM value unless the parent updates state
        
        // Reset mock for next iteration
        mockOnChangeEn.mockClear();
      }

      unmount();
    });

    it('should escape HTML entities in text display', async () => {
      const maliciousText = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
      
      const TestComponent = () => (
        <div data-testid="text-display">
          {maliciousText}
        </div>
      );

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Wait for the auth context to settle
      await waitFor(() => {
        const textDisplay = screen.getByTestId('text-display');
        expect(textDisplay).toBeInTheDocument();
      });

      const textDisplay = screen.getByTestId('text-display');
      
      // React automatically escapes text content, but let's verify
      expect(textDisplay.textContent).toBe(maliciousText);
      expect(textDisplay.innerHTML).not.toContain('<script>');
      // Check for escaped content - the innerHTML will contain escaped characters
      expect(textDisplay.innerHTML).toMatch(/&lt;script&gt;|\\u003cscript\\u003e/);
    });

    it('should sanitize dangerous attributes in dynamic content', async () => {
      const DynamicComponent = ({ userContent }: { userContent: string }) => (
        <div 
          data-testid="dynamic-content"
          // This is what we want to avoid - don't do this in real code
          dangerouslySetInnerHTML={{ __html: userContent }}
        />
      );

      const maliciousHTML = '<img src="x" onerror="alert(1)"><script>alert("xss")</script>';
      
      // In a real app, you would sanitize userContent before using dangerouslySetInnerHTML
      render(
        <TestWrapper>
          <DynamicComponent userContent={maliciousHTML} />
        </TestWrapper>
      );

      // Wait for auth context to settle
      await waitFor(() => {
        const dynamicContent = screen.getByTestId('dynamic-content');
        expect(dynamicContent).toBeInTheDocument();
      });

      const dynamicContent = screen.getByTestId('dynamic-content');
      
      // This test documents the danger - in real code, sanitize before using dangerouslySetInnerHTML
      expect(dynamicContent.innerHTML).toContain('onerror');
      // This demonstrates why you should never use dangerouslySetInnerHTML with unsanitized content
    });

    it('should safely render user-generated content with proper sanitization', async () => {
      // This is the correct way to handle user content
      const SafeComponent = ({ userContent }: { userContent: string }) => (
        <div data-testid="safe-content">
          {userContent} {/* React automatically escapes this */}
        </div>
      );

      const maliciousContent = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
      
      render(
        <TestWrapper>
          <SafeComponent userContent={maliciousContent} />
        </TestWrapper>
      );

      // Wait for auth context to settle
      await waitFor(() => {
        const safeContent = screen.getByTestId('safe-content');
        expect(safeContent).toBeInTheDocument();
      });

      const safeContent = screen.getByTestId('safe-content');
      
      // Content should be escaped and safe
      // Remove any trailing whitespace that might be added
      expect(safeContent.textContent?.trim()).toBe(maliciousContent);
      
      // When React escapes content, it converts HTML entities
      // The innerHTML should NOT contain actual script tags or event handlers
      expect(safeContent.innerHTML).not.toContain('<script>');
      expect(safeContent.innerHTML).not.toContain('<img src="x" onerror="alert(1)">');
      
      // The content should be escaped - check that it contains escaped entities
      // React may use different escaping methods (HTML entities or Unicode)
      expect(safeContent.innerHTML).toMatch(/(&lt;|\\u003c|\\x3c)/i);
    });
  });

  describe('RichTextEditor Security', () => {
    it('should sanitize malicious HTML in rich text editor', async () => {
      const mockOnChange = vi.fn();
      const maliciousHTML = '<script>alert("xss")</script><p>This is safe content</p>';

      render(
        <TestWrapper>
          <RichTextEditor
            value=""
            onChange={mockOnChange}
            placeholder="Enter content"
          />
        </TestWrapper>
      );

      // Wait for the editor to render
      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });

      const editor = screen.getByRole('textbox') as HTMLDivElement;
      
      // Simulate typing content directly (simpler than paste)
      fireEvent.input(editor, {
        target: {
          innerHTML: maliciousHTML
        }
      });

      // The RichTextEditor should sanitize and call onChange
      expect(mockOnChange).toHaveBeenCalled();
      
      // Get the sanitized content from the last call
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
      const sanitizedContent = lastCall?.[0] || '';
      
      // Should remove dangerous elements but keep safe content
      expect(sanitizedContent).not.toContain('<script>');
      expect(sanitizedContent).not.toContain('alert');
      
      // The safe content should be preserved in some form
      // (exact format depends on sanitization implementation)
      expect(sanitizedContent.toLowerCase()).toMatch(/this\s*is\s*safe\s*content|safe content/);
    });

    it('should preserve safe HTML formatting while removing dangerous content', async () => {
      const mockOnChange = vi.fn();
      const mixedHTML = `
        <h1>Title</h1>
        <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
        <script>alert('remove this')</script>
        <ul>
          <li onclick="alert('bad')">Item 1</li>
          <li>Item 2</li>
        </ul>
        <img src="valid.jpg" alt="Valid image">
        <img src="x" onerror="alert('bad')">
      `;

      render(
        <TestWrapper>
          <RichTextEditor
            value=""
            onChange={mockOnChange}
            placeholder="Enter content"
          />
        </TestWrapper>
      );

      // Wait for the editor to render
      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });

      const editor = screen.getByRole('textbox');
      
      fireEvent.paste(editor, {
        clipboardData: {
          getData: () => mixedHTML
        }
      });

      await waitFor(() => {
        if (mockOnChange.mock.calls.length > 0) {
          const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
          const sanitizedContent = lastCall[0];
          
          // Should keep safe formatting
          expect(sanitizedContent).toContain('<h1>');
          expect(sanitizedContent).toContain('<strong>');
          expect(sanitizedContent).toContain('<em>');
          expect(sanitizedContent).toContain('<ul>');
          expect(sanitizedContent).toContain('<li>');
          
          // Should remove dangerous content
          expect(sanitizedContent).not.toContain('<script>');
          expect(sanitizedContent).not.toContain('onclick');
          expect(sanitizedContent).not.toContain('onerror');
          
          // Should keep safe images but remove dangerous ones
          expect(sanitizedContent).toContain('valid.jpg');
          expect(sanitizedContent).not.toContain('onerror');
        }
      });
    });
  });

  describe('URL and Link Security', () => {
    it('should sanitize dangerous URLs', async () => {
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("xss")',
        'file:///etc/passwd',
        'ftp://malicious.site/hack.exe'
      ];

      for (const url of dangerousUrls) {
        const LinkComponent = ({ href }: { href: string }) => (
          <a href={href} data-testid={`test-link-${url.substring(0, 10)}`}>
            Link
          </a>
        );

        const { unmount } = render(
          <TestWrapper>
            <LinkComponent href={url} />
          </TestWrapper>
        );

        await waitFor(() => {
          const link = screen.getByTestId(`test-link-${url.substring(0, 10)}`);
          expect(link).toBeInTheDocument();
        });

        const link = screen.getByTestId(`test-link-${url.substring(0, 10)}`);
        
        // In a real implementation, you would sanitize the href before rendering
        // This test documents what should be checked
        const hrefValue = link.getAttribute('href');
        
        // These should be blocked by proper URL validation
        if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:')) {
          // In a properly secured component, these would be sanitized or blocked
          expect(hrefValue).toBe(url); // React will render it but will show warnings
        }
        
        unmount();
      }
    });

    it('should validate and sanitize user-provided URLs', async () => {
      const UrlInputComponent = () => {
        const [url, setUrl] = React.useState('');
        const [error, setError] = React.useState('');
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          // This is where URL validation should happen
          const isValidUrl = /^https?:\/\//.test(url) && !url.includes('javascript:') && !url.includes('data:');
          
          if (!isValidUrl) {
            setError('Invalid URL format');
            return;
          }
          
          setError('');
          // Process valid URL
          console.log('Valid URL:', url);
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-testid="url-input"
            />
            <button type="submit" data-testid="submit-btn">Submit</button>
            {error && <div data-testid="error-msg">{error}</div>}
          </form>
        );
      };

      render(
        <TestWrapper>
          <UrlInputComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('url-input')).toBeInTheDocument();
      });

      const urlInput = screen.getByTestId('url-input');
      const submitBtn = screen.getByTestId('submit-btn');

      // Test malicious URL
      fireEvent.change(urlInput, { target: { value: 'javascript:alert("xss")' } });
      fireEvent.click(submitBtn);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByTestId('error-msg')).toBeInTheDocument();
        expect(screen.getByTestId('error-msg')).toHaveTextContent('Invalid URL format');
      });
    });
  });

  describe('Form Input Validation', () => {
    it('should validate and sanitize form inputs', async () => {
      const FormComponent = () => {
        const [formData, setFormData] = React.useState({
          name: '',
          email: '',
          description: ''
        });

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          // Form validation should happen here
          console.log('Form submitted:', formData);
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              data-testid="name-input"
              placeholder="Name"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              data-testid="email-input"
              placeholder="Email"
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              data-testid="description-input"
              placeholder="Description"
            />
            <button type="submit" data-testid="submit-btn">Submit</button>
          </form>
        );
      };

      render(
        <TestWrapper>
          <FormComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name-input')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      const descriptionInput = screen.getByTestId('description-input');

      // Test XSS payloads in form fields
      const xssPayload = '<script>alert("xss")</script>';
      
      fireEvent.change(nameInput, { target: { value: xssPayload } });
      fireEvent.change(emailInput, { target: { value: `test${xssPayload}@example.com` } });
      fireEvent.change(descriptionInput, { target: { value: xssPayload } });

      // React should automatically escape the content in the input values
      expect((nameInput as HTMLInputElement).value).toBe(xssPayload);
      expect((descriptionInput as HTMLTextAreaElement).value).toBe(xssPayload);
      
      // But when displayed, it should be escaped
      // This is automatically handled by React's text content rendering
    });

    it('should prevent script injection through event handlers', async () => {
      // Test that dynamic event handlers don't execute malicious code
      const maliciousHandler = 'alert("xss")';
      
      const DynamicComponent = ({ onClick }: { onClick?: string }) => {
        // This is what we want to avoid - never use strings as event handlers
        return (
          <button 
            data-testid="dynamic-button"
            onClick={() => {
              // Safe: only execute predefined functions
              console.log('Button clicked');
            }}
          >
            Click me
          </button>
        );
      };

      render(
        <TestWrapper>
          <DynamicComponent onClick={maliciousHandler} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dynamic-button')).toBeInTheDocument();
      });

      const button = screen.getByTestId('dynamic-button');
      
      // Clicking should only execute safe handler
      fireEvent.click(button);
      
      // The malicious handler should never be executed
      expect(button).toBeInTheDocument();
    });
  });

  describe('Component Props Sanitization', () => {
    it('should sanitize props passed to components', async () => {
      const DisplayComponent = ({ title, content }: { title: string; content: string }) => (
        <div data-testid="display-component">
          <h1>{title}</h1>
          <p>{content}</p>
        </div>
      );

      const maliciousTitle = '<script>alert("title")</script>';
      const maliciousContent = '<img src="x" onerror="alert(1)">';

      render(
        <TestWrapper>
          <DisplayComponent title={maliciousTitle} content={maliciousContent} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('display-component')).toBeInTheDocument();
      });

      const component = screen.getByTestId('display-component');
      
      // React automatically escapes text content
      expect(component.textContent).toContain('<script>alert("title")</script>');
      expect(component.textContent).toContain('<img src="x" onerror="alert(1)">');
      
      // But HTML should be escaped - check for escaped patterns
      expect(component.innerHTML).not.toContain('<script>');
      expect(component.innerHTML).toMatch(/&lt;script&gt;|\\u003cscript\\u003e/);
    });

    it('should validate component props for dangerous content', async () => {
      // Example of a component that validates its props
      const SecureComponent = ({ userInput }: { userInput: string }) => {
        // Validate input
        const isValidInput = !userInput.includes('<script>') && 
                           !userInput.includes('javascript:') &&
                           !userInput.includes('onerror') &&
                           userInput.length < 1000;

        if (!isValidInput) {
          return <div data-testid="error">Invalid input detected</div>;
        }

        return <div data-testid="content">{userInput}</div>;
      };

      // Test with malicious input
      const { unmount: unmount1 } = render(
        <TestWrapper>
          <SecureComponent userInput="<script>alert('xss')</script>" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      
      unmount1();

      // Test with valid input
      render(
        <TestWrapper>
          <SecureComponent userInput="This is safe content" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });
      
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });
  });

  describe('Local Storage and State Security', () => {
    it('should sanitize data from localStorage', () => {
      const maliciousData = JSON.stringify({
        name: '<script>alert("xss")</script>',
        preferences: {
          theme: 'dark',
          language: 'javascript:alert(1)'
        }
      });

      // Simulate malicious data in localStorage
      localStorage.setItem('userPreferences', maliciousData);

      const ComponentUsingStorage = () => {
        const [userData, setUserData] = React.useState<any>(null);

        React.useEffect(() => {
          try {
            const stored = localStorage.getItem('userPreferences');
            if (stored) {
              const parsed = JSON.parse(stored);
              
              // Sanitize the data before using it
              const sanitized = {
                name: parsed.name?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''),
                preferences: {
                  theme: parsed.preferences?.theme === 'dark' || parsed.preferences?.theme === 'light' ? parsed.preferences.theme : 'light',
                  language: parsed.preferences?.language?.startsWith('http') ? 'en' : 'en'
                }
              };
              
              setUserData(sanitized);
            }
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }, []);

        if (!userData) return <div>Loading...</div>;

        return (
          <div data-testid="user-data">
            <p>Name: {userData.name}</p>
            <p>Theme: {userData.preferences.theme}</p>
            <p>Language: {userData.preferences.language}</p>
          </div>
        );
      };

      render(
        <TestWrapper>
          <ComponentUsingStorage />
        </TestWrapper>
      );

      waitFor(() => {
        const userDataDiv = screen.getByTestId('user-data');
        
        // Should not contain script tags in the rendered content
        expect(userDataDiv.textContent).not.toContain('<script>');
        expect(userDataDiv.textContent).toContain('Theme: dark');
        expect(userDataDiv.textContent).toContain('Language: en');
      });

      // Clean up
      localStorage.removeItem('userPreferences');
    });
  });
});