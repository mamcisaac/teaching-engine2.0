import { useState, useEffect } from 'react';
import { useCreateNewsletter, useNewsletter } from '../api';
import { useSearchParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';

export default function NewsletterEditor() {
  const create = useCreateNewsletter();
  const [search] = useSearchParams();
  const id = Number(search.get('id')) || undefined;
  const [showPolished, setShowPolished] = useState(true);
  const { data } = useNewsletter(id ?? 0, showPolished ? 'polished' : 'raw');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const polishedAvailable = data?.polishedDraft !== null && data?.polishedDraft !== undefined;

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setContent(
        showPolished && polishedAvailable
          ? (data.polishedDraft ?? data.rawDraft ?? data.content)
          : (data.rawDraft ?? data.content),
      );
      if (showPolished && !polishedAvailable) {
        alert('Using raw draft');
      }
    }
  }, [data, showPolished, polishedAvailable]);

  const handleSave = () => {
    create.mutate({ title, content });
  };

  return (
    <div className="space-y-2 p-2">
      {polishedAvailable && (
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={showPolished}
            onChange={(e) => setShowPolished(e.target.checked)}
          />
          Polished version
        </label>
      )}
      <input
        className="border p-1 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {!polishedAvailable && import.meta.env.VITE_ENABLE_LLM === 'true' && (
        <div role="status">Loading polished...</div>
      )}
      <RichTextEditor value={content} onChange={setContent} />
      <button className="px-2 py-1 bg-blue-600 text-white" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
