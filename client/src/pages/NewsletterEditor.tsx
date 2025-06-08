import { useState } from 'react';
import axios from 'axios';
import RichTextEditor from '../components/RichTextEditor';

export default function NewsletterEditor() {
  const [html, setHtml] = useState('<p>Write your newsletter...</p>');

  const handleGenerate = async () => {
    await axios.post('/api/newsletters/generate', {
      template: 'custom',
      content: html,
    });
    alert('Newsletter generated');
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Newsletter Editor</h1>
      <RichTextEditor value={html} onChange={setHtml} />
      <button onClick={handleGenerate} className="px-2 py-1 bg-blue-600 text-white">
        Generate
      </button>
      <h2 className="text-lg font-semibold">Preview</h2>
      <div className="border p-2" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
