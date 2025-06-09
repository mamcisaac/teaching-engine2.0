import { useState } from 'react';
import { useCreateNewsletter, useGenerateNewsletter } from '../api';
import RichTextEditor from '../components/RichTextEditor';

export default function NewsletterEditor() {
  const create = useCreateNewsletter();
  const generate = useGenerateNewsletter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleSave = () => {
    create.mutate({ title, content });
  };

  const handleGenerate = () => {
    generate.mutate({
      startDate: start,
      endDate: end,
      template: 'monthly',
      includePhotos: true,
    });
  };

  return (
    <div className="space-y-2 p-2">
      <input
        className="border p-1 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex space-x-2">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-1"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-1"
        />
        <button className="px-2 py-1 bg-green-600 text-white" onClick={handleGenerate}>
          Generate
        </button>
      </div>
      <RichTextEditor value={content} onChange={setContent} />
      <button className="px-2 py-1 bg-blue-600 text-white" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
