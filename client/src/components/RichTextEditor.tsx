import { useState, useEffect } from 'react';
import { sanitizeHtml } from '../utils/sanitization';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  className = ""
}: Props) {
  const [html, setHtml] = useState(value);

  useEffect(() => {
    setHtml(value);
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rawHTML = target.innerHTML;
    
    // Sanitize the HTML to prevent XSS
    const sanitizedHTML = sanitizeHtml(rawHTML);
    
    // Only update if content actually changed to prevent cursor jumping
    if (sanitizedHTML !== html) {
      setHtml(sanitizedHTML);
      onChange(sanitizedHTML);
      
      // If we had to sanitize, update the display
      if (sanitizedHTML !== rawHTML) {
        target.innerHTML = sanitizedHTML;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Get plain text from clipboard and insert it safely
    const text = e.clipboardData.getData('text/plain');
    // Properly escape HTML entities
    const sanitizedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Insert the text at cursor position
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.getRangeAt && selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(sanitizedText));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    // Trigger change event by creating a proper FormEvent
    const divElement = e.currentTarget;
    const syntheticEvent = {
      ...e,
      currentTarget: divElement,
      target: divElement
    } as React.FormEvent<HTMLDivElement>;
    handleInput(syntheticEvent);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="border border-gray-300 rounded-md p-3 min-h-[150px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        role="textbox"
        aria-label="Rich text editor"
        aria-multiline="true"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{
          minHeight: '150px',
        }}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
      
      {/* Placeholder styling - using CSS-in-JS approach for safety */}
      <style>
        {`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `}
      </style>
    </div>
  );
}
