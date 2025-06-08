import { useState } from 'react';
import { useCreateNewsletter } from '../api';
import RichTextEditor from '../components/RichTextEditor';

export default function NewsletterEditor() {
  const create = useCreateNewsletter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    create.mutate({ title, content });
  };

  return (
    <div className="space-y-2 p-2">
      <input
        className="border p-1 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <RichTextEditor value={content} onChange={setContent} />
      <button className="px-2 py-1 bg-blue-600 text-white" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
