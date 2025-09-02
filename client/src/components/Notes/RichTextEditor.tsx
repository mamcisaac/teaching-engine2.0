import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

// Custom toolbar options for anecdotal notes
const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote'],
    ['link'],
    ['clean'] // Remove formatting
  ],
};

// Allowed formats for notes
const formats = [
  'header',
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'blockquote',
  'link'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your note here...',
  readOnly = false,
  className = ''
}) => {
  const [editorHtml, setEditorHtml] = useState(value || '');

  useEffect(() => {
    setEditorHtml(value || '');
  }, [value]);

  const handleChange = (html: string) => {
    setEditorHtml(html);
    onChange(html);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={editorHtml}
        onChange={handleChange}
        modules={readOnly ? { toolbar: false } : modules}
        formats={formats}
        readOnly={readOnly}
        placeholder={placeholder}
      />
      <style jsx>{`
        .rich-text-editor :global(.ql-container) {
          min-height: 150px;
          font-size: 14px;
        }
        .rich-text-editor :global(.ql-editor) {
          min-height: 150px;
        }
        .rich-text-editor :global(.ql-toolbar) {
          border-radius: 4px 4px 0 0;
        }
        .rich-text-editor :global(.ql-container) {
          border-radius: 0 0 4px 4px;
        }
      `}</style>
    </div>
  );
};

// Plain text display component for viewing notes without editor
export const RichTextDisplay: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div 
      className={`rich-text-display prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};