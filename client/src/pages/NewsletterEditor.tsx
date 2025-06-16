import { useState, useEffect } from 'react';
import { useCreateNewsletter, useNewsletter } from '../api';
import { useSearchParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import ResourceSelector from '../components/ResourceSelector';
import type { MediaResource } from '../types';

export default function NewsletterEditor() {
  const create = useCreateNewsletter();
  const [search] = useSearchParams();
  const id = Number(search.get('id')) || undefined;
  const [showPolished, setShowPolished] = useState(true);
  const { data } = useNewsletter(id ?? 0, showPolished ? 'polished' : 'raw');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showResourceSelector, setShowResourceSelector] = useState(false);

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

  const handleResourceSelect = (resource: MediaResource) => {
    const filename = resource.filePath.split('/').pop();
    const resourceUrl = `/api/media-resources/file/${resource.userId}/${filename}`;

    let resourceHtml = '';
    if (resource.fileType === 'image') {
      resourceHtml = `<div style="margin: 10px 0;"><img src="${resourceUrl}" alt="${resource.title}" style="max-width: 100%; height: auto; border-radius: 4px;" /><br><small><em>${resource.title}</em></small></div>`;
    } else if (resource.fileType === 'pdf') {
      resourceHtml = `<div style="margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px;"><strong>📄 PDF Resource:</strong> <a href="${resourceUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">${resource.title}</a></div>`;
    } else if (resource.fileType === 'video') {
      resourceHtml = `<div style="margin: 10px 0;"><video controls style="max-width: 100%; border-radius: 4px;"><source src="${resourceUrl}" type="${resource.mimeType}">Your browser does not support the video tag.</video><br><small><em>${resource.title}</em></small></div>`;
    } else if (resource.fileType === 'audio') {
      resourceHtml = `<div style="margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px;"><strong>🎵 Audio:</strong> ${resource.title}<br><audio controls style="width: 100%; margin-top: 5px;"><source src="${resourceUrl}" type="${resource.mimeType}">Your browser does not support the audio tag.</audio></div>`;
    } else {
      resourceHtml = `<div style="margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px;"><strong>📎 Resource:</strong> <a href="${resourceUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">${resource.title}</a></div>`;
    }

    setContent((prev) => prev + resourceHtml);
    setShowResourceSelector(false);
  };

  // Get current user ID (you may need to adjust this based on your auth context)
  const currentUserId = 1; // This should come from your auth context

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
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Newsletter Content</label>
        <button
          type="button"
          onClick={() => setShowResourceSelector(true)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          📎 Insert Resource
        </button>
      </div>
      <RichTextEditor value={content} onChange={setContent} />
      <button className="px-2 py-1 bg-blue-600 text-white" onClick={handleSave}>
        Save
      </button>

      {/* Resource Selector */}
      {showResourceSelector && (
        <ResourceSelector
          userId={currentUserId}
          onSelect={handleResourceSelect}
          onClose={() => setShowResourceSelector(false)}
          title="Insert Resource into Newsletter"
        />
      )}
    </div>
  );
}
